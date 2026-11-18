import type { Metadata } from 'next';
import Link from 'next/link';
import { cancelPending, getOrder } from '@/lib/orders';
import { expireSession, stripeEnabled } from '@/lib/stripe';

export const metadata: Metadata = { title: 'Zahlung abgebrochen', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function CancelledPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order: id } = await searchParams;
  const order = id ? await getOrder(id) : null;
  // offene Bestellung verwerfen, damit das Zeitfenster sofort wieder frei ist
  if (order?.status === 'pending') {
    if (order.stripeSessionId && stripeEnabled()) await expireSession(order.stripeSessionId);
    await cancelPending(order.id);
  }
  return (
    <div className="wrap schmal abschnitt">
      <h1>Zahlung abgebrochen</h1>
      <p className="lead">Kein Problem – es wurde nichts abgebucht und nichts bestellt. Deine Auswahl ist noch gespeichert, du kannst direkt weitermachen.</p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Link href="/kasse" className="btn">Zurück zur Kasse</Link>
        <Link href="/lieferung" className="btn btn-linie">Termin ändern</Link>
      </div>
    </div>
  );
}
