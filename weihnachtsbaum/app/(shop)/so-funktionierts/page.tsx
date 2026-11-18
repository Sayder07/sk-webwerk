import type { Metadata } from 'next';
import Link from 'next/link';
import { shopConfig } from '@/config/shop.config';
import { euroShort } from '@/lib/format';
import { deliveryDaysText, deliveryHoursText, seasonRangeText } from '@/lib/texts';

export const metadata: Metadata = { title: "So funktioniert's", description: 'Baum aussuchen, Wunschtermin wählen, liefern lassen – so läuft die Bestellung ab.' };

export default function HowPage() {
  const extra = (id: string) => shopConfig.extras.find((e) => e.id === id);
  return (
    <>
      <div className="wrap schmal seitenkopf">
        <p className="eyebrow">So funktioniert&apos;s</p>
        <h1>Vom Klick bis zum Baum im Wohnzimmer</h1>
        <p className="lead">Kein Schleppen, kein Stress: Du bestellst in ein paar Minuten am Handy, wir kümmern uns um den Rest.</p>
      </div>
      <section className="abschnitt" style={{ paddingTop: 24 }}>
        <div className="wrap schmal">
          <ol className="schritte">
            <li><h3>Baum aussuchen</h3><p>Wähle die Größe deiner Nordmanntanne (1,25 m bis 2,75 m) und die Form: schlank, normal oder breit – ohne Aufpreis.</p></li>
            <li><h3>Extras dazunehmen</h3><p>Auf Wunsch stellen wir den Baum auf ({euroShort(extra('aufbau')!.price)}), bringen einen Standfuß mit ({euroShort(extra('standfuss')!.price)}), legen Zweige dazu ({euroShort(extra('zweige')!.price)}) oder holen den Baum im Januar wieder ab ({euroShort(extra('abholung')!.price)}).</p></li>
            <li><h3>Postleitzahl eingeben, Termin wählen</h3><p>Wir liefern {deliveryDaysText()}, jeweils {deliveryHoursText()}, vom {seasonRangeText()}. Du suchst dir Tag und Zeitfenster aus.</p></li>
            <li><h3>Online bezahlen</h3><p>Sicher über Stripe – zum Beispiel mit Karte, Apple Pay oder Google Pay. Die Bestätigung kommt sofort per E-Mail.</p></li>
            <li><h3>Wir holen deinen Baum beim Förster</h3><p>Erst nach deiner Bestellung. Deshalb brauchen wir mindestens {shopConfig.delivery.minLeadDays} Tage Vorlauf – und dein Baum steht nicht wochenlang herum.</p></li>
            <li><h3>Lieferung bis an die Tür – oder bis ins Wohnzimmer</h3><p>Wir kommen im gewählten Zeitfenster. Mit Aufbau-Service steht der Baum danach gerade im Ständer, das Netz nehmen wir wieder mit.</p></li>
          </ol>
          <div className="cta-band" style={{ marginTop: 36 }}>
            <h2>Jetzt Wunschtermin sichern</h2>
            <p>Die Plätze pro Zeitfenster sind begrenzt.</p>
            <Link href="/baeume" className="btn btn-gold">Baum aussuchen</Link>
          </div>
        </div>
      </section>
    </>
  );
}
