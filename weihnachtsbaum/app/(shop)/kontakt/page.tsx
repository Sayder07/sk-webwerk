import type { Metadata } from 'next';
import { shopConfig } from '@/config/shop.config';
import { InquiryForm } from '@/components/InquiryForm';

export const metadata: Metadata = { title: 'Kontakt' };

export default function ContactPage() {
  const c = shopConfig.company;
  return (
    <div className="wrap schmal abschnitt">
      <p className="eyebrow">Kontakt</p>
      <h1>Schreib uns</h1>
      <p className="lead">Fragen zur Bestellung, mehrere Bäume, Lieferung außerhalb des Gebiets? Wir antworten persönlich und so schnell wie möglich.</p>
      <p>
        {c.name} · {c.owner}<br />
        Telefon: {c.phone} · E-Mail: {c.email}
        {c.whatsapp && <><br /><a href={`https://wa.me/${c.whatsapp}`} rel="noopener">Per WhatsApp schreiben</a></>}
      </p>
      <InquiryForm kind="kontakt" submitLabel="Nachricht senden" />
    </div>
  );
}
