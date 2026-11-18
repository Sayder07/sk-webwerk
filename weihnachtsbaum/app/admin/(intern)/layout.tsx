import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { logout } from '@/lib/admin-actions';
import { isAdmin } from '@/lib/auth';

export const metadata: Metadata = { title: 'Admin', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) redirect('/admin/login');
  return (
    <div className="admin">
      <header className="admin-kopf">
        <div className="wrap">
          <strong>Admin</strong>
          <Link href="/admin">Bestellungen</Link>
          <Link href="/admin/tagesliste">Tagesliste</Link>
          <Link href="/admin/einkauf">Einkauf Förster</Link>
          <Link href="/admin/anfragen">Anfragen</Link>
          <span className="rechts"><Link href="/" style={{ marginRight: 16 }}>Zur Website</Link></span>
          <form action={logout}><button>Abmelden</button></form>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
