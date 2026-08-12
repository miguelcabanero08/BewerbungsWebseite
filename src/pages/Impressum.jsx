import { motion } from 'framer-motion'
import { useLanguage } from '../context/LanguageContext.jsx'
import { impressum } from '../i18n/impressum.js'

export default function Impressum() {
  const { language } = useLanguage()
  const t = impressum[language]

  return (
    <div>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-4xl font-bold text-fg sm:text-5xl"
      >
        {t.title}
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass mt-12 grid max-w-4xl grid-cols-1 gap-x-12 gap-y-8 rounded-2xl p-8 sm:p-10 md:grid-cols-2 lg:p-12"
      >
        <div>
          <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-cyan">
            {t.responsibleHeading}
          </h2>
          <p className="mt-2 text-fg/70">
            {t.address.map((line, i) => (
              <span key={i}>
                {line}
                {i < t.address.length - 1 && <br />}
              </span>
            ))}
          </p>
        </div>

        <div>
          <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-cyan">
            {t.contactHeading}
          </h2>
          <p className="mt-2 text-fg/70">
            {t.emailLabel}{' '}
            <a href={`mailto:${t.email}`} className="text-fg underline decoration-fg/30 underline-offset-2 hover:decoration-fg">
              {t.email}
            </a>
          </p>
        </div>

        <div>
          <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-cyan">
            {t.educationHeading}
          </h2>
          <p className="mt-2 text-fg/70">{t.education}</p>
        </div>

        <div>
          <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-cyan">
            {t.disclaimerHeading}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-fg/50">{t.disclaimer}</p>
        </div>
      </motion.div>
    </div>
  )
}
