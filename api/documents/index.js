// GET /api/documents — entspricht dem alten
// app.get('/api/documents', requireAuth, ...).
import { getLang } from '../_lib/i18n.js'
import { requireAuth } from '../_lib/require-auth.js'
import { DOCUMENTS, DOCUMENTS_I18N } from '../_lib/documents.js'

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }
  if (!requireAuth(req, res)) return

  const lang = getLang(req)
  res.json(
    DOCUMENTS.map(({ id }) => ({
      id,
      ...(DOCUMENTS_I18N[id]?.[lang] ?? DOCUMENTS_I18N[id]?.de),
    }))
  )
}
