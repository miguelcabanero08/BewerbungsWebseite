# Bewerbungswebsite Miguel Cabañero

Eine begehbare Bewerbung: Besucher stehen im Treppenhaus vor der Wohnungstür,
klingeln, gehen ins Zimmer und finden am PC alle Inhalte als Apps
(Über mich, Projekte, Dokumente, Songs, Filme, Blender, Fellow Tenants,
Impressum). Auf dem Handy erscheint am PC ein Startbildschirm statt des Desktops.

- **Frontend:** React 19 + Vite, 3D mit three.js (wird erst nachgeladen)
- **Backend:** Vercel Serverless Functions in `api/` (Login, Session, Dokumente)
- **Dokumente:** privater Vercel-Blob-Store, nur mit gültiger Session abrufbar
- Design-Regeln und technische Lehren: [DESIGN.md](DESIGN.md), Produkt: [PRODUCT.md](PRODUCT.md)

## Aufbau

```
src/
  Experience.jsx      Steuerzentrale: URL, 3D-Engine laden, Desktop/Handy, Overlays
  world/              3D: scene.js (Flur + Zimmer), engine.js (Kamera, Eingaben, Licht)
  desk/               Desktop, Fenster, Taskleiste, Handy-Oberfläche, Icons
  apps/               Inhalte der Apps (Über mich, Projekte, Dokumente, …)
  data/               Projekte, Apps, Skills, Medien (Filme, Songs, Blender)
  i18n/               Alle Texte in DE / EN / FR
  styles/             CSS (base, world, desktop, apps, phone)
api/                  Vercel Functions (unverändert seit der alten Seite)
public/media/         Web-Versionen der eigenen Filme und Spiel-Clips
protected-files/      Geschützte PDFs, NUR lokal (gitignored)
design/mockups/       Freigegebene Mockups als Referenz (werden nicht ausgeliefert)
```

**Adressen:** `/` = Flur · `/desktop` = direkt am PC · `/ueber-mich`,
`/projekte`, `/dokumente`, `/songs`, `/filme`, `/blender`, `/fellow-tenants`,
`/impressum` = direkt am PC mit offener App (gut für Links im
Bewerbungsschreiben). Alte Adressen `/lebenslauf`, `/staerken`,
`/persoenliches` leiten auf „Über mich“ weiter.

## Einrichten und lokal starten

```bash
npm install
cp .env.example .env
```

In `.env` drei Werte eintragen (Details in `.env.example`):

| Variable | Wofür | Erzeugen |
|---|---|---|
| `SESSION_SECRET` | signiert das Login-Cookie | `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `SITE_PASSWORD_HASH` | bcrypt-Hash des Dokumente-Passworts | `npm run hash-password -- <passwort>` |
| `BLOB_READ_WRITE_TOKEN` | nur lokal zum Hochladen der PDFs | Vercel → Storage → Blob-Store → `.env.local` |

Starten:

```bash
npm run dev:all
```

Das ist `vercel dev`: Seite **und** die echten Functions aus `api/` auf
`http://localhost:3000`. Beim ersten Start fragt die Vercel-CLI nach Login und
Projekt-Verknüpfung.

Nur die Oberfläche ohne Login/Dokumente: `npm run dev` (Vite auf Port 5173;
`/api` wird an Port 3001 weitergeleitet, dort läuft normalerweise nichts).

**Troubleshooting:** Bricht `vercel dev` im nicht verknüpften `--local`-Modus
mit einem `yarn`-Fehler ab, das Projekt einmal mit dem Vercel-Account
verknüpfen und `vercel dev` ohne `--local` starten.

## Wie der Passwortschutz funktioniert

1. Das Passwort steht **nirgends im Klartext**, weder im Code noch im Repo
   noch auf Vercel. Gespeichert ist nur sein **bcrypt-Hash** in der
   Umgebungsvariable `SITE_PASSWORD_HASH`.
2. Die App „Dokumente“ schickt die Eingabe an `POST /api/login`
   (`api/login.js`). Dort vergleicht `bcrypt.compare` die Eingabe mit dem Hash.
3. Stimmt sie, setzt der Server ein **signiertes, httpOnly Cookie** `session`
   (24 h gültig, auf Vercel automatisch `Secure`). Signiert wird mit
   `SESSION_SECRET`, fälschen ist dadurch nicht möglich.
4. `GET /api/documents` (Liste) und `GET /api/documents/file?id=…` (PDF)
   prüfen dieses Cookie bei **jedem** Aufruf (`api/_lib/require-auth.js`).
5. Gegen Durchprobieren: maximal 8 Fehlversuche pro 15 Minuten und IP
   (`api/_lib/rateLimit.js`, pro Function-Instanz, „best effort“).

### Passwort ändern

```bash
npm run hash-password -- neuesPasswort
```

Die ausgegebene Zeile `SITE_PASSWORD_HASH=…` in `.env` **und** in Vercel
(Project Settings → Environment Variables) ersetzen, dann neu deployen.
Bereits angemeldete Besucher bleiben bis zum Ablauf des Cookies (24 h) drin.
Wer alle sofort abmelden will, ändert zusätzlich `SESSION_SECRET`.

## Wie die Dokumente auf Vercel kommen

Das Repo ist öffentlich, deshalb liegen die PDFs **nicht** im Git, sondern in
einem **privaten Vercel-Blob-Store**. Ohne gültige Session gibt es keinen Link
und keinen Zugriff.

1. PDF nach `protected-files/` legen (lokal, gitignored).
2. In [`api/_lib/documents.js`](api/_lib/documents.js) eintragen:
   `{ id: 'lebenslauf', file: 'lebenslauf.pdf' }` in `DOCUMENTS` und Titel
   sowie Beschreibung je Sprache in `DOCUMENTS_I18N`.
3. Hochladen:
   ```bash
   npm run upload-protected-files
   ```
   Das lädt **alle** Einträge aus `DOCUMENTS` nach `protected-files/<datei>`
   im Blob-Store (überschreibt vorhandene). Erneut ausführen, wenn sich eine
   Datei ändert, zum Beispiel ein neuer Lebenslauf.
4. Code-Änderung aus Schritt 2 committen und deployen.

Aktuell eingetragen: `lebenslauf.pdf`, `zeugnis.pdf` und **neu**
`Bewerbungsschreiben_Miguel.pdf`. Das Bewerbungsschreiben muss einmal mit
`npm run upload-protected-files` hochgeladen werden, sonst meldet die Seite
dafür „Datei liegt noch nicht auf dem Server“.

**„Alle herunterladen (.zip)“** baut das ZIP im Browser (Bibliothek
`fflate`): Die Seite holt jedes PDF einzeln über die geschützte Function und
packt sie zusammen. So gibt es keine zusätzliche Function, und das
4,5-MB-Antwortlimit von Vercel-Functions spielt keine Rolle.

> Die Dokument-ID wird als Query-Parameter (`?id=…`) übergeben statt als
> dynamisches Pfad-Segment, weil reine Vercel-Functions (ohne Next.js) das
> Muster „dynamischer Ordner + fester Dateiname“ nicht zuverlässig routen.

## Deployment auf Vercel

1. Projekt bei [vercel.com](https://vercel.com) importieren (GitHub-Repo
   verbinden) oder `npx vercel` in diesem Ordner.
2. **Environment Variables** (Project Settings, für *Production* und
   *Preview*): `SESSION_SECRET`, `SITE_PASSWORD_HASH`.
3. **Blob-Store:** Projekt → Storage → Create Database → Blob → Access
   **Private** → mit dem Projekt verbinden. Auf Vercel braucht die Function
   keinen Token, sie authentifiziert sich automatisch. Lokal den
   `BLOB_READ_WRITE_TOKEN` in `.env` eintragen und
   `npm run upload-protected-files` ausführen.
4. Build-Einstellungen stehen in [`vercel.json`](vercel.json): Build
   `npm run build`, Ausgabe `dist`. Alle Pfade ausser `/api/*` werden an
   `index.html` geleitet (für Direktlinks). Medien unter `/media/` werden
   eine Woche gecacht, Build-Dateien unter `/assets/` dauerhaft.
5. Deployen: Push auf den verbundenen Branch oder `npx vercel --prod`.

## Inhalte pflegen

- **Texte:** `src/i18n/` (immer DE, EN und FR anpassen).
- **Projekte:** `src/data/projects.js` (Bild, Links, Status `live`/`wip`)
  und Texte in `src/i18n/projekte.js` (gleiche `id`).
- **Eigene Songs:** MP3 nach `public/media/songs/`, dann in
  `src/data/media.js` unter `songs` eintragen. Solange die Liste leer ist,
  zeigt der Player „kommt bald“.
- **Blender-Renders:** Bild nach `public/media/blender/`, in
  `blenderRenders` eintragen.
- **Filme:** Web-Version (nie den 4K-Master) nach `public/media/`, in `films`
  eintragen. Beispiel für eine Web-Version:
  `ffmpeg -i film.mp4 -vf scale=1280:-2 -c:v libx264 -crf 29 -preset slow -c:a aac -b:a 96k -movflags +faststart film-web.mp4`
- **Fernseher im Zimmer:** `tvFilm` in `src/data/media.js` (braucht eine
  Tonspur, sonst hat „Ton an“ keine Wirkung).

## Altes eigenständiges Backend (`server/`)

`server/` ist die frühere Express-Version des Backends und wird nicht mehr
verwendet. Sie kann gelöscht werden.
