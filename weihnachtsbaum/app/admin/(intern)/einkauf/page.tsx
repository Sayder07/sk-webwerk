import { redirect } from 'next/navigation';
import { shopConfig } from '@/config/shop.config';
import { PrintButton } from '@/components/PrintButton';
import { isAdmin } from '@/lib/auth';
import { orderDeadline, seasonDeliveryDates } from '@/lib/delivery';
import { dateLong, dateShort } from '@/lib/format';
import { listOrders } from '@/lib/orders';

/** Einkaufsliste für den Förster: Bäume je Größe und Form pro Liefertermin (nur bezahlte Bestellungen). */
export default async function PurchasePage() {
  if (!(await isAdmin())) redirect('/admin/login');
  const orders = await listOrders({ status: 'aktiv' });
  const { trees, shapes } = shopConfig;
  const dates = seasonDeliveryDates();
  const count = (date: string, treeId?: string, shapeId?: string, extra?: string) =>
    orders.filter((o) => o.deliveryDate === date && (!treeId || o.treeId === treeId) && (!shapeId || o.shapeId === shapeId) && (!extra || o.extras.includes(extra))).length;

  return (
    <>
      <div className="filter"><PrintButton /></div>
      <h1>Einkaufsliste für den Förster</h1>
      <p className="leise">Summe der bezahlten Bäume je Größe und Form pro Liefertermin. Bestellschluss für Kunden ist jeweils {shopConfig.delivery.minLeadDays} Tage vorher – danach steht die Menge fest.</p>
      {dates.map((date) => {
        const total = count(date);
        return (
          <section key={date} className="zonenblock">
            <h2>{dateLong(date)} – {total} {total === 1 ? 'Baum' : 'Bäume'} <span className="leise" style={{ fontSize: '0.85rem', fontFamily: 'var(--sans)', fontWeight: 400 }}>· Bestellschluss {dateShort(orderDeadline(date))}</span></h2>
            {total === 0 ? (
              <p className="leise">Noch keine Bestellungen.</p>
            ) : (
              <div className="scroll">
                <table className="admintabelle">
                  <thead><tr><th>Größe</th>{shapes.map((s) => <th key={s.id} className="r">{s.label}</th>)}<th className="r">Summe</th></tr></thead>
                  <tbody>
                    {trees.filter((t) => count(date, t.id) > 0).map((t) => (
                      <tr key={t.id}>
                        <td>{t.label}</td>
                        {shapes.map((s) => <td key={s.id} className="r">{count(date, t.id, s.id) || '–'}</td>)}
                        <td className="r"><strong>{count(date, t.id)}</strong></td>
                      </tr>
                    ))}
                    <tr>
                      <td><strong>Gesamt</strong></td>
                      {shapes.map((s) => <td key={s.id} className="r"><strong>{count(date, undefined, s.id) || '–'}</strong></td>)}
                      <td className="r"><strong>{total}</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
            {total > 0 && <p className="klein leise" style={{ marginTop: 8 }}>Zusätzlich: {count(date, undefined, undefined, 'zweige')} × Zweige · {count(date, undefined, undefined, 'standfuss')} × Standfuß · {count(date, undefined, undefined, 'aufbau')} × Aufbau</p>}
          </section>
        );
      })}
    </>
  );
}
