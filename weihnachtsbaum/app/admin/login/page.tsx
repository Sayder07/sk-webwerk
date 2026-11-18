import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { adminConfigured, isAdmin } from '@/lib/auth';
import { LoginForm } from './LoginForm';

export const metadata: Metadata = { title: 'Admin-Anmeldung', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  if (await isAdmin()) redirect('/admin');
  return (
    <div className="admin">
      <main style={{ maxWidth: 420, paddingTop: 80 }}>
        <h1>Betreiber-Anmeldung</h1>
        {adminConfigured() ? <LoginForm /> : <div className="meldung meldung-info">Der Admin-Bereich ist noch nicht eingerichtet. Lege die Umgebungsvariable <code>ADMIN_PASSWORD</code> (mindestens 8 Zeichen) an und starte neu.</div>}
      </main>
    </div>
  );
}
