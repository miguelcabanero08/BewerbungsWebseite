import { lazy, Suspense } from 'react'
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

  return (
    <div className="relative z-10">
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">
        <div className="pointer-events-none absolute inset-0 -z-10">
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
        </div>

        {/* Der Name darf hier bewusst aus der sonst schmaleren Content-Spalte
            ausbrechen und (fast) die volle Section-Breite (nur px-6) einnehmen —
            über clamp()+vw skaliert er organisch mit dem Viewport statt an
            Breakpoint-Stufen zu hängen. Typewriter/Beschreibung/CTA bleiben
            darunter in einer schmaleren, lesbaren Spalte. */}
        <div className="relative flex w-full flex-col items-center">
          <TiltCard glare={false} tiltStrength={3} className="block">
            <h1 className="font-display flex flex-col">
              <span className="font-mono flex flex-wrap bg-gradient-to-r from-pink to-cyan bg-clip-text text-[clamp(1.75rem,7.5vw,7rem)] font-extrabold leading-[1.15] text-transparent">
                {FIRST_NAME.split('').map((ch, i) => (
                  <span key={i} className="name-letter" style={{ animationDelay: `${i * STAGGER}s` }}>
                    {ch}
                  </span>
                ))}
              </span>
              <span className="ml-4 flex flex-wrap bg-gradient-to-r from-violet via-cyan to-pink bg-clip-text text-[clamp(2.2rem,22vw_-_1.5rem,20rem)] font-bold leading-[0.82] tracking-tight text-transparent sm:ml-10">
                {LAST_NAME.split('').map((ch, i) => (
                  <span
                    key={i}
                    className="name-letter-big"
                    style={{ animationDelay: `${(FIRST_NAME.length + i) * STAGGER}s` }}
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
