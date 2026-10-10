import { useEffect, useRef, useState } from 'react'
import { LANGUAGES, useLanguage } from '../context/LanguageContext.jsx'
import { ui } from '../i18n/ui.js'

// Sprachwahl DE/EN/FR. variant="inline" (Flur, Handy) oder "tray" (Taskleiste, Menü nach oben).
export default function LangSwitch({ variant = 'inline', className = '' }) {
  const { language, setLanguage } = useLanguage()
  const t = ui[language].lang
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const close = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    const esc = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', esc) }
  }, [open])

  if (variant === 'inline') {
    return (
      <div className={`lang-inline ${className}`.trim()} role="group" aria-label={t.label}>
        {LANGUAGES.map((l) => (
          <button key={l} type="button" lang={l} aria-pressed={language === l} aria-label={t[l]} onClick={() => setLanguage(l)}>
            {l.toUpperCase()}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="lang-tray" ref={ref}>
      <button type="button" className="lang-btn" aria-haspopup="true" aria-expanded={open} aria-label={`${t.label}: ${t[language]}`} onClick={() => setOpen((o) => !o)}>
        {language.toUpperCase()}
      </button>
      {open && (
        <ul className="lang-menu">
          {LANGUAGES.map((l) => (
            <li key={l}>
              <button type="button" lang={l} aria-pressed={language === l} onClick={() => { setLanguage(l); setOpen(false) }}>
                <b>{l.toUpperCase()}</b> {t[l]}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
