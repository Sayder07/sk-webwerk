import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

const COOKIE = 'wb_admin';

/** Admin-Bereich ist nur nutzbar, wenn ADMIN_PASSWORD gesetzt ist (mind. 8 Zeichen). */
export function adminConfigured(): boolean {
  return (process.env.ADMIN_PASSWORD ?? '').length >= 8;
}

function sessionToken(): string {
  return createHmac('sha256', process.env.ADMIN_PASSWORD ?? '').update('wb-admin-session-v1').digest('hex');
}

function safeEqual(a: string, b: string): boolean {
  const x = createHmac('sha256', 'cmp').update(a).digest();
  const y = createHmac('sha256', 'cmp').update(b).digest();
  return timingSafeEqual(x, y);
}

export function checkPassword(input: string): boolean {
  return adminConfigured() && safeEqual(input, process.env.ADMIN_PASSWORD!);
}

export async function isAdmin(): Promise<boolean> {
  if (!adminConfigured()) return false;
  const value = (await cookies()).get(COOKIE)?.value;
  return Boolean(value) && safeEqual(value!, sessionToken());
}

export async function startAdminSession(): Promise<void> {
  (await cookies()).set(COOKIE, sessionToken(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function endAdminSession(): Promise<void> {
  (await cookies()).delete(COOKIE);
}
