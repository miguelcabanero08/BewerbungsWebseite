// Dokumente, die nur nach erfolgreichem Login zugänglich sind.
// Die Dateien liegen lokal in protected-files/ (nicht im Git) und werden mit
// `npm run upload-protected-files` in den privaten Vercel-Blob-Store geladen.
// Neue Datei: hier eintragen, Texte unten ergänzen, dann `npm run upload-protected-files`.
export const DOCUMENTS = [
  { id: 'lebenslauf', file: 'lebenslauf.pdf' },
  { id: 'zeugnis', file: 'zeugnis.pdf' },
  { id: 'bewerbungsschreiben', file: 'Bewerbungsschreiben_Miguel.pdf' },
]

export const DOCUMENTS_I18N = {
  bewerbungsschreiben: {
    de: { title: 'Bewerbungsschreiben', description: 'Allgemeines Bewerbungsschreiben als PDF' },
    en: { title: 'Cover letter', description: 'General cover letter as PDF' },
    fr: { title: 'Lettre de motivation', description: 'Lettre de motivation générale au format PDF' },
  },
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
