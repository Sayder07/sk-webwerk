import { NextResponse } from 'next/server';
import { shopConfig } from '@/config/shop.config';
import { extrasLabel, shapeLabel, treeLabel, zoneName } from '@/lib/admin-view';
import { isAdmin } from '@/lib/auth';
import { dateTimeBerlin, slotLabel } from '@/lib/format';
import { listOrders, STATUS_LABEL, type OrderStatus } from '@/lib/orders';

export const dynamic = 'force-dynamic';

/** Schutz vor Formel-Injektion in Excel + CSV-Escaping */
function cell(value: unknown): string {
  let s = String(value ?? '');
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 });
  const sp = new URL(request.url).searchParams;
  const date = /^\d{4}-\d{2}-\d{2}$/.test(sp.get('tag') ?? '') ? sp.get('tag')! : undefined;
  const zone = shopConfig.zones.some((z) => String(z.id) === sp.get('zone')) ? Number(sp.get('zone')) : undefined;
  const statusParam = sp.get('status') ?? 'aktiv';
  const status = statusParam === 'alle' ? undefined : statusParam === 'aktiv' || statusParam in STATUS_LABEL ? (statusParam as OrderStatus | 'aktiv') : 'aktiv';
  const orders = await listOrders({ date, zone, status });

  const head = ['Bestellnummer', 'Eingang', 'Status', 'Liefertag', 'Zeitfenster', 'Zone', 'Vorname', 'Nachname', 'Straße', 'PLZ', 'Ort', 'Telefon', 'E-Mail', 'Baumgröße', 'Form', 'Extras', 'Hinweise', 'Summe EUR', 'Zahlung'];
  const rows = orders.map((o) => [
    o.orderNumber, dateTimeBerlin(o.createdAt), STATUS_LABEL[o.status], o.deliveryDate.split('-').reverse().join('.'), slotLabel(o.slotId), zoneName(o.zone),
    o.firstName, o.lastName, o.street, o.plz, o.city, o.phone, o.email, treeLabel(o), shapeLabel(o), extrasLabel(o), o.notes.replace(/\n/g, ' '),
    (o.totalCents / 100).toFixed(2).replace('.', ','), o.paymentMode === 'demo' ? 'Test' : 'Stripe',
  ]);
  // Semikolon + BOM, damit deutsches Excel die Datei direkt richtig öffnet
  const csv = '﻿' + [head, ...rows].map((r) => r.map(cell).join(';')).join('\r\n');
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="bestellungen${date ? '-' + date : ''}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
