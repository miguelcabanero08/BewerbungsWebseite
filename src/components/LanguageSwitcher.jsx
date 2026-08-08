import { useState, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { HiLanguage, HiCheck } from 'react-icons/hi2'
import { useLanguage, LANGUAGES } from '../context/LanguageContext.jsx'

const LABELS = {
  de: { short: 'DE', full: 'Deutsch' },
  en: { short: 'EN', full: 'English' },
  fr: { short: 'FR', full: 'Français' },
}

const ARIA_LABEL = {
  de: 'Sprache wählen',
  en: 'Choose language',
  fr: 'Choisir la langue',
}

export default function LanguageSwitcher({ className = '' }) {
  const { language, setLanguage } = useLanguage()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={ARIA_LABEL[language]}
        className="flex items-center gap-1.5 rounded-full border border-fg/10 bg-fg/5 px-3 py-1.5 text-xs font-medium text-fg/70 transition hover:border-fg/20 hover:text-fg"
      >
        <HiLanguage size={15} />
        {LABELS[language].short}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="glass absolute left-0 top-full z-50 mt-2 w-36 overflow-hidden rounded-xl p-1.5 md:left-auto md:right-0"
          >
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                onClick={() => {
                  setLanguage(lang)
                  setOpen(false)
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${
                  lang === language
                    ? 'bg-fg/10 text-fg'
                    : 'text-fg/60 hover:bg-fg/5 hover:text-fg'
                }`}
              >
                {LABELS[lang].full}
                {lang === language && <HiCheck className="text-cyan" size={16} />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
