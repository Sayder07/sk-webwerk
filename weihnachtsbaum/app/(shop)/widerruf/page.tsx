import type { Metadata } from 'next';
import { shopConfig } from '@/config/shop.config';
import { LegalNote } from '@/components/Legal';

export const metadata: Metadata = { title: 'Widerrufsbelehrung' };

export default function WithdrawalPage() {
  const c = shopConfig.company;
  return (
    <div className="wrap schmal abschnitt prosa">
      <h1>Widerrufsbelehrung</h1>
      <LegalNote />
      <div className="platzhalter">
        <strong>Vor dem Launch klären lassen:</strong> Für frisch geschlagene Weihnachtsbäume kann das Widerrufsrecht ausgeschlossen sein
        (§ 312g Abs. 2 Nr. 2 BGB – schnell verderbliche Waren), für Standfuß und Dienstleistungen gelten ggf. andere Regeln. Ob und wie
        das hier gilt, muss rechtlich geprüft und dann eindeutig formuliert werden. Der folgende Text orientiert sich am gesetzlichen Muster.
      </div>
      <h2>Widerrufsrecht</h2>
      <p>Du hast das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag, an dem du oder ein von dir benannter Dritter, der nicht der Beförderer ist, die Waren in Besitz genommen hast bzw. hat.</p>
      <p>Um dein Widerrufsrecht auszuüben, musst du uns ({c.name} – {c.legalName}, Inhaber {c.owner}, {c.street}, {c.zipCity}, Telefon {c.phone}, E-Mail {c.email}) mittels einer eindeutigen Erklärung (z. B. ein mit der Post versandter Brief oder eine E-Mail) über deinen Entschluss, diesen Vertrag zu widerrufen, informieren.</p>
      <h2>Folgen des Widerrufs</h2>
      <p>[Text nach gesetzlichem Muster eintragen: Rückzahlung, Rücksendung bzw. Abholung, Wertersatz.]</p>
      <h2>Ausschluss bzw. Erlöschen des Widerrufsrechts</h2>
      <p>[Nach rechtlicher Prüfung eintragen.]</p>
      <h2>Muster-Widerrufsformular</h2>
      <p>[Muster-Widerrufsformular nach Anlage 2 zu Art. 246a § 1 Abs. 2 EGBGB einfügen.]</p>
    </div>
  );
}
