import type { Metadata } from 'next';
import { InquiryForm } from '@/components/InquiryForm';

export const metadata: Metadata = { title: 'Deko-Anfrage', description: 'Lichterketten, Baumschmuck und mehr – einzeln auf Anfrage.' };

export default function DecoPage() {
  return (
    <div className="wrap schmal abschnitt">
      <p className="eyebrow">Deko auf Anfrage</p>
      <h1>Lichterkette, Kugeln, Baumspitze?</h1>
      <p className="lead">Deko gibt es bei uns nicht im Shop, sondern einzeln auf Anfrage. Schreib uns, was du suchst – wir melden uns mit einem Vorschlag und einem Preis. Unverbindlich.</p>
      <InquiryForm kind="deko" messageLabel="Was suchst du?" messagePlaceholder="z. B. warmweiße Lichterkette für einen 2-m-Baum, rote Kugeln …" />
    </div>
  );
}
