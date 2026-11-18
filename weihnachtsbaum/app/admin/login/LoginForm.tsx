'use client';
import { useActionState } from 'react';
import { login } from '@/lib/admin-actions';

export function LoginForm() {
  const [error, action, pending] = useActionState(login, null);
  return (
    <form action={action}>
      {error && <div className="meldung meldung-fehler" role="alert">{error}</div>}
      <div className="feld"><label htmlFor="pw">Passwort</label><input id="pw" name="password" type="password" required autoComplete="current-password" autoFocus /></div>
      <button className="btn btn-voll" disabled={pending}>{pending ? 'Prüfe …' : 'Anmelden'}</button>
    </form>
  );
}
