'use client';
import Link from 'next/link';
import { useState } from 'react';
import type { Selection } from '@/lib/pricing';

type Props = {
  kind: 'ausserhalb' | 'deko' | 'kontakt';
  plz?: string;
  selection?: Selection;
  messageLabel?: string;
  messagePlaceholder?: string;
  submitLabel?: string;
};

export function InquiryForm({ kind, plz = '', selection, messageLabel = 'Deine Nachricht', messagePlaceholder, submitLabel = 'Anfrage senden' }: Props) {
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle');
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setState('sending');
    setError('');
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind, selection,
          name: f.get('name'), email: f.get('email'), phone: f.get('phone'), plz: f.get('plz'), ort: f.get('ort'),
          wishDate: f.get('wishDate'), message: f.get('message'), website: f.get('website'),
          acceptPrivacy: f.get('acceptPrivacy') === 'on',
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Das hat leider nicht geklappt.');
      setState('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Das hat leider nicht geklappt.');
      setState('idle');
    }
  }

  if (state === 'done') {
    return <div className="meldung meldung-ok" role="status"><strong>Danke – deine Anfrage ist bei uns.</strong> Wir melden uns so schnell wie möglich persönlich bei dir. Eine Kopie haben wir dir per E-Mail geschickt.</div>;
  }

  return (
    <form onSubmit={submit} noValidate={false}>
      {error && <div className="meldung meldung-fehler" role="alert">{error}</div>}
      <div className="felder-2">
        <div className="feld"><label htmlFor="a-name">Name</label><input id="a-name" name="name" required autoComplete="name" maxLength={120} /></div>
        <div className="feld"><label htmlFor="a-email">E-Mail</label><input id="a-email" name="email" type="email" required autoComplete="email" /></div>
      </div>
      <div className="felder-2">
        <div className="feld"><label htmlFor="a-phone">Telefon <span className="leise">(optional)</span></label><input id="a-phone" name="phone" type="tel" autoComplete="tel" /></div>
        {kind === 'ausserhalb' ? (
          <div className="feld"><label htmlFor="a-plz">Postleitzahl</label><input id="a-plz" name="plz" inputMode="numeric" pattern="\d{5}" maxLength={5} defaultValue={plz} required /></div>
        ) : (
          <div className="feld"><label htmlFor="a-plz">Postleitzahl <span className="leise">(optional)</span></label><input id="a-plz" name="plz" inputMode="numeric" maxLength={5} /></div>
        )}
      </div>
      {kind === 'ausserhalb' && (
        <div className="felder-2">
          <div className="feld"><label htmlFor="a-ort">Ort</label><input id="a-ort" name="ort" autoComplete="address-level2" maxLength={80} /></div>
          <div className="feld"><label htmlFor="a-wish">Wunschtermin</label><input id="a-wish" name="wishDate" placeholder="z. B. Samstag, 12.12., vormittags" maxLength={60} /></div>
        </div>
      )}
      <div className="feld">
        <label htmlFor="a-message">{messageLabel}{kind === 'ausserhalb' && <span className="leise"> (optional)</span>}</label>
        <textarea id="a-message" name="message" required={kind !== 'ausserhalb'} maxLength={2000} placeholder={messagePlaceholder} />
      </div>
      <div className="honig" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <label className="haekchen"><input type="checkbox" name="acceptPrivacy" required /><span>Ich bin einverstanden, dass meine Angaben zur Bearbeitung der Anfrage verarbeitet werden. Details in der <Link href="/datenschutz" target="_blank">Datenschutzerklärung</Link>.</span></label>
      <button className="btn" disabled={state === 'sending'}>{state === 'sending' ? 'Wird gesendet …' : submitLabel}</button>
    </form>
  );
}
