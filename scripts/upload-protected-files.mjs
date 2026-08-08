// Lädt die Dateien aus protected-files/ (lokal, gitignored) in den privaten
// Vercel-Blob-Store hoch. Einmalig nötig, danach nur erneut ausführen, wenn
// sich eine geschützte Datei ändert (z.B. neuer Lebenslauf).
//
// Voraussetzung: BLOB_READ_WRITE_TOKEN in .env (Projekt-Root) gesetzt.
// Token holen: Vercel-Dashboard -> Projekt -> Storage -> (Blob-Store) ->
// ".env.local"-Tab.
//
// Aufruf: npm run upload-protected-files
import 'dotenv/config'
import { put } from '@vercel/blob'
import fs from 'node:fs'
import path from 'node:path'
import { DOCUMENTS } from '../api/_lib/documents.js'

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error(
    'BLOB_READ_WRITE_TOKEN fehlt. In .env (Projekt-Root) setzen — siehe ' +
      '.env.example bzw. Vercel-Dashboard -> Storage -> Blob-Store -> ".env.local".'
  )
  process.exit(1)
}

for (const doc of DOCUMENTS) {
  const filePath = path.join(process.cwd(), 'protected-files', doc.file)
  if (!fs.existsSync(filePath)) {
    console.warn(`Übersprungen (Datei fehlt lokal): ${filePath}`)
    continue
  }

  const buffer = fs.readFileSync(filePath)
  const pathname = `protected-files/${doc.file}`

  const blob = await put(pathname, buffer, {
    access: 'private',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/pdf',
  })

  console.log(`${doc.file} -> ${blob.pathname} (${(buffer.length / 1024).toFixed(0)} KB)`)
}

console.log('\nFertig. Die Pfade sind deterministisch (protected-files/<datei>) — kein Code-Update nötig.')
