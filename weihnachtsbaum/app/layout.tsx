import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/fraunces';
import '@fontsource-variable/dm-sans';
import './globals.css';
import { shopConfig } from '@/config/shop.config';

const title = `${shopConfig.company.name} – Weihnachtsbaum-Lieferservice Wetzlar`;
const description = 'Echte Nordmanntannen, frisch vom Förster aus der Region. Geliefert zum Wunschtermin in Wetzlar und Umgebung – auf Wunsch fertig aufgestellt.';

export const metadata: Metadata = {
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL) : undefined,
  title: { default: title, template: `%s · ${shopConfig.company.name}` },
  description,
  openGraph: { title, description, locale: 'de_DE', type: 'website' },
};

export const viewport: Viewport = { themeColor: '#142a1d', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
