// Baut Flur und Zimmer. Einheiten: Millimeter. Übernommen aus dem freigegebenen
// Mockup (design/mockups/zimmer.html); Regeln siehe DESIGN.md:
//  - selbstleuchtend (MeshBasicMaterial) sind nur Bildschirme, LED-Leisten und der
//    Nachthimmel im Fenster, alles andere ist matt (MeshStandardMaterial)
//  - Möbel als Gruppe in lokalen Koordinaten bauen, dann als Ganzes platzieren
import {
  AdditiveBlending, BackSide, BoxGeometry, CanvasTexture, CapsuleGeometry, Color, ConeGeometry, CylinderGeometry, DirectionalLight, DoubleSide, Fog, Group, HemisphereLight, InstancedMesh, Mesh, MeshBasicMaterial, MeshStandardMaterial, Object3D, Path, PlaneGeometry, PointLight, RectAreaLight, RepeatWrapping, SRGBColorSpace, Scene, Shape, ShapeGeometry, Quaternion, SphereGeometry, SpotLight, TextureLoader, TorusGeometry, Vector3,
} from 'three'
import {
  paintPlaster, paintWood, paintFabric, paintKnit, paintCardboard, paintPizzaLid,
  paintTerracotta, paintBrushed, paintSisal, paintPlush, paintTabby,
} from './textures.js'
import { createCity } from './city.js'
import { mergeStatic } from './optimize.js'

export const RW = 6000
export const RD = 5000
export const RH = 2600
export const HZ = 12000 // Flur liegt weit weg vom Zimmer, damit er eigenes Licht hat
export const SCREEN = { w: 560, h: 350, x: 2150, y: 1095, z: -2318 }
export const TV_SCREEN = { w: 1110, h: 624, x: -1200, y: 855, z: -2264 }
export const LED = 0xa595ff

// Fensteröffnung in der linken Wand (z: von–bis, y: Brüstung–Sturz) und Richtung zur Sonne
export const WIN = { z0: -950, z1: 550, y0: 800, y1: 2220 }
export const SUN_DIR = new Vector3(-1, 0.62, 0.45).normalize()

export function buildWorld({ labels, tvPosterUrl, posterUrl, lowTier = false }) {
  // Zwei Szenen: Zimmer (mit Stadt) und Flur. Gezeichnet wird immer nur eine, so rechnet
  // das Zimmer die Flurlampen nicht mit und umgekehrt.
  const scene = new Scene()
  scene.fog = new Fog(0x0b0d12, 7000, 14000)
  const hallScene = new Scene()
  hallScene.fog = scene.fog
  const disposables = []
  const track = (o) => { disposables.push(o); return o }

  const mat = (color, o = {}) => track(new MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, ...o }))
  let target = scene
  const add = (o) => { target.add(o); return o }
  function box(w, h, d, material, x, y, z, ry = 0) {
    const m = new Mesh(track(new BoxGeometry(w, h, d)), typeof material === 'number' ? mat(material) : material)
    m.position.set(x, y + h / 2, z)
    m.rotation.y = ry
    m.castShadow = m.receiveShadow = true
    return add(m)
  }
  function cyl(rt, rb, h, material, x, y, z, seg = 24) {
    const m = new Mesh(track(new CylinderGeometry(rt, rb, h, seg)), typeof material === 'number' ? mat(material) : material)
    m.position.set(x, y + h / 2, z)
    m.castShadow = m.receiveShadow = true
    return add(m)
  }

  // Deterministischer Zufall: das Zimmer sieht bei jedem Besuch gleich aus
  let seed = 7
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647

  // Canvas-Texturen; nach dem Laden der Schrift neu gezeichnet
  const redraws = []
  function canvasTex(w, h, draw, repeat, fonts = true) {
    const c = document.createElement('canvas')
    c.width = w
    c.height = h
    draw(c.getContext('2d'), w, h)
    const t = track(new CanvasTexture(c))
    t.colorSpace = SRGBColorSpace
    t.anisotropy = 8
    if (repeat) {
      t.wrapS = t.wrapT = RepeatWrapping
      t.repeat.set(...repeat)
    }
    const redraw = () => { draw(c.getContext('2d'), w, h); t.needsUpdate = true }
    if (fonts) redraws.push(redraw)
    return Object.assign(t, { redraw })
  }
  const loader = new TextureLoader()
  const loadTex = (url) => { const t = track(loader.load(url)); t.colorSpace = SRGBColorSpace; return t }

  let text = { ...labels }

  // Materialtexturen (textures.js), eigener Zufall pro Textur → immer gleich
  const seeded = (sd) => { let v = sd; return () => (v = (v * 16807) % 2147483647) / 2147483647 }
  const paintTex = (w, h, painter, { repeat, seed: sd = 1, opts, fonts = false } = {}) =>
    canvasTex(w, h, (g, W, H) => painter(g, W, H, seeded(sd), opts), repeat, fonts)
  const T = {
    plaster: paintTex(512, 512, paintPlaster, { repeat: [5, 2.2], seed: 3 }),
    ceiling: paintTex(512, 512, paintPlaster, { repeat: [5, 4], seed: 5 }),
    laminate: paintTex(256, 256, paintPlaster, { repeat: [2, 1], seed: 61 }),
    fabric: paintTex(256, 256, paintFabric, { repeat: [4, 2], seed: 9 }),
    fabricDark: paintTex(256, 256, paintFabric, { repeat: [2, 2], seed: 13, opts: { base: 200, contrast: 40 } }),
    knit: paintTex(256, 256, paintKnit, { repeat: [2, 3], seed: 17 }),
    oak: paintTex(512, 256, paintWood, { seed: 19, opts: { light: '#c9a27a', mid: '#a9825a', dark: '#5c3d22' } }),
    walnut: paintTex(512, 256, paintWood, { seed: 23, opts: { light: '#5a4232', mid: '#46322a', dark: '#1c120c', knots: 1 } }),
    pine: paintTex(512, 256, paintWood, { seed: 29, opts: { light: '#c8a073', mid: '#a57d52', dark: '#6a4a2c' } }),
    doorWood: paintTex(512, 512, paintWood, { seed: 31, opts: { light: '#6e4630', mid: '#5a3826', dark: '#2a170c', knots: 1 } }),
    guitarWood: paintTex(512, 256, paintWood, { seed: 37, opts: { light: '#c06a30', mid: '#9a5524', dark: '#4a2410', knots: 0 } }),
    cardboard: paintTex(256, 256, paintCardboard, { seed: 41 }),
    cardboardPlain: paintTex(256, 256, paintCardboard, { seed: 43, opts: { tape: false } }),
    pizza: paintTex(256, 256, paintPizzaLid, { seed: 47, fonts: true }),
    terracotta: paintTex(256, 256, paintTerracotta, { seed: 53 }),
    brushed: paintTex(256, 256, paintBrushed, { seed: 59 }),
    sisal: paintTex(128, 256, paintSisal, { repeat: [3, 7], seed: 67 }),
    plush: paintTex(256, 256, paintPlush, { repeat: [2, 2], seed: 71 }),
    plushGrey: paintTex(256, 256, paintPlush, { repeat: [2, 2], seed: 73, opts: { base: [150, 146, 156] } }),
    // einfarbig blaugrau wie die Katze im Film CatSleep
    furBlueGrey: paintTex(256, 256, paintTabby, { seed: 79, opts: { base: '#8f949e', stripe: '#5d626b', belly: 'rgba(176,181,190,0.9)', stripes: false } }),
    // getigert wie die echte Katze: grau mit schwarzen Streifen
    tabbyGrey: paintTex(256, 256, paintTabby, { seed: 83, opts: { base: '#9a9a96', stripe: '#1e1e20', belly: 'rgba(214,214,208,0.92)', stripeW: 2.6, stripeA: 0.42 } }),
  }
  // Holz/Karton tragen ihre Farbe selbst (Materialfarbe weiss); Putz/Stoff werden eingefärbt
  const tex = (map, bumpScale, o = {}) => ({ map, bumpMap: map, bumpScale, ...o })

  /* ---------------- Zimmer ---------------- */
  const floorTex = canvasTex(1024, 1024, (g, w, h) => {
    seed = 11
    const rows = 8, rh = h / rows
    for (let r = 0; r < rows; r++) {
      let x = -rnd() * 400
      while (x < w) {
        const len = 300 + rnd() * 350, l = 46 + rnd() * 10
        g.fillStyle = `hsl(30, ${28 + rnd() * 10}%, ${l}%)`
        g.fillRect(x, r * rh, len, rh)
        for (let k = 0; k < 14; k++) {
          g.strokeStyle = `rgba(60,35,15,${0.05 + rnd() * 0.06})`
          g.beginPath()
          const yy = r * rh + rnd() * rh
          g.moveTo(x, yy)
          g.bezierCurveTo(x + len * 0.3, yy + rnd() * 6 - 3, x + len * 0.6, yy + rnd() * 6 - 3, x + len, yy)
          g.stroke()
        }
        g.fillStyle = 'rgba(40,24,10,.55)'
        g.fillRect(x, r * rh, 2, rh)
        x += len
      }
      g.fillStyle = 'rgba(40,24,10,.5)'
      g.fillRect(0, r * rh, w, 2)
    }
  }, [3, 2.5])
  const rugTex = canvasTex(512, 512, (g, w, h) => {
    seed = 31
    g.fillStyle = '#5b3f3a'; g.fillRect(0, 0, w, h)
    g.strokeStyle = '#7d5a4c'; g.lineWidth = 14; g.strokeRect(30, 30, w - 60, h - 60)
    g.strokeStyle = '#3f2a27'; g.lineWidth = 4; g.strokeRect(58, 58, w - 116, h - 116)
    for (let i = 0; i < 5000; i++) { g.fillStyle = `rgba(0,0,0,${rnd() * 0.08})`; g.fillRect(rnd() * w, rnd() * h, 2, 2) }
  })
  seed = 7

  const wallMat = mat(0xc6c4d6, { roughness: 0.95, ...tex(T.plaster, 1.2) })
  const plane = (w, h, material) => new Mesh(track(new PlaneGeometry(w, h)), material)
  const floor = add(plane(RW, RD, mat(0xffffff, { map: floorTex, bumpMap: floorTex, bumpScale: 1.5, roughness: 0.7 })))
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true
  const ceil = add(plane(RW, RD, mat(0xd8d4cc, tex(T.ceiling, 1))))
  ceil.rotation.x = Math.PI / 2; ceil.position.y = RH
  const back = add(plane(RW, RH, wallMat)); back.position.set(0, RH / 2, -RD / 2); back.receiveShadow = true
  // linke Wand mit echtem Fensterloch (UVs wie bei einer normalen Fläche, damit der Putz gleich aussieht)
  const wallShape = new Shape().moveTo(-RD / 2, -RH / 2).lineTo(RD / 2, -RH / 2).lineTo(RD / 2, RH / 2).lineTo(-RD / 2, RH / 2).closePath()
  // lokal x = -Welt-z (die Wand ist um 90° gedreht)
  wallShape.holes.push(new Path().moveTo(-WIN.z1, WIN.y0 - RH / 2).lineTo(-WIN.z0, WIN.y0 - RH / 2).lineTo(-WIN.z0, WIN.y1 - RH / 2).lineTo(-WIN.z1, WIN.y1 - RH / 2).closePath())
  const leftGeo = track(new ShapeGeometry(wallShape))
  {
    const p = leftGeo.attributes.position, uv = leftGeo.attributes.uv
    for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + RD / 2) / RD, (p.getY(i) + RH / 2) / RH)
  }
  const leftMat = track(wallMat.clone()); leftMat.shadowSide = DoubleSide
  const left = add(new Mesh(leftGeo, leftMat)); left.rotation.y = Math.PI / 2; left.position.set(-RW / 2, RH / 2, 0)
  left.receiveShadow = left.castShadow = true
  const right = add(plane(RD, RH, wallMat)); right.rotation.y = -Math.PI / 2; right.position.set(RW / 2, RH / 2, 0); right.receiveShadow = true
  box(RW, 90, 14, 0xe6e2da, 0, 0, -RD / 2 + 7)
  box(14, 90, RD, 0xe6e2da, -RW / 2 + 7, 0, 0)
  box(14, 90, RD, 0xe6e2da, RW / 2 - 7, 0, 0)
  // Schnittkanten fürs Handy-Diorama (von oben): Wandkronen und Bodenplatte, dunkel wie ein
  // Modell-Schnitt. Liegen über der Decke bzw. unter dem Boden, im Zimmer also nie sichtbar.
  const cut = mat(0x17161c, { roughness: 1 })
  box(RW + 500, 40, 250, cut, 0, RH, -RD / 2 - 125)
  box(250, 40, RD + 250, cut, -RW / 2 - 125, RH, -125)
  box(250, 40, RD + 250, cut, RW / 2 + 125, RH, -125)
  box(RW + 500, 300, RD + 250, cut, 0, -315, -125) // knapp unter dem Boden, sonst flimmern die Flächen

  // Fenster links: echtes Loch in der Wand, dahinter die Stadt (city.js).
  // Schwarzer Stahlrahmen wie in einem New Yorker Loft, Laibung 25 cm tief.
  const winW = WIN.z1 - WIN.z0, winH = WIN.y1 - WIN.y0, winZ = (WIN.z0 + WIN.z1) / 2
  const reveal = mat(0xbdbacb, { roughness: 0.95 })
  box(250, 60, winW + 120, reveal, -RW / 2 - 125, WIN.y1, winZ)
  box(250, 60, winW + 120, reveal, -RW / 2 - 125, WIN.y0 - 60, winZ)
  box(250, winH, 60, reveal, -RW / 2 - 125, WIN.y0, WIN.z0 - 30)
  box(250, winH, 60, reveal, -RW / 2 - 125, WIN.y0, WIN.z1 + 30)
  const steel = mat(0x17171a, { roughness: 0.45, metalness: 0.4 })
  const frameX = -RW / 2 - 70
  box(50, 55, winW, steel, frameX, WIN.y1 - 55, winZ); box(50, 55, winW, steel, frameX, WIN.y0, winZ)
  box(50, winH, 55, steel, frameX, WIN.y0, WIN.z0 + 27); box(50, winH, 55, steel, frameX, WIN.y0, WIN.z1 - 27)
  for (const k of [1 / 3, 2 / 3]) box(40, winH, 30, steel, frameX, WIN.y0, WIN.z0 + winW * k)
  for (const k of [0.36, 0.7]) box(40, 30, winW, steel, frameX, WIN.y0 + winH * k, winZ)
  box(170, 35, winW + 160, 0xe9e6df, -RW / 2 + 85, WIN.y0 - 35, winZ)
  const glassMat = track(new MeshBasicMaterial({ color: 0xb8c4ff, transparent: true, opacity: 0.1, depthWrite: false, fog: false }))
  const glass = add(plane(winW, winH, glassMat)); glass.rotation.y = Math.PI / 2; glass.position.set(frameX - 5, WIN.y0 + winH / 2, winZ)

  // Teppich
  const rug = add(new Mesh(track(new BoxGeometry(2500, 8, 1900)), mat(0xffffff, { map: rugTex, roughness: 1 })))
  rug.position.set(-1200, 4, -150); rug.receiveShadow = true

  // Sofa (abgewetzt, olivgrün)
  const sofa = mat(0x6b6a3e, { roughness: 0.95, ...tex(T.fabric, 2) })
  const cushion = mat(0x75744a, { roughness: 1, ...tex(T.fabric, 2) })
  box(2000, 380, 900, sofa, -1200, 0, 750)
  box(790, 140, 760, cushion, -1600, 380, 690)
  box(790, 140, 760, cushion, -800, 380, 690)
  box(2000, 480, 210, sofa, -1200, 380, 1095)
  box(200, 300, 900, sofa, -2100, 380, 750)
  box(200, 300, 900, sofa, -300, 380, 750)
  const blanket = box(560, 22, 820, mat(0xffffff, { roughness: 1, ...tex(T.knit, 2.5) }), -820, 520, 700, 0.08)
  blanket.rotation.z = 0.04

  // Miguel auf dem Sofa (links), schaut Fernsehen. Nur von hinten/der Seite zu sehen,
  // daher kein Gesicht. Referenz: Hintergrundbild am PC (dunkle Locken, United-Trikot).
  // Lokale Koordinaten (Gruppe skaliert 0.85): x seitlich, y ab Boden, z = 0 an der Hüfte, Blick nach -z.
  const me = new Group()
  const skin = mat(0xb98466, { roughness: 0.8 })
  const shirt = mat(0xb3122a, { roughness: 0.9 })
  const pants = mat(0x25272e, { roughness: 1, ...tex(T.fabricDark, 1.5) })
  const hairMat = mat(0x17110d, { roughness: 1 })
  const shoe = mat(0xe6e3dc, { roughness: 0.7 })
  const meAdd = (m) => { m.castShadow = m.receiveShadow = true; me.add(m); return m }
  const up = new Vector3(0, 1, 0)
  const ball = track(new SphereGeometry(1, 16, 12))
  function joint(p, r, material, sx = 1, sy = 1, sz = 1) {
    const m = meAdd(new Mesh(ball, material))
    m.position.copy(p); m.scale.set(r * sx, r * sy, r * sz)
    return m
  }
  // Glied von a nach b, verjüngt von ra auf rb, mit runden Gelenken an beiden Enden
  function seg(a, b, ra, rb, material) {
    const dir = new Vector3().subVectors(b, a)
    const m = meAdd(new Mesh(track(new CylinderGeometry(rb, ra, Math.max(1, dir.length()), 16, 1, true)), material))
    m.position.copy(a).addScaledVector(dir, 0.5)
    m.quaternion.copy(new Quaternion().setFromUnitVectors(up, dir.normalize()))
    joint(a, ra, material); joint(b, rb, material)
    return m
  }
  const V = (x, y, z) => new Vector3(x, y, z)
  // tief ins Sofa gerutscht; tilt() rechnet Höhe über der Hüfte in eine Position am Oberkörper um
  const lean = 0.42, hipY = 640, hipZ = -60
  const tilt = (x, h, dz = 0) => V(x, hipY + h * Math.cos(lean), hipZ + h * Math.sin(lean) + dz)

  // Becken und Beine
  joint(V(0, hipY + 10, hipZ + 10), 150, pants, 1.3, 0.75, 1)
  for (const s of [-1, 1]) {
    const hip = V(s * 100, hipY, hipZ), knee = V(s * 125, hipY + 30, -560), ankle = V(s * (140 + (s > 0 ? 25 : 0)), 115, -650)
    seg(hip, knee, 82, 64, pants)
    seg(knee, ankle, 62, 46, pants)
    joint(V(ankle.x, 55, -700), 62, shoe, 0.95, 0.75, 1.9)
  }
  // Rumpf im Trikot, Schultern rund
  const torso = meAdd(new Mesh(track(new CapsuleGeometry(150, 300, 8, 24)), shirt))
  torso.scale.set(1.35, 1, 0.8)
  torso.position.copy(tilt(0, 300))
  torso.rotation.x = lean
  // Rücken: CABAÑERO 14 (Nummer verschwindet halb in der Lehne)
  const backTex = canvasTex(320, 400, (g, w, h) => {
    g.clearRect(0, 0, w, h)
    g.fillStyle = '#f4efe6'; g.textAlign = 'center'; g.textBaseline = 'middle'
    g.font = '800 46px "Archivo", sans-serif'; g.fillText('CABAÑERO', w / 2, 80)
    g.font = '800 210px "Archivo", sans-serif'; g.fillText('14', w / 2, 260)
  })
  const jerseyBack = meAdd(new Mesh(track(new PlaneGeometry(300, 375)), mat(0xffffff, { map: backTex, transparent: true, alphaTest: 0.3, roughness: 0.9 })))
  jerseyBack.position.copy(tilt(0, 370, 122))
  jerseyBack.rotation.x = lean
  // schwarzer Kragen, Hals, Kopf
  const collar = meAdd(new Mesh(track(new TorusGeometry(60, 14, 8, 24)), mat(0x141414)))
  collar.position.copy(tilt(0, 590)); collar.rotation.x = Math.PI / 2 + lean
  seg(tilt(0, 560), tilt(0, 680, 6), 52, 46, skin)
  const headC = tilt(0, 770, 14)
  const head = joint(headC, 96, skin, 0.92, 1.08, 1)
  head.rotation.x = 0.15
  for (const s of [-1, 1]) joint(V(s * 88, headC.y - 5, headC.z + 5), 25, skin, 0.5, 1, 0.8)
  // Haare: dichte, dunkle Locken oben und hinten
  const hairCap = meAdd(new Mesh(track(new SphereGeometry(102, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.62)), hairMat))
  hairCap.position.set(headC.x, headC.y + 14, headC.z + 8)
  hairCap.rotation.x = 0.35
  const curlCount = 90
  const curls = meAdd(new InstancedMesh(track(new SphereGeometry(1, 12, 9)), hairMat, curlCount)) // klein: 12×9 statt 16×12 Segmente reichen
  const cd = new Object3D()
  for (let i = 0, n = 0; n < curlCount && i < 1000; i++) {
    const u = rnd() * Math.PI * 2, v = Math.acos(1 - rnd() * 1.15)
    const dir = V(Math.sin(v) * Math.cos(u), Math.cos(v), Math.sin(v) * Math.sin(u))
    if (dir.z < -0.45 && dir.y < 0.75) continue // Stirn/Gesicht frei lassen
    cd.position.set(headC.x + dir.x * 104, headC.y + 14 + dir.y * 108, headC.z + 8 + dir.z * 106)
    cd.scale.setScalar(24 + rnd() * 15)
    cd.updateMatrix(); curls.setMatrixAt(n++, cd.matrix)
  }
  // Arme: rechter Arm liegt oben auf der Sofalehne, linker auf der Armlehne
  const shR = tilt(200, 500), shL = tilt(-200, 500)
  const sleeveR = V(330, 1080, 250), elbowR = V(500, 1060, 320), handR = V(880, 1055, 330)
  seg(shR, sleeveR, 70, 62, shirt); seg(sleeveR, elbowR, 46, 42, skin); seg(elbowR, handR, 42, 34, skin)
  const sleeveL = tilt(-255, 320), elbowL = V(-355, 850, -20), handL = V(-380, 845, -400)
  seg(shL, sleeveL, 70, 62, shirt); seg(sleeveL, elbowL, 46, 42, skin); seg(elbowL, handL, 42, 34, skin)
  joint(handR, 46, skin, 1.25, 0.6, 1); joint(handL, 46, skin, 1, 0.6, 1.3)
  me.scale.setScalar(0.85)
  me.position.set(-1680, 0, 820)
  me.rotation.y = -0.14 // leicht zum Fernseher gedreht
  add(me)
  box(380, 346, 120, mat(0xb9b2a0, { roughness: 1, ...tex(T.fabric, 2) }), -620, 520, 1010, -0.2) // 6 mm über der Lehne: sonst flimmern die Oberkanten

  // Couchtisch mit Pizzakarton, Dose, Fernbedienung
  const wood = mat(0xffffff, { roughness: 0.6, ...tex(T.oak, 0.8) })
  box(1100, 36, 560, wood, -1200, 400, -500)
  for (const [dx, dz] of [[-500, -230], [500, -230], [-500, 230], [500, 230]]) box(40, 400, 40, wood, -1200 + dx, 0, -500 + dz)
  const pizzaSide = mat(0xffffff, { map: T.cardboardPlain, roughness: 1 })
  box(400, 48, 400, [pizzaSide, pizzaSide, mat(0xffffff, { map: T.pizza, roughness: 1 }), pizzaSide, pizzaSide, pizzaSide], -1420, 436, -480, 0.32)
  cyl(33, 33, 122, mat(0xb4202a, { roughness: 0.35, metalness: 0.6 }), -900, 436, -380)
  box(50, 22, 170, 0x222222, -1020, 436, -600, -0.5)

  // TV-Möbel + Fernseher (Bild setzt die Engine: Standbild, dann Video)
  box(1500, 420, 420, mat(0xffffff, { roughness: 0.55, ...tex(T.walnut, 0.6) }), -1200, 0, -2270)
  box(260, 50, 200, 0x1a1a1a, -1200, 420, -2290)
  box(70, 90, 40, 0x1a1a1a, -1200, 450, -2300)
  box(1160, 670, 50, mat(0x111214, { roughness: 0.4 }), -1200, 520, -2290)
  box(90, 30, 200, 0x111111, -1700, 420, -2250)
  const tvStill = loadTex(tvPosterUrl)
  const tvScreen = add(plane(TV_SCREEN.w, TV_SCREEN.h, track(new MeshBasicMaterial({ map: tvStill, toneMapped: false }))))
  tvScreen.position.set(TV_SCREEN.x, TV_SCREEN.y, TV_SCREEN.z)

  // Pflanzen
  const terraMat = mat(0xffffff, { roughness: 0.9, ...tex(T.terracotta, 1) })
  function plant(x, y, z, s = 1, tall = false) {
    const g = new Group()
    const pot = new Mesh(track(new CylinderGeometry(150, 115, 260, 24)), terraMat)
    pot.position.y = 130; g.add(pot)
    const soil = new Mesh(track(new CylinderGeometry(140, 140, 10, 24)), mat(0x3a2a1c))
    soil.position.y = 258; g.add(soil)
    const greens = [0x3f7d3a, 0x4f9445, 0x2f6a33, 0x5aa04c].map((c) => mat(c, { roughness: 0.7 }))
    const leafGeo = track(new SphereGeometry(1, 12, 8))
    const n = tall ? 16 : 10
    for (let i = 0; i < n; i++) {
      const pivot = new Group()
      pivot.position.y = 255
      pivot.rotation.y = (i / n) * Math.PI * 2 + rnd() * 0.5
      const len = (tall ? 480 : 200) * (0.7 + rnd() * 0.5), tilt = (tall ? 0.18 : 0.5) + rnd() * 0.5
      const leaf = new Mesh(leafGeo, greens[i % 4])
      leaf.scale.set(tall ? 75 : 55, len, 12)
      leaf.rotation.z = -tilt
      leaf.position.set(Math.sin(tilt) * len, Math.cos(tilt) * len, 0)
      pivot.add(leaf); g.add(pivot)
    }
    g.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true } })
    g.position.set(x, y, z); g.scale.setScalar(s)
    return add(g)
  }
  plant(-560, 420, -2250, 0.55)
  plant(1560, 756, -2380, 0.4)
  plant(2650, 0, 200, 0.9, true)

  // Kratzbaum in der Ecke links neben dem TV-Möbel, mit zwei schlafenden Katzen
  const plushMat = mat(0xffffff, { roughness: 1, ...tex(T.plush, 2) })
  const basketMat = mat(0xffffff, { roughness: 1, side: DoubleSide, ...tex(T.plushGrey, 2) })
  const sisalMat = mat(0xffffff, { roughness: 1, ...tex(T.sisal, 3) })
  const tree = new Group()
  const tp = (geo, m, x, y, z) => { const q = new Mesh(track(geo), m); q.position.set(x, y, z); q.castShadow = q.receiveShadow = true; tree.add(q); return q }
  tp(new BoxGeometry(640, 50, 640), plushMat, 0, 25, 0)                    // Sockel
  tp(new CylinderGeometry(55, 55, 720, 20), sisalMat, -150, 410, -150)     // Stamm hinten
  tp(new CylinderGeometry(55, 55, 1180, 20), sisalMat, 150, 640, 120)      // Stamm vorne, trägt die obere Liege
  tp(new CylinderGeometry(45, 45, 420, 20), sisalMat, -170, 260, 200)      // kurzer Stamm
  tp(new BoxGeometry(300, 30, 260), plushMat, -170, 485, 200)              // Stufe
  tp(new BoxGeometry(560, 40, 460), plushMat, -60, 790, -60)               // mittlere Plattform
  tp(new CylinderGeometry(200, 180, 90, 28, 1, true), basketMat, -120, 855, -100) // Körbchen
  tp(new CylinderGeometry(185, 185, 30, 28), basketMat, -120, 825, -100)
  tp(new CylinderGeometry(260, 260, 40, 32), plushMat, 150, 1250, 120)     // obere Liege
  tp(new TorusGeometry(240, 30, 10, 36), plushMat, 150, 1275, 120).rotation.x = Math.PI / 2
  tp(new CylinderGeometry(2, 2, 210, 6), mat(0xd9c9a8), 160, 665, -200)    // Spielschnur
  tp(new SphereGeometry(36, 16, 12), mat(0xb4202a, { roughness: 0.7 }), 160, 545, -200)

  // Schlafende Katze: lokal gebaut (Kopf zeigt nach +x), dann platziert
  const eyeMat = mat(0x1a1410, { roughness: 0.6 }), noseMat = mat(0xc98a8a, { roughness: 0.6 })
  function cat({ fur, x, y, z, ry, s = 1, phase = 0 }) {
    const g = new Group()
    const furMat = mat(0xffffff, { roughness: 0.95, ...tex(fur, 1.5) })
    const part = (geo, m, px, py, pz) => { const q = new Mesh(track(geo), m); q.position.set(px, py, pz); q.castShadow = true; g.add(q); return q }
    // Kugelachse entlang der Wirbelsäule (x), damit die Tigerringe quer über den Rücken laufen
    const body = part(track(new SphereGeometry(1, 28, 18)).rotateZ(Math.PI / 2), furMat, 0, 105, 0)
    body.scale.set(190, 105, 150)
    const head = part(track(new SphereGeometry(80, 24, 16)).rotateZ(Math.PI / 2), furMat, 172, 92, 55)
    head.scale.set(1, 0.86, 1.05)
    for (const side of [-1, 1]) {
      const ear = part(new ConeGeometry(32, 66, 12), furMat, 165, 160, 55 + side * 40)
      ear.rotation.set(side * 0.3, 0, -0.15)
      const eye = part(new BoxGeometry(6, 6, 28), eyeMat, 248, 100, 55 + side * 30) // geschlossene Augen
      eye.rotation.x = side * 0.25
      part(new SphereGeometry(30, 12, 10), furMat, 150, 28, -30 + side * 50).scale.set(1.3, 0.7, 1) // Pfoten
    }
    part(new SphereGeometry(11, 10, 8), noseMat, 254, 84, 55)
    const tail = part(new TorusGeometry(175, 26, 10, 28, Math.PI * 1.15), furMat, 0, 32, 0)
    tail.rotation.set(Math.PI / 2, 0, -0.9) // liegt flach und legt sich vorne um den Körper
    g.position.set(x, y, z); g.rotation.y = ry; g.scale.setScalar(s)
    tree.add(g)
    return { body, head, baseY: body.scale.y, baseX: body.scale.x, phase }
  }
  const cats = [
    cat({ fur: T.furBlueGrey, x: -120, y: 838, z: -100, ry: -Math.PI / 2 + 0.6, s: 0.95, phase: 0 }),
    cat({ fur: T.tabbyGrey, x: 150, y: 1268, z: 120, ry: -Math.PI / 2 + 0.2, s: 1.05, phase: 1.7 }),
  ]
  tree.position.set(-2470, 0, -1980); tree.rotation.y = 0.35
  add(tree)

  // Trikots im Rahmen: nur Vereinsfarben und Schriftzug, keine nachgezeichneten Wappen
  function jerseyTex({ body, sleeve, print, label }) {
    return canvasTex(640, 800, (g, w, h) => {
      g.fillStyle = '#17181c'; g.fillRect(0, 0, w, h)
      g.fillStyle = '#23252b'; g.fillRect(26, 26, w - 52, h - 52)
      const shirt = new Path2D('M200 100 L262 78 Q320 112 378 78 L440 100 L585 205 L525 315 L472 285 L472 650 L168 650 L168 285 L115 315 L55 205 Z')
      g.fillStyle = body; g.fill(shirt)
      g.save(); g.clip(shirt); g.fillStyle = sleeve
      g.beginPath(); g.moveTo(200, 100); g.lineTo(55, 205); g.lineTo(115, 315); g.lineTo(168, 285); g.lineTo(190, 150); g.closePath(); g.fill()
      g.beginPath(); g.moveTo(440, 100); g.lineTo(585, 205); g.lineTo(525, 315); g.lineTo(472, 285); g.lineTo(450, 150); g.closePath(); g.fill()
      g.restore()
      g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 3; g.stroke(shirt)
      g.fillStyle = print; g.textAlign = 'center'
      g.font = '800 50px "Archivo", sans-serif'; g.fillText('CABAÑERO', 320, 240)
      g.font = '800 230px "Archivo", sans-serif'; g.fillText('14', 320, 500)
      g.fillStyle = '#c9c3b6'; g.font = '600 28px "Archivo", sans-serif'; g.fillText(label, 320, 730)
    })
  }
  function framed(tex, w, h, x, y, z, ry = 0) {
    const grp = new Group()
    const fr = new Mesh(track(new BoxGeometry(w + 50, h + 50, 30)), mat(0x111111, { roughness: 0.5 }))
    const pic = new Mesh(track(new PlaneGeometry(w, h)), mat(0xffffff, { map: tex, roughness: 0.7 }))
    pic.position.z = 16; fr.castShadow = true; grp.add(fr, pic)
    grp.position.set(x, y, z); grp.rotation.y = ry
    return add(grp)
  }
  framed(jerseyTex({ body: '#c8102e', sleeve: '#b00d27', print: '#ffffff', label: 'Manchester United' }), 600, 750, -1200, 1760, -RD / 2 + 20)
  framed(jerseyTex({ body: '#f4f4f2', sleeve: '#d0021b', print: '#d0021b', label: 'FC Thun' }), 540, 675, RW / 2 - 20, 1560, 650, -Math.PI / 2)

  // Wimpel an der linken Wand
  function pennant(fill, stripe, label) {
    return canvasTex(600, 260, (g, w, h) => {
      g.clearRect(0, 0, w, h)
      g.beginPath(); g.moveTo(0, 0); g.lineTo(w, h / 2); g.lineTo(0, h); g.closePath(); g.fillStyle = fill; g.fill()
      g.save(); g.clip(); g.fillStyle = stripe; g.fillRect(0, 0, 60, h); g.restore()
      g.fillStyle = '#fff'; g.font = '800 40px "Archivo", sans-serif'; g.textBaseline = 'middle'; g.fillText(label, 80, h / 2)
    })
  }
  ;[[pennant('#c8102e', '#111', 'MAN UNITED'), 1250], [pennant('#d0021b', '#fff', 'FC THUN'), 1900]].forEach(([tex, z], i) => {
    const m = add(plane(760, 330, mat(0xffffff, { map: tex, transparent: true, alphaTest: 0.5, side: DoubleSide, roughness: 0.9 })))
    m.position.set(-RW / 2 + 6, 1820 - i * 60, z)
    m.rotation.set(0, Math.PI / 2, i ? 0.06 : -0.05)
  })

  // Meisterposter FC Thun an der linken Wand (hinter dem Kratzbaum): matter Druck, nur mit Klebeband-Ecken
  const thunPoster = add(plane(960, 540, mat(0xffffff, { map: loadTex('/images/fc-thun-meister.webp'), roughness: 0.85 })))
  thunPoster.rotation.y = Math.PI / 2
  thunPoster.position.set(-RW / 2 + 6, 1780, -1650)
  for (const [dy, dz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
    const tape = add(plane(70, 26, mat(0xe8e0c8, { roughness: 0.9 })))
    tape.rotation.set(0, Math.PI / 2, dy * dz * 0.7)
    tape.position.set(-RW / 2 + 8, 1780 + dy * 262, -1650 + dz * 472)
  }

  // Hängepflanzen: Efeutute auf einem Brett an der rechten Wand + zwei Hängeampeln
  const leafPool = []
  function vine(x0, y0, z0, len, wallSide = true) {
    const amp = 30 + rnd() * 70, freq = 1.5 + rnd() * 2.5, ph = rnd() * 6, drift = (rnd() - 0.5) * 160
    const step = 42 + rnd() * 10
    for (let d = 0; d < len; d += step) {
      const t = d / len
      const side = Math.round(d / step) % 2 ? 1 : -1
      leafPool.push({
        x: x0 - (wallSide ? 20 + t * 40 + rnd() * 30 : (rnd() - 0.5) * 40),
        y: y0 - d,
        z: z0 + Math.sin(t * freq * Math.PI + ph) * amp * t + drift * t + side * 18,
        s: 1 - t * 0.35,
        side,
      })
    }
  }
  const shelfX = RW / 2 - 90
  box(170, 34, 3200, mat(0xffffff, { roughness: 0.7, ...tex(T.pine, 0.6) }), shelfX, 2230, -200)
  for (const z of [-1600, -200, 1200]) box(150, 110, 26, 0x2a2a2a, RW / 2 - 75, 2125, z)
  const potMat = mat(0xe7e2d8, { roughness: 0.6 })
  for (const z of [-1450, -850, -250, 350, 950]) {
    cyl(80, 62, 140, potMat, shelfX, 2264, z)
    for (let i = 0; i < 6; i++) {
      const zz = z + (rnd() - 0.5) * 180
      const overJersey = zz > 300 && zz < 1000 // über dem FC-Thun-Trikot nur kurze Ranken
      vine(shelfX - 40, 2380, zz, overJersey ? 120 + rnd() * 180 : 450 + rnd() * 900)
    }
  }
  const cordMat = mat(0xd9c9a8)
  function hanger(x, y, z) {
    const pot = add(new Mesh(track(new SphereGeometry(150, 20, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2)), mat(0xf1ede4, { roughness: 0.6 })))
    pot.position.set(x, y, z); pot.castShadow = true
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2
      const top = new Vector3(x, RH, z), bot = new Vector3(x + Math.cos(a) * 140, y, z + Math.sin(a) * 140)
      const cord = add(new Mesh(track(new CylinderGeometry(3, 3, top.distanceTo(bot), 6)), cordMat))
      cord.position.copy(top).add(bot).multiplyScalar(0.5); cord.lookAt(bot); cord.rotateX(Math.PI / 2)
    }
    for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2; vine(x + Math.cos(a) * 120, y + 60, z + Math.sin(a) * 120, 250 + rnd() * 550, false) }
    for (let i = 0; i < 14; i++) leafPool.push({ x: x + (rnd() - 0.5) * 220, y: y + 40 + rnd() * 120, z: z + (rnd() - 0.5) * 220, s: 1.1, side: 1 })
  }
  hanger(2350, 1850, -900)
  hanger(2450, 1950, 1700)
  // alle Blätter als ein InstancedMesh: ein Draw-Call, kein Lag
  const GREENS = [0x2f6b2f, 0x3d8a3a, 0x4fa04a, 0x5fb35a, 0x376f31, 0x6fbf5f].map((c) => new Color(c))
  const leaves = add(new InstancedMesh(track(new SphereGeometry(1, 10, 6)), mat(0xffffff, { roughness: 0.6 }), leafPool.length)) // geschlossen: Rückseiten nie sichtbar
  const dummy = new Object3D()
  leafPool.forEach((l, i) => {
    dummy.position.set(l.x, l.y, l.z)
    dummy.rotation.set(rnd() * Math.PI, (rnd() - 0.5) * 0.8, l.side * (0.5 + rnd() * 0.6))
    const s = l.s * (0.8 + rnd() * 0.5)
    dummy.scale.set(6 * s, 28 * s, 36 * s)
    dummy.updateMatrix()
    leaves.setMatrixAt(i, dummy.matrix)
    leaves.setColorAt(i, GREENS[Math.floor(rnd() * GREENS.length)])
  })
  leaves.castShadow = true

  // Manchester-United-Schal neben dem Trikot
  const scarfTex = canvasTex(220, 1100, (g, w, h) => {
    g.fillStyle = '#c8102e'; g.fillRect(0, 0, w, h)
    for (const [y, c] of [[40, '#fff'], [70, '#111'], [h - 110, '#111'], [h - 80, '#fff']]) { g.fillStyle = c; g.fillRect(0, y, w, 26) }
    g.fillStyle = '#ffd200'; g.fillRect(0, 130, w, 10); g.fillRect(0, h - 140, w, 10)
    g.save(); g.translate(w / 2, h / 2); g.rotate(-Math.PI / 2)
    g.fillStyle = '#fff'; g.font = '800 64px "Archivo", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'
    g.fillText('MANCHESTER UNITED', 0, 0); g.restore()
    g.strokeStyle = '#a30d25'; g.lineWidth = 6
    for (let x = 8; x < w; x += 16) { g.beginPath(); g.moveTo(x, h - 30); g.lineTo(x + ((x * 7) % 5) - 2, h); g.stroke() }
  })
  const scarfMat = mat(0xffffff, { map: scarfTex, side: DoubleSide, roughness: 0.95 })
  function scarfStrip(x, len, tilt) {
    const geo = track(new PlaneGeometry(175, len, 1, 24))
    const p = geo.attributes.position
    for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin(p.getY(i) * 0.012) * 10 + 10)
    geo.computeVertexNormals()
    const m = add(new Mesh(geo, scarfMat))
    m.position.set(x, 2130 - len / 2, -RD / 2 + 22); m.rotation.z = tilt
  }
  scarfStrip(-560, 980, 0.045)
  scarfStrip(-460, 900, -0.06)
  box(26, 26, 40, 0x333333, -510, 2120, -RD / 2 + 20)

  // Filmstill an der Wand: matter Druck, leuchtet nicht
  box(820, 480, 20, 0x161616, 500, 1240, -RD / 2 + 10)
  const poster = add(plane(780, 440, mat(0xffffff, { map: loadTex(posterUrl), roughness: 0.75 })))
  poster.position.set(500, 1480, -RD / 2 + 22)

  // Schreibtisch hinten rechts mit Monitor (Bild setzt die Engine)
  const deskMat = mat(0xe8e5df, { roughness: 0.6, map: T.laminate })
  box(1500, 36, 720, deskMat, 2150, 720, -2120)
  const legMat = mat(0x6a6a70, { map: T.brushed, metalness: 0.6, roughness: 0.45 })
  for (const [dx, dz] of [[-700, -320], [700, -320], [-700, 320], [700, 320]]) box(36, 720, 36, legMat, 2150 + dx, 0, -2120 + dz)
  box(240, 14, 190, 0x1b1b1d, 2150, 756, -2330)
  box(50, 200, 36, 0x1b1b1d, 2150, 770, -2360)
  box(600, 392, 34, mat(0x141416, { roughness: 0.45 }), SCREEN.x, SCREEN.y - 196, SCREEN.z - 18)
  const screenMesh = add(plane(SCREEN.w, SCREEN.h, track(new MeshBasicMaterial({ color: 0xffffff, toneMapped: false }))))
  screenMesh.position.set(SCREEN.x, SCREEN.y, SCREEN.z)
  box(440, 22, 140, 0x2a2a2c, 2150, 756, -2010)
  box(64, 26, 110, 0x2a2a2c, 2460, 756, -2010)
  cyl(42, 38, 110, mat(0xf2f2ee, { roughness: 0.4 }), 1630, 756, -2250)
  box(210, 460, 470, mat(0x1c1c1f, { roughness: 0.5 }), 2700, 0, -2200)
  box(8, 380, 6, mat(0x4aa3ff, { emissive: 0x4aa3ff, emissiveIntensity: 2.2 }), 2640, 40, -1964)

  // Bürostuhl: lokal gebaut (vorne = +z), dann als Ganzes platziert und weggedreht
  const chairMat = mat(0x2a2a2e, { roughness: 0.9, ...tex(T.fabricDark, 1.5) }), chromeMat = mat(0xb0b0b6, { map: T.brushed, metalness: 0.8, roughness: 0.3 })
  const chair = new Group()
  const part = (geo, m, x, y, z) => { const p = new Mesh(track(geo), m); p.position.set(x, y, z); p.castShadow = p.receiveShadow = true; chair.add(p); return p }
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2
    const leg = part(new BoxGeometry(320, 26, 46), chromeMat, Math.cos(a) * 160, 70, Math.sin(a) * 160)
    leg.rotation.y = -a
    part(new SphereGeometry(30, 12, 8), chairMat, Math.cos(a) * 310, 30, Math.sin(a) * 310)
  }
  part(new CylinderGeometry(55, 55, 40, 16), chromeMat, 0, 70, 0)
  part(new CylinderGeometry(24, 24, 360, 12), chromeMat, 0, 270, 0)
  part(new BoxGeometry(320, 30, 300), chromeMat, 0, 455, 0)
  part(new BoxGeometry(520, 80, 500), chairMat, 0, 510, 20)
  part(new BoxGeometry(70, 300, 40), chromeMat, 0, 600, -240)
  part(new BoxGeometry(480, 560, 70), chairMat, 0, 960, -265).rotation.x = -0.1
  for (const sd of [-1, 1]) {
    part(new BoxGeometry(36, 220, 36), chromeMat, sd * 255, 640, 20)
    part(new BoxGeometry(70, 30, 300), chairMat, sd * 255, 760, 30)
  }
  chair.position.set(2620, 0, -1480); chair.rotation.y = -0.65
  add(chair)

  // Gitarre an der rechten Wand
  const guitar = new Group()
  const gBody = mat(0xffffff, { map: T.guitarWood, roughness: 0.35 })
  const gp = (geo, m, setup) => { const p = new Mesh(track(geo), m); setup(p); p.castShadow = true; guitar.add(p) }
  gp(new CylinderGeometry(190, 190, 95, 40), gBody, (p) => { p.rotation.x = Math.PI / 2 })
  gp(new CylinderGeometry(150, 150, 95, 40), gBody, (p) => { p.rotation.x = Math.PI / 2; p.position.y = 230 })
  gp(new CylinderGeometry(52, 52, 4, 32), mat(0x1a0f07), (p) => { p.rotation.x = Math.PI / 2; p.position.set(0, 140, 50) })
  gp(new BoxGeometry(58, 620, 30), mat(0xffffff, { map: T.walnut, roughness: 0.5 }), (p) => { p.position.y = 650 })
  gp(new BoxGeometry(85, 190, 32), mat(0xd0c8c0, { map: T.walnut, roughness: 0.5 }), (p) => { p.position.y = 1040 })
  guitar.position.set(2830, 200, -450); guitar.rotation.set(0, -Math.PI / 2, 0.18)
  add(guitar)

  // Umzugskartons
  const cardboard = mat(0xffffff, { roughness: 1, ...tex(T.cardboard, 0.8) })
  box(620, 460, 460, cardboard, 2350, 0, 1300, 0.1)
  box(480, 340, 400, mat(0xe2d6c4, { roughness: 1, ...tex(T.cardboard, 0.8) }), 2330, 460, 1290, -0.18)
  box(560, 420, 440, cardboard, 1720, 0, 1500, -0.25)

  // LED-Leisten an der Deckenkante, sehr gedimmt
  const washTex = canvasTex(8, 256, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h)
    gr.addColorStop(0, 'rgba(255,255,255,.55)'); gr.addColorStop(0.25, 'rgba(255,255,255,.18)'); gr.addColorStop(1, 'rgba(255,255,255,0)')
    g.clearRect(0, 0, w, h); g.fillStyle = gr; g.fillRect(0, 0, w, h)
  })
  const stripMat = track(new MeshBasicMaterial({ color: LED }))
  const washMat = track(new MeshBasicMaterial({ map: washTex, color: LED, transparent: true, opacity: 0.55, blending: AdditiveBlending, depthWrite: false }))
  function ledStrip(len, x, z, ry) {
    const grp = new Group(); grp.position.set(x, RH - 55, z); grp.rotation.y = ry
    const strip = new Mesh(track(new BoxGeometry(len, 12, 14)), stripMat); strip.position.z = 22; grp.add(strip)
    const wash = new Mesh(track(new PlaneGeometry(len, 1100)), washMat); wash.position.set(0, -540, 4); grp.add(wash)
    add(grp)
  }
  ledStrip(RW - 40, 0, -RD / 2, 0)
  ledStrip(RD, -RW / 2, 0, Math.PI / 2)
  ledStrip(RD, RW / 2, 0, -Math.PI / 2)

  // Licht im Zimmer: nachts sehr gedimmt, nur die Bildschirme stechen heraus.
  // Tagsüber übernehmen dieselben Lampen andere Rollen (setDay), statt neue dazuzunehmen:
  // jede zusätzliche Lichtquelle kostet in jedem Pixel Rechenzeit.
  const hemi = add(new HemisphereLight(0x8580d6, 0x2a2238, 0.36))
  const fill = add(new PointLight(0xb4a6ff, 0.32, 5000, 0)); fill.position.set(400, 1800, 3200)
  const leds = [[-1500, -1900], [1500, -1900], [-2400, 800], [2400, 800]].map(([x, z]) => {
    const l = add(new PointLight(LED, 0.17, 5200, 0)); l.position.set(x, RH - 200, z)
    return l
  })
  // Sonne: fällt nur durchs Fenster (Schatten von Wand, Decke und unsichtbarer Vorderwand).
  // Die Schattenkarte wird nur einmal gerechnet (engine.js), das Zimmer bewegt sich ja nicht.
  const sun = add(new DirectionalLight(0xffd2a0, 0))
  sun.target.position.set(-300, 600, -600)
  sun.position.copy(sun.target.position).addScaledVector(SUN_DIR, 9000)
  add(sun.target)
  sun.castShadow = true
  sun.shadow.mapSize.set(lowTier ? 1024 : 2048, lowTier ? 1024 : 2048)
  Object.assign(sun.shadow.camera, { left: -4600, right: 4600, top: 4600, bottom: -4600, near: 500, far: 19000 })
  sun.shadow.bias = -0.0006
  sun.shadow.normalBias = 6
  // unsichtbare Vorderwand (dort wäre die Wand mit der Wohnungstür): nur für den Sonnenschatten
  const shadowOnly = track(new MeshBasicMaterial({ colorWrite: false, depthWrite: false }))
  shadowOnly.shadowSide = DoubleSide
  // Rückseite zeigt zur Kamera → wird im Bild weggelassen (Backface-Culling), wirft aber Schatten
  // deutlich breiter als das Zimmer, sonst fällt an der Ecke zur Fensterwand ein Lichtstreifen herein
  const frontCaster = add(plane(RW + 8000, RH + 2000, shadowOnly)); frontCaster.position.set(0, RH / 2 + 300, RD / 2 + 150); frontCaster.rotation.y = Math.PI
  frontCaster.castShadow = true
  ceil.castShadow = true; ceil.material.shadowSide = DoubleSide

  const city = createCity({ sunDir: SUN_DIR, portal: { x: -RW / 2, ...WIN } })
  add(city.group)
  const monitorGlow = add(new PointLight(0x9cc2ff, 0.28, 2400, 0)); monitorGlow.position.set(SCREEN.x, SCREEN.y, SCREEN.z + 350)
  const tvGlow = add(new PointLight(0x8fb0ff, 0.3, 3200, 0)); tvGlow.position.set(TV_SCREEN.x, TV_SCREEN.y, -1900)
  const tvLight = add(new RectAreaLight(0x9fb6ff, 3.2, TV_SCREEN.w, TV_SCREEN.h))
  tvLight.position.set(TV_SCREEN.x, TV_SCREEN.y, TV_SCREEN.z + 14); tvLight.lookAt(TV_SCREEN.x, TV_SCREEN.y, 1000)
  const monitorLight = add(new RectAreaLight(0xc9b8c4, 3.2, SCREEN.w, SCREEN.h))
  monitorLight.position.set(SCREEN.x, SCREEN.y, SCREEN.z + 8); monitorLight.lookAt(SCREEN.x, SCREEN.y, 1000)

  // Unsichtbare Klickflächen für Fernseher und PC
  const hitMat = track(new MeshBasicMaterial())
  const tvHit = add(new Mesh(track(new BoxGeometry(1350, 900, 300)), hitMat)); tvHit.visible = false; tvHit.position.set(-1200, 860, -2240)
  const pcHit = add(new Mesh(track(new BoxGeometry(800, 720, 420)), hitMat)); pcHit.visible = false; pcHit.position.set(2150, 1000, -2250)
  const winHit = add(new Mesh(track(new BoxGeometry(240, winH + 120, winW + 120)), hitMat)); winHit.visible = false; winHit.position.set(-RW / 2 + 40, WIN.y0 + winH / 2, winZ)

  // Alles im Zimmer empfängt Schatten (sonst schiene die Sonne durch Wände auf Poster usw.)
  scene.traverse((m) => { if (m.isMesh && m.material?.isMeshStandardMaterial) m.receiveShadow = true })

  // Unbewegte Teile des Zimmers zusammenlegen (optimize.js): gleiches Bild, viel weniger Draw-Calls
  const roomMerge = mergeStatic(scene, {
    keep: [tvScreen, screenMesh, tvHit, pcHit, winHit, frontCaster, city.group, ...cats.map((c) => c.body.parent)],
    protect: [stripMat],
  })
  roomMerge.created.forEach((m) => track(m.geometry))

  // Lichter, die gerade nichts beitragen (Intensität 0), ganz aus der Szene nehmen:
  // jedes Licht kostet in jedem Pixel Rechenzeit, die Sonne zusätzlich ihre Schattenkarte.
  // 'night': ohne Sonne · 'day': ohne die zwei abgeschalteten LED-Lampen · 'mix': alle (Übergang)
  let lightMode = 'mix'
  function setLightMode(mode) {
    if (mode === lightMode) return false
    lightMode = mode
    const show = (light, on) => { if (on && !light.parent) scene.add(light); else if (!on && light.parent) scene.remove(light) }
    show(sun, mode !== 'night')
    show(leds[1], mode !== 'day')
    show(leds[3], mode !== 'day')
    return true
  }

  /* ---------------- Flur vor der Wohnungstür (eigene Szene) ---------------- */
  target = hallScene
  const terrazzo = canvasTex(512, 512, (g, w, h) => {
    seed = 41
    g.fillStyle = '#a7a297'; g.fillRect(0, 0, w, h)
    const cols = ['#6e6a62', '#c9c4b8', '#8a5a44', '#4c4a45', '#d8d3c7']
    for (let i = 0; i < 2600; i++) {
      g.fillStyle = cols[i % 5]
      const r = 1 + rnd() * 4
      g.beginPath(); g.ellipse(rnd() * w, rnd() * h, r, r * (0.5 + rnd() * 0.6), rnd() * 3, 0, 7); g.fill()
    }
  }, [4, 6])
  const hallWhite = mat(0xe4e1da, { roughness: 0.95, ...tex(T.plaster, 1.2) }), hallGreen = mat(0x6d8b78, { roughness: 0.8, ...tex(T.plaster, 1) })
  box(2600, 10, 4600, mat(0xffffff, { map: terrazzo, roughness: 0.5 }), 0, -10, HZ + 600)
  box(2600, 10, 4600, mat(0xe9e7e2, tex(T.ceiling, 1)), 0, 2700, HZ + 600)
  for (const x of [-1310, 1310]) { box(20, 1100, 4600, hallGreen, x, 0, HZ + 600); box(20, 1600, 4600, hallWhite, x, 1100, HZ + 600) }
  box(800, 2700, 200, hallWhite, -900, 0, HZ - 1500); box(800, 2700, 200, hallWhite, 900, 0, HZ - 1500)
  box(1000, 550, 200, hallWhite, 0, 2150, HZ - 1500)
  box(800, 1100, 6, hallGreen, -900, 0, HZ - 1397); box(800, 1100, 6, hallGreen, 900, 0, HZ - 1397)
  const frameMat = mat(0xd8d2c4, { roughness: 0.6 })
  box(60, 2180, 240, frameMat, -530, 0, HZ - 1500); box(60, 2180, 240, frameMat, 530, 0, HZ - 1500); box(1120, 60, 240, frameMat, 0, 2150, HZ - 1500)

  // Tür mit Namensschild
  const plateTex = canvasTex(840, 240, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, w, h)
    gr.addColorStop(0, '#d9b874'); gr.addColorStop(0.5, '#f1d79a'); gr.addColorStop(1, '#b8954f')
    g.fillStyle = gr; g.fillRect(0, 0, w, h)
    g.strokeStyle = 'rgba(70,45,10,.6)'; g.lineWidth = 6; g.strokeRect(14, 14, w - 28, h - 28)
    g.fillStyle = '#2b1d08'; g.textAlign = 'center'; g.textBaseline = 'middle'
    g.font = '800 92px "Archivo", sans-serif'; g.fillText('M. Cabañero', w / 2, h / 2 - 14)
    g.font = '600 30px "Archivo", sans-serif'; g.fillText(text.plateSub, w / 2, h / 2 + 62)
  })
  const door = add(new Group()); door.position.set(-500, 0, HZ - 1440)
  const slab = new Mesh(track(new BoxGeometry(1000, 2150, 50)), mat(0xffffff, { roughness: 0.5, ...tex(T.doorWood, 0.6) }))
  slab.position.set(500, 1075, 0); slab.castShadow = true; door.add(slab)
  const panelMat = mat(0xcfc6bd, { roughness: 0.55, ...tex(T.doorWood, 0.6) })
  for (const [x, y, w, h] of [[500, 1620, 760, 700], [500, 640, 760, 900]]) {
    const p = new Mesh(track(new BoxGeometry(w, h, 12)), panelMat); p.position.set(x, y, 28); door.add(p)
  }
  const plate = new Mesh(track(new PlaneGeometry(420, 120)), mat(0xffffff, { map: plateTex, roughness: 0.3, metalness: 0.4 }))
  plate.position.set(500, 1500, 36); door.add(plate)
  const handle = new Mesh(track(new BoxGeometry(150, 26, 40)), mat(0xc0c0c0, { metalness: 0.9, roughness: 0.25 }))
  handle.position.set(880, 1040, 50); door.add(handle)
  const peep = new Mesh(track(new CylinderGeometry(14, 14, 10, 16)), mat(0xb9b9b9, { metalness: 0.9, roughness: 0.3 }))
  peep.rotation.x = Math.PI / 2; peep.position.set(500, 1700, 36); door.add(peep)
  // Klingel
  box(150, 260, 24, mat(0xd8d2c4, { roughness: 0.5 }), 760, 1140, HZ - 1395)
  const bellBtn = add(new Mesh(track(new CylinderGeometry(30, 30, 18, 24)), mat(0xffe2a8, { emissive: 0xffb547, emissiveIntensity: 1.2 })))
  bellBtn.rotation.x = Math.PI / 2; bellBtn.position.set(760, 1330, HZ - 1378)
  const bellLabel = add(plane(110, 34, mat(0xffffff, {
    map: canvasTex(330, 100, (g, w, h) => {
      g.fillStyle = '#f7f4ec'; g.fillRect(0, 0, w, h)
      g.fillStyle = '#222'; g.font = '700 46px "Archivo", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'
      g.fillText('Cabañero', w / 2, h / 2)
    }),
  })))
  bellLabel.position.set(760, 1225, HZ - 1381)
  // Fussmatte, Schuhregal, Lampe
  const matTex = canvasTex(900, 560, (g, w, h) => {
    g.fillStyle = '#5b4a36'; g.fillRect(0, 0, w, h)
    g.strokeStyle = '#3f3324'; g.lineWidth = 18; g.strokeRect(20, 20, w - 40, h - 40)
    g.fillStyle = '#d8c7a6'; g.font = '800 92px "Archivo", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'
    g.fillText(text.doormat, w / 2, h / 2)
  })
  box(900, 16, 560, mat(0xffffff, { map: matTex, roughness: 1 }), 0, 0, HZ - 1080)
  box(800, 420, 300, mat(0x9a9a9a, { map: T.brushed, metalness: 0.5, roughness: 0.45 }), -880, 0, HZ - 1150)
  box(300, 110, 120, 0xf2f2f2, -1000, 420, HZ - 1150, 0.2)
  box(300, 110, 120, 0xf2f2f2, -700, 420, HZ - 1130, -0.1)
  const lamp = add(new Mesh(track(new SphereGeometry(180, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2)), mat(0xfff3dc, { emissive: 0xffe2b0, emissiveIntensity: 1.6, side: DoubleSide })))
  lamp.rotation.x = Math.PI; lamp.position.set(0, 2695, HZ - 200)
  const hallLight = add(new PointLight(0xffe4bd, 1.5, 5200, 0)); hallLight.position.set(0, 2450, HZ - 200)
  const doorSpot = new SpotLight(0xfff0d8, 1.4, 4500, 0.6, 0.7, 0)
  doorSpot.position.set(0, 2600, HZ - 700); doorSpot.target.position.set(0, 1200, HZ - 1500)
  doorSpot.castShadow = true; doorSpot.shadow.mapSize.set(512, 512)
  add(doorSpot); add(doorSpot.target)

  // Hinter der Tür: schwarzer Raum mit treibendem Nebel
  const voidBox = add(new Mesh(track(new BoxGeometry(2400, 3000, 4000)), track(new MeshBasicMaterial({ color: 0x000000, side: BackSide, fog: false }))))
  // Box endet direkt hinter der Türwand (HZ-1600) und reicht nur so tief wie die Nebelfahrt,
  // damit sie nie die Kameras im Zimmer einschliesst
  voidBox.position.set(0, 1500, HZ - 3620)
  const smokeTex = canvasTex(256, 256, (g, w, h) => {
    seed = 53
    g.clearRect(0, 0, w, h)
    for (let i = 0; i < 40; i++) {
      const x = 40 + rnd() * 176, y = 40 + rnd() * 176, r = 30 + rnd() * 70
      const gr = g.createRadialGradient(x, y, 0, x, y, r)
      gr.addColorStop(0, 'rgba(255,255,255,.14)'); gr.addColorStop(1, 'rgba(255,255,255,0)')
      g.fillStyle = gr; g.fillRect(0, 0, w, h)
    }
  })
  const smokeMat = track(new MeshBasicMaterial({ map: smokeTex, color: 0x34343e, transparent: true, opacity: 0.42, depthWrite: false, fog: false }))
  const smokeGeo = track(new PlaneGeometry(1, 1))
  const fog = []
  seed = 61
  for (let i = 0; i < 12; i++) {
    const m = add(new Mesh(smokeGeo, smokeMat))
    const sz = 1500 + rnd() * 1600
    m.scale.set(sz, sz, 1)
    m.position.set((rnd() - 0.5) * 1400, 800 + rnd() * 1300, HZ - 1750 - i * 260)
    m.rotation.z = rnd() * 6
    m.userData.spin = (rnd() - 0.5) * 0.25
    m.userData.drift = rnd() * 6
    fog.push(m)
  }

  const hallMerge = mergeStatic(hallScene, { keep: [door, bellBtn, bellLabel] })
  hallMerge.created.forEach((m) => track(m.geometry))

  function setLabels(next) {
    text = { ...text, ...next }
    plateTex.redraw()
    matTex.redraw()
  }

  // Tag (k = 1) und Nacht (k = 0) mischen: Lampen, LED-Leisten, Glas, Stadt
  const C = (hex) => new Color(hex)
  const V3 = (x, y, z) => new Vector3(x, y, z)
  const look = {
    hemiSky: [C(0x8580d6), C(0xffe9d2)], hemiGround: [C(0x2a2238), C(0x6e5a48)], hemiI: [0.36, 0.7],
    fillColor: [C(0xb4a6ff), C(0xffc890)], fillI: [0.32, 0.75], fillPos: [V3(400, 1800, 3200), V3(-2500, 1500, -200)],
    ledColor: [C(LED), C(0xffbf86)],
    // tagsüber: zwei LED-Lampen werden zu "Licht, das vom sonnigen Boden zurückstrahlt"
    ledI: [[0.17, 0.17, 0.17, 0.17], [0.32, 0, 0.18, 0]],
    ledPos: [leds.map((l) => l.position.clone()), [V3(-1300, 250, -1100), V3(1500, RH - 200, -1900), V3(-900, 300, 300), V3(2400, RH - 200, 800)]],
    strip: [C(LED), C(0x4a4a52)], wash: [0.55, 0], glass: [0.06, 0.04], sunI: [0, 5.5], fillDist: [5000, 4300],
  }
  const mixN = (pair, k) => pair[0] + (pair[1] - pair[0]) * k
  function setDay(k) {
    hemi.color.lerpColors(look.hemiSky[0], look.hemiSky[1], k)
    hemi.groundColor.lerpColors(look.hemiGround[0], look.hemiGround[1], k)
    hemi.intensity = mixN(look.hemiI, k)
    fill.color.lerpColors(look.fillColor[0], look.fillColor[1], k)
    fill.intensity = mixN(look.fillI, k)
    fill.position.lerpVectors(look.fillPos[0], look.fillPos[1], k)
    fill.distance = mixN(look.fillDist, k) // tagsüber: am Fenster heller, nach hinten weicher
    leds.forEach((l, i) => {
      l.color.lerpColors(look.ledColor[0], look.ledColor[1], k)
      l.intensity = mixN([look.ledI[0][i], look.ledI[1][i]], k)
      l.position.lerpVectors(look.ledPos[0][i], look.ledPos[1][i], k)
    })
    stripMat.color.lerpColors(look.strip[0], look.strip[1], k)
    washMat.opacity = mixN(look.wash, k)
    glassMat.opacity = mixN(look.glass, k)
    sun.intensity = mixN(look.sunI, k)
    city.setDay(k)
  }

  function dispose() {
    city.dispose()
    for (const o of disposables) o.dispose?.()
    disposables.length = 0
  }

  return {
    scene, hallScene, city,
    setDay, setLightMode,
    stats: { room: roomMerge, hall: hallMerge },
    door, slab, plate, bellBtn, bellLabel,
    tvScreen, tvLight, tvGlow,
    screenMesh, monitorLight, monitorGlow,
    tvHit, pcHit, winHit, fog, cats,
    redrawAll: () => redraws.forEach((r) => r()),
    setLabels,
    dispose,
  }
}
