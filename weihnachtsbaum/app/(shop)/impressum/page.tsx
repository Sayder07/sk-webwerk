import type { Metadata } from 'next';
import { shopConfig } from '@/config/shop.config';

export const metadata: Metadata = { title: 'Impressum' };

export default function ImprintPage() {
  const c = shopConfig.company;
  return (
    <div className="wrap schmal abschnitt prosa">
      <h1>Impressum</h1>
      <h2>Angaben gemäß § 5 DDG</h2>
      <p>{c.name} ist ein Angebot von<br />{c.legalName}<br />Inhaber: {c.owner}<br />{c.street}<br />{c.zipCity}<br />Deutschland</p>
      <h2>Kontakt</h2>
      <p>Telefon: {c.phone}<br />E-Mail: {c.email}</p>
      <h2>Umsatzsteuer</h2>
      <p>{c.smallBusiness ? 'Gemäß § 19 UStG wird keine Umsatzsteuer berechnet (Kleinunternehmerregelung).' : `Umsatzsteuer-Identifikationsnummer: ${c.vatId}`}</p>
      <h2>Verbraucherstreitbeilegung</h2>
      <p>Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
      <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
      <p>{c.owner}, Anschrift wie oben</p>
    </div>
  );
}
