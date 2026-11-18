# Instagram mit Claude verbinden (Connector)

Ziel: Claude bereitet Posts, Reels-Texte und Antworten vor – **veröffentlicht wird erst nach deiner Freigabe**.

## Stand

Verbinden kann nur der Kontoinhaber selbst (Anmeldung bei Instagram/Meta im Browser). In dieser Sitzung ist deshalb
noch kein Connector aktiv; vorbereitet ist alles bis zu dem Schritt, den nur du machen kannst.

## Voraussetzungen (du)

1. Instagram-Konto anlegen und auf **Business** oder **Creator** umstellen (Einstellungen → Kontotyp).
2. Eine **Facebook-Seite** anlegen und mit dem Instagram-Konto verknüpfen – ohne diese Verknüpfung erlaubt Meta
   kein Posten über Drittanbieter.
3. Optional: TikTok- und Facebook-Konto gleich mit anlegen, die Connectoren unten decken sie mit ab.

## Passende Connectoren im Claude-Verzeichnis

Im Connector-Verzeichnis von claude.ai sind (Stand 18.11.2026) zwei passende Einträge gelistet:

| Connector | Was er kann | Einschätzung |
|---|---|---|
| **Metricool Social Media Management** | Posts planen und ändern (`createScheduledPost`, `updateScheduledPost`), geplante Posts ansehen, beste Posting-Zeiten, Auswertungen | **Empfehlung.** Planen statt Sofort-Posten passt zum Freigabe-Ablauf: Claude legt den Post als geplanten Beitrag an, du siehst ihn in Metricool und gibst ihn frei oder änderst ihn. |
| **Windsor.ai for Social Media** | Auswerten und organisch posten auf Instagram, Facebook, TikTok, YouTube, LinkedIn | Alternative, stärker auf Auswertung ausgelegt. |

Porter und Composio standen bei der Suche nicht im Verzeichnis (die Suche deckt nur einen Teil ab – im Verzeichnis
auf claude.ai selbst nachsehen, falls du einen davon bevorzugst).

Nicht geprüft: Preise und Gratis-Kontingente der Anbieter sowie, ob Reels-Upload (Video) im jeweiligen Tarif enthalten ist.
Bitte vor der Entscheidung auf der Anbieterseite nachsehen.

## Einrichtung (ca. 10 Minuten)

1. Beim gewählten Anbieter (z. B. Metricool) ein Konto anlegen und dort Instagram, Facebook und TikTok verbinden.
2. In claude.ai: **Einstellungen → Connectors** → Connector suchen → **Verbinden** → Anmeldung bestätigen.
3. Neue Claude-Sitzung starten und sagen: „Bereite die Posts aus `marketing/redaktionsplan.md` für diese Woche als
   geplante Beiträge vor, aber veröffentliche nichts ohne meine Freigabe.“

## Freigabe-Ablauf (so arbeitet Claude damit)

1. Claude erstellt Text, Hashtags und Terminvorschlag aus dem Redaktionsplan und zeigt dir den Entwurf im Chat.
2. Erst nach deinem „Passt“ legt Claude den Beitrag als **geplanten** Post an – nie als Sofort-Veröffentlichung.
3. Du kannst den Beitrag bis zum Termin im Planungstool ändern oder löschen.
4. Antworten auf Kommentare/DMs: Claude formuliert Vorschläge (siehe Checkliste im Redaktionsplan), du schickst sie ab.

## Weitere Werkzeuge

- **Voiceover/Musik:** ElevenLabs – Hinweise zu Modell und Einstellungen in `video-skripte.md`. Der im Verzeichnis
  gelistete ElevenLabs-Connector ist für Sprach-Agenten gedacht, nicht für Voiceover; das Voiceover erzeugst du am
  einfachsten direkt auf elevenlabs.io.
- **Bilder/Schnitt/Untertitel:** Adobe Express / Firefly (ist in Claude bereits verbunden).
- **KI-Video:** Vergleich und Empfehlung in `ki-video-tools-vergleich.md`.
