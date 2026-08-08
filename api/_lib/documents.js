// Dokumente, die nur nach erfolgreichem Login zugänglich sind.
// Datei muss unter protected-files/<file> liegen (Projekt-Root, siehe
// vercel.json -> functions."api/documents/[id]/file.js".includeFiles).
export const DOCUMENTS = [
  { id: 'lebenslauf', file: 'lebenslauf.pdf' },
  { id: 'zeugnis', file: 'zeugnis.pdf' },
]

export const DOCUMENTS_I18N = {
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
