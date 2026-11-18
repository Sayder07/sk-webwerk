'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/lib/cart';
import { dateLong, euro, slotLabel } from '@/lib/format';
import { findZone, normalizeSelection, priceSelection } from '@/lib/pricing';
import { Steps } from './StepsBar';

export function CheckoutForm({ demo }: { demo: boolean }) {
  const { cart, ready } = useCart();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);

  if (!ready) return <div className="wrap abschnitt" aria-busy="true" />;

  const selection = normalizeSelection(cart.selection);
  const zone = cart.zoneId ? findZone(cart.zoneId) : undefined;
  if (!selection || !zone || !cart.plz || !cart.date || !cart.slotId) {
    return (
      <div className="wrap schmal abschnitt">
        <h1>Fast geschafft</h1>
        <p className="lead">Bevor es zur Kasse geht, brauchen wir noch {selection ? 'deinen Liefertermin' : 'deinen Baum'}.</p>
        <Link href={selection ? '/lieferung' : '/baeume'} className="btn">{selection ? 'Liefertermin wählen' : 'Baum aussuchen'}</Link>
      </div>
    );
  }
  const priced = priceSelection(selection, zone.id);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setSending(true);
    setError(null);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selection, plz: cart.plz, date: cart.date, slotId: cart.slotId,
          firstName: f.get('firstName'), lastName: f.get('lastName'), email: f.get('email'), phone: f.get('phone'),
          street: f.get('street'), city: f.get('city'), notes: f.get('notes'), website: f.get('website'),
          acceptTerms: f.get('acceptTerms') === 'on',
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        setError({ message: data.error || 'Da ist etwas schiefgelaufen. Bitte versuche es noch einmal.', code: data.code });
        setSending(false);
        return;
      }
      window.location.assign(data.url);
    } catch {
      setError({ message: 'Keine Verbindung. Bitte prüfe dein Internet und versuche es noch einmal.' });
      setSending(false);
    }
  }

  return (
    <div className="wrap schmal" style={{ padding: '28px 20px 64px' }}>
      <Steps current={3} />
      <p className="eyebrow">Schritt 3 · Kasse</p>
      <h1 style={{ fontSize: 'clamp(1.8rem, 6vw, 2.6rem)' }}>Deine Daten und Bezahlung</h1>

      <div className="zusammenfassung" style={{ marginBottom: 28 }}>
        <h2>Deine Bestellung</h2>
        <ul className="posten">
          {priced.items.map((i) => (
            <li key={i.id}><span>{i.label}</span><span>{euro(i.amount)}</span></li>
          ))}
          <li className="summe"><span>Gesamt inkl. MwSt.</span><span>{euro(priced.total)}</span></li>
        </ul>
        <p className="infozeile">
          <strong>Lieferung:</strong> {dateLong(cart.date)}, {slotLabel(cart.slotId)} · {cart.plz} {cart.ort}<br />
          <Link href="/lieferung">Termin ändern</Link> · <Link href={`/baeume/${selection.treeId}`}>Baum ändern</Link>
        </p>
      </div>

      <form onSubmit={submit}>
        <h2 style={{ fontSize: '1.4rem' }}>Kontakt</h2>
        <div className="felder-2">
          <div className="feld"><label htmlFor="k-vor">Vorname</label><input id="k-vor" name="firstName" required autoComplete="given-name" maxLength={80} /></div>
          <div className="feld"><label htmlFor="k-nach">Nachname</label><input id="k-nach" name="lastName" required autoComplete="family-name" maxLength={80} /></div>
        </div>
        <div className="felder-2">
          <div className="feld"><label htmlFor="k-mail">E-Mail</label><input id="k-mail" name="email" type="email" required autoComplete="email" /><span className="hilfe">Hierhin schicken wir die Bestellbestätigung.</span></div>
          <div className="feld"><label htmlFor="k-tel">Telefon</label><input id="k-tel" name="phone" type="tel" required autoComplete="tel" /><span className="hilfe">Für Rückfragen am Liefertag.</span></div>
        </div>

        <h2 style={{ fontSize: '1.4rem', marginTop: 12 }}>Lieferadresse</h2>
        <div className="feld"><label htmlFor="k-str">Straße und Hausnummer</label><input id="k-str" name="street" required autoComplete="street-address" maxLength={120} /></div>
        <div className="felder-2 felder-plz">
          <div className="feld"><label htmlFor="k-plz">PLZ</label><input id="k-plz" value={cart.plz} readOnly aria-describedby="k-plz-h" /></div>
          <div className="feld"><label htmlFor="k-ort">Ort / Stadtteil</label><input id="k-ort" name="city" required defaultValue={cart.ort} autoComplete="address-level2" maxLength={80} /></div>
        </div>
        <p className="leise klein" id="k-plz-h" style={{ marginTop: -8 }}>Die PLZ bestimmt Zone und Termin. <Link href="/lieferung">Andere PLZ wählen</Link></p>
        <div className="feld">
          <label htmlFor="k-hinweis">Hinweise für die Lieferung <span className="leise">(optional)</span></label>
          <textarea id="k-hinweis" name="notes" maxLength={600} placeholder="z. B. 2. Stock ohne Aufzug, Klingel „Müller“, Hinterhaus" />
        </div>
        <div className="honig" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>

        <label className="haekchen">
          <input type="checkbox" name="acceptTerms" required />
          <span>Ich habe die <Link href="/agb" target="_blank">AGB</Link> und die <Link href="/widerruf" target="_blank">Widerrufsbelehrung</Link> gelesen und akzeptiere sie. Hinweise zur Datenverarbeitung stehen in der <Link href="/datenschutz" target="_blank">Datenschutzerklärung</Link>.</span>
        </label>

        {error && (
          <div className="meldung meldung-fehler" role="alert">
            {error.message} {error.code === 'slot-voll' && <Link href="/lieferung">Anderes Zeitfenster wählen</Link>}
          </div>
        )}
        {demo && <div className="meldung meldung-info">Testmodus: Es ist noch kein Zahlungsanbieter verbunden. Die Bestellung wird ohne Zahlung als Testbestellung angelegt.</div>}

        <button className="btn btn-voll" disabled={sending}>{sending ? 'Einen Moment …' : `Zahlungspflichtig bestellen · ${euro(priced.total)}`}</button>
        <p className="leise klein mitte" style={{ marginTop: 12 }}>Im nächsten Schritt bezahlst du sicher über unseren Zahlungsanbieter Stripe.</p>
      </form>
    </div>
  );
}
