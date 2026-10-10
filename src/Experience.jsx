import { useCallback, useEffect, useMemo, useReducer, useRef, useState, useSyncExternalStore } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useLanguage } from './context/LanguageContext.jsx'
import { ui } from './i18n/ui.js'
import { appById, appBySlug, LEGACY_ROUTES, DESK_W, DESK_H } from './data/apps.js'
import { tvFilm } from './data/media.js'
import { windowsReducer, initialWindows } from './desk/windows.js'
import { DeskContext } from './desk/DeskContext.jsx'
import Desktop from './desk/Desktop.jsx'
import PhoneShell from './desk/PhoneShell.jsx'
import { HallOverlay, RoomOverlay, TvOverlay, PcOverlay, WindowOverlay, Hints } from './world/Overlays.jsx'
import { hasWebGL } from './world/webgl.js'

const PHONE_QUERY = '(max-width: 760px)'
const DAY_KEY = 'mc-daylight'
const DIORAMA_KEY = 'mc-diorama'

// Licht-Modus merken (nur Bequemlichkeit pro Besucher; ohne Speicher einfach Nacht)
function readDaylight() {
  try { return localStorage.getItem(DAY_KEY) === '1' } catch { return false }
}
function readDiorama() {
  try { return localStorage.getItem(DIORAMA_KEY) === '1' } catch { return false }
}
const REDUCE_QUERY = '(prefers-reduced-motion: reduce)'

function useMediaQuery(query) {
  return useSyncExternalStore(
    (cb) => { const m = window.matchMedia(query); m.addEventListener('change', cb); return () => m.removeEventListener('change', cb) },
    () => window.matchMedia(query).matches,
    () => false,
  )
}

// Einstieg aus der Adresse: "/" = Flur, "/desktop" oder "/projekte" usw. = direkt am PC.
function parseEntry(pathname) {
  const slug = decodeURIComponent(pathname).replace(/^\/+|\/+$/g, '').toLowerCase()
  if (!slug) return { start: 'hall' }
  if (slug === 'desktop') return { start: 'pc' }
  const app = appBySlug(slug)
  if (app) return { start: 'pc', app: app.id }
  const legacy = LEGACY_ROUTES[slug]
  if (legacy) return { start: 'pc', app: legacy.app, tab: legacy.tab }
  return { start: 'hall' }
}

const initWindows = (entry) => (entry.app ? windowsReducer(initialWindows, { type: 'open', id: entry.app, tab: entry.tab }) : initialWindows)

export default function Experience() {
  const { language } = useLanguage()
  const t = ui[language]
  const location = useLocation()
  const navigate = useNavigate()

  const [entry] = useState(() => parseEntry(location.pathname))
  const [windows, dispatch] = useReducer(windowsReducer, entry, initWindows)
  // ?flat simuliert in der Entwicklung einen Browser ohne WebGL
  const [mode, setMode] = useState(() => {
    const forceFlat = import.meta.env.DEV && new URLSearchParams(window.location.search).has('flat')
    return hasWebGL() && !forceFlat ? 'world' : 'flat'
  })
  const [worldState, setWorldState] = useState(() => (mode === 'flat' ? 'pc' : entry.start))
  const [ready, setReady] = useState(mode === 'flat')
  const [daylight, setDaylight] = useState(readDaylight)
  const [diorama, setDiorama] = useState(readDiorama) // Computer: Zimmer als Diorama von oben
  const isPhone = useMediaQuery(PHONE_QUERY)
  const reduceMotion = useMediaQuery(REDUCE_QUERY)

  const hostRef = useRef(null)
  const deskRef = useRef(null)
  const hintTvRef = useRef(null)
  const hintPcRef = useRef(null)
  const hintWinRef = useRef(null)
  const blackRef = useRef(null)
  const engineRef = useRef(null)
  const labels = useMemo(() => ({ plateSub: t.world.plateSub, doormat: t.world.doormat }), [t])
  const latest = useRef({ labels, isPhone, reduceMotion, daylight, diorama })
  latest.current = { labels, isPhone, reduceMotion, daylight, diorama }

  /* ---------- 3D-Engine laden (eigener Chunk mit three.js) ---------- */
  useEffect(() => {
    if (mode !== 'world') return
    let cancelled = false
    let engine = null
    import('./world/engine.js')
      .then(({ createEngine }) => {
        if (cancelled) return
        const now = latest.current
        engine = createEngine({
          host: hostRef.current,
          deskLayer: deskRef.current,
          hintEls: { tv: hintTvRef.current, pc: hintPcRef.current, win: hintWinRef.current },
          blackEl: blackRef.current,
          labels: now.labels,
          startState: entry.start,
          phoneMode: now.isPhone,
          reduceMotion: now.reduceMotion,
          daylight: now.daylight,
          diorama: now.diorama,
          tv: tvFilm,
          wallpaperUrl: '/images/manchester-united.webp',
          posterUrl: '/media/catsleep-poster.jpg',
          onState: setWorldState,
          onReady: () => setReady(true),
        })
        engineRef.current = engine
        if (import.meta.env.DEV) window.__engine = engine // nur zum Testen in der Entwicklung
      })
      .catch((err) => {
        console.error('3D-Ansicht nicht verfügbar, zeige den Desktop direkt.', err)
        if (cancelled) return
        engine?.dispose()
        engine = null
        setMode('flat')
        setWorldState('pc')
        setReady(true)
      })
    return () => {
      cancelled = true
      engine?.dispose()
      engineRef.current = null
    }
  }, [mode, entry.start])

  useEffect(() => { engineRef.current?.setPhoneMode(isPhone) }, [isPhone])

  useEffect(() => {
    engineRef.current?.setDiorama(diorama)
    try { localStorage.setItem(DIORAMA_KEY, diorama ? '1' : '0') } catch { /* egal */ }
  }, [diorama])

  useEffect(() => {
    engineRef.current?.setDaylight(daylight)
    try { localStorage.setItem(DAY_KEY, daylight ? '1' : '0') } catch { /* egal */ }
  }, [daylight])

  /* ---------- Sprache: Titel, lang-Attribut, Beschriftungen in der Welt ---------- */
  useEffect(() => {
    document.title = t.meta.title
    document.documentElement.lang = language
    engineRef.current?.setLabels(labels)
    engineRef.current?.refreshScreen()
  }, [language, labels, t])

  /* ---------- ohne WebGL: Desktop mittig und passend skaliert ---------- */
  useEffect(() => {
    if (mode !== 'flat') return
    const el = deskRef.current
    function place() {
      if (isPhone) {
        Object.assign(el.style, { position: 'fixed', left: '0px', top: '0px', transform: 'none', zIndex: '-1', pointerEvents: 'none' })
        return
      }
      const k = Math.min(innerWidth / DESK_W, innerHeight / DESK_H)
      Object.assign(el.style, {
        position: 'fixed', width: `${DESK_W}px`, height: `${DESK_H}px`,
        left: `${(innerWidth - DESK_W * k) / 2}px`, top: `${(innerHeight - DESK_H * k) / 2}px`,
        transform: `scale(${k})`, transformOrigin: '0 0', zIndex: '30', pointerEvents: 'auto', overflow: 'hidden',
      })
    }
    place()
    addEventListener('resize', place)
    return () => removeEventListener('resize', place)
  }, [mode, isPhone])

  /* ---------- Adresse synchron halten (Direktlinks, kein One-Pager) ---------- */
  useEffect(() => {
    if (worldState === 'moving' || worldState === 'entering') return
    let path = '/'
    if (worldState === 'pc') {
      const f = windows.focus ? windows.wins[windows.focus] : null
      path = f && !f.min ? `/${appById(f.id).slug}` : '/desktop'
    }
    if (path !== location.pathname) navigate(path, { replace: true })
  }, [worldState, windows, location.pathname, navigate])

  const openApp = useCallback((id, tab) => dispatch({ type: 'open', id, tab }), [])
  const desk = useMemo(() => ({ openApp }), [openApp])
  const leave = useCallback(() => engineRef.current?.goRoom(), [])
  const canLeave = mode === 'world'
  const atPC = worldState === 'pc'
  const deskInteractive = atPC && !isPhone

  return (
    <DeskContext.Provider value={desk}>
      <div className="stage" ref={hostRef} />
      <div className={`vignette${mode === 'world' && !atPC ? ' on' : ''}${daylight ? ' day' : ''}`} aria-hidden="true" />

      {mode === 'world' && (
        <>
          <HallOverlay visible={worldState === 'hall'} onRing={() => engineRef.current?.ring()} onSkip={() => engineRef.current?.skipToPC()} />
          <RoomOverlay visible={worldState === 'room'} touch={isPhone} diorama={diorama && !isPhone} onDiorama={() => setDiorama((d) => !d)} onPC={() => engineRef.current?.goPC()} onTV={() => engineRef.current?.goTV()} onWindow={() => engineRef.current?.goWindow()} onHelp={() => engineRef.current?.showHints()} daylight={daylight} onDaylight={() => setDaylight((d) => !d)} />
          <PcOverlay visible={atPC && !isPhone} onBack={leave} />
          <TvOverlay visible={worldState === 'tv'} onBack={() => engineRef.current?.leaveTV()} onSound={(on) => engineRef.current?.setTVMuted(!on)} />
          <WindowOverlay visible={worldState === 'window'} onBack={() => engineRef.current?.leaveWindow()} daylight={daylight} onDaylight={() => setDaylight((d) => !d)} />
          <Hints
            tvRef={hintTvRef} pcRef={hintPcRef} winRef={hintWinRef} touch={isPhone || diorama}
            onTV={() => engineRef.current?.goTV()} onPC={() => engineRef.current?.goPC()} onWindow={() => engineRef.current?.goWindow()}
          />
        </>
      )}

      <main className="desk-layer" ref={deskRef} inert={!deskInteractive} aria-hidden={!deskInteractive}>
        <Desktop windows={windows} dispatch={dispatch} onLeave={canLeave ? leave : null} />
      </main>

      {isPhone && atPC && <PhoneShell windows={windows} dispatch={dispatch} onLeave={canLeave ? leave : null} />}

      {mode === 'flat' && <p className="notice-flat" role="status">{t.desktop.noWebgl}</p>}
      <div className="black" ref={blackRef} aria-hidden="true" />
      <div className={`loader${ready ? ' done' : ''}`} aria-hidden={ready} role="status">{t.meta.loading}</div>
    </DeskContext.Provider>
  )
}
