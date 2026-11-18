export function Steps({ current }: { current: 1 | 2 | 3 }) {
  const steps = ['1 · Baum', '2 · Lieferung', '3 · Kasse'];
  return (
    <ol className="ablauf" aria-label="Bestellschritte">
      {steps.map((s, i) => (
        <li key={s} aria-current={i + 1 === current ? 'step' : undefined} className={i + 1 < current ? 'fertig' : undefined}>{s}</li>
      ))}
    </ol>
  );
}
