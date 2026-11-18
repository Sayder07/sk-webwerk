/**
 * ZENTRALE KONFIGURATION – Weihnachtsbaum-Lieferservice, Saison 2026
 * ===================================================================
 * Hier pflegst du alles, was sich ohne Programmierung ändern lassen soll:
 * Firmendaten, Preise, Extras, Lieferzonen, PLZ-Liste, Liefertage,
 * Zeitfenster und Kapazitäten.
 *
 * Alle Preise in CENT und inkl. MwSt. (3900 = 39,00 €).
 * Nach einer Änderung: Seite neu deployen (git push), fertig.
 */

export type TreeSize = {
  id: string;
  label: string;
  minCm: number;
  maxCm: number;
  price: number;
  /** kurze Einordnung für die Auswahlkarte */
  hint: string;
  /** optional: echtes Foto, z. B. '/bilder/baum-175-200.jpg' (Datei in /public/bilder ablegen) */
  photo?: string;
};

export type TreeShape = { id: string; label: string; description: string; widthFactor: number };

export type Extra = { id: string; label: string; price: number; description: string };

export type Slot = { id: string; from: string; to: string };

export type Zone = {
  id: number;
  name: string;
  area: string;
  fee: number;
  /** Zeitfenster, die Kunden in dieser Zone wählen können */
  slots: Slot[];
  /** max. Lieferungen pro Zeitfenster und Tag in dieser Zone */
  capacityPerSlot: number;
  /**
   * Optional: Zone nur an bestimmten Wochentagen beliefern, um Touren zu bündeln.
   * 1 = Montag … 6 = Samstag, 0 = Sonntag. `null` = alle Liefertage.
   * Beispiel Gießen nur freitags: weekdays: [5]
   */
  weekdays: number[] | null;
};

function slots(...ranges: [string, string][]): Slot[] {
  return ranges.map(([from, to]) => ({ id: `${from}-${to}`, from, to }));
}

export const shopConfig = {
  /* ------------------------------------------------------------------ */
  /* Firmendaten – PLATZHALTER, vor dem Launch ausfüllen                 */
  /* ------------------------------------------------------------------ */
  company: {
    name: '[Firmenname]',
    claim: 'Weihnachtsbaum-Lieferservice Wetzlar',
    owner: 'Sayder Karakaplan',
    street: '[Straße und Hausnummer]',
    zipCity: '[PLZ] Wetzlar-Garbenheim',
    phone: '[Telefonnummer]',
    email: '[E-Mail-Adresse]',
    /** z. B. 'DE123456789' oder Hinweis auf Kleinunternehmerregelung */
    vatId: '[USt-IdNr. oder Hinweis § 19 UStG]',
    /** Optional: WhatsApp-Nummer im internationalen Format ohne +, z. B. '4915112345678' */
    whatsapp: '',
    instagram: '',
    facebook: '',
  },

  /* ------------------------------------------------------------------ */
  /* Bilder – Platzhalter-Illustrationen, später durch Fotos ersetzen     */
  /* ------------------------------------------------------------------ */
  images: {
    /** z. B. '/bilder/hero.jpg' – leer lassen, solange die Illustration genutzt wird */
    heroPhoto: '',
  },

  /* ------------------------------------------------------------------ */
  /* Saison und Liefertage                                               */
  /* ------------------------------------------------------------------ */
  season: {
    year: 2026,
    /** erster und letzter möglicher Liefertag (Format JJJJ-MM-TT) */
    firstDeliveryDate: '2026-12-01',
    lastDeliveryDate: '2026-12-23',
  },

  delivery: {
    /** feste Liefertage: 1 = Montag, 5 = Freitag, 6 = Samstag (0 = Sonntag) */
    weekdays: [1, 5, 6],
    /** Lieferzeit am Tag (nur Anzeige) */
    dayStart: '09:00',
    dayEnd: '16:00',
    /** Bestellung mindestens so viele Tage vor dem Liefertag (Förster braucht 2–3 Tage) */
    minLeadDays: 4,
    /** Obergrenze aller Lieferungen pro Tag über alle Zonen (0 = keine Obergrenze) */
    maxDeliveriesPerDay: 20,
    /** einzelne Tage sperren, z. B. ['2026-12-12'] */
    blockedDates: [] as string[],
    /** so lange bleibt ein Zeitfenster reserviert, während der Kunde bezahlt */
    reservationMinutes: 40,
  },

  /* ------------------------------------------------------------------ */
  /* Sortiment: Nordmanntannen                                           */
  /* ------------------------------------------------------------------ */
  trees: [
    { id: '125-150', label: '1,25–1,50 m', minCm: 125, maxCm: 150, price: 3900, hint: 'Kompakt – ideal für kleine Räume oder auf dem Tisch' },
    { id: '150-175', label: '1,50–1,75 m', minCm: 150, maxCm: 175, price: 4900, hint: 'Der Handliche für Wohnung und Kinderzimmer' },
    { id: '175-200', label: '1,75–2,00 m', minCm: 175, maxCm: 200, price: 5900, hint: 'Der Klassiker fürs Wohnzimmer' },
    { id: '200-225', label: '2,00–2,25 m', minCm: 200, maxCm: 225, price: 6900, hint: 'Stattlich – passt unter normale Decken (2,50 m)' },
    { id: '225-250', label: '2,25–2,50 m', minCm: 225, maxCm: 250, price: 7900, hint: 'Groß – für hohe Decken ab ca. 2,70 m' },
    { id: '250-275', label: '2,50–2,75 m', minCm: 250, maxCm: 275, price: 8900, hint: 'Der Imposante für Altbau, Diele und Galerie' },
  ] as TreeSize[],

  /** Baumform – ohne Aufpreis */
  shapes: [
    { id: 'schlank', label: 'Schlank', description: 'Schmal gewachsen – gut für Ecken und kleine Räume', widthFactor: 0.8 },
    { id: 'normal', label: 'Normal', description: 'Gleichmäßig und klassisch', widthFactor: 1 },
    { id: 'breit', label: 'Breit', description: 'Ausladend und füllig – braucht etwas mehr Platz', widthFactor: 1.2 },
  ] as TreeShape[],

  /* ------------------------------------------------------------------ */
  /* Zusatzleistungen und Extras                                         */
  /* ------------------------------------------------------------------ */
  extras: [
    { id: 'aufbau', label: 'Aufbau im Ständer', price: 1990, description: 'Wir stellen den Baum bei dir auf, richten ihn aus und nehmen das Netz ab – in deinem oder dem bei uns gekauften Ständer.' },
    { id: 'standfuss', label: 'Standfuß (Kauf)', price: 3490, description: 'Stabiler Christbaumständer – gehört dir und hält auch nächstes Jahr.' },
    { id: 'zweige', label: 'Zweige, 3–4 Stück', price: 600, description: 'Frisches Tannengrün für Tisch, Tür oder Kranz.' },
    { id: 'abholung', label: 'Abholung des Baums im Januar', price: 1490, description: 'Wir holen den Baum nach den Feiertagen wieder ab. Den Termin stimmen wir per E-Mail mit dir ab.' },
  ] as Extra[],

  /* ------------------------------------------------------------------ */
  /* Lieferzonen, Lieferkosten, Zeitfenster, Kapazität                   */
  /* ------------------------------------------------------------------ */
  zones: [
    {
      id: 1,
      name: 'Zone 1',
      area: 'Wetzlar inkl. Garbenheim',
      fee: 1290,
      // kurze Fenster: 1 Stunde
      slots: slots(['09:00', '10:00'], ['10:00', '11:00'], ['11:00', '12:00'], ['12:00', '13:00'], ['13:00', '14:00'], ['14:00', '15:00'], ['15:00', '16:00']),
      capacityPerSlot: 3,
      weekdays: null,
    },
    {
      id: 2,
      name: 'Zone 2',
      area: 'bis ca. 15 km um Wetzlar (z. B. Lahnau, Aßlar)',
      fee: 1790,
      // mittlere Fenster: 2 Stunden
      slots: slots(['09:00', '11:00'], ['11:00', '13:00'], ['13:00', '15:00'], ['14:00', '16:00']),
      capacityPerSlot: 3,
      weekdays: null,
    },
    {
      id: 3,
      name: 'Zone 3',
      area: 'bis ca. 25 km um Wetzlar (z. B. Gießen)',
      fee: 2490,
      // große Fenster: halber Tag
      slots: slots(['09:00', '12:30'], ['12:30', '16:00']),
      capacityPerSlot: 4,
      // Beispiel Tourenbündelung: nur freitags und samstags → weekdays: [5, 6]
      weekdays: null,
    },
  ] as Zone[],

  /* ------------------------------------------------------------------ */
  /* PLZ → Zone                                                          */
  /* ------------------------------------------------------------------ */
  /**
   * ACHTUNG: Diese Liste ist ein VORSCHLAG nach ungefährer Entfernung zu Wetzlar
   * und muss vor dem Launch vom Betreiber geprüft werden.
   * Jede PLZ, die hier NICHT steht, bekommt statt Checkout das Anfrageformular.
   * Einzelne PLZ verschieben: einfach die Zahl hinter `zone` ändern.
   */
  plzTable: [
    // Zone 1 – Wetzlar inkl. Stadtteile (Garbenheim = 35583)
    { plz: '35576', ort: 'Wetzlar', zone: 1 },
    { plz: '35578', ort: 'Wetzlar', zone: 1 },
    { plz: '35579', ort: 'Wetzlar', zone: 1 },
    { plz: '35580', ort: 'Wetzlar', zone: 1 },
    { plz: '35581', ort: 'Wetzlar', zone: 1 },
    { plz: '35582', ort: 'Wetzlar', zone: 1 },
    { plz: '35583', ort: 'Wetzlar', zone: 1 },
    { plz: '35584', ort: 'Wetzlar', zone: 1 },
    { plz: '35585', ort: 'Wetzlar', zone: 1 },
    { plz: '35586', ort: 'Wetzlar', zone: 1 },

    // Zone 2 – bis ca. 15 km
    { plz: '35633', ort: 'Lahnau', zone: 2 },
    { plz: '35614', ort: 'Aßlar', zone: 2 },
    { plz: '35606', ort: 'Solms', zone: 2 },
    { plz: '35619', ort: 'Braunfels', zone: 2 },
    { plz: '35638', ort: 'Leun', zone: 2 },
    { plz: '35625', ort: 'Hüttenberg', zone: 2 },
    { plz: '35641', ort: 'Schöffengrund', zone: 2 },
    { plz: '35630', ort: 'Ehringshausen', zone: 2 },
    { plz: '35644', ort: 'Hohenahr', zone: 2 },
    { plz: '35444', ort: 'Biebertal', zone: 2 },
    { plz: '35452', ort: 'Heuchelheim', zone: 2 },
    { plz: '35435', ort: 'Wettenberg', zone: 2 },
    { plz: '35428', ort: 'Langgöns', zone: 2 },
    { plz: '35647', ort: 'Waldsolms', zone: 2 },

    // Zone 3 – bis ca. 25 km
    { plz: '35390', ort: 'Gießen', zone: 3 },
    { plz: '35392', ort: 'Gießen', zone: 3 },
    { plz: '35394', ort: 'Gießen', zone: 3 },
    { plz: '35396', ort: 'Gießen', zone: 3 },
    { plz: '35398', ort: 'Gießen', zone: 3 },
    { plz: '35440', ort: 'Linden', zone: 3 },
    { plz: '35415', ort: 'Pohlheim', zone: 3 },
    { plz: '35457', ort: 'Lollar', zone: 3 },
    { plz: '35460', ort: 'Staufenberg', zone: 3 },
    { plz: '35418', ort: 'Buseck', zone: 3 },
    { plz: '35463', ort: 'Fernwald', zone: 3 },
    { plz: '35510', ort: 'Butzbach', zone: 3 },
    { plz: '35649', ort: 'Bischoffen', zone: 3 },
    { plz: '35745', ort: 'Herborn', zone: 3 },
    { plz: '35764', ort: 'Sinn', zone: 3 },
    { plz: '35756', ort: 'Mittenaar', zone: 3 },
    { plz: '35753', ort: 'Greifenstein', zone: 3 },
    { plz: '35781', ort: 'Weilburg', zone: 3 },
    { plz: '35792', ort: 'Löhnberg', zone: 3 },
    { plz: '35789', ort: 'Weilmünster', zone: 3 },
  ] as { plz: string; ort: string; zone: number }[],
};

export type ShopConfig = typeof shopConfig;

/**
 * Kundenstimmen für die Startseite. Solange die Liste leer ist, wird der Abschnitt
 * nicht angezeigt. Nur echte Stimmen eintragen (mit Einverständnis), z. B.:
 *   { text: 'Pünktlich, freundlich, und der Baum stand in zehn Minuten.', name: 'Familie M., Garbenheim' }
 */
export const testimonials: { text: string; name: string }[] = [];
