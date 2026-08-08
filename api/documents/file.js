// GET /api/documents/file?id=... — entspricht dem alten
// app.get('/api/documents/:id/file', requireAuth, ...).
//
// Bewusst ?id=... als Query-Parameter statt eines dynamischen Pfad-Segments
// (api/documents/[id]/file.js): Vercel unterstützt bei einfachen (Nicht-
// Next.js) Functions kein "dynamischer Ordner + statischer Dateiname"-Muster
// zuverlässig — das führte dazu, dass diese Route real deployed still an die
// SPA-Fallback-Rewrite durchgereicht wurde (200 mit index.html statt PDF).
// Mit ?id=... als normalem Query-String ist die Route ein stinknormaler
// statischer Dateipfad und damit eindeutig routbar.
//
// res.sendFile() gibt es hier nicht (kein Express) -> Datei selbst per Stream
// ausliefern. Die PDFs liegen nicht im Vite-Build (dist/public), sondern in
// protected-files/ im Projekt-Root und werden über vercel.json
// (functions."api/documents/file.js".includeFiles) explizit mit in dieses
// Function-Bundle gepackt — sonst wären sie zur Laufzeit nicht da.
import fs from 'node:fs'
import path from 'node:path'
import { getLang, MESSAGES } from '../_lib/i18n.js'
import { requireAuth } from '../_lib/require-auth.js'
import { DOCUMENTS } from '../_lib/documents.js'

const MIME_TYPES = {
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
}

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }
  if (!requireAuth(req, res)) return

  const lang = getLang(req)
  const { id } = req.query
  const doc = DOCUMENTS.find((d) => d.id === id)
  if (!doc) return res.status(404).json({ error: MESSAGES[lang].documentNotFound })

  const filePath = path.join(process.cwd(), 'protected-files', doc.file)
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: MESSAGES[lang].fileMissing })
  }

  const ext = path.extname(doc.file).toLowerCase()
  res.setHeader('Content-Type', MIME_TYPES[ext] || 'application/octet-stream')
  fs.createReadStream(filePath).pipe(res)
}
