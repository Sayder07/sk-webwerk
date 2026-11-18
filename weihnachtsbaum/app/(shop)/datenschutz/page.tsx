import type { Metadata } from 'next';
import { shopConfig } from '@/config/shop.config';
import { LegalNote } from '@/components/Legal';

export const metadata: Metadata = { title: 'Datenschutz' };

export default function PrivacyPage() {
  const c = shopConfig.company;
  return (
    <div className="wrap schmal abschnitt prosa">
      <h1>Datenschutzerklärung</h1>
      <LegalNote />
      <h2>1. Verantwortlicher</h2>
      <p>{c.name} – ein Angebot von {c.legalName}, Inhaber {c.owner}, {c.street}, {c.zipCity} · {c.email} · {c.phone}</p>

      <h2>2. Welche Daten wir verarbeiten</h2>
      <h3>Besuch der Website</h3>
      <p>Beim Aufruf der Seiten verarbeitet unser Hosting-Anbieter technisch notwendige Daten (z. B. IP-Adresse, Zeitpunkt, aufgerufene Seite) in Server-Logs. Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO. [Hosting-Anbieter, Sitz und Auftragsverarbeitungsvertrag eintragen, z. B. Vercel Inc.]</p>
      <h3>Bestellung</h3>
      <p>Für die Abwicklung deiner Bestellung verarbeiten wir Name, Lieferadresse, E-Mail-Adresse, Telefonnummer, Lieferhinweise, bestellte Artikel und den Liefertermin. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung). Die Bestelldaten werden in einer Datenbank gespeichert. [Datenbank-Anbieter und Serverstandort eintragen, z. B. Supabase, EU-Region.]</p>
      <h3>Zahlung</h3>
      <p>Die Zahlung wird über Stripe abgewickelt (Stripe Payments Europe, Ltd., Irland). Zahlungsdaten gibst du direkt bei Stripe ein; wir erhalten keine vollständigen Karten- oder Kontodaten. [Angaben prüfen und ergänzen, inkl. Drittlandübermittlung.]</p>
      <h3>E-Mails</h3>
      <p>Bestellbestätigungen und Antworten auf Anfragen versenden wir über einen E-Mail-Dienstleister. [Anbieter eintragen, z. B. Resend, inkl. Auftragsverarbeitung.]</p>
      <h3>Anfragen (Kontakt, Deko, Lieferung außerhalb)</h3>
      <p>Wenn du uns eine Anfrage schickst, verarbeiten wir deine Angaben, um sie zu beantworten. Rechtsgrundlage: Art. 6 Abs. 1 lit. b bzw. lit. f DSGVO.</p>

      <h2>3. Cookies und lokaler Speicher</h2>
      <p>Diese Website setzt keine Tracking- oder Marketing-Cookies und bindet keine Analyse-Tools ein. Deine Baumauswahl und der gewählte Liefertermin werden bis zum Abschluss der Bestellung ausschließlich lokal in deinem Browser gespeichert (Local Storage) – das ist technisch notwendig, damit der Bestellablauf funktioniert. Schriftarten werden von unserem eigenen Server geladen, nicht von Dritten.</p>

      <h2>4. Speicherdauer</h2>
      <p>[Speicherfristen eintragen – z. B. Bestell- und Rechnungsdaten nach den handels- und steuerrechtlichen Aufbewahrungspflichten, Anfragen bis zur abschließenden Bearbeitung.]</p>

      <h2>5. Deine Rechte</h2>
      <p>Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch sowie das Recht, dich bei einer Datenschutz-Aufsichtsbehörde zu beschweren (in Hessen: Der Hessische Beauftragte für Datenschutz und Informationsfreiheit).</p>
    </div>
  );
}
