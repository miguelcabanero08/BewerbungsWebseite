import { lazy, Suspense, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiArrowRight } from 'react-icons/hi2'
import Marquee from '../components/Marquee.jsx'
import TiltCard from '../components/TiltCard.jsx'
import TypewriterText from '../components/TypewriterText.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { home } from '../i18n/home.js'

// three.js ist schwer (~600 KB) und rein dekorativ, deshalb als eigener Chunk
// nachgeladen statt im Hauptbundle. Der Rest der Hero-Section erscheint sofort,
// der Strahl faded ein, sobald der Chunk geladen ist.
const LightPillar = lazy(() => import('../components/LightPillar.jsx'))

const FIRST_NAME = 'Miguel'
const LAST_NAME = 'Cabañero'

// Farbverlauf-Text per Inline-Style statt Tailwind-Utilities (bg-clip-text/text-transparent):
// die Build-Pipeline hier (Tailwind v4 + Lightning CSS, keine Browserslist konfiguriert)
// filtert das nötige -webkit-background-clip auch aus handgeschriebenem CSS wieder raus,
// ohne das bleibt Farbverlauf-Text auf Safari/iOS komplett unsichtbar. Inline-Styles laufen
// nicht durch diese Pipeline und sind davon nicht betroffen.
//
// Zusätzliche, subtilere Safari/WebKit-Falle (Ursache des "Name fehlt nur auf dem iPhone,
// in Chrome UND Safari"-Bugs): -webkit-background-clip:text muss dort *direkt* auf dem
// Element mit dem Textinhalt liegen — Chrome/Firefox akzeptieren es dagegen anstandslos auch
// auf einem Elternelement, dessen Kinder den eigentlichen Text tragen. Zusätzlich bricht es in
// Safari ab, sobald das geclippte Element selbst ein Flex-Container/-Item ist. Beides war
// hier der Fall: der Gradient lag auf dem äußeren, flex-basierten Wrapper, die einzelnen
// Buchstaben (fürs Stagger-Timing) in Kind-Spans darunter — auf Desktop-Chrome/Firefox (und
// damit auch deren Responsive-/Device-Ansicht, die dieselbe Engine nutzt) unsichtbar kein
// Problem, auf iPhone (Safari UND Chrome, beide WebKit) blieb der Name komplett unsichtbar.
// Fix: der Gradient liegt jetzt direkt auf jedem Buchstaben-Span (kein Flex mehr nötig), mit
// einer über Index/Gesamtlänge berechneten background-size/-position, sodass es weiterhin wie
// ein durchgehender Verlauf übers ganze Wort wirkt statt pro Buchstabe neu zu starten.
function letterGradientStyle(gradient, index, count) {
  return {
    backgroundImage: gradient,
    backgroundSize: `${count * 100}% 100%`,
    backgroundPosition: count > 1 ? `${(index / (count - 1)) * 100}% 0` : '0 0',
    backgroundRepeat: 'no-repeat',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
    WebkitTextFillColor: 'transparent',
  }
}
const MIGUEL_GRADIENT = 'linear-gradient(to right, var(--color-pink), var(--color-cyan))'
const CABANERO_GRADIENT =
  'linear-gradient(to right, var(--color-violet), var(--color-cyan), var(--color-pink))'

const TECH_STACK = [
  'Java',
  'C#',
  'JavaScript',
  'TypeScript',
  'React',
  'Next.js',
  'Tailwind CSS',
  'Python',
  'SQL',
  'MongoDB',
  'Docker',
  'Kubernetes',
  'Git',
  'Unity',
  'Azure',
]

// Namens-Buchstaben animieren per reinem CSS (.name-letter/-big in index.css), nicht
// über framer-motion — lief bei einem Nutzer beim Laden nicht sichtbar an (vermutlich
// Vererbung/Mount-Timing), CSS-Keyframes sind unabhängig davon zuverlässig sichtbar.
// STAGGER steuert nur die pro-Buchstabe berechnete animation-delay.
const STAGGER = 0.045

export default function Home() {
  const navigate = useNavigate()
  const { language } = useLanguage()
  const { theme } = useTheme()
  const t = home[language]

  // Der Lichtstrahl ist rein dekorativ, sein Chunk (three.js) aber mit Abstand das
  // schwerste Stück JS der Startseite (~130 KB gzip) — er lädt deshalb erst, sobald der
  // Browser Leerlaufzeit hat, statt sofort mit Font-/Hauptbundle um Bandbreite und
  // Hauptthread zu konkurrieren (der Fade-in beim Erscheinen ist ohnehin schon so
  // gestaltet, dass er verzögert eintrudeln darf). Bei "reduzierte Bewegung" wird der
  // Chunk gar nicht erst angefordert — analog zu TypewriterText.jsx/DepthCarousel.jsx,
  // die dieselbe Präferenz respektieren.
  const [showPillar, setShowPillar] = useState(false)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (window.requestIdleCallback) {
      const id = window.requestIdleCallback(() => setShowPillar(true), { timeout: 2000 })
      return () => window.cancelIdleCallback(id)
    }
    const id = window.setTimeout(() => setShowPillar(true), 300)
    return () => window.clearTimeout(id)
  }, [])

  return (
    <div className="relative z-10">
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">
        <div className="pointer-events-none absolute inset-0 -z-10">
          {showPillar && (
            <Suspense fallback={null}>
              <LightPillar
                topColor={theme === 'light' ? '#7dd3fc' : '#8b5cf6'}
                bottomColor={theme === 'light' ? '#0ea5e9' : '#ec4899'}
                intensity={theme === 'light' ? 0.5 : 0.6}
                rotationSpeed={0.1}
                glowAmount={0.005}
                pillarWidth={2.1}
                pillarHeight={0.2}
                noiseIntensity={0.4}
                pillarRotation={90}
                interactive={false}
                mixBlendMode={theme === 'light' ? 'normal' : 'screen'}
              />
            </Suspense>
          )}
        </div>

        {/* Der Name darf hier bewusst aus der sonst schmaleren Content-Spalte
            ausbrechen und (fast) die volle Section-Breite (nur px-6) einnehmen —
            über clamp()+vw skaliert er organisch mit dem Viewport statt an
            Breakpoint-Stufen zu hängen. Typewriter/Beschreibung/CTA bleiben
            darunter in einer schmaleren, lesbaren Spalte. */}
        <div className="relative flex w-full flex-col items-center">
          <TiltCard glare={false} tiltStrength={3} className="block">
            <h1 className="font-display flex flex-col">
              <span className="font-mono text-[clamp(1.75rem,7.5vw,7rem)] font-extrabold leading-[1.15]">
                {FIRST_NAME.split('').map((ch, i) => (
                  <span
                    key={i}
                    className="name-letter"
                    style={{
                      animationDelay: `${i * STAGGER}s`,
                      ...letterGradientStyle(MIGUEL_GRADIENT, i, FIRST_NAME.length),
                    }}
                  >
                    {ch}
                  </span>
                ))}
              </span>
              <span className="ml-4 text-[clamp(2.2rem,22vw_-_1.5rem,20rem)] font-bold leading-[0.82] tracking-tight sm:ml-10">
                {LAST_NAME.split('').map((ch, i) => (
                  <span
                    key={i}
                    className="name-letter-big"
                    style={{
                      animationDelay: `${(FIRST_NAME.length + i) * STAGGER}s`,
                      ...letterGradientStyle(CABANERO_GRADIENT, i, LAST_NAME.length),
                    }}
                  >
                    {ch}
                  </span>
                ))}
              </span>
            </h1>
          </TiltCard>

          <div className="max-w-xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mt-8"
            >
              <TypewriterText
                words={t.roles}
                className="font-mono text-base text-cyan sm:text-lg"
              />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="mt-4 text-sm text-fg/60 sm:text-base"
            >
              {t.tagline}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="mt-8 flex justify-center"
            >
              <button
                onClick={() => navigate('/ueber-mich')}
                className="gradient-border glass group relative flex items-center gap-2 rounded-full px-8 py-4 font-medium text-fg transition hover:scale-105 active:scale-95"
              >
                {t.cta}
                <HiArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.8 }}
          className="absolute inset-x-0 bottom-10"
        >
          <Marquee items={TECH_STACK} />
        </motion.div>
      </section>
    </div>
  )
}
