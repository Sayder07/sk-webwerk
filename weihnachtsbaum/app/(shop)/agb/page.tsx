import type { Metadata } from 'next';
import { shopConfig } from '@/config/shop.config';
import { LegalNote } from '@/components/Legal';
import { deliveryDaysText, deliveryHoursText, taxSentence } from '@/lib/texts';

export const metadata: Metadata = { title: 'AGB' };

export default function TermsPage() {
  const c = shopConfig.company;
  return (
    <div className="wrap schmal abschnitt prosa">
      <h1>Allgemeine Geschäftsbedingungen</h1>
      <LegalNote />
      <h2>1. Geltungsbereich und Anbieter</h2>
      <p>Diese Bedingungen gelten für alle Bestellungen über diese Website bei {c.name}, einem Angebot von {c.legalName}, Inhaber {c.owner}, {c.street}, {c.zipCity}.</p>
      <h2>2. Vertragsschluss</h2>
      <p>Die Darstellung der Bäume und Leistungen ist kein rechtlich bindendes Angebot. Mit Klick auf „Zahlungspflichtig bestellen“ gibst du eine verbindliche Bestellung ab. [Regelung zum Zustandekommen des Vertrags – z. B. mit der Bestellbestätigung per E-Mail – eintragen.]</p>
      <h2>3. Preise und Lieferkosten</h2>
      <p>{taxSentence()} Alle Preise verstehen sich in Euro. Lieferkosten werden je nach Lieferzone gesondert berechnet und vor Abschluss der Bestellung angezeigt.</p>
      <h2>4. Zahlung</h2>
      <p>Die Zahlung erfolgt online bei der Bestellung über den Zahlungsdienstleister Stripe mit den dort angebotenen Zahlarten.</p>
      <h2>5. Lieferung</h2>
      <p>Wir liefern im angegebenen Liefergebiet zum gewählten Termin und Zeitfenster ({deliveryDaysText()}, {deliveryHoursText()}). [Regelungen eintragen: Anwesenheit bei Lieferung, erfolgloser Zustellversuch, Verschiebung durch Wetter oder höhere Gewalt.]</p>
      <h2>6. Naturprodukt</h2>
      <p>Weihnachtsbäume sind Naturprodukte. Wuchs, Form und Größe innerhalb der gewählten Größenklasse können von Abbildungen abweichen; Abbildungen sind beispielhaft.</p>
      <h2>7. Zusatzleistungen</h2>
      <p>[Regelungen zu Aufbau im Ständer und Abholung im Januar eintragen – Umfang, Terminabstimmung, Voraussetzungen wie abgeschmückter Baum.]</p>
      <h2>8. Widerrufsrecht</h2>
      <p>Informationen zum Widerrufsrecht findest du in der Widerrufsbelehrung.</p>
      <h2>9. Gewährleistung und Haftung</h2>
      <p>Es gelten die gesetzlichen Mängelhaftungsrechte. [Haftungsregelung eintragen.]</p>
      <h2>10. Schlussbestimmungen</h2>
      <p>[Anwendbares Recht, Hinweis zur Verbraucherstreitbeilegung eintragen.]</p>
    </div>
  );
}
