import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { completeOrder } from '@/lib/complete';
import { cancelPending } from '@/lib/orders';
import { getStripe, stripeEnabled } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

/**
 * Stripe-Webhook: bestätigt Zahlungen auch dann, wenn der Kunde nach dem Bezahlen
 * nicht auf die Website zurückkehrt. Endpoint im Stripe-Dashboard eintragen:
 *   https://DEINE-DOMAIN/api/stripe/webhook
 * Ereignisse: checkout.session.completed, checkout.session.async_payment_succeeded,
 *             checkout.session.async_payment_failed, checkout.session.expired
 */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripeEnabled() || !secret) return NextResponse.json({ error: 'Webhook nicht konfiguriert' }, { status: 503 });

  const signature = request.headers.get('stripe-signature') ?? '';
  const payload = await request.text();
  let event: Stripe.Event;
  try {
    event = await getStripe().webhooks.constructEventAsync(payload, signature, secret);
  } catch {
    return NextResponse.json({ error: 'Ungültige Signatur' }, { status: 400 });
  }

  if (event.type.startsWith('checkout.session.')) {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;
    if (orderId) {
      if ((event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') && session.payment_status === 'paid') {
        await completeOrder(orderId);
      } else if (event.type === 'checkout.session.expired' || event.type === 'checkout.session.async_payment_failed') {
        await cancelPending(orderId);
      }
    }
  }
  return NextResponse.json({ received: true });
}
