import type { Metadata } from 'next';
import { shopConfig } from '@/config/shop.config';
import { LegalNote } from '@/components/Legal';

export const metadata: Metadata = { title: 'Impressum' };

export default function ImprintPage() {
  const c = shopConfig.company;
  return (
    <div className="wrap schmal abschnitt prosa">
      <h1>Impressum</h1>
      <LegalNote />
      <h2>Angaben gemäß § 5 DDG</h2>
      <p>{c.name}<br />Inhaber: {c.owner}<br />{c.street}<br />{c.zipCity}</p>
      <h2>Kontakt</h2>
      <p>Telefon: {c.phone}<br />E-Mail: {c.email}</p>
      <h2>Umsatzsteuer</h2>
      <p>{c.vatId}</p>
      <h2>Verbraucherstreitbeilegung</h2>
      <p>[Angabe, ob Bereitschaft oder Verpflichtung zur Teilnahme an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle besteht – § 36 VSBG.]</p>
      <h2>Verantwortlich für den Inhalt</h2>
      <p>{c.owner}, Anschrift wie oben</p>
    </div>
  );
}
