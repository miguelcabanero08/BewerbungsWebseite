// Stadt vor dem Fenster (NYC-artig): echte 3D-Häuser statt Bild, damit sich die
// Perspektive mit der Kamera ändert. Sparsam gebaut:
//  - Häuser sind Instanzen einer Kiste, aufgeteilt in Kacheln (Sektoren rund ums
//    Fenster, getrennt nach Entfernung). Pro Kachel ein Draw-Call.
//  - Sichtbarkeit (cull): gezeichnet wird nur, was man durch die Fensteröffnung sehen
//    kann. Ist das Fenster nicht im Bild, fallen Stadt und Himmel ganz weg. Die Daten
//    einer Kachel gehen erst beim ersten Zeichnen auf die Grafikkarte.
//  - LOD: ferne Kacheln nutzen einen einfachen Shader ohne Fensterraster und lassen
//    Kleinteile (Antennen, Dachaufbauten, Wassertürme) weg.
//  - eigene, unbeleuchtete Shader: Fenster, Tag/Nacht und Dunst werden gerechnet,
//    keine Texturen, keine Lichtquellen
//  - wird nach dem Zimmer gezeichnet (renderOrder), Pixel hinter den Wänden fallen
//    dadurch gleich beim Tiefentest weg
// Einheiten: Millimeter wie im Zimmer. Wir wohnen im 6. Stock, die Strasse liegt 16 m tiefer.
import {
  BackSide, Box3, BoxGeometry, BufferGeometry, Float32BufferAttribute, ConeGeometry, CylinderGeometry, Group, InstancedBufferAttribute, InstancedMesh, LOD, Matrix4, Mesh, Object3D, Plane,
  ShaderMaterial, SphereGeometry, Vector2, Vector3, Vector4,
} from 'three'

const STREET = -16000
const BASE = STREET - 2000 // Häuser reichen etwas unter die Strasse, keine Lücken
const ACROSS = -23250 // Fassaden auf der anderen Strassenseite (20 m breite Avenue)
const FACADE = -3250 // Aussenseite unserer Hauswand
const STREET_FAR = -300000 // so weit die Avenue hinunter gibt es Strassenmarkierungen

// Fassaden-Typen (im Shader: Grundfarbe, Fensterform)
const K = { brickRed: 0, brickBrown: 1, stone: 2, concrete: 3, glass: 4, deco: 5, tank: 6, metal: 7, ground: 8 }

const vertexShader = /* glsl */ `
  attribute vec4 aInfo; // x: Zufallswert, y: Typ, z: Fensterbreite, w: Geschosshöhe
  varying vec3 vLocal;
  varying vec3 vN;
  varying vec3 vWorld;
  flat varying vec4 vInfo; // flat: sonst schwankt der Wert minimal pro Pixel und der Zufall rauscht
  varying vec3 vSize;
  void main() {
    vec3 sc = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz));
    vSize = sc;
    vLocal = (position + 0.5) * sc;
    vN = normal;
    vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
    vWorld = wp.xyz;
    vInfo = aInfo;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`

const commonFrag = /* glsl */ `
  uniform float uDay;
  uniform vec3 uSun;
  uniform vec3 uHazeDay;
  uniform vec3 uHazeNight;
  varying vec3 vLocal;
  varying vec3 vN;
  varying vec3 vWorld;
  flat varying vec4 vInfo; // flat: sonst schwankt der Wert minimal pro Pixel und der Zufall rauscht
  varying vec3 vSize;

  float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }

  vec3 haze(vec3 col) {
    float d = length(vWorld - cameraPosition);
    float hz = 1.0 - exp(-d / mix(1500000.0, 2100000.0, uDay));
    return mix(col, mix(uHazeNight, uHazeDay, uDay), hz);
  }

  vec3 baseColor(float kind, float seed) {
    vec3 c;
    if (kind < 0.5) c = vec3(0.32, 0.11, 0.07);
    else if (kind < 1.5) c = vec3(0.22, 0.12, 0.075);
    else if (kind < 2.5) c = vec3(0.56, 0.49, 0.37);
    else if (kind < 3.5) c = vec3(0.36, 0.36, 0.37);
    else if (kind < 4.5) c = vec3(0.08, 0.12, 0.17);
    else if (kind < 5.5) c = vec3(0.5, 0.45, 0.37);
    else if (kind < 6.5) c = vec3(0.26, 0.15, 0.09);
    else if (kind < 7.5) c = vec3(0.05, 0.05, 0.055);
    else c = vec3(0.06, 0.06, 0.065);
    return c * (0.82 + 0.36 * fract(seed * 7.31));
  }
`

// Stufe 0: Fensterraster, einzeln beleuchtete Fenster
const fragmentShader = commonFrag + /* glsl */ `
  void main() {
    vec3 n = normalize(vN);
    float seed = vInfo.x, kind = vInfo.y;
    vec3 base = baseColor(kind, seed);
    bool wall = abs(n.y) < 0.5 && kind < 5.5;
    bool glass = kind > 3.5 && kind < 4.5;
    vec2 f = abs(n.x) > 0.5 ? vec2(vLocal.z, vLocal.y) : vec2(vLocal.x, vLocal.y);

    // Fensterraster: eine Zelle pro Fenster und Geschoss
    vec2 cell = f / vInfo.zw;
    vec2 id = floor(cell), uv = fract(cell);
    vec2 lo = glass ? vec2(0.05, 0.1) : vec2(0.22, 0.3);
    vec2 hi = glass ? vec2(0.95, 0.95) : vec2(0.78, 0.86);
    bool band = wall && f.y > 3400.0 && f.y < vSize.y - 900.0;
    float m = 0.0;
    if (band) { vec2 w2 = step(lo, uv) * step(uv, hi); m = w2.x * w2.y; }
    // in der Ferne wird das Raster zum Mittelwert, sonst flimmert es
    vec2 fw = fwidth(cell);
    float far = smoothstep(0.25, 0.75, max(fw.x, fw.y));
    float cover = band ? (hi.x - lo.x) * (hi.y - lo.y) : 0.0;
    m = mix(m, cover, far);

    float r = hash(id + seed * 13.7);
    float litP = glass ? 0.5 : 0.34;
    float lit = step(1.0 - litP, r);
    vec3 warm = mix(vec3(1.0, 0.42, 0.12), vec3(1.0, 0.64, 0.3), hash(id * 1.7 + seed));
    vec3 litC = (glass && hash(id + 2.3) > 0.45 ? vec3(0.62, 0.76, 1.0) : warm) * (0.35 + 0.6 * hash(id * 3.1 + seed));

    // Tag: Sonne und Himmel als einfache Schattierung über die Flächennormale
    float sunK = max(dot(n, uSun), 0.0);
    vec3 dayWall = base * (0.58 + 0.3 * max(n.y, 0.0) + 1.0 * sunK);
    vec3 dayWin = mix(vec3(0.05, 0.06, 0.08), vec3(0.34, 0.45, 0.6), glass ? 0.75 : 0.2 + 0.4 * r);
    vec3 dayWinAvg = glass ? vec3(0.26, 0.34, 0.46) : vec3(0.16, 0.19, 0.25);
    // Nacht: dunkle Fassaden, zufällig beleuchtete Fenster
    vec3 nightWall = base * 0.045 + vec3(0.005, 0.004, 0.01);
    vec3 nightWin = mix(vec3(0.008, 0.01, 0.018), litC, lit);
    vec3 nightWinAvg = mix(vec3(0.008, 0.01, 0.018), vec3(1.0, 0.62, 0.3) * 0.65, litP);

    vec3 wallC = mix(nightWall, dayWall, uDay);
    vec3 winC = mix(mix(nightWin, nightWinAvg, far), mix(dayWin, dayWinAvg, far), uDay);
    vec3 col = mix(wallC, winC, m);
    if (kind > 5.5 && kind < 6.5) col *= 0.82 + 0.18 * step(0.12, fract(vLocal.y / 900.0)); // Reifen am Holztank

    gl_FragColor = vec4(haze(col), 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`

// Stufe 1 (LOD, ferne Kacheln): Fenster nur als mittlere Helligkeit, kein Raster,
// kein Zufall pro Fenster. Auf diese Entfernung wären die Fenster ohnehin kleiner als ein Pixel.
const fragmentFar = commonFrag + /* glsl */ `
  void main() {
    vec3 n = normalize(vN);
    float kind = vInfo.y;
    vec3 base = baseColor(kind, vInfo.x);
    bool glass = kind > 3.5 && kind < 4.5;
    float cover = abs(n.y) < 0.5 && kind < 5.5 ? (glass ? 0.77 : 0.3) : 0.0;
    float sunK = max(dot(n, uSun), 0.0);
    vec3 dayC = mix(base * (0.58 + 0.3 * max(n.y, 0.0) + sunK), glass ? vec3(0.26, 0.34, 0.46) : vec3(0.16, 0.19, 0.25), cover);
    vec3 nightC = mix(base * 0.045 + vec3(0.005, 0.004, 0.01), mix(vec3(0.008, 0.01, 0.018), vec3(1.0, 0.62, 0.3) * 0.65, glass ? 0.5 : 0.34), cover);
    gl_FragColor = vec4(haze(mix(nightC, dayC, uDay)), 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`

// Strasse: Asphalt, Gehsteige mit Fugen, Randsteine, Velostreifen, Spurlinien, Zebrastreifen.
// Alles prozedural (keine Textur), Linien per fwidth gefiltert, damit sie in der Ferne nicht flimmern.
const streetVertex = /* glsl */ `
  attribute vec3 aSt; // x: quer zur Strasse (mm), y: entlang (mm), z: 0 Avenue, 1 Querstrasse
  varying vec3 vSt;
  varying vec3 vWorld;
  void main() {
    vSt = aSt;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorld = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`

const streetFragment = /* glsl */ `
  uniform float uDay;
  uniform vec3 uSun;
  uniform vec3 uHazeDay;
  uniform vec3 uHazeNight;
  uniform vec2 uCross[6]; // Querstrassen (z von, z bis) entlang der Avenue
  varying vec3 vSt;
  varying vec3 vWorld;

  float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }
  // Anteil eines Pixels, der im Bereich [a, b] liegt (gefiltert)
  float band(float x, float a, float b) {
    float w = max(fwidth(x), 1.0);
    return clamp((min(x + 0.5 * w, b) - max(x - 0.5 * w, a)) / w, 0.0, 1.0);
  }
  // wiederkehrende Balken der Breite b alle p (gefiltert über die Pixelbreite)
  float barsF(float x, float p, float b) { return floor(x / p) * b + min(mod(x, p), b); }
  float bars(float x, float p, float b) {
    float w = max(fwidth(x), 1.0);
    return (barsF(x + 0.5 * w, p, b) - barsF(x - 0.5 * w, p, b)) / w;
  }

  void main() {
    float u = vSt.x, v = vSt.y;
    bool cross = vSt.z > 0.5;
    float W = cross ? 18000.0 : 20000.0, side = cross ? 3500.0 : 4000.0;

    // Avenue: Kreuzungen und Zebrastreifen davor und danach
    float inX = 0.0, zebraBand = 0.0;
    if (!cross) {
      for (int i = 0; i < 6; i++) {
        vec2 c = uCross[i];
        inX = max(inX, band(v, c.x, c.y));
        zebraBand = max(zebraBand, max(band(v, c.y + 500.0, c.y + 3500.0), band(v, c.x - 3500.0, c.x - 500.0)));
      }
    } else {
      zebraBand = band(v, -ACROSS_X + 600.0, -ACROSS_X + 3600.0); // an der Einmündung in die Avenue
    }

    float walk = (band(u, 0.0, side) + band(u, W - side, W)) * (1.0 - inX);
    float curb = (band(u, side - 160.0, side) + band(u, W - side, W - side + 160.0)) * (1.0 - inX);
    float road = clamp(1.0 - walk - curb, 0.0, 1.0);

    vec3 asphalt = vec3(0.07, 0.07, 0.075) * (0.82 + 0.36 * noise(vWorld.xz / 2600.0));
    float joints = max(bars(u + 40.0, 1500.0, 30.0), bars(v + 40.0, 1500.0, 30.0));
    vec3 concrete = vec3(0.33, 0.32, 0.3) * (1.0 - 0.3 * joints) * (0.92 + 0.16 * noise(vWorld.xz / 900.0));
    vec3 col = mix(asphalt, concrete, walk);
    col = mix(col, vec3(0.46, 0.45, 0.43), curb);

    vec3 white = vec3(0.7, 0.7, 0.68), yellow = vec3(0.68, 0.48, 0.08);
    float inRoad = band(u, side, W - side);
    if (!cross) {
      float bike = band(u, side + 300.0, side + 2100.0) * (1.0 - inX) * (1.0 - zebraBand);
      col = mix(col, vec3(0.05, 0.17, 0.08), bike); // grüner Velostreifen wie in New York
      float lines = band(u, side + 2100.0, side + 2220.0) * (1.0 - inX);
      lines += (band(u, 9240.0, 9360.0) + band(u, 12540.0, 12660.0)) * bars(v, 12000.0, 3000.0) * (1.0 - inX) * (1.0 - zebraBand);
      col = mix(col, white, clamp(lines, 0.0, 1.0) * road);
    } else {
      float yel = (band(u, 8820.0, 8940.0) + band(u, 9060.0, 9180.0)) * (1.0 - zebraBand);
      col = mix(col, yellow, clamp(yel, 0.0, 1.0) * road);
    }
    col = mix(col, white, zebraBand * bars(u - side, 1200.0, 600.0) * inRoad);

    // Tag: wie die Dächer der Häuser beleuchtet. Nacht: dunkel, Lichtkegel der Strassenlampen
    vec3 day = col * (0.88 + max(uSun.y, 0.0));
    float pv = mod(v, 30000.0) - 15000.0, pv2 = mod(v + 15000.0, 30000.0) - 15000.0;
    float pu1 = u - side - 400.0, pu2 = u - (W - side - 400.0);
    float pool = exp(-(pv * pv + pu1 * pu1) / 2.0e7) + exp(-(pv2 * pv2 + pu2 * pu2) / 2.0e7);
    vec3 night = col * 0.05 + vec3(1.0, 0.66, 0.34) * 0.16 * pool * (0.5 + 1.5 * (col.r + col.g));
    vec3 c = mix(night, day, uDay);

    float d = length(vWorld - cameraPosition);
    float hz = 1.0 - exp(-d / mix(1500000.0, 2100000.0, uDay));
    gl_FragColor = vec4(mix(c, mix(uHazeNight, uHazeDay, uDay), hz), 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`.replaceAll('ACROSS_X', String(Math.abs(ACROSS)) + '.0')

const skyVertex = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vDir = wp.xyz - cameraPosition;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`

const skyFragment = /* glsl */ `
  uniform float uDay;
  uniform vec3 uSun;
  uniform vec3 uHazeDay;
  uniform vec3 uHazeNight;
  varying vec3 vDir;

  float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
  float hash3(vec3 p) { return hash(p.xy + p.z * 17.13); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }

  void main() {
    vec3 d = normalize(vDir);
    float h = d.y;
    // Tag: warmer Nachmittag, Sonnenschein, ein paar Wolken
    vec3 day = mix(uHazeDay, vec3(0.2, 0.42, 0.82), pow(smoothstep(0.0, 0.32, h), 0.55));
    float s = max(dot(d, uSun), 0.0);
    day += vec3(1.0, 0.7, 0.4) * (0.3 * pow(s, 5.0) + 4.0 * pow(s, 900.0));
    vec2 cp = d.xz / (h + 0.12) * 2.2;
    float cl = noise(cp) * 0.6 + noise(cp * 2.3 + 7.1) * 0.3 + noise(cp * 5.1 + 3.0) * 0.1;
    cl = smoothstep(0.55, 0.85, cl) * smoothstep(0.02, 0.2, h);
    day = mix(day, vec3(1.0, 0.96, 0.92) * (0.85 + 0.3 * s), cl * 0.7);
    // Nacht: dunkelblau, unten Lichtglocke der Stadt, wenige Sterne
    vec3 night = mix(uHazeNight, vec3(0.004, 0.007, 0.022), smoothstep(0.0, 0.4, h));
    night += step(0.9965, hash3(floor(d * 900.0))) * smoothstep(0.15, 0.4, h) * 0.5;

    vec3 col = h < 0.0 ? mix(uHazeNight, uHazeDay * 0.85, uDay) : mix(night, day, uDay);
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`

// portal: Fensteröffnung in der Wand { x, y0, y1, z0, z1 } für die Sichtbarkeitsprüfung
export function createCity({ sunDir, portal }) {
  let s = 4242
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)]
  const boxes = [] // [x0, x1, y0, y1, z0, z1, kind, colW, floorH, detail]
  const tanks = [] // [x, y, z]
  // detail = Kleinteil, fällt in der fernen LOD-Stufe weg
  const box = (x0, x1, y0, y1, z0, z1, kind, colW = 2000, floorH = 3300, detail = false) =>
    boxes.push([Math.min(x0, x1), Math.max(x0, x1), y0, y1, Math.min(z0, z1), Math.max(z0, z1), kind, colW, floorH, detail])

  // Wasserturm auf Stelzen (typisch für New Yorker Dächer)
  function waterTower(x, roof, z) {
    for (const [dx, dz] of [[-1050, -1050], [1050, -1050], [-1050, 1050], [1050, 1050]]) box(x + dx - 80, x + dx + 80, roof, roof + 2600, z + dz - 80, z + dz + 80, K.metal, 1e9, 1e9, true)
    box(x - 1400, x + 1400, roof + 2500, roof + 2650, z - 1400, z + 1400, K.metal, 1e9, 1e9, true)
    tanks.push([x, roof + 2650, z])
  }

  // Altbau-Zeile direkt gegenüber: Backstein-Walkups, Dachaufbauten, Wassertürme
  const crossings = []
  let z = 70000
  while (z > -280000) {
    const blockEnd = z - (68000 + rnd() * 26000)
    while (z > blockEnd) {
      const lots = rnd() < 0.55 ? 1 : rnd() < 0.7 ? 2 : 3
      const w = 7600 * lots + (rnd() - 0.5) * 900
      // meist 3–6 Geschosse: vom 6. Stock schaut man darüber hinweg auf die Skyline
      const tall = rnd() < 0.05
      const floors = tall ? 8 + Math.floor(rnd() * 3) : 3 + Math.floor(rnd() * 4)
      const kind = tall ? pick([K.stone, K.concrete, K.deco]) : pick([K.brickRed, K.brickRed, K.brickBrown, K.brickBrown, K.stone, K.concrete])
      const front = ACROSS - rnd() * 400, depth = 15000 + rnd() * 7000
      const top = STREET + floors * 3300 + 700
      box(front - depth, front, BASE, top, z - w, z, kind, 1800 + rnd() * 500)
      if (rnd() < 0.5) {
        const zc = z - w * (0.25 + 0.5 * rnd())
        box(front - depth * 0.75, front - depth * 0.75 + 3200, top, top + 2800, zc - 1600, zc + 1600, K.concrete, 4000, 4000, true)
      }
      if (floors >= 4 && rnd() < 0.7) waterTower(front - depth * (0.35 + 0.3 * rnd()), top, z - w * (0.3 + 0.4 * rnd()))
      z -= w
    }
    crossings.push([blockEnd - 18000, blockEnd])
    z = blockEnd - 18000 // Querstrasse
  }

  // Dahinter: der Rest der langen Blöcke, Häuser stehen an den Querstrassen
  let zTop = 70000
  for (const [zStreetLo, zStreetHi] of crossings) {
    for (const edge of [zTop, zStreetHi]) {
      const facingNorth = edge === zTop
      let x = ACROSS - 24000
      while (x > -330000) {
        const w = 9000 + rnd() * 22000
        const dm = (ACROSS - x) / 1000 // Entfernung in Metern hinter der Häuserzeile
        const isTower = rnd() < 0.05
        const floors = isTower ? 12 + Math.floor(rnd() * 14) : 4 + Math.floor(rnd() * (2 + dm / 28))
        const kind = isTower ? pick([K.glass, K.glass, K.deco, K.concrete]) : pick([K.brickRed, K.brickBrown, K.stone, K.concrete, K.stone])
        const depth = 14000 + rnd() * 16000
        const zA = facingNorth ? edge : edge + depth, zB = facingNorth ? edge - depth : edge
        const fh = isTower ? 3800 : 3300
        const top = STREET + floors * fh
        box(x - w, x, BASE, top, zA, zB, kind, kind === K.glass ? 1500 : 2100, fh)
        if (isTower && rnd() < 0.5) box(x - w * 0.8, x - w * 0.2, top, top + fh * (4 + Math.floor(rnd() * 8)), zA - (zA - zB) * 0.2, zB + (zA - zB) * 0.2, kind, 1600, fh)
        x -= w + (rnd() < 0.15 ? 26000 : 1500) // ab und zu eine Avenue
      }
    }
    zTop = zStreetLo
  }

  // Skyline in der Ferne, rund um das Fenster verteilt (Winkel ab -x Richtung -z)
  const tower = (x, zc, w, d, top, kind) => {
    box(x - w / 2, x + w / 2, BASE, top, zc - d / 2, zc + d / 2, kind, kind === K.glass ? 1500 : 2200, 3900)
    let t = top, ww = w, dd = d
    const steps = rnd() < 0.45 ? 1 + Math.floor(rnd() * 3) : 0
    for (let i = 0; i < steps; i++) { // Rücksprünge wie bei Art-déco-Türmen
      ww *= 0.72; dd *= 0.72
      const h = (top - STREET) * (0.08 + rnd() * 0.12)
      box(x - ww / 2, x + ww / 2, t, t + h, zc - dd / 2, zc + dd / 2, kind, 2200, 3900)
      t += h
    }
    if (steps && rnd() < 0.5) box(x - 600, x + 600, t, t + (top - STREET) * 0.18, zc - 600, zc + 600, K.metal, 1e9, 1e9, true) // Antenne
  }
  for (let i = 0; i < 170; i++) { // flache Bebauung zwischen den Blöcken und der Skyline
    const a = -0.25 + rnd() * 1.6, dist = 340000 + rnd() * 900000
    const w = 14000 + rnd() * 30000
    tower(-3000 - Math.cos(a) * dist, -Math.sin(a) * dist, w, w * (0.6 + rnd() * 0.8), STREET + 14000 + Math.pow(rnd(), 2) * 70000, pick([K.brickRed, K.brickBrown, K.stone, K.concrete, K.glass]))
  }
  for (let i = 0; i < 230; i++) {
    const cluster = rnd()
    // zwei dichte Zentren (wie Midtown und Downtown), dazwischen verstreut
    const a = cluster < 0.45 ? 0.95 + (rnd() - 0.5) * 0.55 : cluster < 0.7 ? 0.32 + (rnd() - 0.5) * 0.4 : -0.2 + rnd() * 1.55
    const dist = cluster < 0.7 ? 1300000 + rnd() * 2400000 : 1200000 + rnd() * 2800000
    const x = -3000 - Math.cos(a) * dist, zc = -Math.sin(a) * dist
    const core = cluster < 0.7 ? 1 : 0.55
    const height = (60000 + Math.pow(rnd(), 1.7) * 300000) * core
    const w = 16000 + rnd() * 34000
    tower(x, zc, w, w * (0.6 + rnd() * 0.8), STREET + height, pick([K.glass, K.glass, K.deco, K.concrete, K.stone]))
  }

  /* ---------- Materialien ---------- */
  const uniforms = {
    uDay: { value: 0 },
    uSun: { value: new Vector3().copy(sunDir).normalize() },
    uHazeDay: { value: new Vector3(0.7, 0.72, 0.74) },
    uHazeNight: { value: new Vector3(0.075, 0.05, 0.1) },
  }
  const material = new ShaderMaterial({ uniforms, vertexShader, fragmentShader })
  const farMaterial = new ShaderMaterial({ uniforms, vertexShader, fragmentShader: fragmentFar })
  const baseBox = new BoxGeometry(1, 1, 1), baseCyl = new CylinderGeometry(0.5, 0.5, 1, 14), baseCone = new ConeGeometry(0.56, 1, 14)
  const disposables = [material, farMaterial, baseBox, baseCyl, baseCone]

  // Grundform teilen (ein Puffer auf der Grafikkarte), nur die Instanz-Daten sind eigen
  function sharedGeometry(base, info) {
    const g = new BufferGeometry()
    g.setIndex(base.index)
    g.setAttribute('position', base.attributes.position)
    g.setAttribute('normal', base.attributes.normal)
    g.setAttribute('aInfo', new InstancedBufferAttribute(info, 4))
    disposables.push(g)
    return g
  }
  const o = new Object3D()
  function instanced(base, rows, mat, place, origin) {
    const info = new Float32Array(rows.length * 4)
    const mesh = new InstancedMesh(sharedGeometry(base, info), mat, rows.length)
    rows.forEach((row, i) => {
      const [kind, colW, floorH] = place(row)
      o.position.sub(origin)
      o.updateMatrix()
      mesh.setMatrixAt(i, o.matrix)
      info.set([rnd() * 100, kind, colW, floorH], i * 4)
    })
    mesh.renderOrder = 5
    mesh.computeBoundingSphere()
    return mesh
  }
  const placeBox = ([x0, x1, y0, y1, z0, z1, kind, colW, floorH]) => {
    o.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2)
    o.scale.set(x1 - x0, y1 - y0, z1 - z0)
    return [kind, colW, floorH]
  }
  const placeTank = ([x, y, zz]) => { o.position.set(x, y + 2300, zz); o.scale.set(3600, 4600, 3600); return [K.tank, 1e9, 1e9] }
  const placeCone = ([x, y, zz]) => { o.position.set(x, y + 5400, zz); o.scale.set(3600, 1600, 3600); return [K.metal, 1e9, 1e9] }

  /* ---------- Kacheln mit LOD ---------- */
  // Sektoren rund ums Fenster, drei Ringe: Nachbarschaft (< 340 m), Stadt (< 1,25 km), Skyline.
  // Ferner als LOD_DIST wird die einfache Stufe gezeichnet (dort sind Fenster < 1 Pixel).
  const LOD_DIST = 1600000
  const OX = portal.x, OZ = (portal.z0 + portal.z1) / 2
  const chunkMap = new Map()
  function chunkFor(x, z) {
    const dx = OX - x, dz = OZ - z, d = Math.hypot(dx, dz)
    const ring = d < 340000 ? 0 : d < 1250000 ? 1 : 2
    const key = ring + ':' + Math.floor(Math.atan2(dz, dx) / [0.4, 0.4, 0.5][ring])
    let c = chunkMap.get(key)
    if (!c) chunkMap.set(key, (c = { main: [], detail: [], tanks: [] }))
    return c
  }
  for (const b of boxes) { const c = chunkFor((b[0] + b[1]) / 2, (b[4] + b[5]) / 2); (b[9] ? c.detail : c.main).push(b) }
  for (const t of tanks) chunkFor(t[0], t[2]).tanks.push(t)

  const group = new Group()
  const chunks = []
  const cam = new Vector3(), aim = new Vector3()
  for (const c of chunkMap.values()) {
    const rows = [...c.main, ...c.detail] // Hauptkörper zuerst: die ferne Stufe zeichnet nur diese
    const center = new Vector3()
    for (const b of rows) { center.x += (b[0] + b[1]) / 2; center.z += (b[4] + b[5]) / 2 }
    center.divideScalar(rows.length)
    const near = new Group()
    const full = instanced(baseBox, rows, material, placeBox, center)
    near.add(full)
    if (c.tanks.length) near.add(instanced(baseCyl, c.tanks, material, placeTank, center), instanced(baseCone, c.tanks, material, placeCone, center))
    // ferne Stufe: dieselben Instanz-Daten, nur weniger davon und der einfache Shader
    const far = new InstancedMesh(full.geometry, farMaterial, 0)
    far.instanceMatrix = full.instanceMatrix
    far.count = c.main.length
    far.renderOrder = 5
    far.computeBoundingSphere()
    const lod = new LOD()
    lod.position.copy(center)
    lod.addLevel(near, 0)
    lod.addLevel(far, LOD_DIST)
    group.add(lod)
    // enge Hülle der Kachel (Welt-Koordinaten) für die Sichtbarkeitsprüfung
    const bounds = new Box3()
    for (const b of rows) { bounds.expandByPoint(aim.set(b[0], b[2], b[4])); bounds.expandByPoint(aim.set(b[1], b[3] + (c.tanks.length ? 7000 : 0), b[5])) }
    chunks.push({ lod, bounds })
  }

  // Boden (Strassen) als flache Riesen-Kiste, immer mit dem einfachen Shader
  const ground = instanced(baseBox, [[-6000000, 6000000, STREET - 1200, STREET - 200, -6000000, 6000000, K.ground, 1e9, 1e9]], farMaterial, placeBox, new Vector3())
  ground.frustumCulled = false
  group.add(ground)

  const skyMat = new ShaderMaterial({ uniforms, vertexShader: skyVertex, fragmentShader: skyFragment, side: BackSide, depthWrite: false })
  const skyGeo = new SphereGeometry(7000000, 32, 16)
  const sky = new Mesh(skyGeo, skyMat)
  sky.frustumCulled = false
  sky.renderOrder = 6
  group.add(sky)
  disposables.push(skyMat, skyGeo)

  /* ---------- Strasse: nur der Teil, den man vom Fenster aus sieht ---------- */
  // Avenue vor dem Haus (bis 300 m die Strasse hinunter) und die Querstrassen in diesem
  // Bereich bis 140 m hinein. Ein Draw-Call, Teil der Sichtbarkeitsprüfung wie die Kacheln.
  const nearCross = crossings.filter(([lo, hi]) => hi > STREET_FAR && lo < 70000).slice(0, 6)
  const stPos = [], stInfo = [], stIndex = []
  function streetQuad(cornersXZ, uv, type) {
    const i0 = stPos.length / 3
    cornersXZ.forEach(([x, zz], i) => { stPos.push(x, STREET, zz); stInfo.push(uv[i][0], uv[i][1], type) })
    stIndex.push(i0, i0 + 2, i0 + 1, i0, i0 + 3, i0 + 2) // Normale nach oben
  }
  // Avenue: u ab der Hausfront gegenüber, v entlang z
  streetQuad([[ACROSS, STREET_FAR], [FACADE, STREET_FAR], [FACADE, 70000], [ACROSS, 70000]],
    [[0, STREET_FAR], [FACADE - ACROSS, STREET_FAR], [FACADE - ACROSS, 70000], [0, 70000]], 0)
  // Querstrassen: u quer (ab z von), v = Abstand von der Avenue-Mitte nach aussen
  for (const [lo, hi] of nearCross) {
    streetQuad([[-140000, lo], [ACROSS, lo], [ACROSS, hi], [-140000, hi]],
      [[0, 140000], [0, -ACROSS], [hi - lo, -ACROSS], [hi - lo, 140000]], 1)
  }
  const streetGeo = new BufferGeometry()
  streetGeo.setAttribute('position', new Float32BufferAttribute(stPos, 3))
  streetGeo.setAttribute('aSt', new Float32BufferAttribute(stInfo, 3))
  streetGeo.setIndex(stIndex)
  streetGeo.computeBoundingSphere()
  const crossUniform = Array.from({ length: 6 }, (_, i) => (nearCross[i] ? new Vector2(nearCross[i][0], nearCross[i][1]) : new Vector2(1e9, 1e9 + 1)))
  const streetMat = new ShaderMaterial({ uniforms: { ...uniforms, uCross: { value: crossUniform } }, vertexShader: streetVertex, fragmentShader: streetFragment })
  const street = new Mesh(streetGeo, streetMat)
  street.renderOrder = 5
  group.add(street)
  disposables.push(streetGeo, streetMat)
  {
    const bounds = new Box3().setFromBufferAttribute(streetGeo.attributes.position)
    bounds.min.y -= 10; bounds.max.y += 10
    chunks.push({ lod: street, bounds })
  }

  /* ---------- Sichtbarkeit durch die Fensteröffnung ---------- */
  const corners = [
    new Vector3(portal.x, portal.y0, portal.z0), new Vector3(portal.x, portal.y0, portal.z1),
    new Vector3(portal.x, portal.y1, portal.z1), new Vector3(portal.x, portal.y1, portal.z0),
  ]
  const portalCenter = new Vector3(portal.x, (portal.y0 + portal.y1) / 2, OZ)
  const planes = corners.map(() => new Plane())
  const clip = new Matrix4(), v4 = new Vector4()
  const lastCam = new Float64Array(32).fill(NaN)
  let visibleChunks = chunks.length

  function cull(camera) {
    // Kamera unverändert → Ergebnis vom letzten Bild gilt weiter
    const a = camera.matrixWorld.elements, p = camera.projectionMatrix.elements
    let same = true
    for (let i = 0; i < 16; i++) {
      if (lastCam[i] !== a[i]) { same = false; lastCam[i] = a[i] }
      if (lastCam[16 + i] !== p[i]) { same = false; lastCam[16 + i] = p[i] }
    }
    if (same) return

    // Kamera draussen (nur beim Testen): alles zeigen
    cam.setFromMatrixPosition(camera.matrixWorld)
    if (cam.x <= portal.x) {
      group.visible = true
      for (const ch of chunks) ch.lod.visible = true
      visibleChunks = chunks.length
      return
    }

    // 1) Fenster überhaupt im Bild? (alle Ecken jenseits derselben Bildkante → nein)
    clip.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
    const out = [0, 0, 0, 0, 0]
    for (const c of corners) {
      v4.set(c.x, c.y, c.z, 1).applyMatrix4(clip)
      if (v4.x + v4.w < 0) out[0]++
      if (v4.w - v4.x < 0) out[1]++
      if (v4.y + v4.w < 0) out[2]++
      if (v4.w - v4.y < 0) out[3]++
      if (v4.z + v4.w < 0) out[4]++
    }
    group.visible = !out.includes(4)
    if (!group.visible) { visibleChunks = 0; return }

    // 2) Pyramide von der Kamera durch die Öffnung: nur Kacheln darin zeichnen
    aim.copy(portalCenter).sub(cam).multiplyScalar(3).add(cam) // sicher innerhalb der Pyramide
    for (let i = 0; i < 4; i++) {
      planes[i].setFromCoplanarPoints(cam, corners[i], corners[(i + 1) % 4])
      if (planes[i].distanceToPoint(aim) < 0) planes[i].negate()
    }
    visibleChunks = 0
    for (const ch of chunks) {
      // Box ausserhalb, wenn selbst ihre Ecke am weitesten in Richtung Ebene davor liegt
      let inside = true
      for (const pl of planes) {
        const { min, max } = ch.bounds, n = pl.normal
        aim.set(n.x > 0 ? max.x : min.x, n.y > 0 ? max.y : min.y, n.z > 0 ? max.z : min.z)
        if (pl.distanceToPoint(aim) < 0) { inside = false; break }
      }
      ch.lod.visible = inside
      if (inside) visibleChunks++
    }
  }

  return {
    group,
    cull,
    // ganz ausblenden (z. B. am PC); beim nächsten cull wird neu gerechnet
    hide() { group.visible = false; lastCam[0] = NaN },
    stats: () => ({ chunks: chunks.length, visible: group.visible ? visibleChunks : 0, instances: boxes.length + tanks.length * 2 }),
    setDay(k) { uniforms.uDay.value = k },
    dispose() { for (const d of disposables) d.dispose() },
  }
}
