import assert from 'node:assert/strict';
import test from 'node:test';
import { shopConfig } from '../config/shop.config.ts';
import { dayAvailability, deliveryDatesForZone, isBookable, orderDeadline, seasonDeliveryDates, zoneForPlz } from '../lib/delivery.ts';
import { euro, slotLabel, weekdayOf } from '../lib/format.ts';
import { normalizeSelection, priceSelection } from '../lib/pricing.ts';

test('Preise laut Briefing', () => {
  const prices = Object.fromEntries(shopConfig.trees.map((t) => [t.id, t.price]));
  assert.deepEqual(prices, { '125-150': 3900, '150-175': 4900, '175-200': 5900, '200-225': 6900, '225-250': 7900, '250-275': 8900 });
  const extras = Object.fromEntries(shopConfig.extras.map((e) => [e.id, e.price]));
  assert.deepEqual(extras, { aufbau: 1990, standfuss: 3490, zweige: 600, abholung: 1490 });
  assert.deepEqual(shopConfig.zones.map((z) => z.fee), [1290, 1790, 2490]);
});

test('2-m-Baum mit allen Extras kostet ca. 120 € plus Lieferung', () => {
  const sel = { treeId: '175-200', shapeId: 'normal', extras: ['aufbau', 'standfuss', 'zweige', 'abholung'] };
  const ohne = priceSelection(sel);
  assert.equal(ohne.subtotal, 5900 + 1990 + 3490 + 600 + 1490);
  assert.equal(ohne.deliveryFee, 0);
  const mit = priceSelection(sel, 1);
  assert.equal(mit.total, ohne.subtotal + 1290);
  assert.equal(mit.items.at(-1)?.kind, 'delivery');
});

test('Auswahl wird bereinigt, Unbekanntes abgelehnt', () => {
  assert.equal(normalizeSelection({ treeId: 'x', shapeId: 'normal', extras: [] }), null);
  assert.equal(normalizeSelection(null), null);
  assert.deepEqual(normalizeSelection({ treeId: '125-150', shapeId: 'breit', extras: ['zweige', 'zweige', 'gibtsnicht', 'aufbau'] }), { treeId: '125-150', shapeId: 'breit', extras: ['aufbau', 'zweige'] });
});

test('PLZ → Zone', () => {
  assert.equal(zoneForPlz('35583')?.zone.id, 1); // Garbenheim
  assert.equal(zoneForPlz('35633')?.zone.id, 2); // Lahnau
  assert.equal(zoneForPlz('35614')?.zone.id, 2); // Aßlar
  assert.equal(zoneForPlz('35390')?.zone.id, 3); // Gießen
  assert.equal(zoneForPlz('60311'), null);
  const all = shopConfig.plzTable.map((p) => p.plz);
  assert.equal(new Set(all).size, all.length, 'keine doppelten PLZ');
});

test('Liefertage: nur Mo/Fr/Sa im Dezember 2026', () => {
  const dates = seasonDeliveryDates();
  assert.deepEqual(dates, ['2026-12-04', '2026-12-05', '2026-12-07', '2026-12-11', '2026-12-12', '2026-12-14', '2026-12-18', '2026-12-19', '2026-12-21']);
  assert.ok(dates.every((d) => [1, 5, 6].includes(weekdayOf(d))));
  assert.deepEqual(deliveryDatesForZone({ ...shopConfig.zones[2], weekdays: [5] }), ['2026-12-04', '2026-12-11', '2026-12-18']);
});

test('Vorlaufzeit', () => {
  assert.equal(shopConfig.delivery.minLeadDays, 4);
  assert.equal(isBookable('2026-12-04', '2026-11-30'), true);
  assert.equal(isBookable('2026-12-04', '2026-12-01'), false);
  assert.equal(orderDeadline('2026-12-21'), '2026-12-17');
});

test('Kapazität: volle Fenster und Tagesobergrenze', () => {
  const zone = shopConfig.zones[0];
  const today = '2026-11-18';
  const free = dayAvailability(zone, '2026-12-04', [], today);
  assert.equal(free.state, 'ok');
  assert.ok(free.slots.every((s) => s.available && s.free === zone.capacityPerSlot));

  const one = dayAvailability(zone, '2026-12-04', [{ zone: 1, slotId: '09:00-10:00', count: zone.capacityPerSlot }], today);
  assert.equal(one.slots[0].available, false);
  assert.equal(one.slots[1].available, true);

  // andere Zone belegt nur die Tagesobergrenze, nicht das Fenster
  const other = dayAvailability(zone, '2026-12-04', [{ zone: 3, slotId: '09:00-12:30', count: 2 }], today);
  assert.equal(other.slots[0].free, zone.capacityPerSlot);

  const full = dayAvailability(zone, '2026-12-04', [{ zone: 3, slotId: '09:00-12:30', count: shopConfig.delivery.maxDeliveriesPerDay }], today);
  assert.equal(full.state, 'voll');
  assert.equal(dayAvailability(zone, '2026-12-04', [], '2026-12-02').state, 'zu-spaet');
});

test('Formatierung', () => {
  assert.equal(euro(12380), '123,80 €');
  assert.equal(slotLabel('09:00-12:30'), '9–12:30 Uhr');
  assert.equal(slotLabel('14:00-16:00'), '14–16 Uhr');
});
