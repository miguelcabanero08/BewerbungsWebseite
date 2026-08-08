// POST /api/login — entspricht dem alten app.post('/api/login', ...) in
// server/index.js.
import bcrypt from 'bcryptjs'
import { requireEnv } from './_lib/env.js'
import { getLang, MESSAGES } from './_lib/i18n.js'
import { isRateLimited, recordFailedAttempt, clearAttempts, getClientIp } from './_lib/rateLimit.js'
import { setSessionCookie } from './_lib/cookies.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const lang = getLang(req)
  const m = MESSAGES[lang]
  const ip = getClientIp(req)

  if (isRateLimited(ip)) {
    return res.status(429).json({ error: m.tooManyAttempts })
  }

  const { password } = req.body || {}
  if (typeof password !== 'string' || password.length === 0) {
    return res.status(400).json({ error: m.passwordMissing })
  }

  const valid = await bcrypt.compare(password, requireEnv('SITE_PASSWORD_HASH'))
  if (!valid) {
    recordFailedAttempt(ip)
    return res.status(401).json({ error: m.wrongPassword })
  }

  clearAttempts(ip)
  setSessionCookie(res)
  res.json({ ok: true })
}
