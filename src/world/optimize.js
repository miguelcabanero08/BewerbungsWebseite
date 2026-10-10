// Statische Objekte zusammenlegen, ohne das Bild zu verändern:
//  1. Materialien mit identischen Einstellungen werden zu einem einzigen Material
//  2. alle unbewegten Meshes mit demselben Material (und denselben Schatten-Flags)
//     werden zu einer Geometrie verschmolzen (Lage in Weltkoordinaten eingebacken)
// Ergebnis: deutlich weniger Draw-Calls und Statuswechsel pro Bild.
// Ausgenommen: alles, was sich bewegt oder später angesprochen wird (keep), transparente
// Materialien (Sortierung), Instanzen und Materialien, die später geändert werden (protect).
import { Mesh } from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'

const tex = (t) => (t ? t.uuid : '')
const materialKey = (m) => [
  m.type, m.color?.getHex(), m.emissive?.getHex(), m.emissiveIntensity, m.roughness, m.metalness,
  tex(m.map), tex(m.bumpMap), m.bumpScale, tex(m.normalMap), tex(m.roughnessMap), tex(m.metalnessMap),
  tex(m.emissiveMap), tex(m.alphaMap), tex(m.aoMap), tex(m.envMap), tex(m.lightMap),
  m.side, m.shadowSide, m.flatShading, m.vertexColors, m.alphaTest, m.depthWrite, m.depthTest,
  m.colorWrite, m.fog, m.toneMapped, m.opacity, m.wireframe, m.blending, m.polygonOffset,
].join('|')

// Dreiecke umdrehen, falls die Lage gespiegelt ist (sonst zeigt die Vorderseite nach innen)
function flipWinding(geometry) {
  const idx = geometry.index.array
  for (let i = 0; i < idx.length; i += 3) { const t = idx[i + 1]; idx[i + 1] = idx[i + 2]; idx[i + 2] = t }
}

export function mergeStatic(root, { keep = [], protect = [] } = {}) {
  const keepSet = new Set(keep), protectSet = new Set(protect)
  root.updateMatrixWorld(true)
  const kept = (o) => { for (let p = o; p; p = p.parent) if (keepSet.has(p) || !p.visible) return true; return false }

  const candidates = []
  root.traverse((o) => {
    if (!o.isMesh || o.isInstancedMesh || o.isSkinnedMesh) return
    const m = o.material
    if (Array.isArray(m) || m.transparent || !o.geometry.index || o.geometry.morphAttributes.position) return
    if (!kept(o)) candidates.push(o)
  })

  const canonical = new Map()
  const materialFor = (m) => {
    if (protectSet.has(m)) return m
    const k = materialKey(m)
    if (!canonical.has(k)) canonical.set(k, m)
    return canonical.get(k)
  }

  const groups = new Map()
  for (const o of candidates) {
    const mat = materialFor(o.material)
    const attrs = Object.keys(o.geometry.attributes).sort().join(',')
    const key = `${mat.uuid}|${o.castShadow}|${o.receiveShadow}|${o.renderOrder}|${o.layers.mask}|${attrs}`
    if (!groups.has(key)) groups.set(key, { mat, list: [] })
    groups.get(key).list.push(o)
  }

  let before = 0, after = 0
  const created = []
  for (const { mat, list } of groups.values()) {
    before += list.length
    if (list.length < 2) { list[0].material = mat; after++; continue }
    const parts = list.map((o) => {
      const g = o.geometry.clone()
      g.clearGroups()
      g.applyMatrix4(o.matrixWorld)
      if (o.matrixWorld.determinant() < 0) flipWinding(g)
      return g
    })
    const merged = mergeGeometries(parts, false)
    parts.forEach((g) => g.dispose())
    if (!merged) { after += list.length; continue }
    const mesh = new Mesh(merged, mat)
    mesh.name = 'merged'
    mesh.castShadow = list[0].castShadow
    mesh.receiveShadow = list[0].receiveShadow
    mesh.renderOrder = list[0].renderOrder
    mesh.matrixAutoUpdate = false
    root.add(mesh)
    created.push(mesh)
    for (const o of list) o.removeFromParent()
    after++
  }
  return { before, after, materials: canonical.size, created }
}
