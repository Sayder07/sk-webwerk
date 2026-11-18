import 'server-only';
import Stripe from 'stripe';
import { shopConfig } from '../config/shop.config.ts';
import type { Order } from './orders.ts';
import { dateLong, slotLabel } from './format.ts';

let client: Stripe | null = null;

/** Ohne STRIPE_SECRET_KEY läuft der Shop im Demo-Modus (Bestellung ohne echte Zahlung). */
export function stripeEnabled(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

/** true, solange mit Stripe-Testschlüsseln oder ganz ohne Stripe gearbeitet wird */
export function isTestMode(): boolean {
  const key = process.env.STRIPE_SECRET_KEY;
  return !key || key.startsWith('sk_test_') || key.startsWith('rk_test_');
}

export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY fehlt');
  client ??= new Stripe(process.env.STRIPE_SECRET_KEY);
  return client;
}

/**
 * Stripe-Checkout-Sitzung für eine Bestellung.
 * Zahlarten werden NICHT fest vorgegeben: Stripe zeigt alles an, was im Dashboard
 * aktiviert ist (Karte, Apple Pay, Google Pay, PayPal, Klarna …).
 */
export async function createCheckoutSession(order: Order, baseUrl: string): Promise<{ id: string; url: string }> {
  const session = await getStripe().checkout.sessions.create({
    mode: 'payment',
    locale: 'de',
    customer_email: order.email,
    client_reference_id: order.id,
    metadata: { orderId: order.id, orderNumber: order.orderNumber },
    payment_intent_data: {
      description: `Bestellung ${order.orderNumber} – Lieferung ${dateLong(order.deliveryDate)}, ${slotLabel(order.slotId)}`,
      metadata: { orderId: order.id, orderNumber: order.orderNumber },
    },
    line_items: order.lineItems.map((item) => ({
      quantity: 1,
      price_data: { currency: 'eur', unit_amount: item.amount, product_data: { name: item.label } },
    })),
    // Stripe verlangt mindestens 30 Minuten; das Zeitfenster bleibt etwas länger reserviert (reservationMinutes)
    expires_at: Math.floor(Date.now() / 1000) + Math.max(31, shopConfig.delivery.reservationMinutes - 5) * 60,
    success_url: `${baseUrl}/bestellung/erfolg?order=${order.id}`,
    cancel_url: `${baseUrl}/bestellung/abgebrochen?order=${order.id}`,
  });
  if (!session.url) throw new Error('Stripe hat keine Checkout-URL geliefert');
  return { id: session.id, url: session.url };
}

export async function isSessionPaid(sessionId: string): Promise<boolean> {
  const session = await getStripe().checkout.sessions.retrieve(sessionId);
  return session.payment_status === 'paid';
}

export async function expireSession(sessionId: string): Promise<void> {
  try {
    await getStripe().checkout.sessions.expire(sessionId);
  } catch {
    // bereits abgelaufen oder abgeschlossen – nichts zu tun
  }
}
