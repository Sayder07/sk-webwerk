const WEEKDAYS = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
const WEEKDAYS_SHORT = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

/** 3900 → "39,00 €" */
export function euro(cents: number): string {
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(cents);
  const whole = Math.floor(abs / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${sign}${whole},${(abs % 100).toString().padStart(2, '0')} €`;
}

/** 3900 → "39 €", 1990 → "19,90 €" */
export function euroShort(cents: number): string {
  return cents % 100 === 0 ? `${cents / 100} €` : euro(cents);
}

export function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function weekdayOf(iso: string): number {
  return parseIsoDate(iso).getUTCDay();
}

export function addDays(iso: string, days: number): string {
  const d = parseIsoDate(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return toIsoDate(d);
}

export function daysBetween(fromIso: string, toIso: string): number {
  return Math.round((parseIsoDate(toIso).getTime() - parseIsoDate(fromIso).getTime()) / 86_400_000);
}

/** "Freitag, 4. Dezember 2026" */
export function dateLong(iso: string): string {
  const d = parseIsoDate(iso);
  return `${WEEKDAYS[d.getUTCDay()]}, ${d.getUTCDate()}. ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** "Fr, 04.12." */
export function dateShort(iso: string): string {
  const d = parseIsoDate(iso);
  return `${WEEKDAYS_SHORT[d.getUTCDay()]}, ${String(d.getUTCDate()).padStart(2, '0')}.${String(d.getUTCMonth() + 1).padStart(2, '0')}.`;
}

export function weekdayName(iso: string): string {
  return WEEKDAYS[weekdayOf(iso)];
}

export function dayAndMonth(iso: string): string {
  const d = parseIsoDate(iso);
  return `${d.getUTCDate()}. ${MONTHS[d.getUTCMonth()]}`;
}

/** "09:00-10:00" → "9–10 Uhr", "09:00-12:30" → "9–12:30 Uhr" */
export function slotLabel(slotId: string): string {
  const [from, to] = slotId.split('-');
  const short = (t: string) => {
    const [h, m] = t.split(':');
    return m === '00' ? String(Number(h)) : `${Number(h)}:${m}`;
  };
  return `${short(from)}–${short(to)} Uhr`;
}

/** heutiges Datum in deutscher Zeit als JJJJ-MM-TT */
export function todayInBerlin(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

export function dateTimeBerlin(iso: string): string {
  return new Intl.DateTimeFormat('de-DE', { timeZone: 'Europe/Berlin', dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso));
}
