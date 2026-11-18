import type { Metadata } from 'next';
import Link from 'next/link';
import { ClearCart } from '@/components/ClearCart';
import { completeOrder } from '@/lib/complete';
import { dateLong, euro, slotLabel } from '@/lib/format';
import { getOrder } from '@/lib/orders';
import { isSessionPaid, stripeEnabled } from '@/lib/stripe';

export const metadata: Metadata = { title: 'Bestellung', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order: id } = await searchParams;
  let order = id ? await getOrder(id) : null;

  // Zahlung bestätigen, falls der Webhook noch nicht da war
  if (order && order.status === 'pending') {
    let paid = false;
    if (order.paymentMode === 'demo') paid = !stripeEnabled();
    else if (order.stripeSessionId) paid = await isSessionPaid(order.stripeSessionId).catch(() => false);
    if (paid) {
      await completeOrder(order.id);
      order = await getOrder(order.id);
    }
  }

  if (!order) {
    return (
      <div className="wrap schmal abschnitt">
        <h1>Bestellung nicht gefunden</h1>
        <p className="lead">Wir konnten diese Bestellung nicht finden. Wenn du gerade bezahlt hast, melde dich bitte kurz bei uns.</p>
        <Link href="/kontakt" className="btn">Kontakt</Link>
      </div>
    );
  }

  if (order.status === 'pending' || order.status === 'cancelled') {
    return (
      <div className="wrap schmal abschnitt">
        <h1>Zahlung noch nicht bestätigt</h1>
        <p className="lead">Für die Bestellung {order.orderNumber} liegt uns noch keine Zahlungsbestätigung vor. Manche Zahlarten brauchen einen Moment – lade die Seite gleich noch einmal. Sobald die Zahlung da ist, bekommst du eine E-Mail.</p>
        <Link href="/kontakt" className="btn btn-linie">Fragen? Kontakt</Link>
      </div>
    );
  }

  return (
    <div className="wrap schmal abschnitt">
      <ClearCart />
      <p className="eyebrow">Bestellung {order.orderNumber}</p>
      <h1>Danke, {order.firstName} – dein Baum ist bestellt!</h1>
      <p className="lead">Die Bestätigung ist unterwegs an {order.email}. Wir holen deinen Baum frisch beim Förster und bringen ihn dir zum Wunschtermin.</p>
      {order.paymentMode === 'demo' && <div className="meldung meldung-info">Das war eine Testbestellung – es wurde keine Zahlung ausgeführt.</div>}
      <div className="zusammenfassung">
        <ul className="posten">
          {order.lineItems.map((i) => (
            <li key={i.id}><span>{i.label}</span><span>{euro(i.amount)}</span></li>
          ))}
          <li className="summe"><span>Gesamt inkl. MwSt.</span><span>{euro(order.totalCents)}</span></li>
        </ul>
        <p className="infozeile">
          <strong>Liefertermin:</strong> {dateLong(order.deliveryDate)}, {slotLabel(order.slotId)}<br />
          <strong>Adresse:</strong> {order.street}, {order.plz} {order.city}
        </p>
      </div>
      <p style={{ marginTop: 24 }}>Bitte sei im Zeitfenster zu Hause. Wenn sich etwas ändert, antworte einfach auf die Bestätigungs-E-Mail.</p>
      <Link href="/" className="btn btn-linie">Zur Startseite</Link>
    </div>
  );
}
