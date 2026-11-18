import type { Metadata } from 'next';
import Link from 'next/link';
import { shopConfig } from '@/config/shop.config';
import { euroShort } from '@/lib/format';
import { deliveryDaysText, deliveryHoursText, seasonRangeText } from '@/lib/texts';

export const metadata: Metadata = { title: 'Häufige Fragen', description: 'Antworten zu Lieferung, Terminen, Aufbau, Bezahlung und Abholung.' };

export default function FaqPage() {
  const { zones, delivery, extras } = shopConfig;
  const price = (id: string) => euroShort(extras.find((e) => e.id === id)!.price);
  const faqs: { q: string; a: React.ReactNode }[] = [
    { q: 'Welche Bäume liefert ihr?', a: <p>Ausschließlich echte Nordmanntannen in Premium-Qualität, von 1,25 m bis 2,75 m. Sie kommen von einem Förster aus der Region.</p> },
    { q: 'Wann wird geliefert?', a: <p>Wir liefern {deliveryDaysText()}, jeweils {deliveryHoursText()}, vom {seasonRangeText()}. Sonntags liefern wir nicht.</p> },
    { q: 'Bis wann muss ich bestellen?', a: <p>Mindestens {delivery.minLeadDays} Tage vor deinem Wunschtermin. Wir holen deinen Baum erst nach der Bestellung beim Förster – so ist er frisch, braucht aber etwas Vorlauf.</p> },
    { q: 'Was kostet die Lieferung?', a: <><p>Die Lieferung berechnen wir getrennt vom Baum, je nach Entfernung:</p><ul>{zones.map((z) => <li key={z.id}>{z.name} – {z.area}: {euroShort(z.fee)}</li>)}<li>Weiter weg: auf Anfrage mit individuellem Preis</li></ul></> },
    { q: 'Wie genau ist das Zeitfenster?', a: <p>Das hängt von deiner Zone ab: In Wetzlar wählst du ein Fenster von einer Stunde, im Umland sind die Fenster etwas größer, weil die Wege länger sind. Die verfügbaren Fenster siehst du nach Eingabe deiner Postleitzahl.</p> },
    { q: 'Muss ich bei der Lieferung zu Hause sein?', a: <p>Ja, bitte. Sollte dir etwas dazwischenkommen, melde dich so früh wie möglich – dann suchen wir gemeinsam eine Lösung.</p> },
    { q: 'Was ist beim Aufbau-Service dabei?', a: <p>Für {price('aufbau')} tragen wir den Baum an seinen Platz, stellen ihn in den Ständer, richten ihn gerade aus und nehmen das Netz ab. Du brauchst einen Ständer – deinen eigenen oder den, den du bei uns mitbestellst.</p> },
    { q: 'Habt ihr auch Christbaumständer?', a: <p>Ja, einen stabilen Standfuß zum Kauf für {price('standfuss')}. Er gehört dir – eine Miete bieten wir nicht an.</p> },
    { q: 'Wie bezahle ich?', a: <p>Online direkt bei der Bestellung, sicher über Stripe – zum Beispiel mit Kredit- oder Debitkarte, Apple Pay oder Google Pay. Barzahlung an der Tür ist nicht möglich.</p> },
    { q: 'Ich möchte mehrere Bäume bestellen. Geht das?', a: <p>Gern! Der Konfigurator ist auf einen Baum pro Bestellung ausgelegt. Für mehrere Bäume an eine Adresse <Link href="/kontakt">schreib uns kurz</Link> – dann fällt die Lieferung nur einmal an.</p> },
    { q: 'Ich wohne außerhalb eures Liefergebiets.', a: <p>Gib im Bestellablauf einfach deine Postleitzahl ein. Liegt sie außerhalb, kannst du direkt eine Anfrage schicken – wir melden uns mit einem individuellen Preis.</p> },
    { q: 'Wie läuft die Abholung im Januar?', a: <p>Du buchst sie für {price('abholung')} gleich mit. Nach den Feiertagen stimmen wir den Termin per E-Mail mit dir ab und holen den abgeschmückten Baum bei dir ab.</p> },
    { q: 'Gibt es auch Lichterketten oder Baumschmuck?', a: <p>Nicht im Shop. Wenn du etwas Bestimmtes suchst, schick uns eine <Link href="/deko-anfrage">Deko-Anfrage</Link> – wir schauen, was wir möglich machen können.</p> },
    { q: 'Wie bleibt mein Baum lange schön?', a: <p>Stell ihn möglichst nicht direkt neben die Heizung und gib ihm einen Ständer mit Wasser – ein frischer Baum trinkt in den ersten Tagen viel. Am besten lässt du ihn nach der Lieferung einen Tag an einem kühlen Ort ankommen.</p> },
  ];
  return (
    <>
      <div className="wrap schmal seitenkopf">
        <p className="eyebrow">Fragen &amp; Antworten</p>
        <h1>Häufige Fragen</h1>
      </div>
      <section className="abschnitt" style={{ paddingTop: 16 }}>
        <div className="wrap schmal faq">
          {faqs.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <div className="antwort">{f.a}</div>
            </details>
          ))}
          <p style={{ marginTop: 24 }}>Deine Frage war nicht dabei? <Link href="/kontakt">Schreib uns.</Link></p>
        </div>
      </section>
    </>
  );
}
