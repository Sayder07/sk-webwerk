'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { shopConfig } from '@/config/shop.config';
import { loadCart, saveCart } from '@/lib/cart';
import { euro, euroShort } from '@/lib/format';
import { findShape, findTree, lowestDeliveryFee, priceSelection } from '@/lib/pricing';
import { taxShort } from '@/lib/texts';
import { Steps } from './StepsBar';
import { SizeScene } from './TreeArt';

export function Configurator({ initialTreeId }: { initialTreeId: string }) {
  const router = useRouter();
  const [treeId, setTreeId] = useState(initialTreeId);
  const [shapeId, setShapeId] = useState('normal');
  const [extras, setExtras] = useState<string[]>([]);

  // Form und Extras aus einer früheren Auswahl übernehmen (z. B. nach „Zurück“)
  useEffect(() => {
    const saved = loadCart().selection;
    if (saved) {
      if (findShape(saved.shapeId)) setShapeId(saved.shapeId);
      setExtras(saved.extras ?? []);
    }
  }, []);

  const tree = findTree(treeId)!;
  const shape = findShape(shapeId)!;
  const { subtotal } = priceSelection({ treeId, shapeId, extras });

  const toggleExtra = (id: string) => setExtras((prev) => (prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]));

  const next = () => {
    saveCart({ ...loadCart(), selection: { treeId, shapeId, extras } });
    router.push('/lieferung');
  };

  return (
    <div className="wrap konfig">
      <div className="konfig-links">
        <Steps current={1} />
        <figure className="konfig-buehne" style={{ margin: 0 }}>
          <SizeScene heightCm={(tree.minCm + tree.maxCm) / 2} widthFactor={shape.widthFactor} label={tree.label} />
          <figcaption>Größenvergleich (Illustration) – jeder Baum ist ein Einzelstück.</figcaption>
        </figure>
      </div>

      <div>
        <p className="eyebrow">Dein Baum</p>
        <h1 style={{ fontSize: 'clamp(1.8rem, 6vw, 2.6rem)' }}>Nordmanntanne {tree.label}</h1>
        <p className="leise">{tree.hint}. Premium-Qualität, frisch vom Förster aus der Region.</p>

        <fieldset className="gruppe">
          <legend>Größe</legend>
          <div className="wahl wahl-2">
            {shopConfig.trees.map((t) => (
              <label key={t.id} className="option">
                <input type="radio" name="groesse" value={t.id} checked={t.id === treeId} onChange={() => setTreeId(t.id)} />
                <span className="option-feld">
                  <span className="option-titel">{t.label}</span>
                  <span className="option-preis">{euroShort(t.price)}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="gruppe">
          <legend>Baumform</legend>
          <p className="leise klein">Ohne Aufpreis – wir suchen beim Förster passend für dich aus.</p>
          <div className="wahl wahl-3">
            {shopConfig.shapes.map((s) => (
              <label key={s.id} className="option">
                <input type="radio" name="form" value={s.id} checked={s.id === shapeId} onChange={() => setShapeId(s.id)} />
                <span className="option-feld">
                  <span className="option-titel">{s.label}</span>
                  <span className="option-text">{s.description}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="gruppe">
          <legend>Extras</legend>
          <p className="leise klein">Alles optional – wähle, was du brauchst.</p>
          <div className="wahl">
            {shopConfig.extras.map((e) => (
              <label key={e.id} className="option extra">
                <input type="checkbox" checked={extras.includes(e.id)} onChange={() => toggleExtra(e.id)} />
                <span className="option-feld">
                  <span className="option-zeile">
                    <span className="option-titel">{e.label}</span>
                    <span className="option-preis">+ {euroShort(e.price)}</span>
                  </span>
                  <span className="option-text">{e.description}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="preisleiste" aria-live="polite">
          <div className="preisleiste-summe">
            <strong>{euro(subtotal)}</strong>
            <span>{taxShort()}, zzgl. Lieferung ab {euroShort(lowestDeliveryFee())}</span>
          </div>
          <button type="button" className="btn" onClick={next}>Weiter zur Lieferung</button>
        </div>
      </div>
    </div>
  );
}
