// Signierte Session-Cookies ohne Express/cookie-parser — dieselbe Technik,
// die cookie-parser intern nutzt (Wert-Präfix "s:" + HMAC via cookie-signature),
// nur direkt auf den rohen Node-Request/-Response der Vercel-Function angewendet.
//
// Bewusst NICHT auf das von Vercel bereitgestellte req.cookies verlassen —
// selbst parsen macht das Verhalten unabhängig davon, ob lokal via `vercel dev`
// oder deployed ausgeführt wird.
// cookie@2 API: parseCookie(header) -> {name: value}, stringifySetCookie({name,
// value, ...attrs}) -> "Set-Cookie"-Headerstring (ersetzt die aus cookie@0.x /
// Express-Zeiten bekannten parse()/serialize()-Funktionsnamen).
import { parseCookie, stringifySetCookie } from 'cookie'
import { sign, unsign } from 'cookie-signature'
import { requireEnv } from './env.js'

const COOKIE_NAME = 'session'
const COOKIE_VALUE = 'authorized'
const MAX_AGE_SECONDS = 24 * 60 * 60 // 24h

function baseCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    // Auf Vercel ist jedes Deployment (Production wie Preview) HTTPS, und
    // NODE_ENV steht dort zur Laufzeit auf "production" — lokal (vercel dev /
    // node) bleibt es "development", damit Secure-Cookies über http
    // funktionieren.
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  }
}

export function isAuthorized(req) {
  const cookies = parseCookie(req.headers.cookie || '')
  const raw = cookies[COOKIE_NAME]
  if (!raw || !raw.startsWith('s:')) return false
  return unsign(raw.slice(2), requireEnv('SESSION_SECRET')) === COOKIE_VALUE
}

export function setSessionCookie(res) {
  const signed = 's:' + sign(COOKIE_VALUE, requireEnv('SESSION_SECRET'))
  res.setHeader(
    'Set-Cookie',
    stringifySetCookie({ name: COOKIE_NAME, value: signed, ...baseCookieOptions(), maxAge: MAX_AGE_SECONDS })
  )
}

export function clearSessionCookie(res) {
  res.setHeader(
    'Set-Cookie',
    stringifySetCookie({ name: COOKIE_NAME, value: '', ...baseCookieOptions(), maxAge: 0 })
  )
}
