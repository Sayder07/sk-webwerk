import Link from 'next/link';
import { redirect } from 'next/navigation';
import { shopConfig } from '@/config/shop.config';
import { updateOrderStatus } from '@/lib/admin-actions';
import { extrasLabel, shapeLabel, treeLabel, zoneName } from '@/lib/admin-view';
import { isAdmin } from '@/lib/auth';
import { seasonDeliveryDates } from '@/lib/delivery';
import { dateShort, dateTimeBerlin, euro, slotLabel } from '@/lib/format';
import { listOrders, STATUS_LABEL, type OrderStatus } from '@/lib/orders';

type Search = { tag?: string; zone?: string; status?: string };

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<Search> }) {
  if (!(await isAdmin())) redirect('/admin/login');
  const sp = await searchParams;
  const dates = seasonDeliveryDates();
  const date = dates.includes(sp.tag ?? '') ? sp.tag : undefined;
  const zone = shopConfig.zones.some((z) => String(z.id) === sp.zone) ? Number(sp.zone) : undefined;
  // Standard: nur bezahlte/gelieferte Bestellungen – abgebrochene Bezahlvorgänge stören sonst die Übersicht
  const statusParam = sp.status ?? 'aktiv';
  const status = statusParam === 'alle' ? undefined : (statusParam as OrderStatus | 'aktiv');

  const orders = await listOrders({ date, zone, status });
  const revenue = orders.filter((o) => o.status === 'paid' || o.status === 'delivered').reduce((s, o) => s + o.totalCents, 0);
  const query = new URLSearchParams({ ...(date && { tag: date }), ...(zone && { zone: String(zone) }), status: statusParam }).toString();

  return (
    <>
      <h1>Bestellungen</h1>
      <form className="filter" method="get">
        <label>Liefertag
          <select name="tag" defaultValue={date ?? ''}>
            <option value="">alle</option>
            {dates.map((d) => <option key={d} value={d}>{dateShort(d)}</option>)}
          </select>
        </label>
        <label>Zone
          <select name="zone" defaultValue={zone ?? ''}>
            <option value="">alle</option>
            {shopConfig.zones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
          </select>
        </label>
        <label>Status
          <select name="status" defaultValue={statusParam}>
            <option value="aktiv">Bezahlt + geliefert</option>
            {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            <option value="alle">alle</option>
          </select>
        </label>
        <button className="btn btn-klein">Filtern</button>
        <a className="btn btn-klein btn-linie" href={`/api/admin/export?${query}`}>CSV-Export</a>
        {date && <Link className="btn btn-klein btn-linie" href={`/admin/tagesliste?tag=${date}`}>Tagesliste drucken</Link>}
      </form>

      <div className="kennzahlen">
        <div className="kennzahl"><strong>{orders.length}</strong><span>Bestellungen in dieser Ansicht</span></div>
        <div className="kennzahl"><strong>{euro(revenue)}</strong><span>Umsatz (bezahlt/geliefert)</span></div>
        <div className="kennzahl"><strong>{orders.filter((o) => o.extras.includes('aufbau')).length}</strong><span>mit Aufbau</span></div>
        <div className="kennzahl"><strong>{orders.filter((o) => o.extras.includes('abholung')).length}</strong><span>mit Abholung im Januar</span></div>
      </div>

      {orders.length === 0 ? (
        <p className="leise">Keine Bestellungen für diese Auswahl.</p>
      ) : (
        <div className="scroll">
          <table className="admintabelle">
            <thead>
              <tr><th>Liefertag</th><th>Fenster</th><th>Zone</th><th>Kunde</th><th>Adresse</th><th>Baum</th><th>Extras</th><th>Hinweise</th><th className="r">Summe</th><th>Status</th><th>Nr. / Eingang</th></tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="nowrap">{dateShort(o.deliveryDate)}</td>
                  <td className="nowrap">{slotLabel(o.slotId)}</td>
                  <td className="nowrap">{zoneName(o.zone)}</td>
                  <td>{o.firstName} {o.lastName}<br /><a href={`tel:${o.phone}`}>{o.phone}</a><br /><a href={`mailto:${o.email}`}>{o.email}</a></td>
                  <td>{o.street}<br />{o.plz} {o.city}</td>
                  <td className="nowrap">{treeLabel(o)}<br />{shapeLabel(o)}</td>
                  <td>{extrasLabel(o)}</td>
                  <td>{o.notes || '–'}</td>
                  <td className="r">{euro(o.totalCents)}{o.paymentMode === 'demo' && <><br /><span className="leise">Test</span></>}</td>
                  <td>
                    <span className={`status status-${o.status}`}>{STATUS_LABEL[o.status]}</span>
                    <form action={updateOrderStatus} style={{ marginTop: 6, display: 'flex', gap: 4 }}>
                      <input type="hidden" name="id" value={o.id} />
                      <select name="status" defaultValue={o.status} aria-label={`Status für ${o.orderNumber}`}>
                        {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                      <button className="textlink">ok</button>
                    </form>
                  </td>
                  <td className="nowrap">{o.orderNumber}<br /><span className="leise">{dateTimeBerlin(o.createdAt)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
