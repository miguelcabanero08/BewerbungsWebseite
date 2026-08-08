// GET /api/session — entspricht dem alten app.get('/api/session', ...).
import { isAuthorized } from './_lib/cookies.js'

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  res.json({ authorized: isAuthorized(req) })
}
