import 'dotenv/config'
import express from 'express'
import cookieParser from 'cookie-parser'
import bcrypt from 'bcryptjs'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const PORT = process.env.PORT || 3001
const SESSION_SECRET = process.env.SESSION_SECRET
const PASSWORD_HASH = process.env.SITE_PASSWORD_HASH
const isProd = process.env.NODE_ENV === 'production'

if (!SESSION_SECRET || !PASSWORD_HASH) {
  console.error(
    'Fehlende Umgebungsvariablen SESSION_SECRET und/oder SITE_PASSWORD_HASH. ' +
      'Siehe server/.env.example: .env im server/-Ordner anlegen und Werte setzen ' +
      '(Hash mit "npm run hash-password -- <passwort>" erzeugen).'
  )
  process.exit(1)
}

const SUPPORTED_LANGS = ['de', 'en', 'fr']

const MESSAGES = {
  de: {
    notAuthenticated: 'Nicht authentifiziert.',
    tooManyAttempts: 'Zu viele Versuche. Bitte später erneut versuchen.',
    passwordMissing: 'Passwort fehlt.',
    wrongPassword: "Falsches Passwort. Versuch's nochmal.",
    documentNotFound: 'Dokument nicht gefunden.',
    fileMissing: 'Datei liegt noch nicht auf dem Server.',
  },
  en: {
    notAuthenticated: 'Not authenticated.',
    tooManyAttempts: 'Too many attempts. Please try again later.',
    passwordMissing: 'Password is missing.',
    wrongPassword: 'Wrong password. Try again.',
    documentNotFound: 'Document not found.',
    fileMissing: 'File is not yet available on the server.',
  },
  fr: {
    notAuthenticated: 'Non authentifié.',
    tooManyAttempts: 'Trop de tentatives. Veuillez réessayer plus tard.',
    passwordMissing: 'Mot de passe manquant.',
    wrongPassword: 'Mot de passe incorrect. Réessayez.',
    documentNotFound: 'Document introuvable.',
    fileMissing: "Le fichier n'est pas encore disponible sur le serveur.",
  },
}

function getLang(req) {
  const lang = req.body?.lang || req.query?.lang
  return SUPPORTED_LANGS.includes(lang) ? lang : 'de'
}

// Dokumente, die nur nach erfolgreichem Login zugänglich sind.
// Datei muss unter server/protected-files/<file> liegen.
const DOCUMENTS = [
  { id: 'lebenslauf', file: 'lebenslauf.pdf' },
  { id: 'zeugnis', file: 'zeugnis.pdf' },
]

const DOCUMENTS_I18N = {
  lebenslauf: {
    de: { title: 'Lebenslauf', description: 'Aktueller Lebenslauf als PDF' },
    en: { title: 'Resume', description: 'Current resume as PDF' },
    fr: { title: 'CV', description: 'CV actuel au format PDF' },
  },
  zeugnis: {
    de: { title: 'Zeugnis', description: 'Zeugnisse 1. und 2. Ausbildungsjahr' },
    en: { title: 'Transcripts', description: '1st and 2nd year transcripts' },
    fr: { title: 'Bulletin', description: 'Bulletins de 1re et 2e année de formation' },
  },
}

const app = express()
app.set('trust proxy', 1)
app.use(express.json())
app.use(cookieParser(SESSION_SECRET))

// --- einfacher In-Memory Rate-Limiter gegen Passwort-Raten ---
const MAX_ATTEMPTS = 8
const WINDOW_MS = 15 * 60 * 1000
const attempts = new Map()

function isRateLimited(ip) {
  const entry = attempts.get(ip)
  if (!entry) return false
  if (Date.now() > entry.resetAt) {
    attempts.delete(ip)
    return false
  }
  return entry.count >= MAX_ATTEMPTS
}
function recordFailedAttempt(ip) {
  const entry = attempts.get(ip)
  if (!entry || Date.now() > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: Date.now() + WINDOW_MS })
  } else {
    entry.count += 1
  }
}
function clearAttempts(ip) {
  attempts.delete(ip)
}

function requireAuth(req, res, next) {
  if (req.signedCookies.session === 'authorized') return next()
  return res.status(401).json({ error: MESSAGES[getLang(req)].notAuthenticated })
}

const cookieOptions = {
  signed: true,
  httpOnly: true,
  sameSite: 'lax',
  secure: isProd,
  maxAge: 24 * 60 * 60 * 1000, // 24h
}

app.post('/api/login', async (req, res) => {
  const lang = getLang(req)
  const m = MESSAGES[lang]
  const ip = req.ip

  if (isRateLimited(ip)) {
    return res.status(429).json({ error: m.tooManyAttempts })
  }

  const { password } = req.body || {}
  if (typeof password !== 'string' || password.length === 0) {
    return res.status(400).json({ error: m.passwordMissing })
  }

  const valid = await bcrypt.compare(password, PASSWORD_HASH)
  if (!valid) {
    recordFailedAttempt(ip)
    return res.status(401).json({ error: m.wrongPassword })
  }

  clearAttempts(ip)
  res.cookie('session', 'authorized', cookieOptions)
  res.json({ ok: true })
})

app.post('/api/logout', (req, res) => {
  res.clearCookie('session', { httpOnly: true, sameSite: 'lax', secure: isProd })
  res.json({ ok: true })
})

app.get('/api/session', (req, res) => {
  res.json({ authorized: req.signedCookies.session === 'authorized' })
})

app.get('/api/documents', requireAuth, (req, res) => {
  const lang = getLang(req)
  res.json(
    DOCUMENTS.map(({ id }) => ({
      id,
      ...(DOCUMENTS_I18N[id]?.[lang] ?? DOCUMENTS_I18N[id]?.de),
    }))
  )
})

app.get('/api/documents/:id/file', requireAuth, (req, res) => {
  const lang = getLang(req)
  const doc = DOCUMENTS.find((d) => d.id === req.params.id)
  if (!doc) return res.status(404).json({ error: MESSAGES[lang].documentNotFound })

  const filePath = path.join(__dirname, 'protected-files', doc.file)
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: MESSAGES[lang].fileMissing })
  }
  res.sendFile(filePath)
})

// Production: Backend liefert zusätzlich den gebauten Frontend-Build aus
// (gleicher Origin -> kein CORS nötig).
if (isProd) {
  const distPath = path.join(__dirname, '..', 'dist')
  app.use(express.static(distPath))
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`API-Server läuft auf http://localhost:${PORT}`)
})
