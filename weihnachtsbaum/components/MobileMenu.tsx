'use client';
import Link from 'next/link';
import { useRef } from 'react';

export function MobileMenu({ links }: { links: { href: string; label: string }[] }) {
  const ref = useRef<HTMLDetailsElement>(null);
  return (
    <details className="menue" ref={ref}>
      <summary aria-label="Menü öffnen">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
      </summary>
      <div className="menue-liste">
        {links.map((n) => (
          <Link key={n.href} href={n.href} onClick={() => ref.current?.removeAttribute('open')}>{n.label}</Link>
        ))}
      </div>
    </details>
  );
}
