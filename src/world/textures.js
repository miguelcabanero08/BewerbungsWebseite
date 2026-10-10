// Prozedurale Materialtexturen (Canvas). Jede Funktion malt in einen 2D-Kontext.
// Graue "Detail"-Texturen (Putz, Stoff) werden mit der Materialfarbe multipliziert,
// farbige (Holz, Karton) tragen ihre Farbe selbst. Viele dienen zugleich als Bump-Map.
// Zufall immer über das übergebene rnd, damit das Zimmer bei jedem Besuch gleich aussieht.

// Punkt, der über die Ränder hinweg wiederholt wird → kachelbar ohne Naht
function dotWrapped(g, x, y, r, w, h) {
  for (const dx of [-w, 0, w]) for (const dy of [-h, 0, h]) {
    const px = x + dx, py = y + dy
    if (px + r < 0 || py + r < 0 || px - r > w || py - r > h) continue
    g.beginPath(); g.arc(px, py, r, 0, Math.PI * 2); g.fill()
  }
}

function grain(g, w, h, rnd, amount) {
  const img = g.getImageData(0, 0, w, h)
  const d = img.data
  for (let i = 0; i < d.length; i += 4) {
    const n = (rnd() - 0.5) * amount
    d[i] += n; d[i + 1] += n; d[i + 2] += n
  }
  g.putImageData(img, 0, 0)
}

// Fein gesprenkelter Wandputz (hell, wird mit der Wandfarbe multipliziert)
export function paintPlaster(g, w, h, rnd) {
  g.fillStyle = 'rgb(240,240,240)'; g.fillRect(0, 0, w, h)
  for (let i = 0; i < 1400; i++) {
    const v = 222 + rnd() * 30 | 0
    g.fillStyle = `rgba(${v},${v},${v},0.35)`
    dotWrapped(g, rnd() * w, rnd() * h, 2 + rnd() * 9, w, h)
  }
  grain(g, w, h, rnd, 12)
}

// Holz: Maserung läuft entlang x, Jahresringe als wellige Linien, ein paar Äste
export function paintWood(g, w, h, rnd, { light, mid, dark, knots = 2 }) {
  g.fillStyle = mid; g.fillRect(0, 0, w, h)
  const bands = 18
  for (let b = 0; b < bands; b++) {
    const y0 = (b / bands) * h
    g.fillStyle = b % 2 ? light : mid
    g.globalAlpha = 0.35 + rnd() * 0.3
    g.fillRect(0, y0, w, h / bands + 1)
  }
  g.globalAlpha = 1
  for (let i = 0; i < 70; i++) {
    const y = rnd() * h, amp = 2 + rnd() * 6, f = 0.004 + rnd() * 0.01, ph = rnd() * 6
    g.strokeStyle = dark
    g.globalAlpha = 0.12 + rnd() * 0.25
    g.lineWidth = 0.6 + rnd() * 1.8
    g.beginPath()
    for (let x = 0; x <= w; x += 8) {
      const yy = y + Math.sin(x * f * Math.PI * 2 + ph) * amp
      if (x === 0) g.moveTo(x, yy)
      else g.lineTo(x, yy)
    }
    g.stroke()
  }
  for (let k = 0; k < knots; k++) {
    const x = rnd() * w, y = rnd() * h
    for (let r = 4; r < 22; r += 3) {
      g.strokeStyle = dark; g.globalAlpha = 0.25; g.lineWidth = 1.2
      g.beginPath(); g.ellipse(x, y, r * 1.9, r * 0.7, 0, 0, Math.PI * 2); g.stroke()
    }
    g.globalAlpha = 0.6; g.fillStyle = dark
    g.beginPath(); g.ellipse(x, y, 5, 2.4, 0, 0, Math.PI * 2); g.fill()
  }
  g.globalAlpha = 1
  grain(g, w, h, rnd, 10)
}

// Webstoff (Sofa, Stuhl): feines Köpermuster in Grau
export function paintFabric(g, w, h, rnd, { base = 228, contrast = 26 } = {}) {
  g.fillStyle = `rgb(${base},${base},${base})`; g.fillRect(0, 0, w, h)
  const s = 4
  for (let y = 0; y < h; y += s) {
    for (let x = 0; x < w; x += s) {
      const on = ((x / s + y / s) % 4) < 2
      const v = base + (on ? contrast / 2 : -contrast / 2) + (rnd() - 0.5) * 10 | 0
      g.fillStyle = `rgb(${v},${v},${v})`
      g.fillRect(x, y, s, s)
    }
  }
  for (let i = 0; i < 160; i++) { // Abnutzung, Fusseln
    const v = base + 18 | 0
    g.fillStyle = `rgba(${v},${v},${v},0.25)`
    dotWrapped(g, rnd() * w, rnd() * h, 3 + rnd() * 14, w, h)
  }
}

// Strickdecke: Reihen aus V-Maschen
export function paintKnit(g, w, h, rnd, { color = '#9a3d2f', dark = '#6e2a20', light = '#b8513f' } = {}) {
  g.fillStyle = color; g.fillRect(0, 0, w, h)
  const cw = 16, ch = 20
  for (let y = 0; y < h; y += ch) {
    for (let x = 0; x < w; x += cw) {
      g.fillStyle = rnd() > 0.5 ? light : color
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + cw / 2, y + ch); g.lineTo(x + cw / 2 - 3, y + ch); g.lineTo(x, y + 4); g.fill()
      g.fillStyle = dark
      g.beginPath(); g.moveTo(x + cw, y); g.lineTo(x + cw / 2, y + ch); g.lineTo(x + cw / 2 + 3, y + ch); g.lineTo(x + cw, y + 4); g.fill()
    }
  }
  grain(g, w, h, rnd, 14)
}

// Wellkarton mit Klebeband in der Mitte
export function paintCardboard(g, w, h, rnd, { tape = true } = {}) {
  g.fillStyle = '#b68b58'; g.fillRect(0, 0, w, h)
  for (let y = 0; y < h; y += 6) { g.fillStyle = `rgba(90,60,25,${0.04 + rnd() * 0.04})`; g.fillRect(0, y, w, 3) }
  for (let i = 0; i < 90; i++) { g.fillStyle = `rgba(80,52,20,${rnd() * 0.12})`; dotWrapped(g, rnd() * w, rnd() * h, 2 + rnd() * 12, w, h) }
  if (tape) {
    const tw = w * 0.18
    g.fillStyle = 'rgba(214,180,120,0.85)'; g.fillRect(w / 2 - tw / 2, 0, tw, h)
    g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(w / 2 - tw / 2, 0, tw * 0.25, h)
    g.strokeStyle = 'rgba(120,85,40,0.35)'; g.lineWidth = 1
    g.strokeRect(w / 2 - tw / 2, -2, tw, h + 4)
  }
  grain(g, w, h, rnd, 16)
}

// Pizzakarton-Deckel: Karton mit einfachem Rundlogo (ohne Markennamen)
export function paintPizzaLid(g, w, h, rnd) {
  paintCardboard(g, w, h, rnd, { tape: false })
  g.strokeStyle = '#a3261c'; g.lineWidth = 10
  g.beginPath(); g.arc(w / 2, h / 2, w * 0.26, 0, Math.PI * 2); g.stroke()
  g.fillStyle = '#a3261c'; g.font = `800 ${w * 0.11}px "Archivo", sans-serif`
  g.textAlign = 'center'; g.textBaseline = 'middle'
  g.fillText('PIZZA', w / 2, h / 2)
}

// Terrakotta-Topf
export function paintTerracotta(g, w, h, rnd) {
  const gr = g.createLinearGradient(0, 0, 0, h)
  gr.addColorStop(0, '#c26b45'); gr.addColorStop(1, '#9c4d2c')
  g.fillStyle = gr; g.fillRect(0, 0, w, h)
  for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(${rnd() > 0.5 ? '255,220,190' : '70,30,15'},${rnd() * 0.12})`; dotWrapped(g, rnd() * w, rnd() * h, 1 + rnd() * 5, w, h) }
  grain(g, w, h, rnd, 18)
}

// Gebürstetes Metall (Stuhl, Tischbeine)
export function paintBrushed(g, w, h, rnd, { base = 150 } = {}) {
  g.fillStyle = `rgb(${base},${base},${base + 4})`; g.fillRect(0, 0, w, h)
  for (let i = 0; i < 500; i++) {
    const v = base - 25 + rnd() * 60 | 0
    g.strokeStyle = `rgba(${v},${v},${v + 4},0.5)`; g.lineWidth = 0.5 + rnd()
    const y = rnd() * h
    g.beginPath(); g.moveTo(0, y); g.lineTo(w, y + (rnd() - 0.5) * 2); g.stroke()
  }
}

// Sisalseil für Kratzbaum-Stämme: Windungen quer, Fasern schräg
export function paintSisal(g, w, h, rnd) {
  g.fillStyle = '#c9ae7c'; g.fillRect(0, 0, w, h)
  const coil = 10
  for (let y = 0; y < h; y += coil) {
    const gr = g.createLinearGradient(0, y, 0, y + coil)
    gr.addColorStop(0, 'rgba(90,65,30,0.45)'); gr.addColorStop(0.5, 'rgba(255,240,200,0.25)'); gr.addColorStop(1, 'rgba(90,65,30,0.45)')
    g.fillStyle = gr; g.fillRect(0, y, w, coil)
    for (let x = 0; x < w; x += 5) {
      g.strokeStyle = `rgba(110,80,40,${0.2 + rnd() * 0.3})`; g.lineWidth = 1
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + 6, y + coil); g.stroke()
    }
  }
}

// Plüsch für Kratzbaum-Plattformen
export function paintPlush(g, w, h, rnd, { base = [214, 200, 178] } = {}) {
  g.fillStyle = `rgb(${base.join(',')})`; g.fillRect(0, 0, w, h)
  for (let i = 0; i < 2600; i++) {
    const s = (rnd() - 0.5) * 40
    g.fillStyle = `rgba(${base[0] + s | 0},${base[1] + s | 0},${base[2] + s | 0},0.5)`
    dotWrapped(g, rnd() * w, rnd() * h, 1 + rnd() * 3, w, h)
  }
  grain(g, w, h, rnd, 20)
}

// Getigertes Katzenfell. Gedacht für eine Kugel, deren Achse entlang der Wirbelsäule
// liegt: Zeilen (v) = Ringe quer über den Rücken, Spalten (u) = rundherum.
// u = 0.5 ist der Rücken, die Ränder (u ≈ 0 / 1) sind der Bauch.
export function paintTabby(g, w, h, rnd, { base, stripe, belly, stripes = true, stripeW = 5, stripeA = 0.55 }) {
  g.fillStyle = base; g.fillRect(0, 0, w, h)
  const bands = stripes ? 13 : 0
  for (let i = 0; i < bands; i++) {
    const y0 = ((i + 0.5) / bands) * h
    g.strokeStyle = stripe; g.globalAlpha = stripeA + rnd() * 0.3; g.lineWidth = stripeW + rnd() * stripeW
    g.beginPath()
    for (let x = 0; x <= w; x += 6) {
      const y = y0 + Math.sin(x * 0.06 + i * 1.7) * 4
      if (x === 0) g.moveTo(x, y)
      else g.lineTo(x, y)
    }
    g.stroke()
  }
  g.globalAlpha = 1
  if (stripes) {
    const spine = g.createLinearGradient(w * 0.4, 0, w * 0.6, 0) // dunkler Rückenstreif
    spine.addColorStop(0, 'rgba(0,0,0,0)'); spine.addColorStop(0.5, 'rgba(0,0,0,0.28)'); spine.addColorStop(1, 'rgba(0,0,0,0)')
    g.fillStyle = spine; g.fillRect(w * 0.4, 0, w * 0.2, h)
  }
  const bellyGr = g.createLinearGradient(0, 0, w, 0) // heller Bauch an den Rändern
  bellyGr.addColorStop(0, belly); bellyGr.addColorStop(0.16, 'rgba(0,0,0,0)'); bellyGr.addColorStop(0.84, 'rgba(0,0,0,0)'); bellyGr.addColorStop(1, belly)
  g.fillStyle = bellyGr; g.fillRect(0, 0, w, h)
  for (let i = 0; i < 3000; i++) { g.fillStyle = `rgba(${rnd() > 0.5 ? '255,255,255' : '0,0,0'},${rnd() * 0.12})`; g.fillRect(rnd() * w, rnd() * h, 2 + rnd() * 3, 1) }
}
