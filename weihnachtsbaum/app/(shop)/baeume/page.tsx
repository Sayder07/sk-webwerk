import type { Metadata } from 'next';
import Link from 'next/link';
import { shopConfig } from '@/config/shop.config';
import { TreeCardArt } from '@/components/TreeArt';
import { euroShort } from '@/lib/format';
import { taxSentence } from '@/lib/texts';

export const metadata: Metadata = { title: 'Baum aussuchen', description: 'Nordmanntannen von 1,25 m bis 2,75 m – Größe wählen und im Konfigurator Form und Extras bestimmen.' };

export default function TreesPage() {
  return (
    <section className="abschnitt">
      <div className="wrap">
        <p className="eyebrow">Schritt 1 · Baum aussuchen</p>
        <h1>Welche Größe darf es sein?</h1>
        <p className="lead">Alle Bäume sind echte Nordmanntannen in Premium-Qualität. Tipp: Miss die Raumhöhe und zieh rund 30 cm für Ständer und Spitze ab.</p>
        <div className="baumraster" style={{ marginTop: 28 }}>
          {shopConfig.trees.map((t) => (
            <Link key={t.id} href={`/baeume/${t.id}`} className="baumkarte">
              <div className="baumkarte-bild">{t.photo ? <img src={t.photo} alt={`Nordmanntanne ${t.label}`} /> : <TreeCardArt heightCm={(t.minCm + t.maxCm) / 2} />}</div>
              <div className="baumkarte-text">
                <span className="baumkarte-groesse">{t.label}</span>
                <span className="baumkarte-hinweis">{t.hint}</span>
                <div className="baumkarte-preis"><span className="preis">{euroShort(t.price)}</span><span className="pfeil">Auswählen →</span></div>
              </div>
            </Link>
          ))}
        </div>
        <p className="leise klein" style={{ marginTop: 20 }}>{taxSentence()} Zzgl. Lieferung je nach Zone ({shopConfig.zones.map((z) => euroShort(z.fee)).join(' / ')}). Die Bilder sind Illustrationen – jeder Baum ist ein Naturprodukt und ein Einzelstück.</p>
      </div>
    </section>
  );
}
