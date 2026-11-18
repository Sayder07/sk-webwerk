'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { shopConfig } from '@/config/shop.config';
import { useCart } from '@/lib/cart';
import type { DayAvailability } from '@/lib/delivery';
import { dateLong, dateShort, euro, euroShort, slotLabel, weekdayName } from '@/lib/format';
import { findZone, normalizeSelection, priceSelection } from '@/lib/pricing';
import { InquiryForm } from './InquiryForm';
import { Steps } from './StepsBar';

type Result = { plz: string; zoneId: number | null; ort?: string; days?: DayAvailability[] };

export function DeliveryPicker() {
  const router = useRouter();
  const { cart, ready, update } = useCart();
  const [plz, setPlz] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [date, setDate] = useState('');
  const [slotId, setSlotId] = useState('');

  const selection = ready ? normalizeSelection(cart.selection) : null;

  async function lookup(value: string, keep?: { date?: string; slotId?: string }) {
    if (!/^\d{5}$/.test(value)) {
      setError('Bitte gib eine fünfstellige Postleitzahl ein.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/availability?plz=${value}`, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
      const day = (data.days as DayAvailability[] | undefined)?.find((d) => d.date === keep?.date && d.state === 'ok');
      setDate(day ? day.date : '');
      setSlotId(day?.slots.find((s) => s.id === keep?.slotId && s.available) ? keep!.slotId! : '');
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : 'Die Verfügbarkeit konnte nicht geladen werden. Bitte versuche es noch einmal.');
    } finally {
      setLoading(false);
    }
  }

  // gespeicherte PLZ und Terminwahl wiederherstellen
  useEffect(() => {
    if (ready && cart.plz && !result) {
      setPlz(cart.plz);
      void lookup(cart.plz, { date: cart.date, slotId: cart.slotId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  if (!ready) return <div className="wrap abschnitt" aria-busy="true" />;

  if (!selection) {
    return (
      <div className="wrap schmal abschnitt">
        <h1>Erst der Baum, dann die Lieferung</h1>
        <p className="lead">Du hast noch keinen Baum ausgewählt. Such dir zuerst deine Nordmanntanne aus – danach geht es hier mit dem Liefertermin weiter.</p>
        <Link href="/baeume" className="btn">Baum aussuchen</Link>
      </div>
    );
  }

  const zone = result?.zoneId ? findZone(result.zoneId) : undefined;
  const priced = priceSelection(selection, zone?.id);
  const day = result?.days?.find((d) => d.date === date);
  const anyDay = result?.days?.some((d) => d.state === 'ok');

  const next = () => {
    if (!zone || !date || !slotId) return;
    update({ plz: result!.plz, ort: result!.ort, zoneId: zone.id, date, slotId });
    router.push('/kasse');
  };

  return (
    <div className="wrap schmal" style={{ padding: '28px 20px 64px' }}>
      <Steps current={2} />
      <p className="eyebrow">Schritt 2 · Lieferung</p>
      <h1 style={{ fontSize: 'clamp(1.8rem, 6vw, 2.6rem)' }}>Wohin und wann dürfen wir liefern?</h1>

      <div className="zusammenfassung" style={{ marginBottom: 24 }}>
        <ul className="posten">
          {priced.items.map((i) => (
            <li key={i.id}><span>{i.label}</span><span>{euro(i.amount)}</span></li>
          ))}
          <li className="summe"><span>{zone ? 'Gesamt inkl. Lieferung' : 'Zwischensumme ohne Lieferung'}</span><span>{euro(priced.total)}</span></li>
        </ul>
        <p className="klein" style={{ margin: '8px 0 0' }}><Link href={`/baeume/${selection.treeId}`}>Auswahl ändern</Link></p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void lookup(plz.trim());
        }}
      >
        <div className="feld">
          <label htmlFor="plz">Deine Postleitzahl</label>
          <div className="plz-zeile">
            <input id="plz" inputMode="numeric" autoComplete="postal-code" maxLength={5} placeholder="z. B. 35583" value={plz} onChange={(e) => setPlz(e.target.value.replace(/\D/g, ''))} />
            <button className="btn" disabled={loading}>{loading ? 'Prüfe …' : 'Prüfen'}</button>
          </div>
          <span className="hilfe">Damit erkennen wir deine Lieferzone und zeigen dir die freien Termine.</span>
        </div>
      </form>
      {error && <div className="meldung meldung-fehler" role="alert">{error}</div>}

      {result && result.zoneId === null && (
        <section aria-live="polite">
          <div className="meldung meldung-info">
            <strong>{result.plz} liegt außerhalb unseres festen Liefergebiets.</strong> Kein Problem – schick uns eine kurze Anfrage. Wir prüfen, ob wir zu dir kommen können, und nennen dir einen individuellen Lieferpreis.
          </div>
          <h2 style={{ fontSize: '1.4rem' }}>Lieferung anfragen</h2>
          <InquiryForm kind="ausserhalb" plz={result.plz} selection={selection} messageLabel="Noch etwas, das wir wissen sollten?" />
        </section>
      )}

      {result && zone && (
        <section aria-live="polite">
          <div className="meldung meldung-ok">
            <strong>{result.plz} {result.ort} – {zone.name}.</strong> Lieferung für {euroShort(zone.fee)}.
          </div>

          {!anyDay ? (
            <div className="meldung meldung-info">
              Für deine Zone sind online leider keine Termine mehr frei. <Link href="/kontakt">Schreib uns</Link> – vielleicht finden wir noch eine Lösung.
            </div>
          ) : (
            <>
              <fieldset className="gruppe">
                <legend>Liefertag</legend>
                <p className="leise klein">Bestellung mindestens {shopConfig.delivery.minLeadDays} Tage vorher – so kommt dein Baum frisch vom Förster.</p>
                <div className="tage">
                  {result.days!.map((d) => (
                    <label key={d.date} className="tag">
                      <input type="radio" name="tag" value={d.date} disabled={d.state !== 'ok'} checked={date === d.date} onChange={() => { setDate(d.date); setSlotId(''); }} />
                      <span className="tag-feld">
                        <span className="tag-wochentag">{weekdayName(d.date).slice(0, 2)}</span>
                        <span className="tag-datum">{dateShort(d.date).slice(4)}</span>
                        <span className="tag-status">{d.state === 'ok' ? 'frei' : d.state === 'voll' ? 'ausgebucht' : 'zu kurzfristig'}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {day && (
                <fieldset className="gruppe">
                  <legend>Zeitfenster am {dateLong(day.date)}</legend>
                  <p className="leise klein">In diesem Zeitraum kommen wir bei dir vorbei. Bitte sei dann zu Hause.</p>
                  <div className="fenster">
                    {day.slots.map((s) => (
                      <label key={s.id} className="tag">
                        <input type="radio" name="fenster" value={s.id} disabled={!s.available} checked={slotId === s.id} onChange={() => setSlotId(s.id)} />
                        <span className="tag-feld">
                          <span className="tag-datum">{slotLabel(s.id)}</span>
                          <span className="tag-status">{!s.available ? 'ausgebucht' : s.free === 1 ? 'nur noch 1 frei' : 'frei'}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              )}

              <button type="button" className="btn btn-voll" disabled={!date || !slotId} onClick={next}>
                {date && slotId ? 'Weiter zur Kasse' : 'Bitte Tag und Zeitfenster wählen'}
              </button>
            </>
          )}
        </section>
      )}
    </div>
  );
}
