import { useEffect, useRef } from 'react'
import { useLanguage } from '../context/LanguageContext.jsx'
import { kurz } from '../i18n/kurz.js'
import { impressum } from '../i18n/impressum.js'
import { UiIcon } from '../desk/icons.jsx'

// Knopf für die Karte, in jeder Ansicht neben den anderen Knöpfen
export function BriefButton({ onOpen, className = 'tvbtn ghost' }) {
  const { language } = useLanguage()
  const t = kurz[language]
  return (
    <button type="button" className={`${className} brief-btn`} onClick={onOpen} aria-label={t.buttonLabel} title={t.buttonLabel} aria-haspopup="dialog">
      <UiIcon name="card" size={16} /> <span className="lbl">{t.button}</span>
    </button>
  )
}

// Lasche am rechten Rand, immer am selben Ort (Flur, Zimmer, Fernseher, Fenster).
// Amber wie der Klingel-Knopf, damit sie nicht übersehen wird.
export function BriefTab({ visible, onOpen }) {
  const { language } = useLanguage()
  const t = kurz[language]
  return (
    <button
      type="button"
      className={`brief-tab${visible ? ' on' : ''}`}
      onClick={onOpen}
      aria-haspopup="dialog"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
    >
      <UiIcon name="card" size={18} />
      <span>{t.buttonLabel}</span>
    </button>
  )
}

const PROJECTS = [
  { id: 'tunehead', name: 'Tunehead', live: 'https://tunehead.miguel-cabanero.ch' },
  { id: 'profileauth', name: 'ProfileAuth', live: 'https://profile.miguel-cabanero.ch' },
  { id: 'fellow', name: 'Fellow Tenants', app: 'fellow' },
]

// Die Karte selbst: ein echtes <dialog> (Fokus bleibt drin, Esc schliesst).
// onApp(id) öffnet eine App am PC und fährt bei Bedarf dorthin.
export function BriefCard({ open, onClose, onApp }) {
  const { language } = useLanguage()
  const t = kurz[language]
  const email = impressum[language].email
  const ref = useRef(null)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    else if (!open && d.open) d.close()
  }, [open])

  const go = (id) => { onClose(); onApp(id) }

  return (
    <dialog
      ref={ref}
      className="brief"
      aria-labelledby="brief-title"
      onClose={onClose}
      // Klick neben die Karte (auf den Hintergrund) schliesst
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="brief-card">
        <header className="brief-head">
          <img src="/images/portrait.webp" alt="" width="64" height="64" />
          <div>
            <small id="brief-title">{t.title}</small>
            <h2>Miguel Cabañero</h2>
            <p className="brief-role">{t.role}</p>
          </div>
          <button type="button" className="brief-x" onClick={onClose} aria-label={t.close}><UiIcon name="close" size={14} /></button>
        </header>
        <ul className="brief-facts">{t.facts.map((f) => <li key={f}>{f}</li>)}</ul>

        <section>
          <h3>{t.strengthsTitle}</h3>
          <ol className="brief-strengths">
            {t.strengths.map(([title, text]) => <li key={title}><b>{title}</b> {text}</li>)}
          </ol>
        </section>

        <section>
          <h3>{t.projectsTitle}</h3>
          <ul className="brief-projects">
            {PROJECTS.map((p) => (
              <li key={p.id}>
                <div><b>{p.name}</b><span>{t.projects[p.id]}</span></div>
                {p.live ? (
                  <a href={p.live} target="_blank" rel="noreferrer">{t.live} <UiIcon name="external" size={12} /></a>
                ) : (
                  <button type="button" onClick={() => go(p.app)}>{t.inPc}</button>
                )}
              </li>
            ))}
          </ul>
        </section>

        <footer className="brief-actions">
          <button type="button" className="brief-main" onClick={() => go('docs')}><UiIcon name="lock" size={14} /> {t.docs}</button>
          <a className="brief-sec" href={`mailto:${email}`}>{t.mail}</a>
          <button type="button" className="brief-sec" onClick={() => go('projects')}>{t.allProjects}</button>
          <button type="button" className="brief-sec" onClick={() => go('making')}>{t.makingOf}</button>
        </footer>
      </div>
    </dialog>
  )
}
