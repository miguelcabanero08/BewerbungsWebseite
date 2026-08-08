import { lazy, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiSparkles } from 'react-icons/hi2'
import Marquee from '../components/Marquee.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { home } from '../i18n/home.js'

// three.js ist schwer (~600 KB) und rein dekorativ, deshalb als eigener Chunk
// nachgeladen statt im Hauptbundle. Der Rest der Hero-Section erscheint sofort,
// der Strahl faded ein, sobald der Chunk geladen ist.
const LightPillar = lazy(() => import('../components/LightPillar.jsx'))

const NAME = 'Miguel Cabañero'

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

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
}
const letter = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
}

export default function Home() {
  const navigate = useNavigate()
  const { language } = useLanguage()
  const { theme } = useTheme()
  const t = home[language]

  return (
    <div className="relative z-10">
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
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

        <motion.span
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass mb-6 flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-fg/70"
        >
          <HiSparkles className="text-cyan" /> {t.badge}
        </motion.span>

        <motion.h1
          variants={container}
          initial="hidden"
          animate="show"
          className="font-display flex flex-wrap justify-center gap-x-3 bg-gradient-to-r from-violet to-cyan bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-7xl"
        >
          {NAME.split(' ').map((word, wi) => (
            <span key={wi} className="inline-flex whitespace-nowrap">
              {word.split('').map((ch, i) => (
                <motion.span key={i} variants={letter}>
                  {ch}
                </motion.span>
              ))}
            </span>
          ))}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="mt-6 max-w-xl text-lg text-fg/60"
        >
          {t.tagline}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="mt-10"
        >
          <button
            onClick={() => navigate('/ueber-mich')}
            className="gradient-border glass relative rounded-full px-8 py-4 font-medium text-fg transition hover:scale-105 active:scale-95"
          >
            {t.cta}
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="absolute inset-x-0 bottom-10"
        >
          <Marquee items={TECH_STACK} />
        </motion.div>
      </section>
    </div>
  )
}
