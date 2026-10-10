import { useEffect, useState } from 'react'
import { useLanguage } from '../context/LanguageContext.jsx'
import { ui } from '../i18n/ui.js'
import { impressum } from '../i18n/impressum.js'
import { APPS, appById } from '../data/apps.js'
import { AppContent } from '../apps/index.jsx'
import { AppIcon, UiIcon } from './icons.jsx'
import { useDesk } from './DeskContext.jsx'
import Window from './Window.jsx'
import LangSwitch from './LangSwitch.jsx'

const LOCALE = { de: 'de-CH', en: 'en-GB', fr: 'fr-CH' }

// Der PC-Desktop (immer 1280 × 800, wird von aussen skaliert).
export default function Desktop({ windows, dispatch, onLeave }) {
  const { language } = useLanguage()
  const t = ui[language]
  const { openApp } = useDesk()
  const [startOpen, setStartOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const list = Object.values(windows.wins)

  useEffect(() => {
    if (!startOpen) return
    const esc = (e) => { if (e.key === 'Escape') setStartOpen(false) }
    document.addEventListener('keydown', esc)
    return () => document.removeEventListener('keydown', esc)
  }, [startOpen])

  function launch(id) {
    setSelected(id)
    setStartOpen(false)
    openApp(id)
  }

  return (
    <div className="desktop" onPointerDown={(e) => { if (startOpen && !e.target.closest('.startmenu, .start-btn')) setStartOpen(false) }}>
      <div className="wallpaper" aria-hidden="true" />

      <ul className="icons" aria-label="Desktop">
        {APPS.map((a) => (
          <li key={a.id}>
            <button type="button" className={`icon${selected === a.id ? ' sel' : ''}`} onClick={() => launch(a.id)}>
              <AppIcon name={a.icon} />
              <span>{t.apps[a.id]}</span>
            </button>
          </li>
        ))}
      </ul>

      <aside className="sticky" aria-label={t.desktop.note}>
        <div className="sticky-top" />
        <div className="sticky-body">
          <b>Miguel Cabañero</b>
          {t.sticky.lines.map((l) => <span key={l}>{l}</span>)}
          <a href={`mailto:${impressum[language].email}`}>{impressum[language].email}</a>
        </div>
      </aside>

      {list.map((w) => !w.min && (
        <Window
          key={w.id}
          win={w}
          app={appById(w.id)}
          title={t.apps[w.id]}
          labels={t.desktop}
          focused={windows.focus === w.id}
          dispatch={dispatch}
        >
          <AppContent id={w.id} tab={w.tab} onTab={(tab) => dispatch({ type: 'setTab', id: w.id, tab })} />
        </Window>
      ))}

      {startOpen && (
        <div className="startmenu" role="dialog" aria-label={t.desktop.start}>
          <h3>{t.desktop.pinned}</h3>
          <ul className="sm-grid">
            {APPS.filter((a) => a.id !== 'bin').map((a) => (
              <li key={a.id}>
                <button type="button" className="icon" onClick={() => launch(a.id)}>
                  <AppIcon name={a.icon} size={36} />
                  <span>{t.apps[a.id]}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="sm-foot">
            <span className="sm-user"><img src="/images/portrait.webp" alt="" /> Miguel Cabañero</span>
            {onLeave && (
              <button type="button" className="sm-power" onClick={() => { setStartOpen(false); onLeave() }}>
                <UiIcon name="power" size={14} /> {t.desktop.leave}
              </button>
            )}
          </div>
        </div>
      )}

      <nav className="taskbar" aria-label={t.desktop.taskbar}>
        <span className="tray-left"><i className="dot" />{t.desktop.open}</span>
        <button type="button" className="tb-btn start-btn" aria-label={t.desktop.start} aria-expanded={startOpen} onClick={() => setStartOpen((o) => !o)}>
          <span className="start-mark">MC</span>
        </button>
        {APPS.filter((a) => a.taskbar).map((a) => {
          const w = windows.wins[a.id]
          const active = w && !w.min && windows.focus === a.id
          return (
            <button
              key={a.id}
              type="button"
              className={`tb-btn${w ? ' open' : ''}${active ? ' active' : ''}`}
              aria-label={t.apps[a.id]}
              aria-pressed={!!active}
              onClick={() => (active ? dispatch({ type: 'minimize', id: a.id }) : launch(a.id))}
            >
              <AppIcon name={a.icon} size={26} />
            </button>
          )
        })}
        <div className="tray">
          <LangSwitch variant="tray" />
          <Clock language={language} />
        </div>
      </nav>
    </div>
  )
}

function Clock({ language }) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 15000)
    return () => clearInterval(id)
  }, [])
  const loc = LOCALE[language]
  return (
    <time className="clock" dateTime={now.toISOString()}>
      {now.toLocaleTimeString(loc, { hour: '2-digit', minute: '2-digit' })}
      <br />
      {now.toLocaleDateString(loc)}
    </time>
  )
}
