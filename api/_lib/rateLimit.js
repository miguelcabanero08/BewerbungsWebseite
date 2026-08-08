// Einfacher In-Memory Rate-Limiter gegen Passwort-Raten — 1:1-Logik aus dem
// alten server/index.js übernommen.
//
// Wichtige Einschränkung auf Vercel: Dieser Map-basierte Zustand lebt nur
// innerhalb EINER warmen Function-Instanz. Vercel kann mehrere Instanzen
// parallel starten (kein gemeinsamer Speicher) und recycelt inaktive
// Instanzen nach einer Weile (Map wird dann geleert). Der Limiter ist also
// "best effort" statt einer harten globalen Grenze — in Kombination mit dem
// ohnehin langsamen bcrypt.compare() (~100ms+) für ein privates
// Portfolio-Passwort ausreichend. Für eine belastbare globale Grenze bräuchte
// es einen externen Store (z.B. Vercel KV / Upstash Redis).
const MAX_ATTEMPTS = 8
const WINDOW_MS = 15 * 60 * 1000
const attempts = new Map()

export function isRateLimited(ip) {
  const entry = attempts.get(ip)
  if (!entry) return false
  if (Date.now() > entry.resetAt) {
    attempts.delete(ip)
    return false
  }
  return entry.count >= MAX_ATTEMPTS
}

export function recordFailedAttempt(ip) {
  const entry = attempts.get(ip)
  if (!entry || Date.now() > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: Date.now() + WINDOW_MS })
  } else {
    entry.count += 1
  }
}

export function clearAttempts(ip) {
  attempts.delete(ip)
}

// req.ip gibt es nur bei Express (dort abhängig von app.set('trust proxy', 1)).
// Auf Vercel selbst lesen wir den von Vercels Edge-Netzwerk gesetzten
// x-forwarded-for-Header.
export function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim()
  }
  return req.socket?.remoteAddress || 'unknown'
}
