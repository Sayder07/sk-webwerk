# Weihnachtsbaum-Lieferservice Wetzlar – Shop, Saison 2026

Website mit Konfigurator, Lieferterminwahl, Checkout (Stripe), Admin-Bereich und Marketing-Vorlagen.
Technik: Next.js 15, Postgres, Stripe Checkout, Resend. Kein Tracking, keine Cookies außer dem Admin-Login.

## Lokal starten

```bash
npm install
cp .env.example .env.local   # mindestens ADMIN_PASSWORD setzen
npm run dev                  # http://localhost:3000
```

Ohne weitere Einstellungen läuft alles im **Demo-Modus**: eingebettete Testdatenbank (`.data/`), Bestellungen ohne
Zahlung, E-Mails nur im Server-Log. So kannst du den ganzen Ablauf sofort durchklicken.

`npm test` prüft Preise, PLZ-Zonen, Liefertage, Vorlaufzeit und Kapazitätslogik.

## Was wo gepflegt wird

| Was | Wo |
|---|---|
| Firmendaten, Preise, Extras, Zonen, **PLZ-Liste**, Liefertage, Zeitfenster, Kapazitäten, Vorlaufzeit, Saison | `config/shop.config.ts` – eine Datei, ausführlich kommentiert |
| Kundenstimmen (Abschnitt erscheint erst, wenn Einträge da sind) | `config/shop.config.ts` → `testimonials` |
| Fotos statt Illustrationen | Dateien nach `public/bilder/`, dann `images.heroPhoto` bzw. `photo` je Baumgröße in der Konfiguration setzen |
| Texte der Seiten | `app/(shop)/…/page.tsx` |
| Rechtstexte (Platzhalter!) | `app/(shop)/impressum`, `datenschutz`, `agb`, `widerruf` |
| E-Mail-Texte | `lib/email.ts` |

Die Tourenbündelung (Zone nur an bestimmten Wochentagen) stellst du je Zone über `weekdays` ein, z. B. `weekdays: [5]` = nur freitags.

## Ablauf für Kunden

Startseite → Baumauswahl → Konfigurator (Größe, Form, Extras, Live-Preis) → **erst dann** PLZ, Zone, Liefertag und
Zeitfenster → Kasse → Stripe → Bestätigung per E-Mail. PLZ außerhalb der Liste: Anfrageformular statt Checkout.

Ein Zeitfenster wird beim Klick auf „Zahlungspflichtig bestellen“ reserviert (Standard 40 Minuten). Wird nicht
bezahlt, ist es danach wieder frei. Volle Fenster und zu kurzfristige Tage sind ausgegraut.

## Admin-Bereich: `/admin`

Login mit `ADMIN_PASSWORD`. Enthält:

- **Bestellungen** mit Filter nach Liefertag, Zone, Status; Status ändern; **CSV-Export** (öffnet direkt in Excel)
- **Tagesliste** je Liefertag, sortiert nach Zone und Zeitfenster – zum Drucken
- **Einkauf Förster**: Bäume je Größe und Form pro Liefertermin, mit Bestellschluss
- **Anfragen** (Kontakt, Deko, Lieferung außerhalb)

## Live schalten (Vercel + Supabase + Stripe + Resend)

1. **Vercel:** Repository importieren, als *Root Directory* den Ordner `weihnachtsbaum` wählen. Domain verbinden.
2. **Datenbank (Supabase, kostenloser Tarif reicht):** Projekt in einer EU-Region anlegen, unter *Connect* die
   Verbindungs-URL des **Transaction Poolers** kopieren und als `DATABASE_URL` eintragen. Die Tabellen legt der
   Shop beim ersten Aufruf selbst an.
3. **Stripe:** Konto anlegen, zunächst die **Test-Schlüssel** eintragen (`STRIPE_SECRET_KEY=sk_test_…`).
   Unter *Entwickler → Webhooks* einen Endpoint `https://DEINE-DOMAIN/api/stripe/webhook` mit den Ereignissen
   `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`,
   `checkout.session.expired` anlegen und das Signatur-Geheimnis als `STRIPE_WEBHOOK_SECRET` eintragen.
   Zahlarten (Karte, Apple Pay, Google Pay, PayPal …) schaltest du im Stripe-Dashboard unter
   *Einstellungen → Zahlungsmethoden* frei – der Shop zeigt automatisch alles an, was dort aktiv ist.
   Testkarte: `4242 4242 4242 4242`. Für den Echtbetrieb die Live-Schlüssel und einen Live-Webhook eintragen.
4. **Resend:** Konto anlegen, Domain verifizieren, `RESEND_API_KEY`, `EMAIL_FROM`, `OPERATOR_EMAIL` eintragen.
5. `NEXT_PUBLIC_SITE_URL` und `ADMIN_PASSWORD` setzen, neu deployen.

Solange Test-Schlüssel (oder gar kein Stripe) aktiv sind, zeigt die Website oben einen roten Testmodus-Balken.

## Flyer

```bash
npm run flyer -- https://deine-domain.de "Dein Firmenname"
```

erzeugt `marketing/flyer/flyer-a6.pdf` (Vorder-/Rückseite, A6 mit 3 mm Beschnitt) inklusive QR-Code auf die
angegebene Adresse. **Das mitgelieferte PDF enthält einen Platzhalter-QR-Code** (example.com) – vor dem Druck mit
der echten Domain neu erzeugen.

## Marketing-Unterlagen (`marketing/`)

- `video-skripte.md` – 5 Reel-Skripte mit Voiceover, Untertiteln, Bildideen, ElevenLabs-Hinweisen
- `redaktionsplan.md` – Plan 23.11.–23.12., fertige Captions, Gruppentexte, Antwort-Checkliste
- `ki-video-tools-vergleich.md` – Vergleich und Empfehlung KI-Video-Tools
- `instagram-connector.md` – Instagram mit Claude verbinden, Freigabe-Ablauf
- `flyer/` – Flyer-Vorlage und Generator

## Vor dem Launch (Betreiber)

- [ ] Firmenname, Adresse, Telefon, E-Mail, USt-Angabe in `config/shop.config.ts` eintragen
- [ ] **PLZ-Liste prüfen** – sie ist ein Vorschlag nach ungefährer Entfernung
- [ ] Rechtstexte vervollständigen und prüfen lassen (insbesondere Widerrufsrecht bei frischen Bäumen)
- [ ] Stripe im Testmodus einmal komplett durchspielen (Bestellung, E-Mail, Admin), dann Live-Schlüssel
- [ ] Zeitfenster, Kapazitäten und Tagesobergrenze an Fahrzeug und Tour anpassen
- [ ] Echte Fotos einsetzen, Flyer mit echter Domain erzeugen
