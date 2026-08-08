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
// Die PDFs liegen NICHT im Repo (protected-files/ ist in .gitignore, das
// Repo ist öffentlich) und werden deshalb nicht mit deployt. Stattdessen
// liegen sie in einem privaten Vercel-Blob-Store (siehe
// scripts/upload-protected-files.mjs zum Hochladen) und werden hier erst
// NACH erfolgreicher Auth-Prüfung per get() abgerufen und durchgestreamt —
// der Blob selbst ist ohne gültige Vercel-Auth nicht erreichbar.
import { Readable } from 'node:stream'
import { get } from '@vercel/blob'
import { getLang, MESSAGES } from '../_lib/i18n.js'
import { requireAuth } from '../_lib/require-auth.js'
import { DOCUMENTS } from '../_lib/documents.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }
  if (!requireAuth(req, res)) return

  const lang = getLang(req)
  const { id } = req.query
  const doc = DOCUMENTS.find((d) => d.id === id)
  if (!doc) return res.status(404).json({ error: MESSAGES[lang].documentNotFound })

  const pathname = `protected-files/${doc.file}`
  let result
  try {
    result = await get(pathname, { access: 'private' })
  } catch (err) {
    console.error(`Blob-Fehler für ${pathname}:`, err)
    return res.status(404).json({ error: MESSAGES[lang].fileMissing })
  }

  if (!result || result.statusCode !== 200 || !result.stream) {
    return res.status(404).json({ error: MESSAGES[lang].fileMissing })
  }

  res.setHeader('Content-Type', result.blob.contentType || 'application/octet-stream')
  res.setHeader('Cache-Control', 'private, no-store')
  Readable.fromWeb(result.stream).pipe(res)
}
