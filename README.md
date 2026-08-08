# Persönliche Bewerbungswebsite

React (Vite) Frontend + Vercel Serverless Functions (`api/`), die den
passwortgeschützten Dokumente-Bereich (`/dokumente`) echt server-seitig
absichern. Frontend und Backend werden als **ein** Vercel-Projekt deployt
(gleiche Origin, kein CORS nötig).

## Erste Einrichtung

```bash
npm install
```

Danach `.env.example` nach `.env` kopieren (Projekt-Root) und ausfüllen:

```bash
cp .env.example .env
```

- `SESSION_SECRET`: zufälligen String erzeugen, z.B.
  `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- `SITE_PASSWORD_HASH`: Hash des gewünschten Passworts erzeugen mit
  `npm run hash-password -- <dein-passwort>` (Ausgabe in `.env` einfügen)

`.env` wird nur für die lokale Entwicklung gelesen (`vercel dev`). Fürs
Deployment müssen dieselben zwei Variablen zusätzlich in Vercel eingetragen
werden — siehe [Deployment](#deployment).

## Entwicklung starten

Frontend **und** API zusammen, mit derselben Routing-Logik wie in Production
(empfohlen):

```bash
npm run dev:all
```

Das führt `vercel dev` aus (Vercel CLI, per `npm install` bereits als
Dev-Dependency vorhanden) und öffnet die Seite auf `http://localhost:3000`.
`/api/*`-Aufrufe werden dabei lokal von genau den Functions unter `api/`
beantwortet, die auch deployt werden.

Nur das Frontend (ohne funktionierendes `/api/*`): `npm run dev`

Erststart von `vercel dev` fragt nach Login/Projekt-Verknüpfung (einmalig,
Browser-Login bei vercel.com) — danach merkt sich die Vercel-CLI die
Verknüpfung in `.vercel/` (bereits in `.gitignore`).

**Troubleshooting:** Falls `vercel dev` (v.a. im nicht verknüpften
`--local`-Modus) beim ersten Build mit einem Fehler zu `yarn` abbricht, obwohl
kein `yarn.lock` existiert: das ist eine bekannte Eigenart der Vercel-CLI in
diesem Modus, kein Problem des Projekts selbst. Am zuverlässigsten ist dann,
`vercel dev` **ohne** `--local` laufen zu lassen (also einmal mit dem
eigenen Vercel-Account verknüpfen) — Build/Install-Commands aus
`vercel.json` (`npm run build` / `npm install`) werden dann korrekt
verwendet. Die eigentliche `api/`-Logik selbst wurde unabhängig davon bereits
gegen einen echten Browser (Login, Cookie, Dokumente, PDF-Download) getestet.

## Passwort ändern

```bash
npm run hash-password -- neuesPasswort123
```

Den ausgegebenen `SITE_PASSWORD_HASH`-Wert in `.env` **und** in den
Vercel-Projekteinstellungen (Environment Variables) ersetzen. Bereits
angemeldete Sessions bleiben bis zum Cookie-Ablauf (24h) gültig.

## Geschützte Dokumente hinzufügen

1. Datei (z.B. PDF) nach `protected-files/` (Projekt-Root) legen.
2. In [`api/_lib/documents.js`](api/_lib/documents.js) im `DOCUMENTS`-Array
   einen Eintrag ergänzen (`{ id: '...', file: 'dateiname.pdf' }`) und die
   Titel/Beschreibung je Sprache in `DOCUMENTS_I18N` ergänzen.

Dateien in `protected-files/` sind **nie** öffentlich erreichbar — sie liegen
außerhalb von `public/`/`dist/` (Vite fasst sie nicht an, Vercels statisches
Hosting liefert sie nicht aus) und werden ausschließlich über
`/api/documents/file?id=...` ausgeliefert, was eine gültige, server-geprüfte
Session voraussetzt. Damit die Datei zur Laufzeit in der Function verfügbar
ist, bündelt `vercel.json` (`functions` → `includeFiles`) den kompletten
Ordner explizit mit in die `api/documents/file.js`-Function.

> **Hinweis:** Die Dokument-ID wird bewusst als Query-Parameter (`?id=...`)
> übergeben statt als dynamisches Pfad-Segment (`api/documents/[id]/file.js`).
> Plain Vercel Functions (ohne Next.js) unterstützen das Muster "dynamischer
> Ordner + statischer Dateiname danach" nicht zuverlässig — die Route wurde
> in der Praxis von der SPA-Fallback-Rewrite abgefangen statt die Function
> aufzurufen.

## Deployment (Vercel)

1. Projekt bei [vercel.com](https://vercel.com) importieren (GitHub-Repo
   verbinden) **oder** per CLI aus diesem Ordner: `npx vercel`.
2. In den Projekteinstellungen unter **Environment Variables** setzen (für
   *Production* und *Preview*):
   - `SESSION_SECRET`
   - `SITE_PASSWORD_HASH`
3. Build-Command (`npm run build`) und Output-Directory (`dist`) sind bereits
   in [`vercel.json`](vercel.json) hinterlegt — Vercel erkennt das
   Vite-Projekt zusätzlich automatisch.
4. Deployen (Git-Push auf den verbundenen Branch, oder `npx vercel --prod`).

Vercel baut das Frontend (`vite build` → `dist/`) und deployt gleichzeitig
jede Datei unter `api/` als eigene Serverless Function. `vercel.json` sorgt
zusätzlich dafür, dass alle Nicht-API-Pfade clientseitig an `index.html`
durchgereicht werden (nötig für React-Router-Routen wie `/dokumente` bei
Direktaufruf/Reload).

### Hinweis zum Rate-Limiting

Der einfache In-Memory-Rate-Limiter gegen Passwort-Raten
(`api/_lib/rateLimit.js`) ist auf Serverless-Infrastruktur nur "best effort":
der Zähler lebt pro warmer Function-Instanz und wird bei neuen/zurückgesetzten
Instanzen wieder leer. In Kombination mit `bcrypt.compare` (bewusst langsam)
für ein privates Portfolio-Passwort ist das ein akzeptabler Kompromiss. Für
eine harte globale Grenze bräuchte es einen externen Store (z.B. Vercel KV
oder Upstash Redis).

## Altes eigenständiges Backend (`server/`)

Der Ordner `server/` enthält die ursprüngliche, eigenständige
Express-Version des Backends (für Hosting auf einem klassischen Node-Server
wie VPS/Render/Railway). Sie ist durch die `api/`-Functions oben vollständig
abgelöst und wird von `npm run build`/`npm run dev:all`/Vercel nicht mehr
verwendet. Der Ordner ist nur noch als Referenz vorhanden und kann gelöscht
werden, sobald das Vercel-Deployment bestätigt läuft.
