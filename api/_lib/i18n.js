// 1:1 aus server/index.js übernommen.
export const SUPPORTED_LANGS = ['de', 'en', 'fr']

export const MESSAGES = {
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

// req.body ist bei Vercel Node-Functions nur bei JSON-Content-Type automatisch
// geparst (analog zu express.json()) — bei GET-Requests i.d.R. undefined,
// daher weiterhin defensiv mit ?. absichern.
export function getLang(req) {
  const lang = req.body?.lang || req.query?.lang
  return SUPPORTED_LANGS.includes(lang) ? lang : 'de'
}
