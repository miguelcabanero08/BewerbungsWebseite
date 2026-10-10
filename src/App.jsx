import { LanguageProvider } from './context/LanguageContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { MusicProvider } from './context/MusicContext.jsx'
import Experience from './Experience.jsx'

// Eine einzige Ansicht für alle Adressen: Experience liest die URL selbst
// (/ = Flur, /projekte usw. = direkt am PC mit offener App).
export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MusicProvider>
          <Experience />
        </MusicProvider>
      </AuthProvider>
    </LanguageProvider>
  )
}
