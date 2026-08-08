// Ersatz für die alte Express-Middleware `requireAuth`. Ohne Middleware-Chain
// ruft jeder Route-Handler das hier selbst als erstes auf:
//
//   if (!requireAuth(req, res)) return
//
import { getLang, MESSAGES } from './i18n.js'
import { isAuthorized } from './cookies.js'

export function requireAuth(req, res) {
  if (isAuthorized(req)) return true
  res.status(401).json({ error: MESSAGES[getLang(req)].notAuthenticated })
  return false
}
