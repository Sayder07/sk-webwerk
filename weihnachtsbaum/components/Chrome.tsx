import Link from 'next/link';
import { shopConfig } from '@/config/shop.config';
import { isTestMode } from '@/lib/stripe';
import { MobileMenu } from './MobileMenu';
import { BrandMark } from './TreeArt';

const NAV = [
  { href: '/baeume', label: 'Bäume' },
  { href: '/so-funktionierts', label: "So funktioniert's" },
  { href: '/faq', label: 'Fragen' },
  { href: '/kontakt', label: 'Kontakt' },
];

export function Header() {
  const c = shopConfig.company;
  return (
    <>
      {isTestMode() && <div className="testbanner">Testmodus – Bestellungen lösen keine echte Zahlung aus.</div>}
      <header className="kopf">
        <div className="wrap kopf-innen">
          <Link href="/" className="marke">
            <BrandMark />
            <span>
              <span className="marke-name">{c.name}</span>
              <span className="marke-claim">{c.claim}</span>
            </span>
          </Link>
          <nav className="nav" aria-label="Hauptnavigation">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href}>{n.label}</Link>
            ))}
          </nav>
          <div className="kopf-rechts">
            <Link href="/baeume" className="btn btn-klein">Baum aussuchen</Link>
            <MobileMenu links={[...NAV, { href: '/deko-anfrage', label: 'Deko-Anfrage' }]} />
          </div>
        </div>
      </header>
    </>
  );
}

export function Footer() {
  const c = shopConfig.company;
  return (
    <footer className="fuss">
      <div className="wrap">
        <div className="fuss-raster">
          <div>
            <h3>{c.name}</h3>
            <p>Echte Nordmanntannen, frisch vom Förster aus der Region – geliefert zum Wunschtermin in Wetzlar und Umgebung.</p>
            <p>{c.owner}<br />{c.street}<br />{c.zipCity}</p>
          </div>
          <div>
            <h3>Service</h3>
            <ul>
              <li><Link href="/baeume">Baum aussuchen</Link></li>
              <li><Link href="/so-funktionierts">So funktioniert&apos;s</Link></li>
              <li><Link href="/faq">Häufige Fragen</Link></li>
              <li><Link href="/deko-anfrage">Deko-Anfrage</Link></li>
              <li><Link href="/kontakt">Kontakt</Link></li>
            </ul>
          </div>
          <div>
            <h3>Rechtliches</h3>
            <ul>
              <li><Link href="/impressum">Impressum</Link></li>
              <li><Link href="/datenschutz">Datenschutz</Link></li>
              <li><Link href="/agb">AGB</Link></li>
              <li><Link href="/widerruf">Widerrufsbelehrung</Link></li>
            </ul>
          </div>
        </div>
        <div className="fuss-unten">© {shopConfig.season.year} {c.name} · Alle Preise inkl. MwSt., zzgl. Lieferkosten je nach Zone.</div>
      </div>
    </footer>
  );
}
