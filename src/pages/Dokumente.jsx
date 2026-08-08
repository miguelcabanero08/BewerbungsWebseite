import { motion } from 'framer-motion'
import DocumentsSection from '../components/DocumentsSection.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import { dokumente } from '../i18n/dokumente.js'

export default function Dokumente() {
  const { language } = useLanguage()
  const t = dokumente[language]

  return (
    <div>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-4xl font-bold text-fg sm:text-5xl"
      >
        {t.title}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-4 max-w-xl text-fg/60"
      >
        {t.intro}
      </motion.p>

      <div className="mt-16">
        <DocumentsSection />
      </div>
    </div>
  )
}
