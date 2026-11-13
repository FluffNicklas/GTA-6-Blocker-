# GTA6 Blocker

🇩🇪 Deutsch · [🇬🇧 English below](#english)

Browser-Erweiterung (Chrome, Edge, Brave, Firefox), die GTA-6-Inhalte auf **YouTube, Twitch, Instagram und TikTok** ausblendet – bevor du sie siehst. Nach dem Release schaltest du sie mit einem Klick wieder aus.

## Was sie kann
- Blendet Videos, Shorts, Streams, Reels und Beiträge aus, deren Titel/Beschreibung/Hashtags zu deinen Stichwörtern passen (Groß-/Kleinschreibung und Leerzeichen sind egal: `GTA6` = `gta 6` = `GTA-6`)
- Twitch: blendet die ganze Kategorie „Grand Theft Auto VI“ aus und sperrt Kanäle, die sie streamen
- Sperrt Video-, Kanal-, Such-, Hashtag- und Kategorieseiten, die passen (abschaltbar)
- Player und Ton bleiben gesperrt, bis die Seite geprüft ist
- Stichwörter im Popup frei änderbar, großer An/Aus-Schalter
- Alles läuft lokal. Es werden keine Daten gesendet.

## Installation in Chrome / Edge / Brave
> Chrome erlaubt Erweiterungen von außerhalb des Chrome Web Store nur über den **Entwicklermodus**. Das ist eine Chrome-Vorgabe und lässt sich ohne Store nicht umgehen.

1. Gehe oben auf dieser Seite zu **Releases** und lade `gta6-blocker-chrome.zip` herunter.
2. Entpacke die ZIP in einen Ordner, den du behalten willst, z. B. `Dokumente\gta6-blocker`.
   Windows: Rechtsklick → *Alle extrahieren…*. Mac: Doppelklick.
   **Den Ordner danach nicht löschen oder verschieben** – Chrome liest die Erweiterung direkt daraus.
3. Öffne in Chrome `chrome://extensions` (Edge: `edge://extensions`, Brave: `brave://extensions`).
4. Schalte oben rechts **Entwicklermodus** ein.
5. Klicke auf **Entpackte Erweiterung laden** und wähle den entpackten Ordner (der, in dem direkt `manifest.json` liegt).
6. Klicke in der Chrome-Leiste auf das Puzzle-Symbol und hefte **GTA6 Blocker** an.
7. Lade YouTube/Twitch/… einmal neu (Strg+F5).

Hinweis: Unter Windows zeigt Chrome beim Start manchmal „Erweiterungen im Entwicklermodus deaktivieren“. Einfach wegklicken, nicht „Deaktivieren“ wählen.

**Update:** Neue ZIP herunterladen, die Dateien im alten Ordner ersetzen, dann bei `chrome://extensions` beim Eintrag auf das Reload-Symbol (↻) klicken.

## Installation in Firefox
**Dauerhaft (empfohlen, ohne Entwicklermodus):**
1. Lade unter **Releases** die Datei `gta6-blocker-firefox.xpi` herunter (von Mozilla signiert).
2. Öffne die Datei mit Firefox oder ziehe sie auf ein Firefox-Fenster. Bestätige mit **Hinzufügen**.
3. Firefox gibt neuen Erweiterungen keinen Seitenzugriff von allein: Öffne `about:addons` → **GTA6 Blocker** → **Berechtigungen** und erlaube den Zugriff auf YouTube, Twitch, Instagram und TikTok.
4. Lade die Seiten neu.

**Nur zum Testen (weg nach Neustart):** `about:debugging#/runtime/this-firefox` → *Temporäres Add-on laden…* → `manifest.json` aus dem entpackten Ordner wählen.

## Bedienung
Klick auf das Icon: Schalter **Blocker aktiv** an/aus, **Seiten sperren** an/aus, Stichwörter mit Enter hinzufügen und mit × entfernen.

## Grenzen
- Es wird nach Text gefiltert (Titel, Beschreibung, Hashtags). Was GTA 6 nur im Bild zeigt, wird nicht erkannt.
- Handy-Apps sind nicht betroffen, nur der Browser.
- YouTube, Twitch & Co. ändern ihre Seiten oft. Wenn etwas durchrutscht, bitte ein Issue mit Screenshot öffnen.
- Beim Wechsel auf einen Stream/ein Video kann der Ton für einen Moment durchkommen, bevor die Sperre greift.

## Lizenz
MIT

---

<a name="english"></a>
# GTA6 Blocker (English)

Browser extension (Chrome, Edge, Brave, Firefox) that hides GTA 6 content on **YouTube, Twitch, Instagram and TikTok** before you see it. Switch it off with one click after the release.

**Features:** keyword filter (case, spaces and punctuation don't matter), hides the Twitch "Grand Theft Auto VI" category and channels streaming it, blocks matching video/channel/search/hashtag pages (optional), editable keywords, on/off switch. Everything runs locally, no data is sent.

## Install – Chrome / Edge / Brave
Chrome only allows extensions from outside the Chrome Web Store in Developer mode.
1. Download `gta6-blocker-chrome.zip` from **Releases** and unzip it into a folder you keep.
2. Open `chrome://extensions` and turn on **Developer mode**.
3. Click **Load unpacked** and select the unzipped folder (the one containing `manifest.json`).
4. Pin the extension and reload YouTube/Twitch/etc.

## Install – Firefox
1. Download `gta6-blocker-firefox.xpi` from **Releases** (signed by Mozilla) and open it in Firefox → **Add**.
2. `about:addons` → GTA6 Blocker → **Permissions** → allow access to the four sites.
3. Testing only: `about:debugging#/runtime/this-firefox` → *Load Temporary Add-on…* → `manifest.json`.

## Limits
Text-based only, browser only (no mobile apps), site layouts change – please open an issue with a screenshot if something slips through.

## License
MIT
