import { redirect } from 'next/navigation';
import { shopConfig } from '@/config/shop.config';
import { PrintButton } from '@/components/PrintButton';
import { extrasLabel, shapeLabel, treeLabel } from '@/lib/admin-view';
import { isAdmin } from '@/lib/auth';
import { seasonDeliveryDates } from '@/lib/delivery';
import { dateLong, dateShort, slotLabel, todayInBerlin } from '@/lib/format';
import { listOrders } from '@/lib/orders';

export default async function DayListPage({ searchParams }: { searchParams: Promise<{ tag?: string }> }) {
  if (!(await isAdmin())) redirect('/admin/login');
  const dates = seasonDeliveryDates();
  const today = todayInBerlin();
  const wanted = (await searchParams).tag ?? '';
  // ohne Auswahl: der nächste anstehende Liefertag
  const date = dates.includes(wanted) ? wanted : dates.find((d) => d >= today) ?? dates[dates.length - 1];
  const orders = date ? await listOrders({ date, status: 'aktiv' }) : [];

  return (
    <>
      <form className="filter" method="get">
        <label>Liefertag
          <select name="tag" defaultValue={date}>
            {dates.map((d) => <option key={d} value={d}>{dateShort(d)}</option>)}
          </select>
        </label>
        <button className="btn btn-klein btn-linie">Anzeigen</button>
        <PrintButton />
      </form>
      <h1>Tagesliste – {date ? dateLong(date) : 'kein Liefertag'}</h1>
      <p className="leise">{orders.length} Lieferungen · sortiert nach Zone und Zeitfenster · nur bezahlte Bestellungen</p>
      {shopConfig.zones.map((zone) => {
        const list = orders.filter((o) => o.zone === zone.id);
        if (list.length === 0) return null;
        return (
          <section key={zone.id} className="zonenblock">
            <h2>{zone.name} – {zone.area} ({list.length})</h2>
            <div className="scroll">
              <table className="admintabelle">
                <thead><tr><th>Fenster</th><th>Name / Telefon</th><th>Adresse</th><th>Baum</th><th>Form</th><th>Extras</th><th>Hinweise</th><th>✓</th></tr></thead>
                <tbody>
                  {list.map((o) => (
                    <tr key={o.id}>
                      <td className="nowrap"><strong>{slotLabel(o.slotId)}</strong></td>
                      <td>{o.firstName} {o.lastName}<br />{o.phone}</td>
                      <td>{o.street}<br />{o.plz} {o.city}</td>
                      <td className="nowrap">{treeLabel(o)}</td>
                      <td>{shapeLabel(o)}</td>
                      <td>{extrasLabel(o)}</td>
                      <td>{o.notes || '–'}</td>
                      <td style={{ width: 32 }}>☐</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
      {orders.length === 0 && <p>Für diesen Tag gibt es noch keine bezahlten Bestellungen.</p>}
    </>
  );
}
