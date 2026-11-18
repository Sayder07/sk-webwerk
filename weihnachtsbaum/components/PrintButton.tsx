'use client';
export function PrintButton() {
  return <button type="button" className="btn btn-klein kein-druck" onClick={() => window.print()}>Drucken</button>;
}
