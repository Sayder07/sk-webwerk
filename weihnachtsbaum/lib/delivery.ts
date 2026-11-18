import { shopConfig, type Zone } from '../config/shop.config.ts';
import { addDays, daysBetween, todayInBerlin, weekdayOf } from './format.ts';

export function normalizePlz(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  const plz = input.trim();
  return /^\d{5}$/.test(plz) ? plz : null;
}

/** Zone zur PLZ – null, wenn die PLZ außerhalb des Liefergebiets liegt. */
export function zoneForPlz(plz: string): { zone: Zone; ort: string } | null {
  const entry = shopConfig.plzTable.find((p) => p.plz === plz);
  if (!entry) return null;
  const zone = shopConfig.zones.find((z) => z.id === entry.zone);
  return zone ? { zone, ort: entry.ort } : null;
}

/** Alle Liefertage der Saison (unabhängig von Zone und Vorlaufzeit). */
export function seasonDeliveryDates(): string[] {
  const { firstDeliveryDate, lastDeliveryDate } = shopConfig.season;
  const { weekdays, blockedDates } = shopConfig.delivery;
  const dates: string[] = [];
  for (let d = firstDeliveryDate; d <= lastDeliveryDate; d = addDays(d, 1)) {
    if (weekdays.includes(weekdayOf(d)) && !blockedDates.includes(d)) dates.push(d);
  }
  return dates;
}

/** Liefertage, an denen diese Zone grundsätzlich beliefert wird. */
export function deliveryDatesForZone(zone: Zone): string[] {
  return seasonDeliveryDates().filter((d) => !zone.weekdays || zone.weekdays.includes(weekdayOf(d)));
}

/** Ist der Tag heute noch bestellbar? (Vorlaufzeit für den Förster) */
export function isBookable(date: string, today: string = todayInBerlin()): boolean {
  return daysBetween(today, date) >= shopConfig.delivery.minLeadDays;
}

/** Letzter Tag, an dem für diesen Liefertag bestellt werden kann. */
export function orderDeadline(date: string): string {
  return addDays(date, -shopConfig.delivery.minLeadDays);
}

export type SlotUsage = { zone: number; slotId: string; count: number };

export type DayAvailability = {
  date: string;
  /** 'ok' buchbar · 'zu-spaet' Vorlaufzeit unterschritten · 'voll' alle Fenster belegt */
  state: 'ok' | 'zu-spaet' | 'voll';
  slots: { id: string; free: number; available: boolean }[];
};

/** Verfügbarkeit eines Tages für eine Zone aus den bereits belegten Fenstern berechnen. */
export function dayAvailability(zone: Zone, date: string, usage: SlotUsage[], today: string = todayInBerlin()): DayAvailability {
  const max = shopConfig.delivery.maxDeliveriesPerDay;
  const dayTotal = usage.reduce((sum, u) => sum + u.count, 0);
  const dayFull = max > 0 && dayTotal >= max;
  const bookable = isBookable(date, today);

  const slots = zone.slots.map((slot) => {
    const used = usage.find((u) => u.zone === zone.id && u.slotId === slot.id)?.count ?? 0;
    const free = Math.max(0, zone.capacityPerSlot - used);
    return { id: slot.id, free, available: bookable && !dayFull && free > 0 };
  });

  const state = !bookable ? 'zu-spaet' : slots.some((s) => s.available) ? 'ok' : 'voll';
  return { date, state, slots };
}

/** Grundprüfung, ob Datum und Fenster für die Zone überhaupt existieren. */
export function isValidSlot(zone: Zone, date: string, slotId: string): boolean {
  return deliveryDatesForZone(zone).includes(date) && zone.slots.some((s) => s.id === slotId);
}
