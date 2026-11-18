'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { checkPassword, endAdminSession, isAdmin, startAdminSession } from './auth.ts';
import { setInquiryStatus, setStatus, type OrderStatus } from './orders.ts';

export async function login(_prev: string | null, form: FormData): Promise<string | null> {
  // kleine Bremse gegen Durchprobieren
  await new Promise((r) => setTimeout(r, 600));
  if (!checkPassword(String(form.get('password') ?? ''))) return 'Das Passwort stimmt nicht.';
  await startAdminSession();
  redirect('/admin');
}

export async function logout(): Promise<void> {
  await endAdminSession();
  redirect('/admin/login');
}

export async function updateOrderStatus(form: FormData): Promise<void> {
  if (!(await isAdmin())) redirect('/admin/login');
  await setStatus(String(form.get('id')), String(form.get('status')) as OrderStatus);
  revalidatePath('/admin', 'layout');
}

export async function updateInquiryStatus(form: FormData): Promise<void> {
  if (!(await isAdmin())) redirect('/admin/login');
  await setInquiryStatus(String(form.get('id')), form.get('status') === 'erledigt' ? 'erledigt' : 'neu');
  revalidatePath('/admin/anfragen');
}
