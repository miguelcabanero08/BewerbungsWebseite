// Kleiner 3D-Viewer für die Blender-Modelle. Wird erst geladen, wenn jemand auf
// "In 3D ansehen" klickt (eigener Chunk, teilt sich three.js mit dem Zimmer).
// Sparsam für schwache Geräte:
//  - unbewegte Modelle werden nur gezeichnet, wenn man sie dreht (kein Dauer-Loop)
//  - Animationen laufen mit höchstens 30 Bildern/s und nur, solange der Viewer sichtbar ist
//  - niedrige Pixeldichte, kein Schatten, beim Schliessen wird alles freigegeben
import {
  AnimationMixer, Box3, Color, DirectionalLight, HemisphereLight, LoopRepeat, PerspectiveCamera, Scene, SRGBColorSpace, Vector3, WebGLRenderer,
} from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

const FRAME_MS = 1000 / 30

export function createViewer(container, { src, onReady, onError }) {
  const dpr = window.devicePixelRatio || 1
  const renderer = new WebGLRenderer({ antialias: dpr < 2, powerPreference: 'low-power' })
  renderer.setPixelRatio(Math.min(dpr, 1.25))
  renderer.outputColorSpace = SRGBColorSpace
  renderer.domElement.className = 'mv-canvas'
  container.appendChild(renderer.domElement)

  const scene = new Scene()
  scene.background = new Color(0x1b1d24)
  scene.add(new HemisphereLight(0xdfe6ff, 0x30302a, 1.6))
  const key = new DirectionalLight(0xffffff, 2.2)
  key.position.set(3, 5, 4)
  const rim = new DirectionalLight(0xa595ff, 1.2)
  rim.position.set(-4, 2, -3)
  scene.add(key, rim)

  const camera = new PerspectiveCamera(35, 1, 0.01, 100)
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enablePan = false
  controls.addEventListener('change', () => requestRender())

  let mixer = null, actions = {}, current = null, playing = true
  let raf = 0, last = 0, visible = true, disposed = false, model = null

  function resize() {
    const w = container.clientWidth, h = container.clientHeight
    if (!w || !h) return
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    requestRender()
  }
  const ro = new ResizeObserver(resize)
  ro.observe(container)
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; requestRender() })
  io.observe(container)
  const onVis = () => requestRender()
  document.addEventListener('visibilitychange', onVis)

  function animating() { return !!(mixer && current && playing && visible && !document.hidden) }

  function tick(now) {
    raf = 0
    if (disposed) return
    if (animating()) {
      if (now - last >= FRAME_MS) {
        mixer.update(Math.min(0.1, (now - last) / 1000))
        last = now
        renderer.render(scene, camera)
      }
      raf = requestAnimationFrame(tick)
    } else {
      renderer.render(scene, camera)
    }
  }
  function requestRender() {
    if (disposed || raf) return
    last = performance.now() - FRAME_MS
    raf = requestAnimationFrame(tick)
  }

  new GLTFLoader().load(
    src,
    (gltf) => {
      if (disposed) return
      model = gltf.scene
      scene.add(model)
      // Kamera auf das Modell ausrichten
      const box = new Box3().setFromObject(model)
      const size = box.getSize(new Vector3()), center = box.getCenter(new Vector3())
      const radius = Math.max(size.x, size.y, size.z) * 0.5
      const dist = radius / Math.sin((camera.fov * Math.PI) / 360) * 1.15
      controls.target.copy(center)
      camera.position.copy(center).add(new Vector3(0.45, 0.25, 1).normalize().multiplyScalar(dist))
      camera.near = dist / 100; camera.far = dist * 10
      camera.updateProjectionMatrix()
      controls.minDistance = dist * 0.4; controls.maxDistance = dist * 2.5
      controls.update()
      if (gltf.animations.length) {
        mixer = new AnimationMixer(model)
        for (const clip of gltf.animations) actions[clip.name] = mixer.clipAction(clip)
      }
      resize()
      onReady?.(gltf.animations.map((c) => c.name))
    },
    undefined,
    (err) => { if (!disposed) onError?.(err) },
  )

  const api = {
    play(name) {
      const next = actions[name]
      if (!next) return
      if (current && current !== next) current.fadeOut(0.25)
      next.reset().setLoop(LoopRepeat, Infinity).fadeIn(current ? 0.25 : 0).play()
      current = next
      requestRender()
    },
    setPlaying(on) { playing = on; requestRender() },
    dispose() {
      disposed = true
      cancelAnimationFrame(raf)
      ro.disconnect(); io.disconnect()
      document.removeEventListener('visibilitychange', onVis)
      controls.dispose()
      mixer?.stopAllAction()
      model?.traverse((o) => {
        if (!o.isMesh) return
        o.geometry.dispose()
        for (const m of [].concat(o.material)) {
          for (const v of Object.values(m)) if (v?.isTexture) v.dispose()
          m.dispose()
        }
      })
      renderer.dispose()
      renderer.forceContextLoss()
      renderer.domElement.remove()
    },
  }
  if (import.meta.env.DEV) window.__viewer = { api, step(s) { mixer?.update(s); renderer.render(scene, camera) }, get state() { return { visible, playing, hidden: document.hidden, hasMixer: !!mixer, current: current?.getClip().name, time: current?.time, raf } } }
  return api
}
