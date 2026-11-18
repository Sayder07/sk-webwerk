import 'server-only';
import { headers } from 'next/headers';

/** Basis-URL der Website: NEXT_PUBLIC_SITE_URL, sonst aus der aktuellen Anfrage. */
export async function baseUrl(): Promise<string> {
  const fixed = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '');
  if (fixed) return fixed;
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
  const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') || host.startsWith('127.') ? 'http' : 'https');
  return `${proto}://${host}`;
}
