import Link from 'next/link';
import { shopConfig, testimonials } from '@/config/shop.config';
import { IconCalendar, IconForest, IconHome } from '@/components/Icons';
import { HeroScene, TreeCardArt } from '@/components/TreeArt';
import { euroShort } from '@/lib/format';
import { deliveryDaysText, deliveryHoursText, seasonRangeText } from '@/lib/texts';

export default function HomePage() {
  const { trees, zones, images, delivery } = shopConfig;
  const minPrice = Math.min(...trees.map((t) => t.price));
  return (
    <>
      <section className="hero">
        <div className="wrap hero-innen">
          <div className="hero-text">
            <p className="eyebrow">Echte Nordmanntannen · Wetzlar &amp; Umgebung · Saison {shopConfig.season.year}</p>
            <h1>Dein Weihnachtsbaum kommt zu dir nach Hause.</h1>
            <p className="lead">Kein Schleppen, kein Stress – dein Baum kommt zum Wunschtermin, auf Wunsch fertig aufgestellt.</p>
            <div className="hero-aktionen">
              <Link href="/baeume" className="btn btn-gold">Baum aussuchen</Link>
              <Link href="/so-funktionierts" className="btn btn-hell">So funktioniert&apos;s</Link>
            </div>
            <ul className="haken">
              <li>Frisch vom Förster aus der Region</li>
              <li>Lieferung zum Wunschtermin – {deliveryDaysText()}</li>
              <li>Auf Wunsch fertig aufgestellt</li>
            </ul>
          </div>
          <div className="hero-bild">
            {images.heroPhoto ? <img src={images.heroPhoto} alt="Geschmückter Weihnachtsbaum im Wohnzimmer" /> : <HeroScene />}
          </div>
        </div>
      </section>

      <section className="abschnitt">
        <div className="wrap">
          <div className="raster raster-3">
            <div className="karte">
              <div className="symbol"><IconCalendar /></div>
              <h3>Lieferung zum Wunschtermin</h3>
              <p className="leise">Du wählst Tag und Zeitfenster, wir klingeln pünktlich. Geliefert wird {deliveryDaysText()}, jeweils {deliveryHoursText()}.</p>
            </div>
            <div className="karte">
              <div className="symbol"><IconHome /></div>
              <h3>Auf Wunsch fertig aufgestellt</h3>
              <p className="leise">Wir tragen den Baum rein, stellen ihn in den Ständer und richten ihn aus. Du musst nur noch schmücken.</p>
            </div>
            <div className="karte">
              <div className="symbol"><IconForest /></div>
              <h3>Frisch vom Förster aus der Region</h3>
              <p className="leise">Premium-Nordmanntannen, die wir erst nach deiner Bestellung beim Förster holen – statt wochenlang im Netz am Straßenrand.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="abschnitt abschnitt-hell">
        <div className="wrap">
          <p className="eyebrow">Unsere Bäume</p>
          <h2>Sechs Größen, eine Sorte: Nordmanntanne</h2>
          <p className="lead">Weiche Nadeln, satter Wuchs, lange haltbar. Ab {euroShort(minPrice)} – die Baumform (schlank, normal oder breit) wählst du ohne Aufpreis.</p>
          <div className="baumraster" style={{ marginTop: 24 }}>
            {trees.map((t) => (
              <Link key={t.id} href={`/baeume/${t.id}`} className="baumkarte">
                <div className="baumkarte-bild">{t.photo ? <img src={t.photo} alt={`Nordmanntanne ${t.label}`} /> : <TreeCardArt heightCm={(t.minCm + t.maxCm) / 2} />}</div>
                <div className="baumkarte-text">
                  <span className="baumkarte-groesse">{t.label}</span>
                  <div className="baumkarte-preis"><span className="preis">{euroShort(t.price)}</span><span className="pfeil">Auswählen →</span></div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="abschnitt">
        <div className="wrap">
          <p className="eyebrow">So funktioniert&apos;s</p>
          <h2>In drei Schritten zum Baum</h2>
          <ol className="schritte schritte-3" style={{ marginTop: 24 }}>
            <li><h3>Baum aussuchen</h3><p>Größe und Form wählen, auf Wunsch Aufbau, Standfuß, Zweige oder die Abholung im Januar dazu.</p></li>
            <li><h3>Wunschtermin sichern</h3><p>Postleitzahl eingeben, Liefertag und Zeitfenster wählen, online bezahlen.</p></li>
            <li><h3>Zurücklehnen</h3><p>Wir holen deinen Baum frisch beim Förster und bringen ihn dir bis ins Wohnzimmer.</p></li>
          </ol>
        </div>
      </section>

      <section className="abschnitt abschnitt-moos">
        <div className="wrap">
          <p className="eyebrow">Liefergebiet</p>
          <h2>Wetzlar, Garbenheim und rundherum</h2>
          <p className="lead">Die Lieferung berechnen wir getrennt vom Baum – fair nach Entfernung. Lieferzeitraum: {seasonRangeText()}. Bitte bestell mindestens {delivery.minLeadDays} Tage vor deinem Wunschtermin.</p>
          <table className="tabelle" style={{ marginTop: 20 }}>
            <thead><tr><th>Zone</th><th>Gebiet</th><th className="r">Lieferung</th></tr></thead>
            <tbody>
              {zones.map((z) => (
                <tr key={z.id}><td className="nowrap">{z.name}</td><td>{z.area}</td><td className="r">{euroShort(z.fee)}</td></tr>
              ))}
              <tr><td className="nowrap">Außerhalb</td><td>über 25 km – <Link href="/kontakt">frag uns einfach an</Link></td><td className="r">auf Anfrage</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      {testimonials.length > 0 && (
        <section className="abschnitt abschnitt-hell">
          <div className="wrap">
            <p className="eyebrow">Kundenstimmen</p>
            <h2>Das sagen unsere Kunden</h2>
            <div className="raster raster-3" style={{ marginTop: 24 }}>
              {testimonials.map((t) => (
                <figure key={t.name} className="karte" style={{ margin: 0 }}>
                  <blockquote style={{ margin: '0 0 12px' }}>„{t.text}“</blockquote>
                  <figcaption className="leise klein">{t.name}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="abschnitt">
        <div className="wrap">
          <div className="cta-band">
            <h2>Jetzt Wunschtermin sichern</h2>
            <p>Die Zeitfenster sind begrenzt – wer früh bestellt, hat die freie Wahl.</p>
            <Link href="/baeume" className="btn btn-gold">Baum aussuchen</Link>
          </div>
        </div>
      </section>
    </>
  );
}
