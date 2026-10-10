import { useEffect, useRef } from 'react'
import { useLanguage } from '../context/LanguageContext.jsx'
import { ui } from '../i18n/ui.js'
import { APPS } from '../data/apps.js'
import { AppContent } from '../apps/index.jsx'
import { AppIcon, UiIcon } from './icons.jsx'
import { useDesk } from './DeskContext.jsx'
import LangSwitch from './LangSwitch.jsx'

// Auf schmalen Bildschirmen statt des 1280er-Desktops: ein Startbildschirm mit
// denselben Apps, jede App im Vollbild. Teilt den Fensterzustand mit dem Desktop.
export default function PhoneShell({ windows, dispatch, onLeave }) {
  const { language } = useLanguage()
  const t = ui[language]
  const { openApp } = useDesk()
  const focus = windows.focus && windows.wins[windows.focus] && !windows.wins[windows.focus].min ? windows.wins[windows.focus] : null
  const headingRef = useRef(null)
  const focusId = focus?.id

  // beim Öffnen einer App den Fokus auf deren Titel setzen (Screenreader, Tastatur)
  useEffect(() => { if (focusId) headingRef.current?.focus() }, [focusId])

  if (focus) {
    return (
      <div className="phone">
        <section className="phone-app" aria-labelledby="phone-app-title">
          <header className="phone-bar">
            <button type="button" className="phone-back" onClick={() => dispatch({ type: 'close', id: focus.id })}>
              <UiIcon name="back" size={16} /> {t.phone.back}
            </button>
            <h1 id="phone-app-title" ref={headingRef} tabIndex={-1}>{t.apps[focus.id]}</h1>
          </header>
          <div className="phone-body">
            <AppContent id={focus.id} tab={focus.tab} onTab={(tab) => dispatch({ type: 'setTab', id: focus.id, tab })} />
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="phone">
      <div className="phone-home">
        <header className="phone-top">
          <LangSwitch />
        </header>
        <aside className="phone-note">
          <b>Miguel Cabañero</b>
          {t.sticky.lines.map((l) => <span key={l}>{l}</span>)}
        </aside>
        <ul className="phone-grid" aria-label={t.phone.home}>
          {APPS.map((a) => (
            <li key={a.id}>
              <button type="button" onClick={() => openApp(a.id)}>
                <AppIcon name={a.icon} size={52} />
                <span>{t.apps[a.id]}</span>
              </button>
            </li>
          ))}
        </ul>
        {onLeave && (
          <button type="button" className="phone-leave" onClick={onLeave}>
            <UiIcon name="power" size={14} /> {t.phone.leave}
          </button>
        )}
      </div>
    </div>
  )
}
