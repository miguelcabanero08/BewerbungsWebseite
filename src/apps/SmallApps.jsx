import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../context/LanguageContext.jsx'
import { ui } from '../i18n/ui.js'
import { impressum } from '../i18n/impressum.js'
import { films, blenderModels, fellowClips } from '../data/media.js'
import { UiIcon } from '../desk/icons.jsx'

export function FilmsApp() {
  const { language } = useLanguage()
  const t = ui[language].films
  const [id, setId] = useState(films[0].id)
  const film = films.find((f) => f.id === id) ?? films[0]
  return (
    <div className="cinema scroll" data-scroll>
      <video key={film.id} src={film.src} poster={film.poster} controls playsInline preload="metadata" aria-label={film.title} />
      <div className="pad">
        <h2>{film.title}</h2>
        <p className="muted">{t.intro}</p>
        <div className="reel" role="group" aria-label={t.choose}>
          {films.map((f) => (
            <button key={f.id} type="button" className={f.id === id ? 'on' : ''} aria-pressed={f.id === id} onClick={() => setId(f.id)}>
              <img src={f.poster} alt="" loading="lazy" />
              <span>{f.title}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export function BlenderApp() {
  const { language } = useLanguage()
  const t = ui[language]
  const [open, setOpen] = useState(null)
  const model = blenderModels.find((m) => m.id === open)
  return (
    <div className="pad scroll" data-scroll>
      <h2>{t.apps.blender}</h2>
      <p className="lead">{t.blender.intro}</p>
      {model && <ModelStage key={model.id} model={model} t={t.blender} onClose={() => setOpen(null)} />}
      <h3>{t.blender.models}</h3>
      <ul className="renders">
        {blenderModels.map((m) => (
          <li key={m.id}>
            <button type="button" className={m.id === open ? 'on' : ''} aria-pressed={m.id === open} onClick={() => setOpen(m.id)}>
              <img src={m.preview} alt="" loading="lazy" />
              <span className="r-title">{m.title}</span>
              <span className="r-meta">{m.animated ? t.blender.rigged : t.blender.simple} · {t.blender.view3d}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

// Interaktiver Viewer: three.js-Teil wird erst hier nachgeladen
function ModelStage({ model, t, onClose }) {
  const hostRef = useRef(null)
  const viewerRef = useRef(null)
  const [status, setStatus] = useState('loading')
  const [clips, setClips] = useState([])
  const [clip, setClip] = useState(null)
  const [playing, setPlaying] = useState(true)

  // Viewer sitzt oben in der App: beim Öffnen dorthin scrollen
  useEffect(() => { const sc = hostRef.current?.closest('[data-scroll]'); if (sc) sc.scrollTop = 0 }, [])

  useEffect(() => {
    let viewer = null, cancelled = false
    import('./modelViewer.js')
      .then(({ createViewer }) => {
        if (cancelled) return
        viewer = createViewer(hostRef.current, {
          src: model.src,
          onReady: (names) => {
            setStatus('ready')
            setClips(names)
            const first = names.includes('idle1') ? 'idle1' : names[0]
            if (first) { viewer.play(first); setClip(first) }
          },
          onError: () => setStatus('error'),
        })
        viewerRef.current = viewer
      })
      .catch(() => !cancelled && setStatus('error'))
    return () => { cancelled = true; viewer?.dispose(); viewerRef.current = null }
  }, [model.src])

  function choose(name) { viewerRef.current?.play(name); setClip(name); setPlaying(true); viewerRef.current?.setPlaying(true) }
  function toggle() { const next = !playing; setPlaying(next); viewerRef.current?.setPlaying(next) }

  return (
    <section className="stage3d" aria-label={model.title}>
      <div className="stage3d-view" ref={hostRef}>
        {status !== 'ready' && <p className="stage3d-msg" role="status">{status === 'error' ? t.error : t.loading}</p>}
      </div>
      <div className="stage3d-bar">
        <b>{model.title}</b>
        <span className="muted small">{t.drag}</span>
        {clips.length > 0 && (
          <div className="clipbtns" role="group">
            <button type="button" onClick={toggle} aria-label={playing ? t.pause : t.play}><UiIcon name={playing ? 'pause' : 'play'} size={12} /></button>
            {clips.map((c) => (
              <button key={c} type="button" className={c === clip ? 'on' : ''} aria-pressed={c === clip} onClick={() => choose(c)}>{t.clips[c] ?? c}</button>
            ))}
          </div>
        )}
        <button type="button" className="stage3d-close" onClick={onClose}>{t.close3d}</button>
      </div>
    </section>
  )
}

export function FellowApp() {
  const { language } = useLanguage()
  const t = ui[language].fellow
  const [clip, setClip] = useState(fellowClips[0])
  return (
    <div className="game scroll" data-scroll>
      <div className="game-hero">
        <video key={clip.id} src={clip.src} poster={clip.poster} autoPlay muted loop playsInline controls aria-label={t.clipNames[clip.id]} />
        <h2>Fellow Tenants</h2>
      </div>
      <div className="pad">
        <span className="rule">{t.rule}</span>
        <p>{t.text}</p>
        <p className="muted small">{t.meta}</p>
        <h3>{t.clips}</h3>
        <div className="clips">
          {fellowClips.map((c) => (
            <button key={c.id} type="button" className={c.id === clip.id ? 'on' : ''} aria-pressed={c.id === clip.id} onClick={() => setClip(c)}>
              <img src={c.poster} alt="" loading="lazy" />
              <span>{t.clipNames[c.id]}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ImprintApp() {
  const { language } = useLanguage()
  const t = impressum[language]
  const n = ui[language].notepad
  return (
    <div className="notepad-wrap">
      <div className="menubar" aria-hidden="true"><span>{n.file}</span><span>{n.edit}</span><span>{n.view}</span></div>
      <div className="notepad scroll" data-scroll>
        <h2>{t.title.toUpperCase()}</h2>
        <h3>{t.responsibleHeading}</h3>
        <p>{t.address.map((l) => <span key={l}>{l}<br /></span>)}</p>
        <h3>{t.contactHeading}</h3>
        <p>{t.emailLabel} <a href={`mailto:${t.email}`}>{t.email}</a></p>
        <h3>{t.educationHeading}</h3>
        <p>{t.education}</p>
        <h3>{t.disclaimerHeading}</h3>
        <p>{t.disclaimer}</p>
      </div>
    </div>
  )
}

export function BinApp() {
  const { language } = useLanguage()
  const t = ui[language].bin
  return (
    <div className="pad">
      <table className="files">
        <thead><tr><th scope="col">{t.name}</th><th scope="col">{t.deleted}</th><th scope="col">{t.size}</th></tr></thead>
        <tbody><tr><td>{t.item}</td><td>09.10.2026</td><td>{t.itemSize}</td></tr></tbody>
      </table>
      <p className="muted small">{t.note}</p>
    </div>
  )
}
