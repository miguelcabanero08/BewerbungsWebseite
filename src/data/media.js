// Eigene Medien. Alles liegt unter public/media/ (Web-Versionen, nie die 4K-Master).

// Filme: erscheinen in der App "Filme". Der erste ist vorausgewählt.
export const films = [
  { id: 'ausflug-blueme', title: 'Ausflug Blueme', src: '/media/ausflug-blueme.mp4', poster: '/media/ausflug-blueme-poster.jpg' },
  { id: 'catsleep', title: 'CatSleep', src: '/media/catsleep.mp4', poster: '/media/catsleep-poster.jpg' },
  { id: 'isabellas-lullaby', title: "Isabella's Lullaby", src: '/media/isabellas-lullaby.mp4', poster: '/media/isabellas-lullaby-poster.jpg' },
]

// Was im Zimmer auf dem Fernseher läuft (stumm in Schleife; braucht eine Tonspur für "Ton an").
export const tvFilm = { src: '/media/catsleep.mp4', poster: '/media/catsleep-poster.jpg' }

// Clips aus der Entwicklung von Fellow Tenants. Namen in ui.js (fellow.clipNames).
export const fellowClips = [
  { id: 'door', src: '/media/fellow-door.mp4', poster: '/media/fellow-door.jpg' },
  { id: 'interact', src: '/media/fellow-interact.mp4', poster: '/media/fellow-interact.jpg' },
  { id: 'billboard', src: '/media/fellow-billboard.mp4', poster: '/media/fellow-billboard.jpg' },
]

// Eigene Gitarren-Aufnahmen (AAC/.m4a, läuft in allen Browsern). Neue Datei nach
// public/media/songs/ legen und hier eintragen.
export const songs = [
  { id: 'isabellas-lullaby', title: "Isabella's Lullaby", src: '/media/songs/isabellas-lullaby.m4a' },
  { id: 'bug-collector', title: 'Bug Collector', src: '/media/songs/bug-collector.m4a' },
  { id: 'saviour', title: 'Saviour', note: 'Fellow Tenants OST', src: '/media/songs/saviour.m4a' },
  { id: 'stay-quiet', title: 'Stay Quiet', note: 'Fellow Tenants OST', src: '/media/songs/stay-quiet.m4a' },
]

// Eigene Blender-Modelle: Vorschaubild (Eevee-Render) + glTF-Modell für den 3D-Viewer.
// Das Modell wird erst geladen, wenn man auf "In 3D ansehen" klickt.
// animated: Modell mit Rig, Animationen stehen im .glb (Namen aus Blender).
export const blenderModels = [
  { id: 'person1', title: 'Person1', src: '/media/blender/person1.glb', preview: '/media/blender/person1.webp', animated: true },
  { id: 'ironman', title: 'Iron Man', src: '/media/blender/ironman.glb', preview: '/media/blender/ironman.webp' },
  { id: 'spiderman', title: 'Spider-Man', src: '/media/blender/spiderman.glb', preview: '/media/blender/spiderman.webp' },
  { id: 'lego-man', title: 'Lego-Man', src: '/media/blender/lego-man.glb', preview: '/media/blender/lego-man.webp' },
]

// Persönliche Medien zu den Interessen auf "Über mich" (Index wie in ueberMich.js interests).
// app: öffnet stattdessen eine Desktop-App mit eigenem Inhalt.
export const interestMedia = [
  { type: 'video', src: '/videos/musik-gitarre.mp4', audio: true },
  { type: 'video', src: '/videos/sport.mp4' },
  null,
  { type: 'image', src: '/images/manchester-united.webp' },
  { app: 'fellow' },
  { app: 'films', type: 'image', src: '/media/ausflug-blueme-poster.jpg' },
  { app: 'blender' },
]
