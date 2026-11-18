/**
 * Platzhalter-Illustrationen (SVG), bis echte Fotos vorliegen.
 * Die Bäume werden maßstäblich gezeichnet: 1 Einheit = 1 cm.
 */

type TreeProps = { cx: number; ground: number; heightCm: number; widthFactor?: number; lights?: boolean };

/** Zeichnet eine Tanne mit Fußpunkt (cx, ground) und gegebener Höhe. */
export function Tree({ cx, ground, heightCm, widthFactor = 1, lights = false }: TreeProps) {
  const trunkH = heightCm * 0.09;
  const top = ground - heightCm;
  const foliageBottom = ground - trunkH;
  const foliageH = foliageBottom - top - heightCm * 0.04;
  const foliageTop = top + heightCm * 0.04;
  const baseHalf = heightCm * 0.31 * widthFactor;
  const tiers = Math.max(5, Math.round(heightCm / 30));
  const paths: { d: string; fill: string }[] = [];
  const lightDots: { x: number; y: number }[] = [];

  for (let i = tiers - 1; i >= 0; i--) {
    const t0 = i / tiers;
    const t1 = (i + 1) / tiers;
    const yTop = foliageTop + foliageH * Math.max(0, t0 - 0.16);
    const yBot = foliageTop + foliageH * t1;
    const half = baseHalf * (0.16 + 0.84 * t1);
    const tips = 3 + Math.round(t1 * 4);
    const step = (half * 2) / tips;
    const droop = (yBot - yTop) * 0.2;
    let d = `M${cx},${yTop} Q${cx - half * 0.3},${yTop + (yBot - yTop) * 0.62} ${cx - half},${yBot}`;
    for (let k = 0; k < tips; k++) {
      const x0 = cx - half + k * step;
      d += ` Q${x0 + step * 0.5},${yBot - droop} ${x0 + step},${yBot + (k === tips - 1 ? 0 : (k % 2 ? 1 : -1) * droop * 0.25)}`;
    }
    d += ` Q${cx + half * 0.3},${yTop + (yBot - yTop) * 0.62} ${cx},${yTop} Z`;
    paths.push({ d, fill: i % 2 ? '#2a5239' : '#234731' });
    if (lights) {
      const n = 2 + Math.round(t1 * 3);
      for (let k = 0; k < n; k++) {
        const f = (k + 0.5) / n;
        lightDots.push({ x: cx - half * 0.78 + f * half * 1.56, y: yBot - droop * (1.3 + ((k + i) % 2) * 0.9) });
      }
    }
  }

  return (
    <g>
      <ellipse cx={cx} cy={ground} rx={baseHalf * 0.9} ry={heightCm * 0.022} fill="#000" opacity="0.14" />
      <rect x={cx - heightCm * 0.022} y={foliageBottom - heightCm * 0.03} width={heightCm * 0.044} height={trunkH + heightCm * 0.03} fill="#6f4a27" rx={heightCm * 0.006} />
      {paths.map((p, i) => (
        <path key={i} d={p.d} fill={p.fill} />
      ))}
      {/* Spitze */}
      <path d={`M${cx},${top} L${cx - heightCm * 0.022},${foliageTop + foliageH * 0.1} L${cx + heightCm * 0.022},${foliageTop + foliageH * 0.1} Z`} fill="#2a5239" />
      {lights &&
        lightDots.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={heightCm * 0.022} fill="#f5d98a" opacity="0.28" />
            <circle cx={p.x} cy={p.y} r={heightCm * 0.008} fill="#fff3c9" />
          </g>
        ))}
    </g>
  );
}

/** Baum auf einer Auswahlkarte – alle Karten im selben Maßstab, damit der Größenunterschied sichtbar ist. */
export function TreeCardArt({ heightCm }: { heightCm: number }) {
  return (
    <svg viewBox="0 0 240 300" role="img" aria-label={`Illustration: Nordmanntanne, ca. ${(heightCm / 100).toFixed(2).replace('.', ',')} m`} preserveAspectRatio="xMidYMax meet">
      <rect x="0" y="278" width="240" height="22" fill="#cdb48c" />
      <rect x="0" y="278" width="240" height="2" fill="#b89a6b" />
      <Tree cx={120} ground={282} heightCm={heightCm} />
    </svg>
  );
}

/** Größenvergleich im Konfigurator: Baum neben einer 1,80 m großen Person und einer 2,50-m-Decke. */
export function SizeScene({ heightCm, widthFactor, label }: { heightCm: number; widthFactor: number; label: string }) {
  const ground = 300;
  const person = 180;
  return (
    <svg viewBox="0 0 360 330" role="img" aria-label={`Größenvergleich: Baum ${label} neben einer 1,80 m großen Person`}>
      <rect x="0" y={ground} width="360" height="30" fill="#cdb48c" />
      <rect x="0" y={ground} width="360" height="2" fill="#b89a6b" />
      {/* Deckenhöhe 2,50 m */}
      <line x1="0" y1={ground - 250} x2="360" y2={ground - 250} stroke="#9a6a3a" strokeWidth="1.2" strokeDasharray="5 5" opacity="0.7" />
      <text x="8" y={ground - 255} fontSize="11" fill="#7a5a34" fontFamily="var(--sans)">Decke 2,50 m</text>
      {/* Person 1,80 m */}
      <g fill="#b9a587">
        <circle cx="290" cy={ground - person + 13} r="13" />
        <path d={`M270,${ground - person + 34} q20,-9 40,0 l4,62 h-9 l-3,-40 v${person - 96} h-10 v-${person - 150} h-4 v${person - 150} h-10 v-${person - 96} l-3,40 h-9 z`} />
      </g>
      <text x="290" y={ground + 20} fontSize="11" textAnchor="middle" fill="#5b4a2f" fontFamily="var(--sans)">1,80 m</text>
      <Tree cx={140} ground={ground} heightCm={heightCm} widthFactor={widthFactor} />
      <text x="140" y={ground + 20} fontSize="11" textAnchor="middle" fill="#5b4a2f" fontFamily="var(--sans)" fontWeight="600">{label}</text>
    </svg>
  );
}

/** Stimmungsbild für die Startseite: Baum im Wohnzimmer am Abend. */
export function HeroScene() {
  return (
    <svg viewBox="0 0 640 520" role="img" aria-label="Illustration: geschmückter Weihnachtsbaum mit Lichterkette in einem Wohnzimmer">
      <defs>
        <linearGradient id="wand" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a3626" />
          <stop offset="1" stopColor="#234a34" />
        </linearGradient>
        <linearGradient id="nacht" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0f2233" />
          <stop offset="1" stopColor="#25435c" />
        </linearGradient>
        <radialGradient id="schein" cx="0.5" cy="0.55" r="0.5">
          <stop offset="0" stopColor="#f5d98a" stopOpacity="0.34" />
          <stop offset="1" stopColor="#f5d98a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="640" height="520" fill="url(#wand)" />
      {/* Fenster mit Winternacht */}
      <g>
        <rect x="408" y="70" width="172" height="230" rx="6" fill="#dcc29a" />
        <rect x="418" y="80" width="152" height="210" fill="url(#nacht)" />
        <path d="M418,262 q40,-26 76,-8 t76,-10 v46 h-152 z" fill="#e9eef0" opacity="0.92" />
        <path d="M452,262 l14,-44 l14,44 z M520,256 l11,-34 l11,34 z" fill="#17362a" />
        {[[436, 104], [470, 140], [512, 110], [548, 150], [444, 190], [498, 176], [540, 208], [526, 96], [460, 232]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 2.4 : 1.6} fill="#fff" opacity="0.85" />
        ))}
        <rect x="490" y="80" width="8" height="210" fill="#dcc29a" />
        <rect x="418" y="178" width="152" height="8" fill="#dcc29a" />
        <rect x="398" y="298" width="192" height="12" rx="3" fill="#c9ab7c" />
      </g>
      {/* Boden */}
      <rect x="0" y="440" width="640" height="80" fill="#8a5f35" />
      <rect x="0" y="440" width="640" height="5" fill="#6f4a27" />
      {[70, 190, 330, 450, 560].map((x) => (
        <rect key={x} x={x} y="445" width="2" height="75" fill="#6f4a27" opacity="0.5" />
      ))}
      <ellipse cx="250" cy="462" rx="210" ry="26" fill="#a63a2b" opacity="0.55" />
      {/* Lichtschein */}
      <circle cx="250" cy="270" r="250" fill="url(#schein)" />
      {/* Ständer */}
      <path d="M222,444 h56 l10,16 h-76 z" fill="#3b2a18" />
      <g transform="translate(0,0)">
        <Tree cx={250} ground={450} heightCm={372} widthFactor={1.02} lights />
      </g>
      {/* Stern */}
      <path d="M250,58 l6.5,13.5 l15,2 l-11,10.4 l2.8,14.8 l-13.3,-7.2 l-13.3,7.2 l2.8,-14.8 l-11,-10.4 l15,-2 z" fill="#ecd9a4" />
      {/* Geschenke */}
      <g>
        <rect x="352" y="412" width="60" height="44" rx="3" fill="#ecd9a4" />
        <rect x="378" y="412" width="8" height="44" fill="#a63a2b" />
        <rect x="352" y="428" width="60" height="7" fill="#a63a2b" />
        <rect x="108" y="424" width="48" height="34" rx="3" fill="#a63a2b" />
        <rect x="128" y="424" width="7" height="34" fill="#ecd9a4" />
        <rect x="70" y="434" width="34" height="26" rx="3" fill="#f6f0e4" />
        <rect x="84" y="434" width="6" height="26" fill="#c39a3f" />
      </g>
    </svg>
  );
}

export function BrandMark() {
  return (
    <svg viewBox="0 0 30 34" aria-hidden="true">
      <path d="M15 1 L22 11 H18.5 L25 20 H20.5 L28 29 H2 L9.5 20 H5 L11.5 11 H8 Z" fill="#1f3d2b" />
      <rect x="13" y="29" width="4" height="5" fill="#9a6a3a" />
    </svg>
  );
}
