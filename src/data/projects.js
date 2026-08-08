// Sprachunabhängige Projekt-Daten (Bild, GitHub-Link). Die eigentlichen Texte
// (Titel, Beschreibung, Abstract) liegen, nach id gematcht, in src/i18n/projekte.js.
// Vorschaubilder liegen unter /public/images/. Fehlt eins (z.B. BookLoan aktuell),
// zeigt die Karte automatisch einen Farbverlauf-Platzhalter (siehe ImagePlaceholder.jsx).
// `image` kann auch ein Array sein (z.B. CarPin), dann werden mehrere Bilder
// nebeneinander als Streifen gerendert, statt eins zugeschnitten zu strecken.
// Reihenfolge hier bestimmt die Anzeigereihenfolge auf der Projekte-Seite.
export const projects = [
  {
    id: 9,
    image: '/images/SlapFighters_preview.png',
    github: 'https://github.com/miguelcabanero08/SlapFighters',
  },
  {
    id: 5,
    image: [
      '/images/Carpin1_preview.jfif',
      '/images/Carpin2_preview.jfif',
      '/images/Carpin3_preview.jfif',
    ],
    github: 'https://github.com/miguelcabanero08/CarPin',
  },
  {
    id: 8,
    image: '/images/FilmFinder_preview.png',
    github: 'https://github.com/miguelcabanero08/FilmFinder',
    live: 'https://filmfinder-planary.vercel.app/',
  },
  {
    id: 4,
    image: '/images/BookLoan_preview.png',
    github: 'https://github.com/miguelcabanero08/BookLoan',
  },
  {
    id: 2,
    image: '/images/ManUtd_preview.png',
    github: 'https://github.com/miguelcabanero08/ManUtdWebsite',
    live: 'https://manutd-cabanero.vercel.app/',
  },
  {
    id: 3,
    image: '/images/hotelsoft.png',
    github: 'https://github.com/miguelcabanero08/HotelsoftSolutions',
  },
  {
    id: 7,
    image: '/images/InfTicTacToe_preview.png',
    github: 'https://github.com/miguelcabanero08/InfTicTacToe',
  },
  {
    id: 6,
    image: '/images/UrlShortener_preview.png',
    github: 'https://github.com/miguelcabanero08/UrlShortener',
  },
  {
    id: 1,
    image: '/images/ErsteWebseite_preview.png',
    github: 'https://github.com/miguelcabanero08/FirstWebsite',
  },
]
