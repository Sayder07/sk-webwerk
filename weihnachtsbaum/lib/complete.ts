import 'server-only';
import { sendOrderEmails } from './email.ts';
import { markPaid } from './orders.ts';

/** Zahlung bestätigt: Bestellung auf „bezahlt“ setzen und (genau einmal) E-Mails verschicken. */
export async function completeOrder(orderId: string): Promise<void> {
  const order = await markPaid(orderId);
  if (order) await sendOrderEmails(order);
}
