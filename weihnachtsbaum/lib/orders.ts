import 'server-only';
import { randomUUID, randomInt } from 'node:crypto';
import { shopConfig } from '../config/shop.config.ts';
import { getDb, type Query } from './db.ts';
import { dayAvailability, deliveryDatesForZone, isValidSlot, zoneForPlz, type DayAvailability, type SlotUsage } from './delivery.ts';
import { priceSelection, type LineItem, type Selection } from './pricing.ts';

export type OrderStatus = 'pending' | 'paid' | 'delivered' | 'cancelled';

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Zahlung offen',
  paid: 'Bezahlt',
  delivered: 'Geliefert',
  cancelled: 'Storniert',
};

export type Order = {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: OrderStatus;
  deliveryDate: string;
  zone: number;
  slotId: string;
  treeId: string;
  shapeId: string;
  extras: string[];
  lineItems: LineItem[];
  totalCents: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  plz: string;
  city: string;
  notes: string;
  paymentMode: 'stripe' | 'demo';
  stripeSessionId: string | null;
  paidAt: string | null;
};

export type Inquiry = {
  id: string;
  createdAt: string;
  kind: 'ausserhalb' | 'deko' | 'kontakt';
  status: 'neu' | 'erledigt';
  name: string;
  email: string;
  phone: string;
  plz: string;
  message: string;
  payload: Record<string, unknown>;
};

const iso = (v: unknown) => (v instanceof Date ? v.toISOString() : v ? new Date(String(v)).toISOString() : null);
const json = (v: unknown) => (typeof v === 'string' ? JSON.parse(v) : v);

function toOrder(r: Record<string, any>): Order {
  return {
    id: r.id,
    orderNumber: r.order_number,
    createdAt: iso(r.created_at)!,
    status: r.status,
    deliveryDate: r.delivery_date,
    zone: Number(r.zone),
    slotId: r.slot_id,
    treeId: r.tree_id,
    shapeId: r.shape_id,
    extras: json(r.extras),
    lineItems: json(r.line_items),
    totalCents: Number(r.total_cents),
    firstName: r.first_name,
    lastName: r.last_name,
    email: r.email,
    phone: r.phone,
    street: r.street,
    plz: r.plz,
    city: r.city,
    notes: r.notes,
    paymentMode: r.payment_mode,
    stripeSessionId: r.stripe_session_id,
    paidAt: iso(r.paid_at),
  };
}

function toInquiry(r: Record<string, any>): Inquiry {
  return {
    id: r.id,
    createdAt: iso(r.created_at)!,
    kind: r.kind,
    status: r.status,
    name: r.name,
    email: r.email,
    phone: r.phone,
    plz: r.plz,
    message: r.message,
    payload: json(r.payload),
  };
}

/** Bedingung: Bestellung belegt ein Zeitfenster (bezahlt/geliefert oder gerade im Bezahlvorgang). */
const OCCUPIES = `(status in ('paid','delivered') or (status = 'pending' and created_at > now() - make_interval(mins => ${Number(shopConfig.delivery.reservationMinutes)})))`;

async function usageFor(query: Query, dates: string[]): Promise<Map<string, SlotUsage[]>> {
  const map = new Map<string, SlotUsage[]>(dates.map((d) => [d, []]));
  if (dates.length === 0) return map;
  const rows = await query(
    `select delivery_date, zone, slot_id, count(*)::int as count from orders
     where delivery_date = any($1::text[]) and ${OCCUPIES}
     group by delivery_date, zone, slot_id`,
    [dates],
  );
  for (const r of rows) map.get(r.delivery_date)?.push({ zone: Number(r.zone), slotId: r.slot_id, count: Number(r.count) });
  return map;
}

/** Verfügbarkeit aller Liefertage für eine PLZ – null, wenn außerhalb des Liefergebiets. */
export async function availabilityForPlz(plz: string): Promise<{ zoneId: number; ort: string; days: DayAvailability[] } | null> {
  const match = zoneForPlz(plz);
  if (!match) return null;
  const dates = deliveryDatesForZone(match.zone);
  const db = await getDb();
  const usage = await usageFor(db.query, dates);
  return { zoneId: match.zone.id, ort: match.ort, days: dates.map((d) => dayAvailability(match.zone, d, usage.get(d) ?? [])) };
}

export class OrderError extends Error {
  code: 'slot-voll' | 'ungueltig';
  constructor(code: 'slot-voll' | 'ungueltig', message: string) {
    super(message);
    this.code = code;
  }
}

export type NewOrder = {
  selection: Selection;
  plz: string;
  date: string;
  slotId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  notes: string;
  paymentMode: 'stripe' | 'demo';
};

function newOrderNumber(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) code += alphabet[randomInt(alphabet.length)];
  return `WB${String(shopConfig.season.year).slice(2)}-${code}`;
}

/**
 * Legt eine Bestellung mit Status „Zahlung offen“ an und reserviert das Zeitfenster.
 * Kapazitätsprüfung und Anlegen laufen in einer Transaktion mit Sperre pro Liefertag,
 * damit ein Fenster auch bei gleichzeitigen Bestellungen nie überbucht wird.
 */
export async function createOrder(input: NewOrder): Promise<Order> {
  const match = zoneForPlz(input.plz);
  if (!match) throw new OrderError('ungueltig', 'Diese Postleitzahl liegt außerhalb unseres Liefergebiets.');
  const { zone } = match;
  if (!isValidSlot(zone, input.date, input.slotId)) throw new OrderError('ungueltig', 'Dieser Liefertermin ist nicht verfügbar.');

  const { items, total } = priceSelection(input.selection, zone.id);
  const db = await getDb();

  return db.tx(async (query) => {
    await query('select pg_advisory_xact_lock(hashtext($1))', [`lieferung-${input.date}`]);
    const usage = (await usageFor(query, [input.date])).get(input.date) ?? [];
    const slot = dayAvailability(zone, input.date, usage).slots.find((s) => s.id === input.slotId);
    if (!slot?.available) throw new OrderError('slot-voll', 'Dieses Zeitfenster ist leider nicht mehr frei. Bitte wähle ein anderes.');

    const rows = await query(
      `insert into orders (id, order_number, status, delivery_date, zone, slot_id, tree_id, shape_id, extras, line_items, total_cents,
                           first_name, last_name, email, phone, street, plz, city, notes, payment_mode)
       values ($1,$2,'pending',$3,$4,$5,$6,$7,$8::text::jsonb,$9::text::jsonb,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
       returning *`,
      [
        randomUUID(), newOrderNumber(), input.date, zone.id, input.slotId, input.selection.treeId, input.selection.shapeId,
        JSON.stringify(input.selection.extras), JSON.stringify(items), total,
        input.firstName, input.lastName, input.email, input.phone, input.street, input.plz, input.city, input.notes, input.paymentMode,
      ],
    );
    return toOrder(rows[0]);
  });
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getOrder(id: string): Promise<Order | null> {
  if (!UUID.test(id)) return null;
  const db = await getDb();
  const rows = await db.query('select * from orders where id = $1', [id]);
  return rows[0] ? toOrder(rows[0]) : null;
}

export async function setStripeSession(id: string, sessionId: string): Promise<void> {
  const db = await getDb();
  await db.query('update orders set stripe_session_id = $2 where id = $1', [id, sessionId]);
}

/**
 * Markiert eine Bestellung als bezahlt. Gibt die Bestellung nur beim ERSTEN Aufruf zurück
 * (sonst null) – so werden Bestätigungs-E-Mails genau einmal verschickt, auch wenn
 * Webhook und Erfolgsseite gleichzeitig ankommen.
 */
export async function markPaid(id: string): Promise<Order | null> {
  if (!UUID.test(id)) return null;
  const db = await getDb();
  const rows = await db.query(`update orders set status = 'paid', paid_at = now() where id = $1 and status in ('pending','cancelled') and paid_at is null returning *`, [id]);
  return rows[0] ? toOrder(rows[0]) : null;
}

/** Offene Bestellung verwerfen (Zahlung abgebrochen oder abgelaufen) – gibt das Zeitfenster frei. */
export async function cancelPending(id: string): Promise<void> {
  if (!UUID.test(id)) return;
  const db = await getDb();
  await db.query(`update orders set status = 'cancelled' where id = $1 and status = 'pending'`, [id]);
}

export async function setStatus(id: string, status: OrderStatus): Promise<void> {
  if (!UUID.test(id) || !(status in STATUS_LABEL)) return;
  const db = await getDb();
  await db.query('update orders set status = $2 where id = $1', [id, status]);
}

export type OrderFilter = { date?: string; zone?: number; status?: OrderStatus | 'aktiv' };

/** Bestellungen für die Übersicht. Status „aktiv“ = bezahlt oder geliefert. */
export async function listOrders(filter: OrderFilter = {}): Promise<Order[]> {
  const where: string[] = [];
  const params: unknown[] = [];
  if (filter.date) where.push(`delivery_date = $${params.push(filter.date)}`);
  if (filter.zone) where.push(`zone = $${params.push(filter.zone)}`);
  if (filter.status === 'aktiv') where.push(`status in ('paid','delivered')`);
  else if (filter.status) where.push(`status = $${params.push(filter.status)}`);
  const db = await getDb();
  const rows = await db.query(
    `select * from orders ${where.length ? 'where ' + where.join(' and ') : ''} order by delivery_date, zone, slot_id, created_at`,
    params,
  );
  return rows.map(toOrder);
}

export type NewInquiry = Omit<Inquiry, 'id' | 'createdAt' | 'status'>;

export async function createInquiry(input: NewInquiry): Promise<Inquiry> {
  const db = await getDb();
  const rows = await db.query(
    `insert into inquiries (id, kind, name, email, phone, plz, message, payload) values ($1,$2,$3,$4,$5,$6,$7,$8::text::jsonb) returning *`,
    [randomUUID(), input.kind, input.name, input.email, input.phone, input.plz, input.message, JSON.stringify(input.payload ?? {})],
  );
  return toInquiry(rows[0]);
}

export async function listInquiries(): Promise<Inquiry[]> {
  const db = await getDb();
  return (await db.query('select * from inquiries order by created_at desc')).map(toInquiry);
}

export async function setInquiryStatus(id: string, status: 'neu' | 'erledigt'): Promise<void> {
  if (!UUID.test(id)) return;
  const db = await getDb();
  await db.query('update inquiries set status = $2 where id = $1', [id, status === 'erledigt' ? 'erledigt' : 'neu']);
}
