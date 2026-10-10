// Die Apps auf dem Desktop. slug = URL (/projekte usw.), w/h = Fenstergrösse in
// Desktop-Pixeln (der Desktop ist immer 1280 × 800 gross und wird skaliert).
export const APPS = [
  { id: 'about', slug: 'ueber-mich', icon: 'user', w: 900, h: 600, taskbar: true },
  { id: 'projects', slug: 'projekte', icon: 'folder', w: 980, h: 620, taskbar: true },
  { id: 'docs', slug: 'dokumente', icon: 'lock', w: 760, h: 520, taskbar: true },
  { id: 'songs', slug: 'songs', icon: 'music', w: 720, h: 540 },
  { id: 'films', slug: 'filme', icon: 'film', w: 880, h: 640, taskbar: true },
  { id: 'blender', slug: 'blender', icon: 'cube', w: 860, h: 620 },
  { id: 'fellow', slug: 'fellow-tenants', icon: 'door', w: 880, h: 640, taskbar: true },
  { id: 'imprint', slug: 'impressum', icon: 'note', w: 620, h: 460 },
  { id: 'bin', slug: 'papierkorb', icon: 'bin', w: 640, h: 380 },
]

export const appById = (id) => APPS.find((a) => a.id === id)
export const appBySlug = (slug) => APPS.find((a) => a.slug === slug)

// Alte Adressen der früheren Seite → App + Tab.
export const LEGACY_ROUTES = {
  lebenslauf: { app: 'about', tab: 'path' },
  staerken: { app: 'about', tab: 'skills' },
  persoenliches: { app: 'about', tab: 'free' },
}

export const DESK_W = 1280
export const DESK_H = 800
