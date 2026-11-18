import type { Metadata } from 'next';
import { CheckoutForm } from '@/components/CheckoutForm';
import { stripeEnabled } from '@/lib/stripe';

export const metadata: Metadata = { title: 'Kasse', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default function CheckoutPage() {
  return <CheckoutForm demo={!stripeEnabled()} />;
}
