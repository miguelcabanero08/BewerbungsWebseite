// Comic-Effekte im Zimmer: Musiknoten steigen seitlich am Fernseher auf, "Zzz"
// steigt bei den schlafenden Katzen auf. Gezeichnete Pfade mit dickem Rand, nicht als Schriftzeichen.
// Alle Teilchen sind Instanzen EINER Fläche (ein Draw-Call statt einer pro Teilchen), die sich
// im Shader zur Kamera dreht, genau wie ein three.js-Sprite. Die drei Formen liegen
// nebeneinander in einer Textur.
import {
  CanvasTexture, DynamicDrawUsage, InstancedBufferAttribute, InstancedMesh, PlaneGeometry, ShaderMaterial, SRGBColorSpace, Vector3,
} from 'three'

const INK = '#1b1530'
const PAPER = '#f2ecff'
const TILE = 128

// Achtelnote: Kopf, Hals, Fähnchen
const eighthNote = (p) => {
  p.ellipse(46, 96, 21, 15, -0.4, 0, Math.PI * 2)
  p.rect(60, 22, 9, 76)
  p.moveTo(64, 22)
  p.bezierCurveTo(88, 32, 100, 48, 92, 70)
  p.bezierCurveTo(90, 56, 80, 48, 66, 46)
  p.closePath()
}
// Zwei verbundene Achtelnoten
const beamedNotes = (p) => {
  p.ellipse(30, 100, 17, 12, -0.4, 0, Math.PI * 2)
  p.ellipse(88, 88, 17, 12, -0.4, 0, Math.PI * 2)
  p.rect(41, 30, 8, 70)
  p.rect(99, 18, 8, 70)
  p.moveTo(41, 30); p.lineTo(107, 18); p.lineTo(107, 34); p.lineTo(41, 46); p.closePath()
}
// Dickes "Z"
const zShape = (p) => {
  p.moveTo(22, 22); p.lineTo(106, 22); p.lineTo(106, 42); p.lineTo(50, 96); p.lineTo(106, 96)
  p.lineTo(106, 116); p.lineTo(22, 116); p.lineTo(22, 96); p.lineTo(78, 42); p.lineTo(22, 42); p.closePath()
}
const SHAPES = [eighthNote, beamedNotes, zShape] // Kachel 0, 1, 2

function atlasTexture() {
  const c = document.createElement('canvas')
  c.width = TILE * SHAPES.length
  c.height = TILE
  const g = c.getContext('2d')
  SHAPES.forEach((draw, i) => {
    const path = new Path2D()
    draw(path)
    g.save()
    g.translate(i * TILE, 0)
    g.lineJoin = 'round'
    g.lineCap = 'round'
    g.lineWidth = 12
    g.strokeStyle = INK
    g.stroke(path)
    g.fillStyle = PAPER
    g.fill(path)
    g.restore()
  })
  const t = new CanvasTexture(c)
  t.colorSpace = SRGBColorSpace
  return t
}

// wie three.js SpriteMaterial (sizeAttenuation, rotation, ohne Tone-Mapping und Nebel)
const vertexShader = /* glsl */ `
  attribute vec3 aPos;
  attribute vec4 aMisc; // Grösse, Drehung, Deckkraft, Kachel
  uniform float uTiles;
  varying vec2 vUv;
  varying float vAlpha;
  void main() {
    vec4 mv = viewMatrix * vec4(aPos, 1.0);
    vec2 c = position.xy * aMisc.x;
    float s = sin(aMisc.y), co = cos(aMisc.y);
    mv.xy += vec2(co * c.x - s * c.y, s * c.x + co * c.y);
    gl_Position = projectionMatrix * mv;
    vUv = vec2((uv.x + aMisc.w) / uTiles, uv.y);
    vAlpha = aMisc.z;
  }
`
const fragmentShader = /* glsl */ `
  uniform sampler2D map;
  varying vec2 vUv;
  varying float vAlpha;
  void main() {
    vec4 t = texture2D(map, vUv);
    gl_FragColor = vec4(t.rgb, t.a * vAlpha);
    #include <colorspace_fragment>
  }
`

export function createFx(scene, { tv, cats, reduceMotion }) {
  const texture = atlasTexture()
  let seed = 97
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647

  const MAX = 24
  const pos = new Float32Array(MAX * 3), misc = new Float32Array(MAX * 4)
  const geometry = new PlaneGeometry(1, 1)
  const aPos = new InstancedBufferAttribute(pos, 3).setUsage(DynamicDrawUsage)
  const aMisc = new InstancedBufferAttribute(misc, 4).setUsage(DynamicDrawUsage)
  geometry.setAttribute('aPos', aPos)
  geometry.setAttribute('aMisc', aMisc)
  const material = new ShaderMaterial({
    uniforms: { map: { value: texture }, uTiles: { value: SHAPES.length } },
    vertexShader, fragmentShader, transparent: true, depthWrite: false,
  })
  const mesh = new InstancedMesh(geometry, material, MAX)
  mesh.name = 'fx'
  mesh.frustumCulled = false
  mesh.count = 0
  mesh.visible = false
  scene.add(mesh)

  const makePool = (n) => Array.from({ length: n }, () => ({
    alive: false, age: 0, life: 1, p: new Vector3(), vel: new Vector3(), size: 100, grow: 1, spin: 0, rot: 0, phase: 0, maxOpacity: 0.9, opacity: 0, tile: 0,
  }))
  const notes = makePool(12)
  const zs = makePool(12)
  const take = (pool) => pool.find((p) => !p.alive)

  let noteSide = 1, noteTimer = 0.4, zTimer = 0.8, zCat = 0
  const headPos = new Vector3()

  function spawnNote() {
    const p = take(notes)
    if (!p) return
    noteSide = -noteSide
    p.tile = rnd() > 0.5 ? 1 : 0
    p.p.set(tv.x + noteSide * (tv.w / 2 + 40 + rnd() * 60), tv.y - 180 + rnd() * 300, tv.z + 60)
    p.vel.set(noteSide * (18 + rnd() * 30), 120 + rnd() * 60, 10)
    p.size = 85 + rnd() * 30
    p.grow = 1.15
    p.spin = (rnd() - 0.5) * 0.6
    p.rot = (rnd() - 0.5) * 0.6
    p.phase = rnd() * 6
    p.life = 3.4 + rnd() * 1
    p.age = 0
    p.maxOpacity = 0.9
    p.alive = true
  }

  function spawnZ() {
    if (!cats.length) return
    const cat = cats[zCat % cats.length]
    zCat++
    const p = take(zs)
    if (!p) return
    p.tile = 2
    cat.head.getWorldPosition(headPos)
    p.p.set(headPos.x + 40, headPos.y + 70, headPos.z + 20)
    p.vel.set(70 + rnd() * 30, 125 + rnd() * 30, 45)
    p.size = 50
    p.grow = 2.7 // wächst beim Aufsteigen: z → Z
    p.spin = 0.15
    p.rot = -0.2 + rnd() * 0.2
    p.phase = rnd() * 6
    p.life = 3 + rnd() * 0.6
    p.age = 0
    p.maxOpacity = 0.85
    p.alive = true
  }

  let count = 0
  function step(pool, dt, t) {
    for (const p of pool) {
      if (!p.alive) continue
      p.age += dt
      const k = p.age / p.life
      if (k >= 1) { p.alive = false; continue }
      p.p.addScaledVector(p.vel, dt)
      p.p.x += Math.sin(t * 2.2 + p.phase) * 22 * dt // leichtes Schaukeln
      const fadeIn = Math.min(1, k / 0.15)
      const fadeOut = k > 0.6 ? 1 - (k - 0.6) / 0.4 : 1
      p.rot += p.spin * dt
      pos.set([p.p.x, p.p.y, p.p.z], count * 3)
      misc.set([p.size * (1 + (p.grow - 1) * k), p.rot, p.maxOpacity * fadeIn * fadeOut, p.tile], count * 4)
      count++
    }
  }

  return {
    // active: Effekte sichtbar (Zimmer/Fernseher); tvPlaying: Film läuft gerade
    update(dt, t, { active, tvPlaying }) {
      if (active && !reduceMotion) {
        noteTimer -= dt
        if (noteTimer <= 0) { if (tvPlaying) spawnNote(); noteTimer = 0.55 + rnd() * 0.45 }
        zTimer -= dt
        if (zTimer <= 0) { spawnZ(); zTimer = 0.9 + rnd() * 0.5 }
      }
      count = 0
      step(notes, dt, t)
      step(zs, dt, t)
      mesh.count = count
      mesh.visible = count > 0
      if (count) { aPos.needsUpdate = true; aMisc.needsUpdate = true }
    },
    dispose() {
      scene.remove(mesh)
      geometry.dispose()
      material.dispose()
      texture.dispose()
    },
  }
}
