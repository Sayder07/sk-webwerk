import { shopConfig } from '../config/shop.config.ts';
import { seasonDeliveryDates } from './delivery.ts';
import { dayAndMonth } from './format.ts';

const DAY_PLURAL = ['sonntags', 'montags', 'dienstags', 'mittwochs', 'donnerstags', 'freitags', 'samstags'];

/** "montags, freitags und samstags" */
export function deliveryDaysText(): string {
  const days = shopConfig.delivery.weekdays.map((d) => DAY_PLURAL[d]);
  return days.length > 1 ? `${days.slice(0, -1).join(', ')} und ${days[days.length - 1]}` : days[0] ?? '';
}

/** "9–16 Uhr" */
export function deliveryHoursText(): string {
  const h = (t: string) => (t.endsWith(':00') ? String(Number(t.slice(0, 2))) : t.replace(/^0/, ''));
  return `${h(shopConfig.delivery.dayStart)}–${h(shopConfig.delivery.dayEnd)} Uhr`;
}

/** "4. Dezember bis 21. Dezember" – erster und letzter tatsächlicher Liefertag */
export function seasonRangeText(): string {
  const dates = seasonDeliveryDates();
  if (dates.length === 0) return '';
  return `${dayAndMonth(dates[0])} bis ${dayAndMonth(dates[dates.length - 1])}`;
}

const small = () => shopConfig.company.smallBusiness;

/** kurzer Zusatz hinter Preisen: "Endpreis" bzw. "inkl. MwSt." */
export function taxShort(): string {
  return small() ? 'Endpreis' : 'inkl. MwSt.';
}

/** Beschriftung der Gesamtsumme */
export function totalLabel(): string {
  return small() ? 'Gesamt (Endpreis)' : 'Gesamt inkl. MwSt.';
}

/** ganzer Satz für Fußzeile, AGB, E-Mails */
export function taxSentence(): string {
  return small() ? 'Alle Preise sind Endpreise. Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.' : 'Alle Preise inkl. MwSt.';
}
