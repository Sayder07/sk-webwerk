import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="wrap schmal abschnitt">
      <h1>Diese Seite gibt es nicht</h1>
      <p className="lead">Vielleicht hat sich ein Tippfehler eingeschlichen. Hier geht es zurück zu den Bäumen.</p>
      <Link href="/baeume" className="btn">Baum aussuchen</Link>
    </div>
  );
}
