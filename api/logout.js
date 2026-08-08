// POST /api/logout — entspricht dem alten app.post('/api/logout', ...).
import { clearSessionCookie } from './_lib/cookies.js'

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  clearSessionCookie(res)
  res.json({ ok: true })
}
