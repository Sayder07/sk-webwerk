import { NextResponse } from 'next/server';
import { sendInquiryEmails } from '@/lib/email';
import { createInquiry } from '@/lib/orders';
import { findExtra, normalizeSelection, priceSelection } from '@/lib/pricing';
import { euro } from '@/lib/format';
import { isEmail, multiline, text } from '@/lib/validate';

export const dynamic = 'force-dynamic';

const fail = (message: string, status = 400) => NextResponse.json({ error: message }, { status });

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return fail('Ungültige Anfrage.');
  }
  if (text(body.website, 100)) return fail('Ungültige Anfrage.');

  const kind = body.kind === 'ausserhalb' || body.kind === 'deko' ? body.kind : 'kontakt';
  const name = text(body.name, 120);
  const email = text(body.email, 200).toLowerCase();
  const phone = text(body.phone, 30);
  const plz = text(body.plz, 5);
  const message = multiline(body.message, 2000);

  if (!name) return fail('Bitte gib deinen Namen an.');
  if (!isEmail(email)) return fail('Bitte prüfe deine E-Mail-Adresse.');
  if (kind !== 'ausserhalb' && !message) return fail('Bitte schreib uns kurz, worum es geht.');
  if (kind === 'ausserhalb' && !/^\d{5}$/.test(plz)) return fail('Bitte gib deine Postleitzahl an.');
  if (body.acceptPrivacy !== true) return fail('Bitte stimme der Verarbeitung deiner Angaben zu.');

  // Bei Lieferanfragen die Baumauswahl lesbar mitschicken
  const payload: Record<string, string> = {};
  const selection = kind === 'ausserhalb' ? normalizeSelection(body.selection) : null;
  if (selection) {
    const { items, subtotal } = priceSelection(selection);
    payload['Wunschbaum'] = items[0].label;
    const extras = selection.extras.map((id) => findExtra(id)?.label).filter(Boolean).join(', ');
    if (extras) payload['Extras'] = extras;
    payload['Warenwert ohne Lieferung'] = euro(subtotal);
  }
  const ort = text(body.ort, 80);
  if (ort) payload['Ort'] = ort;
  const wish = text(body.wishDate, 60);
  if (wish) payload['Wunschtermin'] = wish;

  try {
    const inquiry = await createInquiry({ kind, name, email, phone, plz, message, payload });
    await sendInquiryEmails(inquiry);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Anfrage konnte nicht gespeichert werden:', err);
    return fail('Da ist etwas schiefgelaufen. Bitte versuche es noch einmal.', 500);
  }
}
