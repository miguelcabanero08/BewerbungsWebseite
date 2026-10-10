import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext.jsx'
import { ui } from '../i18n/ui.js'
import { UiIcon } from '../desk/icons.jsx'
import LangSwitch from '../desk/LangSwitch.jsx'

// Oberfläche über der 3D-Welt, je nach Zustand der Kamera.
export function HallOverlay({ visible, onRing, onSkip }) {
  const { language } = useLanguage()
  const t = ui[language].hall
  return (
    <section className={`ui hall-ui${visible ? ' on' : ''}`} aria-hidden={!visible} inert={!visible}>
      <div className="hall-top">
        <h1 className="sr">{t.heading}</h1>
        <p><b>Miguel Cabañero</b> · {t.facts}</p>
      </div>
      <div className="hall-corner">
        <LangSwitch />
        <a className="skip" href="/desktop" onClick={(e) => { e.preventDefault(); onSkip() }}>{t.skip}</a>
      </div>
      <div className="hall-bottom">
        <button type="button" className="ring" onClick={onRing}>
          <UiIcon name="bell" size={18} /> {t.ring}
        </button>
        <span className="hint">{t.orPress} <kbd>Enter</kbd>{t.press ? ` ${t.press}` : ''}</span>
      </div>
    </section>
  )
}

// Tag/Nacht-Knopf: zeigt, wohin er wechselt (tagsüber den Mond, nachts die Sonne)
function DayButton({ daylight, onDaylight, t }) {
  return (
    <button type="button" className="tvbtn ghost" onClick={onDaylight} aria-label={daylight ? t.toNight : t.toDay} title={daylight ? t.toNight : t.toDay}>
      <UiIcon name={daylight ? 'moon' : 'sun'} size={16} /> <span className="lbl">{daylight ? t.night : t.day}</span>
    </button>
  )
}

export function RoomOverlay({ visible, touch, diorama, onDiorama, onPC, onTV, onWindow, onHelp, daylight, onDaylight }) {
  const { language } = useLanguage()
  const t = ui[language].room
  const hall = ui[language].hall
  return (
    <section className={`ui room-ui${visible ? ' on' : ''}${daylight ? ' day' : ''}`} aria-hidden={!visible} inert={!visible}>
      {/* Handy: über dem Diorama steht, wessen Zimmer das ist */}
      {(touch || diorama) && <p className="room-title"><b>Miguel Cabañero</b> · {hall.facts}</p>}
      <div className="room-corner">
        <LangSwitch className="ghost" />
        <div className="room-tools">
          {/* nur am Computer: auf dem Handy ist das Diorama immer an */}
          {!touch && (
            <button type="button" className="tvbtn ghost" onClick={onDiorama} aria-label={diorama ? t.toInside : t.toDiorama} title={diorama ? t.toInside : t.toDiorama}>
              <UiIcon name={diorama ? 'eye' : 'iso'} size={16} /> <span className="lbl">{diorama ? t.inside : t.diorama}</span>
            </button>
          )}
          <DayButton daylight={daylight} onDaylight={onDaylight} t={t} />
          <button type="button" className="tvbtn ghost" onClick={onHelp} aria-label={t.helpLabel} title={t.helpLabel}>
            <UiIcon name="help" size={16} /> <span className="lbl">{t.help}</span>
          </button>
        </div>
      </div>
      <div className="room-bottom">
        <span className="chip"><UiIcon name="down" size={16} /> {touch ? t.chipTouch : diorama ? t.chipDiorama : t.chip}</span>
        {/* für Tastatur und Screenreader; sichtbar, sobald sie den Fokus haben */}
        <button type="button" className="sr focusable" onClick={onPC}>{t.toPC}</button>
        <button type="button" className="sr focusable" onClick={onTV}>{t.toTV}</button>
        <button type="button" className="sr focusable" onClick={onWindow}>{t.toWindow}</button>
      </div>
    </section>
  )
}

// Am PC (Desktop-Ansicht): Knopf oben links zurück ins Zimmer, wie beim Fernseher
export function PcOverlay({ visible, onBack }) {
  const { language } = useLanguage()
  const t = ui[language].tv
  return (
    <section className={`ui pc-ui${visible ? ' on' : ''}`} aria-hidden={!visible} inert={!visible}>
      <button type="button" className="tvbtn ghost pc-back" onClick={onBack}><UiIcon name="back" size={14} /> {t.back}</button>
    </section>
  )
}

// Am Fenster: zurück ins Zimmer und Tag/Nacht direkt draussen ansehen
export function WindowOverlay({ visible, onBack, daylight, onDaylight }) {
  const { language } = useLanguage()
  const t = ui[language]
  return (
    <section className={`ui window-ui${visible ? ' on' : ''}`} aria-hidden={!visible} inert={!visible}>
      <div className="tv-top">
        <button type="button" className="tvbtn ghost" onClick={onBack}><UiIcon name="back" size={14} /> {t.tv.back}</button>
        <DayButton daylight={daylight} onDaylight={onDaylight} t={t.room} />
      </div>
      <p className="tv-cap">{t.room.windowCap}</p>
    </section>
  )
}

export function TvOverlay({ visible, onBack, onSound }) {
  const { language } = useLanguage()
  const t = ui[language].tv
  const [soundOn, setSoundOn] = useState(false)
  // Ton immer aus, wenn man den Fernseher verlässt (die Engine schaltet ihn stumm)
  const [lastVisible, setLastVisible] = useState(visible)
  if (visible !== lastVisible) {
    setLastVisible(visible)
    if (!visible && soundOn) setSoundOn(false)
  }
  return (
    <section className={`ui tv-ui${visible ? ' on' : ''}`} aria-hidden={!visible} inert={!visible}>
      <div className="tv-top">
        <button type="button" className="tvbtn" onClick={onBack}><UiIcon name="back" size={14} /> {t.back}</button>
        <button type="button" className="tvbtn" aria-pressed={soundOn} onClick={() => { const next = !soundOn; setSoundOn(next); onSound(next) }}>
          {soundOn ? t.soundOff : t.soundOn}
        </button>
      </div>
      <p className="tv-cap"><b>{t.title}</b><br />{t.caption}</p>
    </section>
  )
}

// Desktop: "Klick"-Pfeile (nur Hinweis). Handy: dieselben Anker als Knöpfe mit Namen,
// denn ohne Maus gibt es kein Hover und die Objekte sind im Diorama klein.
export function Hints({ tvRef, pcRef, winRef, touch, onTV, onPC, onWindow }) {
  const { language } = useLanguage()
  const t = ui[language].room
  const label = t.hint
  const arrow = (
    <svg width="34" height="46" viewBox="0 0 34 46" aria-hidden="true">
      <path d="M17 2v36M5 27l12 13 12-13" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
  // immer dieselben Elemente (die Engine hält die Referenzen), nur Text und Bedienbarkeit wechseln
  const tag = (ref, onClick, name) => (
    <button type="button" className={touch ? 'hint3d tag' : 'hint3d'} ref={ref} onClick={touch ? onClick : undefined} tabIndex={touch ? 0 : -1} aria-hidden={!touch}>
      <span>{touch ? name : label}</span>{arrow}
    </button>
  )
  return (
    <>
      {tag(tvRef, onTV, t.tags.tv)}
      {tag(pcRef, onPC, t.tags.pc)}
      {tag(winRef, onWindow, t.tags.win)}
    </>
  )
}
