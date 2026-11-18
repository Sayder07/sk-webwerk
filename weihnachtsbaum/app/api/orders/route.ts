import { NextResponse } from 'next/server';
import { normalizePlz } from '@/lib/delivery';
import { cancelPending, createOrder, OrderError, setStripeSession } from '@/lib/orders';
import { normalizeSelection } from '@/lib/pricing';
import { baseUrl } from '@/lib/site';
import { createCheckoutSession, stripeEnabled } from '@/lib/stripe';
import { isEmail, isPhone, multiline, text } from '@/lib/validate';

export const dynamic = 'force-dynamic';

const fail = (message: string, code = 'ungueltig', status = 400) => NextResponse.json({ error: message, code }, { status });

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return fail('Ungültige Anfrage.');
  }
  // Honeypot: echte Besucher lassen das versteckte Feld leer
  if (text(body.website, 100)) return fail('Ungültige Anfrage.');

  const selection = normalizeSelection(body.selection);
  if (!selection) return fail('Bitte wähle zuerst deinen Baum aus.');
  const plz = normalizePlz(body.plz);
  const date = text(body.date, 10);
  const slotId = text(body.slotId, 11);
  if (!plz || !date || !slotId) return fail('Bitte wähle zuerst Liefertag und Zeitfenster.');

  const firstName = text(body.firstName, 80);
  const lastName = text(body.lastName, 80);
  const email = text(body.email, 200).toLowerCase();
  const phone = text(body.phone, 30);
  const street = text(body.street, 120);
  const city = text(body.city, 80);
  const notes = multiline(body.notes, 600);

  if (!firstName || !lastName) return fail('Bitte gib Vor- und Nachnamen an.');
  if (!isEmail(email)) return fail('Bitte prüfe deine E-Mail-Adresse.');
  if (!isPhone(phone)) return fail('Bitte gib eine Telefonnummer an, unter der wir dich am Liefertag erreichen.');
  if (!street || !/\d/.test(street)) return fail('Bitte gib Straße und Hausnummer an.');
  if (!city) return fail('Bitte gib deinen Ort an.');
  if (body.acceptTerms !== true) return fail('Bitte bestätige AGB und Widerrufsbelehrung.');

  const useStripe = stripeEnabled();
  let order;
  try {
    order = await createOrder({ selection, plz, date, slotId, firstName, lastName, email, phone, street, city, notes, paymentMode: useStripe ? 'stripe' : 'demo' });
  } catch (err) {
    if (err instanceof OrderError) return fail(err.message, err.code, err.code === 'slot-voll' ? 409 : 400);
    console.error('Bestellung konnte nicht angelegt werden:', err);
    return fail('Da ist etwas schiefgelaufen. Bitte versuche es noch einmal.', 'fehler', 500);
  }

  if (!useStripe) {
    // Demo-Modus ohne Stripe: Bestellung wird auf der Erfolgsseite als Testbestellung abgeschlossen
    return NextResponse.json({ url: `/bestellung/erfolg?order=${order.id}` });
  }

  try {
    const session = await createCheckoutSession(order, await baseUrl());
    await setStripeSession(order.id, session.id);
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Stripe-Checkout konnte nicht gestartet werden:', err);
    await cancelPending(order.id);
    return fail('Die Zahlung konnte nicht gestartet werden. Bitte versuche es noch einmal.', 'fehler', 502);
  }
}

