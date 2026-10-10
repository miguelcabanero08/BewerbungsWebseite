// 3D-Engine: Renderer, Kamera als Zustandsmaschine (Flur → Zimmer ↔ PC / Fernseher),
// Eingaben, Bildschirm-Abbild und Bildschirm-Licht. React steuert nur die Oberfläche
// und ruft die Methoden des zurückgegebenen Objekts auf.
//
// Wichtige Lehren aus dem Mockup (DESIGN.md → Implementation Notes):
//  - Monitor zeigt ein html2canvas-Abbild des echten Desktops (kein CSS3D)
//  - Animationen zeitbasiert, Fortschritt auf 0..1 begrenzt
//  - Viewport kann beim Laden 0 sein → Ersatz-Seitenverhältnis, Grösse jede Frame prüfen
import {
  ACESFilmicToneMapping, CanvasTexture, CatmullRomCurve3, Color, MathUtils, PCFShadowMap, PerspectiveCamera, Raycaster, SRGBColorSpace, Vector2, Vector3, VideoTexture, WebGLRenderer,
} from 'three'
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js'
import { buildWorld, SCREEN, TV_SCREEN, HZ, WIN, RW, RH } from './scene.js'
import { createFx } from './fx.js'
import { DESK_W, DESK_H } from '../data/apps.js'

const easeIO = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const clamp01 = (t) => Math.min(1, Math.max(0, t))

// Elemente, in denen Scrollen/Wischen/Tasten nicht zur Navigation gehören
const LOCAL_UI = '.win, .startmenu, .phone-app, .lang-menu, input, textarea, select, [contenteditable="true"]'

const DESK_HOME = {
  position: 'fixed', left: '0px', top: '0px', width: `${DESK_W}px`, height: `${DESK_H}px`,
  zIndex: '-1', pointerEvents: 'none', transform: 'none', transformOrigin: '0 0', overflow: 'hidden',
}

export function createEngine({
  host, deskLayer, hintEls, blackEl,
  labels, startState = 'hall', phoneMode = false, reduceMotion = false, daylight = false,
  tv, wallpaperUrl, posterUrl,
  onState, onReady,
}) {
  /* ---------- Renderer ---------- */
  // Schwächere Geräte (Handy, wenige Kerne, wenig Speicher) starten ohne Kantenglättung
  // und mit 1× Pixeldichte; läuft es trotzdem ruckelig, senkt quality() die Auflösung weiter.
  const lowTier = phoneMode || (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4
  const renderer = new WebGLRenderer({ antialias: !lowTier, powerPreference: lowTier ? 'low-power' : 'high-performance' })
  let pixelRatio = Math.min(window.devicePixelRatio || 1, lowTier && !phoneMode ? 1 : 1.5)
  renderer.setPixelRatio(pixelRatio)
  renderer.setClearColor(0x0b0d12, 1)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = PCFShadowMap
  // Schatten nur neu rechnen, wenn sich etwas bewegt (Tür im Flur), nicht in jedem Bild
  renderer.shadowMap.autoUpdate = false
  renderer.toneMapping = ACESFilmicToneMapping
  renderer.toneMappingExposure = 0.9
  renderer.domElement.setAttribute('aria-hidden', 'true')
  host.appendChild(renderer.domElement)
  RectAreaLightUniformsLib.init()

  const world = buildWorld({ labels, tvPosterUrl: tv.poster, posterUrl, lowTier })
  const { scene, hallScene } = world
  hallScene.updateMatrixWorld() // für Klicks im Flur, auch bevor er gezeichnet wurde
  // weit genug für die Skyline vor dem Fenster
  const camera = new PerspectiveCamera(45, 16 / 10, 50, 9000000)
  // Schattenkarten pro Szene: einmal beim ersten Zeichnen, danach nur bei Bedarf
  const shadowDirty = new Map([[scene, true], [hallScene, true]])
  const fx = createFx(scene, { tv: TV_SCREEN, cats: world.cats, reduceMotion })

  let disposed = false
  const timers = new Set()
  const later = (ms, fn) => {
    const id = setTimeout(() => { timers.delete(id); if (!disposed) fn() }, reduceMotion ? Math.min(ms, 60) : ms)
    timers.add(id)
  }
  const intervals = []
  const listeners = []
  const on = (target, type, fn, opts) => { target.addEventListener(type, fn, opts); listeners.push([target, type, fn, opts]) }

  // Schrift geladen → Canvas-Texte neu zeichnen
  document.fonts?.load('800 50px "Archivo"').then(() => { if (!disposed) world.redrawAll() }).catch(() => {})

  /* ---------- Fernseher: Video, sonst Standbild ---------- */
  const tvVideo = document.createElement('video')
  Object.assign(tvVideo, { src: tv.src, muted: true, loop: true, playsInline: true, autoplay: true, preload: 'auto' })
  tvVideo.setAttribute('aria-hidden', 'true')
  tvVideo.style.cssText = 'position:fixed;left:0;top:0;width:2px;height:2px;opacity:0;pointer-events:none;'
  document.body.appendChild(tvVideo)
  const tvTex = new VideoTexture(tvVideo)
  tvTex.colorSpace = SRGBColorSpace
  on(tvVideo, 'playing', () => { world.tvScreen.material.map = tvTex; world.tvScreen.material.needsUpdate = true })
  // Der Fernseher läuft immer: bei Interaktion, beim Sichtbarwerden und periodisch anstossen
  let tvHold = false // am PC: Fernseher angehalten
  const kickTV = () => { if (!tvHold && tvVideo.paused) tvVideo.play().catch(() => {}) }
  for (const ev of ['pointerdown', 'keydown', 'wheel', 'touchstart']) on(window, ev, kickTV, { passive: true })
  on(document, 'visibilitychange', kickTV)
  intervals.push(setInterval(kickTV, 2500))
  kickTV()

  /* ---------- Bildschirm-Licht: Durchschnittsfarbe des Bildes ---------- */
  const sampleC = document.createElement('canvas')
  sampleC.width = 8; sampleC.height = 5
  const sampleG = sampleC.getContext('2d', { willReadFrequently: true })
  const WHITE = new Color(0xffffff)
  function avgColor(src, out) {
    try {
      sampleG.drawImage(src, 0, 0, 8, 5)
      const d = sampleG.getImageData(0, 0, 8, 5).data
      let r = 0, g = 0, b = 0
      for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2] }
      const n = d.length / 4
      out.setRGB(r / n / 255, g / n / 255, b / n / 255, SRGBColorSpace).lerp(WHITE, 0.3)
    } catch { /* Quelle noch nicht bereit */ }
    return out
  }
  const tvTarget = new Color(0x9fb6ff)
  let tvLum = 0.5, lastSample = 0

  /* ---------- Monitor: Abbild des echten Desktops ---------- */
  const deskCanvas = document.createElement('canvas')
  deskCanvas.width = DESK_W; deskCanvas.height = DESK_H
  const deskTex = new CanvasTexture(deskCanvas)
  deskTex.colorSpace = SRGBColorSpace
  deskTex.anisotropy = 8
  world.screenMesh.material.map = deskTex
  world.screenMesh.material.needsUpdate = true
  const wp = new Image()
  wp.onload = () => {
    if (disposed || hasSnapshot) return
    const g = deskCanvas.getContext('2d'), sc = Math.max(DESK_W / wp.width, DESK_H / wp.height)
    g.drawImage(wp, (DESK_W - wp.width * sc) / 2, (DESK_H - wp.height * sc) / 2, wp.width * sc, wp.height * sc)
    deskTex.needsUpdate = true
    avgColor(deskCanvas, world.monitorLight.color)
  }
  wp.src = wallpaperUrl
  let hasSnapshot = false
  let snapping = null
  function snapshot() {
    if (disposed) return Promise.resolve()
    if (snapping) return snapping
    snapping = import('html2canvas')
      .then(({ default: html2canvas }) => html2canvas(deskLayer, {
        backgroundColor: '#1d2433', scale: 1, useCORS: true, logging: false,
        width: DESK_W, height: DESK_H, windowWidth: DESK_W, windowHeight: DESK_H, x: 0, y: 0, scrollX: 0, scrollY: 0,
        // nur den Desktop klonen, nicht die WebGL-Leinwand oder fremde Videos
        ignoreElements: (el) => el.classList?.contains('mv-canvas') || ((el.tagName === 'CANVAS' || el.tagName === 'VIDEO') && !deskLayer.contains(el)),
        // in der Kopie keine Einblend-Animationen, sonst fehlen frisch geöffnete Fenster
        onclone: (doc) => {
          const st = doc.createElement('style')
          st.textContent = '*,*::before,*::after{animation:none!important;transition:none!important}'
          doc.head.appendChild(st)
        },
      }))
      .then((c) => {
        if (disposed) return
        deskCanvas.getContext('2d').drawImage(c, 0, 0, DESK_W, DESK_H)
        deskTex.needsUpdate = true
        hasSnapshot = true
        avgColor(deskCanvas, world.monitorLight.color)
        world.monitorGlow.color.copy(world.monitorLight.color)
      })
      .catch(() => {})
      .finally(() => { snapping = null })
    return snapping
  }

  /* ---------- Desktop-Ebene: unsichtbar unter der Szene oder flach über dem Monitor ---------- */
  let phone = phoneMode
  function deskHome() { Object.assign(deskLayer.style, DESK_HOME) }
  function deskFlat() {
    const t = Math.tan(MathUtils.degToRad(camera.fov / 2))
    const pxPerMm = innerHeight / (2 * finalDistance() * t)
    const w = SCREEN.w * pxPerMm, h = SCREEN.h * pxPerMm
    Object.assign(deskLayer.style, {
      ...DESK_HOME,
      left: `${(innerWidth - w) / 2}px`, top: `${(innerHeight - h) / 2}px`,
      transform: `scale(${w / DESK_W})`, zIndex: '30', pointerEvents: 'auto',
    })
  }
  deskHome()

  /* ---------- Kamera ---------- */
  const screenCenter = new Vector3(SCREEN.x, SCREEN.y, SCREEN.z)
  const tvCenter = new Vector3(TV_SCREEN.x, TV_SCREEN.y, TV_SCREEN.z)
  const aspect = () => (Number.isFinite(camera.aspect) && camera.aspect > 0 ? camera.aspect : 16 / 10)
  const portrait = () => aspect() < 0.9
  const baseFov = () => (portrait() ? 76 : 45)
  function fitDistance(w, h, margin, fov = baseFov()) {
    const t = Math.tan(MathUtils.degToRad(fov / 2))
    return Math.max(h / 2 / t, w / 2 / (t * aspect())) * margin
  }
  const finalDistance = () => fitDistance(SCREEN.w, SCREEN.h, 1.015)

  // Hochformat (Handy): das ganze Zimmer als Diorama von schräg oben, wie ein Puppenhaus.
  // Wände, die zur Kamera zeigen, verschwinden von selbst (nur ihre Innenseiten werden gezeichnet).
  // Mit dem Finger lässt es sich drehen (yaw).
  const DIORAMA_FOV = 28
  const dioTarget = new Vector3(0, 650, -150)
  const YAW_MAX = 0.9
  let yaw = 0.2, yawVel = 0
  function dioramaPose() {
    const t = Math.tan(MathUtils.degToRad(DIORAMA_FOV / 2))
    const halfW = 3450 + Math.abs(Math.sin(yaw)) * 1500 // gedreht ist das Zimmer breiter
    const dist = Math.max(halfW / (t * aspect()), 3500 / t)
    const elev = 0.95, ce = Math.cos(elev)
    const pos = new Vector3(Math.sin(yaw) * ce, Math.sin(elev), Math.cos(yaw) * ce).multiplyScalar(dist).add(dioTarget)
    return { pos, look: dioTarget.clone(), fov: DIORAMA_FOV }
  }
  const DESK_START = { pos: new Vector3(-900, 1750, 3700), look: new Vector3(-250, 1050, -1500) }
  const roomPose = () => (portrait() ? dioramaPose() : { pos: DESK_START.pos.clone(), look: DESK_START.look.clone(), fov: 45 })

  let posCurve, lookCurve, pathFov = [45, 45]
  function buildPath() {
    const end = screenCenter.clone().add(new Vector3(0, 0, finalDistance()))
    const start = roomPose()
    pathFov = [start.fov, baseFov()]
    posCurve = new CatmullRomCurve3([start.pos, new Vector3(500, 1580, 2300), new Vector3(1500, 1350, 300), new Vector3(2120, 1160, -1150), end], false, 'centripetal')
    lookCurve = new CatmullRomCurve3([start.look, new Vector3(200, 900, -1500), new Vector3(1700, 1000, -2000), new Vector3(2150, 1090, -2300), screenCenter.clone()], false, 'centripetal')
  }
  const tvPose = () => ({ pos: tvCenter.clone().add(new Vector3(0, 0, fitDistance(TV_SCREEN.w, TV_SCREEN.h, 1.25))), look: tvCenter.clone(), fov: baseFov() })
  // Am Fenster: nah an der Scheibe, Blick schräg die Avenue hinunter (Wassertürme, Skyline)
  const WIN_Z = (WIN.z0 + WIN.z1) / 2
  const windowPose = () => portrait()
    ? { pos: new Vector3(-2440, 1560, WIN_Z + 300), look: new Vector3(-6380, 1150, WIN_Z - 2780), fov: 76 }
    : { pos: new Vector3(-2470, 1560, WIN_Z + 550), look: new Vector3(-6800, 1200, WIN_Z - 1950), fov: 45 }
  const HALL = {
    start: { pos: new Vector3(0, 1550, HZ + 1150), look: new Vector3(0, 1300, HZ - 1500) },
    door: { pos: new Vector3(0, 1480, HZ - 1300), look: new Vector3(0, 1420, HZ - 4000) },
    deep: { pos: new Vector3(0, 1450, HZ - 3200), look: new Vector3(0, 1400, HZ - 6000) },
  }
  const pose = { pos: HALL.start.pos.clone(), look: HALL.start.look.clone(), fov: 45 }
  const snap = () => ({ pos: pose.pos.clone(), look: pose.look.clone(), fov: pose.fov })
  const setPose = (p) => { pose.pos.copy(p.pos); pose.look.copy(p.look); if (p.fov) pose.fov = p.fov }
  const lerpPose = (a, b, k) => {
    pose.pos.lerpVectors(a.pos, b.pos, k); pose.look.lerpVectors(a.look, b.look, k)
    const fa = a.fov ?? pose.fov, fb = b.fov ?? fa
    pose.fov = fa + (fb - fa) * k
  }
  const curvePose = (t) => {
    t = clamp01(t); posCurve.getPointAt(t, pose.pos); lookCurve.getPointAt(t, pose.look)
    const f = Math.min(1, t / 0.45) // Blickwinkel früh öffnen (Diorama → Raum)
    pose.fov = pathFov[0] + (pathFov[1] - pathFov[0]) * f * f * (3 - 2 * f)
  }

  let vw = 0, vh = 0
  function resize() {
    if (!innerWidth || !innerHeight) return false
    vw = innerWidth; vh = innerHeight
    camera.aspect = innerWidth / innerHeight
    renderer.setSize(innerWidth, innerHeight)
    buildPath()
    if (state === 'room') setPose(roomPose())
    else if (state === 'pc') curvePose(1)
    else if (state === 'tv') setPose(tvPose())
    else if (state === 'window') setPose(windowPose())
    else pose.fov = baseFov()
    camera.fov = pose.fov
    camera.updateProjectionMatrix()
    if (state === 'pc' && !phone) deskFlat()
    return true
  }
  buildPath()

  /* ---------- Tag und Nacht ---------- */
  // dayK: 0 = Nacht, 1 = Tag. Nur während des Übergangs wird pro Bild etwas umgestellt.
  let dayK = daylight ? 1 : 0, dayFrom = dayK, dayTo = dayK, dayT0 = 0
  const DAY_MS = reduceMotion ? 1 : 1600
  world.setDay(dayK)
  // Lichter mit Intensität 0 ganz weglassen (scene.js setLightMode); wenn die Sonne
  // dazukommt, ihre Schattenkarte einmal neu rechnen
  function syncLightMode() {
    if (world.setLightMode(dayK === 0 ? 'night' : dayK === 1 ? 'day' : 'mix')) shadowDirty.set(scene, true)
  }
  syncLightMode()

  /* ---------- Animationen ---------- */
  const anims = []
  const run = (dur, step, done) => anims.push({ t0: performance.now(), dur: reduceMotion ? Math.min(dur, 300) : dur, step, done })

  /* ---------- Zustände ---------- */
  let state = startState
  const setState = (s) => { state = s; onState?.(s) }
  let hintsDone = false
  let hintsUntil = 0 // Hilfe-Knopf: Hinweise bis zu diesem Zeitpunkt wieder zeigen

  function dingDong() {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext
      const ac = new Ctx()
      for (const [f, t] of [[659.25, 0], [523.25, 0.5]]) {
        for (const [mul, vol] of [[1, 0.22], [2.01, 0.05], [3.02, 0.02]]) {
          const o = ac.createOscillator(), g = ac.createGain()
          o.type = 'sine'; o.frequency.value = f * mul
          const s0 = ac.currentTime + t
          g.gain.setValueAtTime(0, s0)
          g.gain.linearRampToValueAtTime(vol, s0 + 0.01)
          g.gain.exponentialRampToValueAtTime(0.0001, s0 + 1.6)
          o.connect(g).connect(ac.destination)
          o.start(s0); o.stop(s0 + 1.7)
        }
      }
      setTimeout(() => ac.close().catch(() => {}), 2500)
    } catch { /* ohne Ton weiter */ }
  }

  function enterRoom() {
    world.door.rotation.y = 0
    curvePose(0)
    setState('room')
    blackEl.classList.remove('on')
  }
  function arriveAtPC() {
    tvHold = true
    tvVideo.pause()
    if (!phone) deskFlat()
    setState('pc')
  }

  const api = {
    getState: () => state,

    ring() {
      if (state !== 'hall') return
      setState('entering')
      dingDong()
      kickTV()
      world.bellBtn.material.emissiveIntensity = 4
      later(400, () => { world.bellBtn.material.emissiveIntensity = 1.2 })
      later(1000, () => run(1700, (k) => { world.door.rotation.y = 1.7 * easeIO(k) }))
      later(1500, () => {
        const from = snap()
        run(2300, (k) => lerpPose(from, HALL.door, easeIO(k)), () => {
          blackEl.classList.add('on')
          run(1500, (k) => lerpPose(HALL.door, HALL.deep, k * k), () => later(500, enterRoom))
        })
      })
    },

    skipToPC() {
      if (state !== 'hall' && state !== 'room') return
      setState('moving')
      blackEl.classList.add('on')
      later(700, () => {
        world.door.rotation.y = 0
        curvePose(1)
        arriveAtPC()
        blackEl.classList.remove('on')
      })
    },

    goPC() {
      if (state !== 'room') return
      hintsDone = true
      yawVel = 0
      buildPath()
      setState('moving')
      run(2600, (k) => curvePose(easeIO(k)), arriveAtPC)
    },

    goRoom() {
      if (state !== 'pc') return
      setState('moving')
      tvHold = false
      kickTV()
      const back = () => run(2600, (k) => curvePose(easeIO(1 - k)), () => setState('room'))
      if (phone) { snapshot().then(() => { if (!disposed) back() }); return }
      // Standbild stehen lassen, während das Abbild für den Monitor entsteht
      const freeze = deskLayer.cloneNode(true)
      freeze.removeAttribute('id')
      freeze.style.pointerEvents = 'none'
      freeze.setAttribute('aria-hidden', 'true')
      document.body.appendChild(freeze)
      deskHome()
      snapshot().then(() => {
        freeze.remove()
        if (!disposed) back()
      })
    },

    goTV() {
      if (state !== 'room') return
      hintsDone = true
      setState('moving')
      const from = snap(), to = tvPose()
      run(1700, (k) => lerpPose(from, to, easeIO(k)), () => setState('tv'))
    },

    // Fenster: hinschauen und die Stadt ansehen, zurück wie beim Fernseher
    goWindow() {
      if (state !== 'room') return
      hintsDone = true
      setState('moving')
      const from = snap(), to = windowPose()
      run(1900, (k) => lerpPose(from, to, easeIO(k)), () => setState('window'))
    },

    leaveWindow() {
      if (state !== 'window') return
      setState('moving')
      const from = snap(), to = roomPose()
      run(1700, (k) => lerpPose(from, to, easeIO(k)), () => setState('room'))
    },

    leaveTV() {
      if (state !== 'tv') return
      tvVideo.muted = true
      setState('moving')
      const from = snap(), to = roomPose()
      run(1500, (k) => lerpPose(from, to, easeIO(k)), () => setState('room'))
    },

    setTVMuted(muted) {
      tvVideo.muted = muted
      kickTV()
    },

    setLabels(next) { world.setLabels(next) },

    // Licht-Modus: Tag (Sonne durchs Fenster, Lampen aus) oder Nacht (LED-Leisten)
    setDaylight(on) {
      const to = on ? 1 : 0
      if (to === dayTo) return
      dayFrom = dayK; dayTo = to; dayT0 = performance.now()
    },

    // Hilfe-Knopf im Zimmer: "Klick"-Hinweise für ein paar Sekunden wieder einblenden
    showHints(ms = 6000) { hintsUntil = performance.now() + ms },

    setPhoneMode(next) {
      if (phone === next) return
      phone = next
      if (state === 'pc') { if (phone) deskHome(); else deskFlat() }
    },

    // nach Änderungen am Desktop (z. B. Sprache), solange man nicht davor sitzt
    refreshScreen() {
      if (state !== 'pc' || phone) later(150, snapshot)
    },

    dispose() {
      disposed = true
      cancelAnimationFrame(raf)
      for (const id of timers) clearTimeout(id)
      for (const id of intervals) clearInterval(id)
      for (const [target, type, fn, opts] of listeners) target.removeEventListener(type, fn, opts)
      tvVideo.pause()
      tvVideo.removeAttribute('src')
      tvVideo.load()
      tvVideo.remove()
      tvTex.dispose()
      deskTex.dispose()
      fx.dispose()
      world.dispose()
      renderer.dispose()
      renderer.domElement.remove()
      deskHome()
      document.body.style.cursor = ''
      for (const el of Object.values(hintEls)) el?.classList.remove('on')
      blackEl.classList.remove('on')
    },
  }

  /* ---------- Eingaben ---------- */
  const inLocalUI = (target) => target instanceof Element && !!target.closest(LOCAL_UI)
  const onButton = (target) => target instanceof Element && !!target.closest('button, a, [role="button"]')

  on(window, 'wheel', (e) => {
    if (Math.abs(e.deltaY) < 3) return
    if (state === 'room' && e.deltaY > 0) api.goPC()
    else if (state === 'pc' && e.deltaY < 0 && !inLocalUI(e.target)) api.goRoom()
    else if (state === 'tv') api.leaveTV()
    else if (state === 'window') api.leaveWindow()
  }, { passive: true })

  let touchY = null, touchX = 0
  on(window, 'touchstart', (e) => { touchY = e.touches[0]?.clientY ?? null; touchX = e.touches[0]?.clientX ?? 0 }, { passive: true })
  on(window, 'touchend', (e) => {
    if (touchY === null) return
    const dy = touchY - (e.changedTouches[0]?.clientY ?? touchY)
    const dx = touchX - (e.changedTouches[0]?.clientX ?? touchX)
    touchY = null
    if (Math.abs(dy) < 40 || Math.abs(dx) > Math.abs(dy)) return
    if (state === 'room' && dy > 0) api.goPC()
    else if (state === 'pc' && dy < 0 && !inLocalUI(e.target)) api.goRoom()
    else if (state === 'tv') api.leaveTV()
    else if (state === 'window') api.leaveWindow()
  }, { passive: true })

  on(window, 'keydown', (e) => {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || inLocalUI(e.target)) return
    const key = e.key
    if (state === 'hall' && (key === 'Enter' || key === ' ') && !onButton(e.target)) { e.preventDefault(); api.ring() }
    else if (state === 'room' && ['ArrowDown', 'PageDown', ' '].includes(key) && !onButton(e.target)) { e.preventDefault(); api.goPC() }
    else if (state === 'pc' && ['ArrowUp', 'PageUp'].includes(key) && !onButton(e.target)) api.goRoom()
    else if (state === 'tv' && ['Escape', 'ArrowUp', 'Backspace'].includes(key)) api.leaveTV()
    else if (state === 'window' && ['Escape', 'ArrowUp', 'Backspace'].includes(key)) api.leaveWindow()
  })

  const ray = new Raycaster(), ndc = new Vector2()
  function pick(x, y) {
    const targets = state === 'hall' ? [world.slab, world.plate, world.bellBtn, world.bellLabel] : state === 'room' ? [world.tvHit, world.pcHit, world.winHit] : null
    if (!targets) return null
    ndc.set((x / innerWidth) * 2 - 1, -(y / innerHeight) * 2 + 1)
    ray.setFromCamera(ndc, camera)
    return ray.intersectObjects(targets, false)[0]?.object ?? null
  }
  // Diorama drehen: horizontal ziehen (Finger oder Maus), mit etwas Nachschwung
  let drag = null, dragMoved = false
  const YAW_PER_PX = () => 1.7 / Math.max(320, innerWidth)
  const clampYaw = (v) => Math.max(-YAW_MAX, Math.min(YAW_MAX, v))
  on(renderer.domElement, 'pointerdown', (e) => {
    dragMoved = false
    if (state !== 'room' || !portrait()) return
    drag = { x: e.clientX, y: e.clientY, yaw0: yaw, lastX: e.clientX, lastT: performance.now() }
    yawVel = 0
  })
  on(window, 'pointermove', (e) => {
    if (!drag) return
    if (Math.abs(e.clientX - drag.x) > 8 || Math.abs(e.clientY - drag.y) > 8) dragMoved = true
    const now = performance.now()
    yaw = clampYaw(drag.yaw0 - (e.clientX - drag.x) * YAW_PER_PX())
    yawVel = (-(e.clientX - drag.lastX) * YAW_PER_PX() / Math.max(8, now - drag.lastT)) * 1000
    drag.lastX = e.clientX; drag.lastT = now
    setPose(dioramaPose())
  }, { passive: true })
  const endDrag = () => { if (drag && performance.now() - drag.lastT > 80) yawVel = 0; drag = null }
  on(window, 'pointerup', endDrag)
  on(window, 'pointercancel', endDrag)

  on(renderer.domElement, 'click', (e) => {
    if (dragMoved) return // war ein Ziehen, kein Tippen
    if ((state !== 'hall' && state !== 'room') || onButton(e.target) || inLocalUI(e.target)) return
    const hit = pick(e.clientX, e.clientY)
    if (!hit) return
    if (state === 'hall') api.ring()
    else if (hit === world.pcHit) api.goPC()
    else if (hit === world.winHit) api.goWindow()
    else api.goTV()
  })
  on(window, 'pointermove', (e) => {
    if (e.pointerType === 'touch') return
    const pointer = (state === 'hall' || state === 'room') && !onButton(e.target) && !!pick(e.clientX, e.clientY)
    document.body.style.cursor = pointer ? 'pointer' : ''
  }, { passive: true })

  /* ---------- Startzustand ---------- */
  resize()
  if (startState === 'pc') { curvePose(1); arriveAtPC() }
  else if (startState === 'room') curvePose(0)

  // erstes Abbild, sobald Schrift und Bilder geladen sind; danach jede Minute (Uhr)
  Promise.all([
    document.fonts?.ready ?? Promise.resolve(),
    new Promise((res) => (document.readyState === 'complete' ? res() : on(window, 'load', res, { once: true }))),
  ]).then(() => {
    if (disposed) return
    world.redrawAll()
    later(400, () => { if (state !== 'pc' || phone) snapshot() })
  })
  intervals.push(setInterval(() => { if (!document.hidden && (state === 'hall' || state === 'room' || state === 'tv' || (state === 'pc' && phone))) snapshot() }, 60000))

  /* ---------- Bildschleife ---------- */
  const projV = new Vector3()
  const hintList = [
    { el: hintEls.tv, at: new Vector3(TV_SCREEN.x, 1230, TV_SCREEN.z) },
    { el: hintEls.pc, at: new Vector3(SCREEN.x, 1300, SCREEN.z) },
    { el: hintEls.win, at: new Vector3(-RW / 2 + 10, WIN.y1 + 130, WIN.z0 + 220) }, // hinterer Rand: früher im Bild
  ]
  let last = performance.now(), lastRender = 0, raf = 0, readySent = false

  // Automatische Qualität: misst die Bildzeit, solange die Szene durchgehend gezeichnet
  // wird. Im Schnitt über 28 ms (unter ~35 Bilder/s) → Pixeldichte um eine Stufe senken.
  // Es wird nur gesenkt, nie wieder erhöht (kein Hin und Her).
  let qSum = 0, qCount = 0, qSkip = 30
  function quality(ms) {
    if (qSkip > 0 || ms > 250) { if (qSkip > 0) qSkip--; return } // Ladespitzen und Pausen nicht mitzählen
    qSum += ms; qCount++
    if (qCount < 90) return
    const avg = qSum / qCount
    qSum = 0; qCount = 0
    if (avg > 28 && pixelRatio > 0.6) {
      pixelRatio = Math.max(0.6, pixelRatio - 0.25)
      renderer.setPixelRatio(pixelRatio)
      renderer.setSize(vw, vh)
      qSkip = 30
    }
  }

  let lastDraw = -Infinity
  const BG_NIGHT = new Color(0x0b0d12), BG_DAY = new Color(0xd6cfc4), bgNow = new Color(0x0b0d12), bgLast = new Color(0x0b0d12)
  function frame(now) {
    raf = requestAnimationFrame(frame)
    // höchstens ~60–80 Bilder/s: Bildschirme mit 120/144 Hz würden sonst doppelt so oft rechnen
    if (now - lastDraw < 10) return
    lastDraw = now
    const frameMs = now - last
    const dt = Math.min(0.05, frameMs / 1000)
    last = now
    if ((innerWidth !== vw || innerHeight !== vh) && !resize()) return

    for (const a of [...anims]) {
      const k = clamp01((now - a.t0) / a.dur)
      a.step(k)
      if (k >= 1) { anims.splice(anims.indexOf(a), 1); a.done?.() }
    }
    if (disposed) return

    // Am PC deckt der Desktop (bzw. auf dem Handy die Handy-Oberfläche) die Szene fast
    // ganz ab: dann nur selten neu zeichnen, spart Akku und Lüfter
    if (state === 'pc' && anims.length === 0 && readySent && now - lastRender < (phone ? 1000 : 250)) return
    lastRender = now

    // Fernseh-Licht folgt der Farbe und Helligkeit des laufenden Films
    if (!tvHold && now - lastSample > 180 && world.tvScreen.material.map === tvTex && tvVideo.readyState >= 2) {
      lastSample = now
      avgColor(tvVideo, tvTarget)
      tvLum = tvTarget.r * 0.3 + tvTarget.g * 0.59 + tvTarget.b * 0.11
    }
    world.tvLight.color.lerp(tvTarget, 0.08)
    world.tvGlow.color.copy(world.tvLight.color)
    world.tvLight.intensity = 2.2 + tvLum * 2.4
    world.tvGlow.intensity = 0.18 + tvLum * 0.25

    if (dayK !== dayTo) {
      const k = clamp01((now - dayT0) / DAY_MS)
      dayK = k >= 1 ? dayTo : dayFrom + (dayTo - dayFrom) * easeIO(k)
      world.setDay(dayK)
      syncLightMode()
    }

    // Leben im Zimmer: Katzen atmen, Noten und "Zzz" steigen auf
    const roomVisible = state === 'room' || state === 'tv' || state === 'moving' || state === 'window'
    if (roomVisible) {
      const t = now / 1000
      for (const c of world.cats) {
        const b = Math.sin(t * 1.9 + c.phase)
        c.body.scale.y = c.baseY * (1 + b * 0.035)
        c.body.scale.x = c.baseX * (1 + b * 0.012)
      }
    }
    fx.update(dt, now / 1000, { active: roomVisible, tvPlaying: world.tvScreen.material.map === tvTex && !tvVideo.paused })

    if (state === 'hall' || state === 'entering') {
      const e = now / 1000
      for (const m of world.fog) { m.rotation.z += m.userData.spin * dt; m.position.x += Math.sin(e * 0.3 + m.userData.drift) * 20 * dt }
    }

    // Diorama: Nachschwung nach dem Loslassen
    if (state === 'room' && portrait() && !drag && yawVel) {
      yaw = clampYaw(yaw + yawVel * dt)
      yawVel *= Math.pow(0.03, dt)
      if (Math.abs(yawVel) < 0.01 || Math.abs(yaw) >= YAW_MAX) yawVel = 0
      setPose(dioramaPose())
    }
    if (camera.fov !== pose.fov) { camera.fov = pose.fov; camera.updateProjectionMatrix() }

    camera.position.copy(pose.pos)
    // am Fenster wiegt der Blick ganz leicht: so sieht man, dass die Stadt räumlich ist
    if (state === 'window' && !reduceMotion) {
      const t = now / 1000
      camera.position.z += Math.sin(t * 0.32) * 70
      camera.position.y += Math.sin(t * 0.21) * 22
    }
    camera.lookAt(pose.look)
    camera.updateMatrixWorld()
    // Stadt: nur Kacheln zeichnen, die man durchs Fenster sieht (am PC nie im Bild).
    // Von oben (Diorama) keine Stadt: das Zimmer schwebt vor einem ruhigen Hintergrund.
    const fromAbove = pose.pos.y > RH + 400
    if (state === 'pc' || fromAbove) world.city.hide()
    else world.city.cull(camera)
    bgNow.copy(BG_NIGHT)
    if (fromAbove) bgNow.lerp(BG_DAY, dayK)
    if (!bgNow.equals(bgLast)) { renderer.setClearColor(bgNow, 1); bgLast.copy(bgNow) }
    // Raumnebel (ab 7 m) würde das Diorama aus 30 m Entfernung verschlucken
    scene.fog.near = fromAbove ? 1e8 : 7000
    scene.fog.far = fromAbove ? 2e8 : 14000
    // von oben wirkt das nur innen beleuchtete Zimmer dunkel: Belichtung mit der Höhe sanft anheben
    const lift = Math.min(1, Math.max(0, (pose.pos.y - RH) / 8000))
    renderer.toneMappingExposure = 0.9 + lift * (0.75 - dayK * 0.45)

    // im Diorama sind die Hinweise Knöpfe mit Namen und bleiben sichtbar (kein Hover auf dem Handy)
    const showHints = state === 'room' && (portrait() || !hintsDone || now < hintsUntil)
    for (const { el, at } of hintList) {
      if (!el) continue
      projV.copy(at).project(camera)
      // ausserhalb des Bildes (z. B. Fenster auf schmalen Bildschirmen): Hinweis weglassen
      const onScreen = projV.z < 1 && Math.abs(projV.x) < 0.94 && projV.y < 0.95
      el.classList.toggle('on', showHints && onScreen)
      if (!showHints || !onScreen) continue
      el.style.transform = `translate(${((projV.x + 1) / 2) * innerWidth}px, ${((1 - projV.y) / 2) * innerHeight}px) translate(-50%, -100%)`
    }

    // Flur und Zimmer liegen weit auseinander: die Kamera entscheidet, welche Szene gilt
    const active = pose.pos.z > HZ / 2 && pose.pos.y < RH ? hallScene : scene // Flur-Kameras stehen nie über Deckenhöhe
    if (active === hallScene && state === 'entering') shadowDirty.set(hallScene, true) // Tür geht auf
    renderer.shadowMap.needsUpdate = shadowDirty.get(active)
    renderer.render(active, camera)
    shadowDirty.set(active, false)
    if (state === 'pc' && anims.length === 0) qSkip = 30 // gedrosselt: nicht messen
    else if (!document.hidden) quality(frameMs)
    if (!readySent) { readySent = true; onReady?.() }
  }
  // nur in der Entwicklung: Kamera frei setzen, um Details zu prüfen
  if (import.meta.env.DEV) {
    api.debugPose = (p, l) => { pose.pos.set(...p); pose.look.set(...l) }
    api.debugWorld = world
    api.debugRenderer = renderer
    api.debugCamera = camera
    api.debugSetDay = (k) => { world.setDay(k); world.setLightMode(k === 0 ? 'night' : k === 1 ? 'day' : 'mix') }
  }

  raf = requestAnimationFrame(frame)
  // Zimmer-Shader für alle drei Lichtmodi vorab übersetzen (im Flur bzw. kurz nach dem Start),
  // aktueller Modus zuerst; so ruckelt weder das Eintreten noch der Tag/Nacht-Wechsel
  function precompile() {
    const current = () => (dayK === 0 ? 'night' : dayK === 1 ? 'day' : 'mix')
    const modes = [current(), ...['night', 'mix', 'day'].filter((m) => m !== current())]
    const next = () => {
      if (disposed || !modes.length) return
      world.setLightMode(modes.shift())
      renderer.compileAsync?.(scene, camera).catch(() => {})
      world.setLightMode(current())
      later(500, next)
    }
    next()
  }
  later(startState === 'hall' ? 1200 : 2500, precompile)

  return api
}

