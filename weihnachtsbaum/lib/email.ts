import 'server-only';
import { shopConfig } from '../config/shop.config.ts';
import { dateLong, euro, slotLabel } from './format.ts';
import type { Inquiry, Order } from './orders.ts';
import { findZone } from './pricing.ts';

/**
 * E-Mail-Versand über Resend (https://resend.com).
 * Ohne RESEND_API_KEY werden E-Mails nur ins Server-Log geschrieben – praktisch zum Testen.
 */

type Mail = { to: string; subject: string; html: string; replyTo?: string };

const esc = (s: unknown) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

function operatorAddress(): string | null {
  return process.env.OPERATOR_EMAIL || null;
}

async function send(mail: Mail): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) {
    console.log(`[E-Mail – nicht versendet, RESEND_API_KEY/EMAIL_FROM fehlen] An: ${mail.to} · Betreff: ${mail.subject}`);
    return;
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [mail.to], subject: mail.subject, html: mail.html, reply_to: mail.replyTo }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

/** Fehler beim Versand dürfen eine Bestellung nie scheitern lassen – nur protokollieren. */
async function sendSafely(mail: Mail): Promise<void> {
  try {
    await send(mail);
  } catch (err) {
    console.error('E-Mail-Versand fehlgeschlagen:', mail.subject, err);
  }
}

function layout(title: string, body: string): string {
  const c = shopConfig.company;
  return `<!doctype html><html lang="de"><body style="margin:0;background:#f6f0e4;font-family:Georgia,'Times New Roman',serif;color:#1d231f">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fffdf8;border-radius:12px;overflow:hidden">
<tr><td style="background:#1f3d2b;color:#f6f0e4;padding:20px 28px;font-size:18px">${esc(c.name)} <span style="opacity:.7;font-size:13px">· ${esc(c.claim)}</span></td></tr>
<tr><td style="padding:28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55">
<h1 style="font-family:Georgia,serif;font-size:22px;margin:0 0 16px;color:#1f3d2b">${esc(title)}</h1>
${body}
</td></tr>
<tr><td style="padding:18px 28px;background:#f1e9d8;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#5b6159">
${esc(c.name)} · ${esc(c.owner)} · ${esc(c.street)}, ${esc(c.zipCity)}<br>Telefon ${esc(c.phone)} · ${esc(c.email)}
</td></tr></table></td></tr></table></body></html>`;
}

function itemsTable(order: Order): string {
  const rows = order.lineItems
    .map((i) => `<tr><td style="padding:6px 0;border-bottom:1px solid #eee4d0">${esc(i.label)}</td><td align="right" style="padding:6px 0;border-bottom:1px solid #eee4d0;white-space:nowrap">${euro(i.amount)}</td></tr>`)
    .join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:15px">${rows}
<tr><td style="padding:10px 0;font-weight:bold">Gesamt (inkl. MwSt.)</td><td align="right" style="padding:10px 0;font-weight:bold;white-space:nowrap">${euro(order.totalCents)}</td></tr></table>`;
}

function deliveryBlock(order: Order): string {
  return `<p style="margin:16px 0;padding:14px 16px;background:#f6f0e4;border-radius:8px">
<strong>Liefertermin:</strong> ${esc(dateLong(order.deliveryDate))}, ${esc(slotLabel(order.slotId))}<br>
<strong>Lieferadresse:</strong> ${esc(order.firstName)} ${esc(order.lastName)}, ${esc(order.street)}, ${esc(order.plz)} ${esc(order.city)}
${order.notes ? `<br><strong>Dein Hinweis:</strong> ${esc(order.notes)}` : ''}</p>`;
}

export async function sendOrderEmails(order: Order): Promise<void> {
  const demo = order.paymentMode === 'demo' ? '<p style="color:#a63a2b"><strong>Testbestellung – es wurde keine Zahlung ausgeführt.</strong></p>' : '';
  const pickup = order.extras.includes('abholung')
    ? '<p>Du hast die <strong>Abholung im Januar</strong> gebucht. Den Termin dafür stimmen wir nach den Feiertagen per E-Mail mit dir ab.</p>'
    : '';

  const customer = layout(
    `Danke, ${order.firstName} – dein Baum ist bestellt!`,
    `${demo}<p>Wir haben deine Bestellung <strong>${esc(order.orderNumber)}</strong> und deine Zahlung erhalten. Dein Baum kommt frisch vom Förster und wird zum Wunschtermin geliefert.</p>
${deliveryBlock(order)}
${itemsTable(order)}
${pickup}
<p>Bitte sorge dafür, dass im Zeitfenster jemand zu Hause ist. Wenn sich etwas ändert oder du Fragen hast, antworte einfach auf diese E-Mail.</p>
<p>Frohe Adventszeit!<br>${esc(shopConfig.company.owner)}</p>`,
  );
  await sendSafely({ to: order.email, subject: `Deine Bestellung ${order.orderNumber} – Lieferung am ${dateLong(order.deliveryDate)}`, html: customer, replyTo: operatorAddress() ?? undefined });

  const op = operatorAddress();
  if (!op) return;
  const zone = findZone(order.zone);
  const operator = layout(
    `Neue Bestellung ${order.orderNumber}`,
    `${demo}${deliveryBlock(order)}
<p><strong>Zone:</strong> ${esc(zone?.name ?? order.zone)} · <strong>Telefon:</strong> ${esc(order.phone)} · <strong>E-Mail:</strong> ${esc(order.email)}</p>
${itemsTable(order)}`,
  );
  await sendSafely({ to: op, subject: `Neue Bestellung ${order.orderNumber}: ${dateLong(order.deliveryDate)}, ${slotLabel(order.slotId)}`, html: operator, replyTo: order.email });
}

const KIND_LABEL: Record<Inquiry['kind'], string> = {
  ausserhalb: 'Lieferanfrage außerhalb des Liefergebiets',
  deko: 'Deko-Anfrage',
  kontakt: 'Kontaktanfrage',
};

export async function sendInquiryEmails(inquiry: Inquiry): Promise<void> {
  const details = Object.entries(inquiry.payload ?? {})
    .filter(([, v]) => v !== '' && v != null)
    .map(([k, v]) => `<strong>${esc(k)}:</strong> ${esc(v)}`)
    .join('<br>');
  const summary = `<p style="margin:16px 0;padding:14px 16px;background:#f6f0e4;border-radius:8px">
<strong>Name:</strong> ${esc(inquiry.name)}<br><strong>E-Mail:</strong> ${esc(inquiry.email)}
${inquiry.phone ? `<br><strong>Telefon:</strong> ${esc(inquiry.phone)}` : ''}${inquiry.plz ? `<br><strong>PLZ:</strong> ${esc(inquiry.plz)}` : ''}
${details ? `<br>${details}` : ''}</p>
<p style="white-space:pre-wrap">${esc(inquiry.message)}</p>`;

  const op = operatorAddress();
  if (op) {
    await sendSafely({ to: op, subject: `${KIND_LABEL[inquiry.kind]} von ${inquiry.name}`, html: layout(KIND_LABEL[inquiry.kind], summary), replyTo: inquiry.email });
  }
  await sendSafely({
    to: inquiry.email,
    subject: 'Wir haben deine Anfrage erhalten',
    html: layout('Danke für deine Anfrage!', `<p>Hallo ${esc(inquiry.name)},</p><p>deine Anfrage ist bei uns angekommen. Wir melden uns so schnell wie möglich persönlich bei dir.</p><p>Das hast du uns geschrieben:</p>${summary}`),
    replyTo: op ?? undefined,
  });
}
