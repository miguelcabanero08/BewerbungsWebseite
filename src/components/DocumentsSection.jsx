import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { HiLockClosed, HiLockOpen, HiDocumentText, HiArrowUpRight } from 'react-icons/hi2'
import { useAuth } from '../context/AuthContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import { dokumente } from '../i18n/dokumente.js'
import PasswordGate from './PasswordGate.jsx'
import Reveal from './Reveal.jsx'
import TiltCard from './TiltCard.jsx'

export default function DocumentsSection() {
  const { unlocked, checking, lock } = useAuth()
  const { language } = useLanguage()
  const t = dokumente[language]
  const [gateOpen, setGateOpen] = useState(false)
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    if (!unlocked) return
    setLoading(true)
    setLoadError(false)
    fetch(`/api/documents?lang=${language}`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('request failed')
        return res.json()
      })
      .then((data) => setDocuments(data))
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false))
  }, [unlocked, language])

  if (checking) {
    return <div className="h-40 animate-pulse rounded-2xl bg-fg/5" />
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {unlocked ? (
          <motion.div
            key="unlocked"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {loading && <p className="text-sm text-fg/40">{t.loading}</p>}
            {loadError && <p className="text-sm text-pink">{t.loadError}</p>}
            {!loading && !loadError && (
              <>
                <div className="mb-6 flex justify-end">
                  <button
                    onClick={lock}
                    className="group flex items-center gap-1.5 text-sm text-fg/40 transition hover:text-fg"
                  >
                    <HiLockOpen size={15} className="transition group-hover:text-cyan" />
                    {t.lockButton}
                  </button>
                </div>
                <div className="grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
                  {documents.map((doc, i) => (
                    <Reveal key={doc.id} delay={i * 0.06} className="h-full">
                      <TiltCard
                        tiltStrength={5}
                        className="group glass relative flex h-full flex-col overflow-hidden rounded-2xl p-6"
                      >
                        <a
                          href={`/api/documents/file?id=${doc.id}&lang=${language}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex h-full flex-col"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet to-cyan text-fg">
                              <HiDocumentText size={22} />
                            </div>
                            <HiArrowUpRight className="text-fg/30 transition group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-fg" />
                          </div>
                          <h4 className="mt-5 font-display text-lg font-semibold text-fg">
                            {doc.title}
                          </h4>
                          <p className="mt-2 text-sm text-fg/50">{doc.description}</p>
                          <div className="flex-1" />
                          <span className="mt-4 inline-block text-sm text-fg/30 transition group-hover:text-cyan">
                            {t.openLink} &rarr;
                          </span>
                        </a>
                      </TiltCard>
                    </Reveal>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        ) : (
          <motion.button
            key="locked"
            onClick={() => setGateOpen(true)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="group glass relative mx-auto flex w-full max-w-2xl flex-col items-center gap-4 overflow-hidden rounded-2xl border border-dashed border-fg/15 p-10 text-center transition hover:border-fg/30"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet to-cyan text-fg transition-transform group-hover:scale-110">
              <HiLockClosed size={24} />
            </div>
            <p className="font-display text-lg font-semibold text-fg">{t.lockedTitle}</p>
            <p className="max-w-sm text-sm text-fg/50">{t.lockedText}</p>
            <span className="mt-2 rounded-full bg-fg/5 px-5 py-2 text-sm font-medium text-fg/80 transition group-hover:bg-fg/10 group-hover:text-fg">
              {t.unlockButton}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <PasswordGate
        open={gateOpen}
        onClose={() => setGateOpen(false)}
        onUnlocked={() => setGateOpen(false)}
        title={t.gateTitle}
        description={t.gateDescription}
      />
    </>
  )
}
