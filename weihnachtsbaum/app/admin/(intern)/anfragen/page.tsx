import { redirect } from 'next/navigation';
import { updateInquiryStatus } from '@/lib/admin-actions';
import { isAdmin } from '@/lib/auth';
import { dateTimeBerlin } from '@/lib/format';
import { listInquiries } from '@/lib/orders';

const KIND = { ausserhalb: 'Lieferung außerhalb', deko: 'Deko', kontakt: 'Kontakt' } as const;

export default async function InquiriesPage() {
  if (!(await isAdmin())) redirect('/admin/login');
  const inquiries = await listInquiries();
  return (
    <>
      <h1>Anfragen</h1>
      {inquiries.length === 0 ? (
        <p className="leise">Noch keine Anfragen.</p>
      ) : (
        <div className="scroll">
          <table className="admintabelle">
            <thead><tr><th>Eingang</th><th>Art</th><th>Kontakt</th><th>PLZ</th><th>Details</th><th>Nachricht</th><th>Status</th></tr></thead>
            <tbody>
              {inquiries.map((q) => (
                <tr key={q.id}>
                  <td className="nowrap">{dateTimeBerlin(q.createdAt)}</td>
                  <td className="nowrap">{KIND[q.kind]}</td>
                  <td>{q.name}<br /><a href={`mailto:${q.email}`}>{q.email}</a>{q.phone && <><br /><a href={`tel:${q.phone}`}>{q.phone}</a></>}</td>
                  <td>{q.plz || '–'}</td>
                  <td>{Object.entries(q.payload).map(([k, v]) => <div key={k}><span className="leise">{k}:</span> {String(v)}</div>)}</td>
                  <td style={{ whiteSpace: 'pre-wrap', maxWidth: 380 }}>{q.message || '–'}</td>
                  <td>
                    <span className={`status status-${q.status}`}>{q.status === 'neu' ? 'Neu' : 'Erledigt'}</span>
                    <form action={updateInquiryStatus} style={{ marginTop: 6 }}>
                      <input type="hidden" name="id" value={q.id} />
                      <input type="hidden" name="status" value={q.status === 'neu' ? 'erledigt' : 'neu'} />
                      <button className="textlink">{q.status === 'neu' ? 'als erledigt markieren' : 'wieder öffnen'}</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
