/**
 * Erzeugt den A6-Flyer (Vorder- und Rückseite) als druckfertiges PDF mit QR-Code.
 *
 *   npm run flyer -- https://tannentaxi.de "Tannentaxi"
 *
 * Ausgabe: marketing/flyer/flyer-a6.pdf  (2 Seiten, 111 × 154 mm = A6 + 3 mm Beschnitt je Seite)
 *          marketing/flyer/flyer-a6.html (zum Nachbearbeiten, z. B. Import in Adobe Express)
 * Benötigt Playwright/Chromium für die PDF-Ausgabe (npx playwright install chromium), sonst entsteht nur das HTML.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import QRCode from 'qrcode';

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dir, '../..');
const url = process.argv[2] || 'https://tannentaxi.de';
const firma = process.argv[3] || 'Tannentaxi';

const font = (p) => `data:font/woff2;base64,${fs.readFileSync(path.join(root, 'node_modules', p)).toString('base64')}`;
const fraunces = font('@fontsource-variable/fraunces/files/fraunces-latin-wght-normal.woff2');
const dmsans = font('@fontsource-variable/dm-sans/files/dm-sans-latin-wght-normal.woff2');

const qr = await QRCode.toString(url, { type: 'svg', margin: 0, errorCorrectionLevel: 'M', color: { dark: '#142a1d', light: '#0000' } });

/** einfache Tanne als SVG-Pfade (gleiche Formensprache wie auf der Website) */
function tree(cx, ground, h, lights = false) {
  const trunk = h * 0.09, top = ground - h, fTop = top + h * 0.04, fH = ground - trunk - fTop, half = h * 0.31;
  const tiers = 8;
  let out = `<rect x="${cx - h * 0.022}" y="${ground - trunk - h * 0.03}" width="${h * 0.044}" height="${trunk + h * 0.03}" fill="#6f4a27"/>`;
  let dots = '';
  for (let i = tiers - 1; i >= 0; i--) {
    const t1 = (i + 1) / tiers, yT = fTop + fH * Math.max(0, i / tiers - 0.16), yB = fTop + fH * t1, w = half * (0.16 + 0.84 * t1);
    const tips = 3 + Math.round(t1 * 4), step = (w * 2) / tips, droop = (yB - yT) * 0.2;
    let d = `M${cx},${yT} Q${cx - w * 0.3},${yT + (yB - yT) * 0.62} ${cx - w},${yB}`;
    for (let k = 0; k < tips; k++) d += ` Q${cx - w + k * step + step / 2},${yB - droop} ${cx - w + (k + 1) * step},${yB}`;
    d += ` Q${cx + w * 0.3},${yT + (yB - yT) * 0.62} ${cx},${yT} Z`;
    out += `<path d="${d}" fill="${i % 2 ? '#2f5a40' : '#274b35'}"/>`;
    if (lights) {
      const n = 2 + Math.round(t1 * 3);
      for (let k = 0; k < n; k++) {
        const x = cx - w * 0.78 + ((k + 0.5) / n) * w * 1.56, y = yB - droop * (1.3 + ((k + i) % 2) * 0.9);
        dots += `<circle cx="${x}" cy="${y}" r="${h * 0.02}" fill="#f5d98a" opacity=".3"/><circle cx="${x}" cy="${y}" r="${h * 0.008}" fill="#fff3c9"/>`;
      }
    }
  }
  out += `<path d="M${cx},${top} L${cx - h * 0.022},${fTop + fH * 0.1} L${cx + h * 0.022},${fTop + fH * 0.1} Z" fill="#2f5a40"/>`;
  return out + dots;
}

const html = `<!doctype html>
<html lang="de"><head><meta charset="utf-8"><title>Flyer A6 – ${firma}</title>
<style>
@font-face { font-family: Fraunces; src: url(${fraunces}) format('woff2'); font-weight: 100 900; }
@font-face { font-family: 'DM Sans'; src: url(${dmsans}) format('woff2'); font-weight: 100 1000; }
@page { size: 111mm 154mm; margin: 0; }
* { box-sizing: border-box; margin: 0; }
body { font-family: 'DM Sans', sans-serif; color: #1d231f; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
/* Seite = A6 (105 × 148 mm) + 3 mm Beschnitt rundum. Wichtiges bleibt 7 mm vom Papierrand weg. */
.seite { width: 111mm; height: 154mm; padding: 10mm; position: relative; overflow: hidden; page-break-after: always; }
h1, h2 { font-family: Fraunces, serif; font-weight: 600; line-height: 1.05; letter-spacing: -0.01em; }
.vorn { background: #142a1d; color: #f6f0e4; }
.vorn .oben { font-size: 7.5pt; letter-spacing: .14em; text-transform: uppercase; color: #ecd9a4; font-weight: 600; }
.vorn h1 { font-size: 30pt; margin-top: 4mm; color: #fcf9f2; }
.vorn .claim { font-size: 11pt; line-height: 1.4; margin-top: 4mm; max-width: 62mm; color: rgba(246,240,228,.88); }
.vorn svg.bild { position: absolute; left: 0; bottom: 0; width: 111mm; height: 82mm; }
.vorn .band { position: absolute; left: 10mm; bottom: 10mm; background: #c39a3f; color: #142a1d; font-weight: 700; font-size: 10.5pt; padding: 2.4mm 5mm; border-radius: 99px; }
.hinten { background: #f6f0e4; }
.hinten h2 { font-size: 17pt; color: #142a1d; }
.schritte { list-style: none; padding: 0; margin-top: 4mm; counter-reset: s; }
.schritte li { counter-increment: s; position: relative; padding-left: 9mm; margin-bottom: 2.6mm; font-size: 9pt; line-height: 1.35; }
.schritte li::before { content: counter(s); position: absolute; left: 0; top: 0; width: 6mm; height: 6mm; border-radius: 50%; background: #1f3d2b; color: #ecd9a4; font: 600 9.5pt/6mm Fraunces, serif; text-align: center; }
.schritte b { display: block; font-size: 9.8pt; }
.preise { margin-top: 4mm; background: #fffdf8; border: .3mm solid #e3d9c4; border-radius: 2.5mm; padding: 3.2mm 4mm; font-size: 8.4pt; line-height: 1.5; }
.preise table { width: 100%; border-collapse: collapse; }
.preise td { padding: 0; }
.preise td:last-child { text-align: right; font-weight: 600; white-space: nowrap; }
.preise td.titel { text-align: left; font-weight: 700; color: #9a6a3a; font-size: 7pt; letter-spacing: .1em; text-transform: uppercase; padding-bottom: .6mm; }
.preise .abstand td { padding-top: 1.6mm; }
.unten { position: absolute; left: 10mm; right: 10mm; bottom: 10mm; display: flex; gap: 5mm; align-items: flex-end; }
.qr { width: 30mm; height: 30mm; background: #fffdf8; border: .3mm solid #e3d9c4; border-radius: 2.5mm; padding: 2.5mm; flex: none; }
.qr svg { width: 100%; height: 100%; display: block; }
.unten h2 { font-size: 15pt; }
.unten p { font-size: 8.4pt; line-height: 1.4; margin-top: 1.5mm; }
.unten .url { font-weight: 700; color: #1f3d2b; font-size: 9pt; word-break: break-all; }
.firma { font-size: 7pt; color: #5b6159; margin-top: 1.5mm; }
</style></head><body>

<section class="seite vorn">
  <p class="oben">Echte Nordmanntannen · Wetzlar &amp; Umgebung</p>
  <h1>Dein Baum<br>kommt zu dir.</h1>
  <p class="claim">Kein Schleppen, kein Stress – geliefert zum Wunschtermin, auf Wunsch fertig aufgestellt.</p>
  <svg class="bild" viewBox="0 0 444 328" preserveAspectRatio="xMidYMax slice">
    <defs><radialGradient id="g" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#f5d98a" stop-opacity=".3"/><stop offset="1" stop-color="#f5d98a" stop-opacity="0"/></radialGradient></defs>
    <circle cx="318" cy="190" r="170" fill="url(#g)"/>
    <rect x="0" y="296" width="444" height="32" fill="#8a5f35"/><rect x="0" y="296" width="444" height="3" fill="#6f4a27"/>
    <path d="M300,296 h36 l7,10 h-50 z" fill="#3b2a18"/>
    ${tree(318, 300, 262, true)}
    <path d="M318,22 l4.6,9.5 l10.500,1.400 l-7.700,7.300 l2,10.400 l-9.400,-5.100 l-9.400,5.100 l2,-10.400 l-7.700,-7.300 l10.500,-1.400 z" fill="#ecd9a4"/>
  </svg>
  <span class="band">Jetzt Wunschtermin sichern</span>
</section>

<section class="seite hinten">
  <h2>So einfach geht&rsquo;s</h2>
  <ol class="schritte">
    <li><b>Baum aussuchen</b>Nordmanntanne von 1,25 m bis 2,75 m – schlank, normal oder breit.</li>
    <li><b>Wunschtermin wählen</b>Lieferung montags, freitags und samstags, 9–16 Uhr.</li>
    <li><b>Zurücklehnen</b>Wir bringen deinen Baum frisch vom Förster aus der Region.</li>
  </ol>
  <div class="preise"><table>
    <tr><td class="titel" colspan="2">Nordmanntanne, Premium-Qualität</td></tr>
    <tr><td>1,25–1,50 m</td><td>39 €</td></tr>
    <tr><td>1,75–2,00 m</td><td>59 €</td></tr>
    <tr><td>2,50–2,75 m</td><td>89 €</td></tr>
    <tr class="abstand"><td>Aufbau im Ständer</td><td>19,90 €</td></tr>
    <tr><td>Lieferung Wetzlar inkl. Garbenheim</td><td>12,90 €</td></tr>
    <tr><td>Umland bis ca. 25 km (z. B. Gießen)</td><td>ab 17,90 €</td></tr>
  </table></div>
  <div class="unten">
    <div class="qr">${qr}</div>
    <div>
      <h2>Jetzt Wunschtermin sichern</h2>
      <p>QR-Code scannen oder direkt bestellen:<br><span class="url">${url.replace(/^https?:\/\//, '')}</span></p>
      <p class="firma">${firma} · ein Angebot von SK Webwerk, Wetzlar · Endpreise, keine USt. gem. § 19 UStG · Weitere Größen online</p>
    </div>
  </div>
</section>
</body></html>`.replace(/(\d)\.(\d)00\b/g, '$1.$2');

fs.writeFileSync(path.join(dir, 'flyer-a6.html'), html);
console.log('HTML geschrieben: marketing/flyer/flyer-a6.html');

try {
  // lokal installiertes Playwright, sonst ein global installiertes (NODE_PATH)
  const { chromium } = await import('playwright').catch(async () => {
    const { createRequire } = await import('node:module');
    return createRequire(path.join(process.env.NODE_PATH || root, 'x.js'))('playwright');
  });
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({ path: path.join(dir, 'flyer-a6.pdf'), width: '111mm', height: '154mm', printBackground: true });
  if (process.env.FLYER_PREVIEW) {
    await page.setViewportSize({ width: 420, height: 1164 });
    await page.screenshot({ path: process.env.FLYER_PREVIEW, fullPage: true });
  }
  await browser.close();
  console.log('PDF geschrieben:  marketing/flyer/flyer-a6.pdf');
} catch (err) {
  console.log('PDF übersprungen (Playwright/Chromium nicht verfügbar):', err.message.split('\n')[0]);
}
