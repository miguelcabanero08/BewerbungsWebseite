---
name: Miguel Cabañero · Bewerbung
description: Die Bewerbungsseite als begehbares Studentenzimmer bei Nacht; die Inhalte leben auf dem PC in der Ecke.
colors:
  night: "#0b0d12"
  room-wall: "#c6c4d6"
  led-violet: "#a595ff"
  hemi-sky: "#8580d6"
  hemi-ground: "#2a2238"
  day-hemi-sky: "#ffe9d2"
  day-hemi-ground: "#6e5a48"
  sun: "#ffd2a0"
  window-steel: "#17171a"
  vignette-ink: "#080516"
  bell-amber: "#ffb547"
  hall-green: "#6d8b78"
  hall-white: "#e4e1da"
  door-wood: "#5a3826"
  brass: "#e8c98a"
  sofa-olive: "#6b6a3e"
  mu-red: "#c8102e"
  thun-red: "#d0021b"
  overlay-ink: "#f1ece3"
  win-bg: "#f3f3f3"
  win-surface: "#ffffff"
  win-ink: "#1b1b1b"
  win-muted: "#5b5b5b"
  win-line: "#dcdcdc"
  win-accent: "#0f6cbd"
  sticky-paper: "#fff4a8"
  sticky-ink: "#2a2510"
  taskbar: "#1c1e26"
  tag-live-bg: "#dff3e5"
  tag-live-ink: "#12632f"
  tag-wip-bg: "#fff1d6"
  tag-wip-ink: "#8a4b00"
typography:
  overlay:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1.5
  overlay-action:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 700
    lineHeight: 1
  world-print:
    fontFamily: "Archivo, sans-serif"
    fontWeight: 800
  desktop-ui:
    fontFamily: "Segoe UI Variable Text, Segoe UI, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.55
  desktop-title:
    fontFamily: "Segoe UI Variable Text, Segoe UI, system-ui, sans-serif"
    fontSize: "26px"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  notepad:
    fontFamily: "Consolas, Cascadia Mono, monospace"
    fontSize: "14px"
    lineHeight: 1.6
rounded:
  pill: "999px"
  window: "8px"
  control: "5px"
  icon: "6px"
  sticky: "4px"
spacing:
  xs: "6px"
  sm: "10px"
  md: "18px"
  lg: "26px"
  xl: "30px"
components:
  ring-button:
    backgroundColor: "{colors.bell-amber}"
    textColor: "#1b1205"
    typography: "{typography.overlay-action}"
    rounded: "{rounded.pill}"
    padding: "15px 24px"
  overlay-chip:
    backgroundColor: "#0a0c12"
    textColor: "#ffffff"
    rounded: "{rounded.pill}"
    padding: "11px 18px"
  desktop-window:
    backgroundColor: "{colors.win-surface}"
    textColor: "{colors.win-ink}"
    rounded: "{rounded.window}"
  desktop-button:
    backgroundColor: "#fbfbfb"
    textColor: "{colors.win-ink}"
    rounded: "{rounded.control}"
    padding: "7px 14px"
  desktop-button-primary:
    backgroundColor: "{colors.win-accent}"
    textColor: "#ffffff"
    rounded: "{rounded.control}"
    padding: "7px 14px"
  sticky-note:
    backgroundColor: "{colors.sticky-paper}"
    textColor: "{colors.sticky-ink}"
    rounded: "{rounded.sticky}"
    width: "270px"
  tag-live:
    backgroundColor: "{colors.tag-live-bg}"
    textColor: "{colors.tag-live-ink}"
    rounded: "3px"
  tag-wip:
    backgroundColor: "{colors.tag-wip-bg}"
    textColor: "{colors.tag-wip-ink}"
    rounded: "3px"
---

<!-- Stand: aus dem freigegebenen Mockup (design/mockups/zimmer.html) abgeleitet und im Oktober 2026 als React-Seite gebaut (src/world, src/desk, src/apps). Tokens im Code: src/styles/base.css. Bei grösseren Änderungen mit /impeccable document neu erfassen. -->

# Design System: Miguel Cabañero · Bewerbung

## Overview

**Creative North Star: "Ein Zimmer, kein Portfolio"**

Die Seite ist kein Layout mit Abschnitten, sondern ein Ort. Besucher stehen zuerst im Treppenhaus vor Miguels Wohnungstür, klingeln, gehen durch schwarzen Nebel hinein und landen in einem einfachen Studentenzimmer bei Nacht: altes Sofa, Couchtisch mit Pizzakarton, Fernseher, Pflanzen, Trikots, Gitarre, PC in der Ecke. Alle Inhalte (Über mich, Projekte, Dokumente, Songs, Filme, Blender, Fellow Tenants, Impressum) liegen als Apps auf dem Desktop dieses PCs. Die Welt trägt die Persönlichkeit, der Desktop trägt die Fakten.

Die Stimmung ist ruhig und filmisch: ein dunkler, leicht kühler Blau-Lila-Raum, nur von sehr gedimmten LED-Leisten an der Deckenkante beleuchtet. Fernseher und Monitor sind die hellsten Dinge im Raum und färben ihre Umgebung in der Farbe ihres Bildes, wie in einer Filmszene. Alles andere ist matt und nimmt nur Licht an.

Durch ein Loft-Fenster mit schwarzem Stahlrahmen (linke Wand, 6. Stock) sieht man eine New-York-artige Stadt in echtem 3D: Backstein-Walkups mit Wassertürmen gegenüber, dahinter Blöcke und eine dunstige Skyline. Ein Tag/Nacht-Knopf im Overlay schaltet auf Tageslicht: LEDs aus, warme Nachmittagssonne fällt durchs Fenster und zeichnet das Fensterkreuz auf Boden und Couchtisch; draussen blauer Himmel mit Wolken. Nacht bleibt der Standard. Die Katzen schlafen in beiden Modi gleich weiter.

Ausdrücklich abgelehnt (vom Nutzer): das alte KI-typische Design mit Lila-Cyan-Pink-Verläufen, Glas-Karten, Lichtstrahl, Schreibmaschinen-Effekt, Custom Cursor und Prozent-Skillbalken; "zu brav/corporate", "zu verspielt", "Hacker/Terminal-Look", "zu leer"; ein One-Pager; Lag auf der Startseite.

**Key Characteristics:**
- Eine begehbare 3D-Welt (Flur → Zimmer → PC/Fernseher) statt Seiten-Scrollen.
- Nur Bildschirme, LED-Leisten und die Stadt/der Himmel vor dem Fenster leuchten selbst; tagsüber übernimmt die Sonne.
- Drei Ziele im Zimmer per Klick: Fernseher (Film), PC (Inhalte), Fenster (Ausblick).
- Der Desktop ist echtes HTML in Windows-Anmutung, ohne Microsoft-Marken.
- Echte, persönliche Medien (eigene Filme, Spiel-Clips, Old-Trafford-Foto) statt Stock oder Deko.
- Fakten für HR sind in jeder Station in einem Satz sichtbar: Name, 18, Thun, IMS Bern, Praktikum ab August 2027.

## Colors

Eine Nachtpalette: tiefes Blau-Schwarz, lavendelgraue Wände, ein violettes LED-Licht und warme Ausnahmen nur dort, wo sie etwas bedeuten.

### Primary
- **LED-Violett** (#a595ff): Farbe der LED-Leisten, ihres Wandscheins und der vier schwachen Fülllichter. Bestimmt die Grundstimmung des Zimmers.
- **Klingel-Amber** (#ffb547): die einzige warme UI-Farbe. Klingel-Knopf im Flur, Startknopf "MC" in der Taskleiste, aktive Film-Auswahl. Bedeutet immer "hier passiert etwas".

### Secondary
- **Vereinsrot** (#c8102e Manchester United, #d0021b FC Thun): nur auf Trikots, Schal und Wimpeln. Nie für UI.

### Neutral
- **Nacht** (#0b0d12): Clear-Color, Ladebildschirm, Fog.
- **Lavendelgraue Wand** (#c6c4d6): Wände im Zimmer; wirkt unter dem LED-Licht kühl blau-lila.
- **Himmel/Boden-Licht** (#8580d6 / #2a2238): Hemisphere-Light, Intensität 0.36. Tagsüber #ffe9d2 / #6e5a48, Intensität 0.7.
- **Sonne** (#ffd2a0): DirectionalLight, nur tagsüber (Intensität 5.5), Richtung (-1, 0.62, 0.45).
- **Fensterstahl** (#17171a): Rahmen und Sprossen des Loft-Fensters.
- **Vignetten-Tinte** (#080516): radialer Rand, 62 % Deckkraft am Bildrand, ausgeblendet am PC.
- **Overlay-Text** (#f1ece3) auf halbtransparenten Nacht-Chips.
- **Flur** (#6d8b78 Grün unten, #e4e1da Weiss oben): klassisches Schweizer Treppenhaus.
- **Desktop-Neutrals** (#f3f3f3, #ffffff, #1b1b1b, #5b5b5b, #dcdcdc) und **Desktop-Akzent** (#0f6cbd) nur innerhalb von Fenstern.

### Named Rules
**The Day-Night Rule.** Tag und Nacht tauschen nur Rollen und Stärken bestehender Lichter (setDay in scene.js): Hemisphere, Fülllicht und zwei LED-Punktlichter werden tagsüber zu warmem Fensterlicht bzw. Bodenreflex, die Sonne geht von 0 auf 5.5. Nie Lichter hinzufügen oder entfernen (Shader würden neu kompiliert, es ruckelt). Übergang 1.6 s, bei reduzierter Bewegung sofort.

**The Only-Screens-Glow Rule.** Selbstleuchtend (MeshBasicMaterial bzw. unbeleuchtete Shader) sind ausschliesslich Fernseher, Monitor, LED-Leisten mit Wandschein und die Stadt mit Himmel vor dem Fenster. Bilder, Trikots, Schal, Wimpel, Pflanzen und Möbel sind matte MeshStandardMaterials und dürfen nie heller wirken als das Licht, das auf sie fällt. Der Nutzer hat das zweimal korrigiert.

**The Screen-Light Rule.** Bildschirme werfen ihr Bild als Licht: RectAreaLight in Bildschirmgrösse, Farbe = Durchschnittsfarbe des aktuellen Bildes (8×5-Sample, 30 % Richtung Weiss gemischt), Intensität folgt der Helligkeit (TV 2.2 + Helligkeit × 2.4). Dezent, nie überstrahlend.

## Typography

**Overlay-Schrift:** Archivo (variable, wdth 62–125, wght 100–900)
**Desktop-Schrift:** Segoe UI Variable / System-UI
**Editor-Schrift:** Consolas, nur im Impressum-"Notepad"

**Character:** Archivo spricht für die Welt (Overlays, Türschild, Trikot-Druck, Fussmatte), Segoe für den PC. Die beiden mischen sich nie: alles auf dem Desktop ist System-UI, alles ausserhalb Archivo.

### Hierarchy
- **Overlay-Text** (600, 15px, 1.5): Fakten-Zeile im Flur, Hinweis-Chips.
- **Overlay-Aktion** (700, 16px): "Klingeln", Fernseh-Knöpfe.
- **Hinweis "Klick"** (700, 15px, Versalien, 0.08em).
- **Welt-Druck** (800, Canvas-Text): Türschild "M. Cabañero" 92px auf 840×240, Trikot "CABAÑERO" 50px und "14" 230px, Wimpel 40px.
- **Fenstertitel** (700, 26px, 1.15) und **Fliesstext** (400, 14.5px, 1.55, max. 68ch) im Desktop.

### Named Rules
**The Fonts-Before-Canvas Rule.** Canvas-Texturen mit Text werden nach `document.fonts.load('800 50px "Archivo"')` neu gezeichnet, sonst stehen Fallback-Schriften auf Tür und Trikot.

## Layout

Die "Seite" ist eine Kamera mit vier Zuständen, keine Scroll-Fläche: `hall` → (Klingeln) → `room` ↔ `pc`, `room` ↔ `tv`. Der Body scrollt nicht (overflow hidden).

- **Welt-Einheiten:** Millimeter. Zimmer 6000 × 2600 × 5000 (x/y/z), Vorderseite offen. Flur liegt weit weg bei z = 12000, damit er unabhängig beleuchtet ist.
- **Kamera:** 45° FOV. Zimmer-Start (-900, 1750, 3700) blickt auf (250, 1050, -1500), damit die Pflanzenwand rechts sichtbar ist. Fahrt zum PC über eine CatmullRom-Kurve (centripetal), Endpunkt so berechnet, dass der Monitor (560 × 350) den Viewport genau füllt (Faktor 1.015). Fernseh-Pose: Fernseher (1110 × 624) füllt 1/1.25 des Viewports.
- **Desktop:** fixe 1280 × 800 CSS-px, am PC per `transform: scale()` exakt über die Monitor-Fläche gelegt.
- **Overlays:** links/oben `clamp(20px, 4vw, 56px)` Abstand; Aktionen unten zentriert.
- **Hochformat / Handy:** Kamera mit 76° FOV, Zimmer-Start (475, 1600, 4700) blickt auf (475, 950, -1500), damit Fernseher und PC ganz im Bild sind. Am PC erscheint unter 760 px Breite statt des 1280er-Desktops ein Startbildschirm (PhoneShell) mit denselben Apps im Vollbild; der Fensterzustand ist geteilt, der Monitor im Zimmer zeigt ihn trotzdem.
- **Container Queries:** App-Inhalte reagieren auf die Breite ihres Fensters (`.wbody`, `.phone-body` sind Container), nicht auf den Bildschirm.

## Elevation & Depth

Tiefe entsteht durch Licht, nicht durch Schatten-Tokens. Im Zimmer gibt es keine harte Schattenquelle mehr (LED-Licht wirft keine harten Schatten); nur der Türspot im Flur hat eine Shadow-Map (512). Eine radiale Vignette (#080516, 62 %) drückt den Rand ab, die Bildschirme ziehen den Blick an.

Im Desktop gilt Windows-Logik: Fenster `0 22px 48px -12px rgba(0,0,0,.6), 0 2px 8px rgba(0,0,0,.25)`, Notizzettel `0 10px 24px -8px rgba(0,0,0,.55)`, Taskleiste mit `backdrop-filter: blur(24px) saturate(1.4)` als echter Windows-Effekt, nicht als Deko.

### Named Rules
**The Dim-Room Rule.** Grundlicht bleibt sehr gedimmt: Hemisphere 0.36, vier LED-Punktlichter je 0.17 (Distanz 5200, decay 0), Exposure 0.9 mit ACES. Wenn etwas "zu hell" wirkt, zuerst die Grundlichter senken, nie die Bildschirme.

## Shapes

Die Welt ist aus einfachen, ehrlichen Volumen gebaut (Boxen, Zylinder, abgeflachte Kugeln für Blätter), leicht low-poly, nie zurechtgebogen. Im Desktop: Fenster 8px, Buttons und Felder 5px, Icons-Hover 6px, Pillen 999px für Overlay-Chips und Klingel.

### Named Rules
**The Real-Object Rule.** Jedes Möbel wird als Gruppe in lokalen Koordinaten gebaut (vorne = +z) und erst danach als Ganzes positioniert und gedreht. Nie einzelne Teile für einen Blickwinkel zurechtdrehen (so war der erste Stuhl falsch).

## Components

### Klingel-Knopf (Flur)
- **Stil:** Amber-Pille (#ffb547), dunkle Schrift, Glocken-Icon, Schatten `0 10px 30px -8px rgba(255,181,71,.6)`.
- **Hover:** hebt 2px an, Glocke schwingt einmal. Daneben "oder Enter drücken" mit kbd-Chip.
- **Auslöser:** Knopf, Klick auf Tür/Schild/Klingel in 3D, Enter oder Leertaste. Gong per Web Audio (E5 → C5 mit Obertönen).

### Overlay-Chip
- Halbtransparente Nacht-Pille (`rgba(10,12,18,.66)`, 1px Rand `rgba(255,255,255,.16)`), weisse Schrift, für Hinweise wie "Kurz scrollen oder PC anklicken".

### Klick-Hilfe (Signature)
- Halbtransparenter, wippender Pfeil nach unten mit "KLICK"-Pille darüber, per Projektion an 3D-Ankern über Fernseher (-1200, 1230, -2264) und Monitor (2150, 1300, -2318) befestigt.
- Erscheint nur im Zimmer; verschwindet nach dem ersten Klick auf Fernseher oder PC **für diesen Besuch** (nicht gespeichert, nach Neuladen wieder da).

### Desktop-Fenster
- **Form:** 8px Radius, Titelleiste 36px (#eaeaea, fokussiert #f9f9f9), Fensterknöpfe 46 × 36 (Schliessen-Hover #c42b1c).
- **Verhalten:** verschiebbar, minimieren, maximieren (auch per Doppelklick), Fokus per Klick, Einblend-Animation `scale(.96) translateY(8px)` in 220ms.

### Desktop-Icon
- 48px SVG-Icon im Windows-11-Flat-Stil (eigene Pfade, keine Microsoft-Assets), Label 13px mit Textschatten. Hover: weisse 12 %-Fläche, Auswahl: blaue 28 %-Fläche.

### Notizzettel
- Gelbes Sticky (#fff4a8) oben rechts mit den HR-Fakten; erstes, was man am PC sieht.

### Taskleiste
- 48px, zentrierte App-Knöpfe mit Offen-Indikator (#9cc2ff), Startknopf "MC" in Amber, links "Offen für ein Praktikum" mit grünem Punkt, rechts Sprache und echte Uhr.

### Projekt-Kachel / Tags
- Explorer-Raster `minmax(190px, 1fr)`, Thumbnail 16:10. Tags: live (grün), in Arbeit (amber), Schule (blau). Detailansicht mit Video (Fellow Tenants) oder Bild, Buttons "Live ansehen" (primär) und "GitHub".

## Do's and Don'ts

### Do:
- **Do** die Reihenfolge Flur → Zimmer → PC beibehalten und "Direkt zu den Inhalten" im Flur anbieten (HR mit wenig Zeit).
- **Do** jede Bewegung mit einem einzigen Scroll-Tick, Wisch (≥ 40px) oder einer Taste komplett auslösen; Scrollen in Fenstern (`.win`, `.startmenu`) nie als Navigation werten.
- **Do** echte, eigene Medien zeigen: CatSleep im Fernseher, Ausflug Blueme in "Filme", Fellow-Tenants-Clip, Old-Trafford-Foto als Wallpaper.
- **Do** Vereine nur über Farben und Schriftzüge zeigen (Trikot "CABAÑERO 14", Schal, Wimpel).
- **Do** Skills in Worten statt Zahlen: "Sicher / Gute Erfahrung / Im Aufbau".
- **Do** das Fenster als dritten Klick-Punkt behandeln (Hinweis "Klick", Hover-Cursor, Zustand `window` mit Zurück-Knopf und Tag/Nacht-Knopf). Kein sichtbarer "Ausblick"-Knopf im Overlay (vom Nutzer entfernt); für Tastatur gibt es einen versteckten Fokus-Knopf.

### Don't:
- **Don't** irgendetwas ausser Bildschirmen, LED-Leisten und Fensterhimmel leuchten lassen.
- **Don't** offizielle Wappen von Manchester United oder FC Thun und kein Windows-Logo nachzeichnen.
- **Don't** Prozentwerte, Skill-Balken oder Kreisdiagramme für Fähigkeiten.
- **Don't** zum alten Look zurück: keine Lila-Cyan-Pink-Verläufe, kein Glas als Deko, kein Lichtstrahl, kein Custom Cursor, kein Schreibmaschinen-Text.
- **Don't** einen One-Pager bauen.
- **Don't** Spiele- oder Film-Cover von Dritten verwenden, wo eigene Bilder möglich sind.

## Implementation Notes

Lehren aus dem Mockup, die beim Umbau in React sofort gelten:

1. **Kein CSS3DRenderer für den Monitor.** 3D-transformiertes HTML war unzuverlässig (Hit-Testing in Chrome kaputt, teils schwarz). Lösung: Der Desktop wohnt als echtes HTML unsichtbar unter dem Canvas (`z-index:-1`, `pointer-events:none`); im Zimmer zeigt der Monitor ein **html2canvas-Abbild** als Textur. Beim Ankommen am PC wird das HTML flach und exakt über die Monitorfläche gelegt (klickbar, scharf). Beim Verlassen: Standbild-Klon stehen lassen, Abbild erzeugen, dann losfahren. So bleibt der PC-Zustand im Zimmer sichtbar.
2. **html2canvas `onclone`:** in der Kopie `animation:none; transition:none` setzen, sonst fehlen frisch geöffnete Fenster (Einblend-Animation startet dort bei Deckkraft 0).
3. **Animationen zeitbasiert und begrenzen:** Fortschritt `k = clamp((now - t0) / dur, 0, 1)`. Der rAF-Zeitstempel kann vor `performance.now()` beim Start liegen; ein negativer Wert liess `CatmullRomCurve3.getPointAt` abstürzen.
4. **Viewport kann beim Laden 0 sein** (ausgeblendetes Fenster): Seitenverhältnis-Fallback 16/10 und jede Frame prüfen, ob sich `innerWidth/innerHeight` geändert hat. Sonst NaN in der Kamerakurve und ein zu kleiner Canvas.
5. **Ausgeblendete Tabs drosseln rAF.** Tests mit Hash-Sprüngen machen: `#zimmer`, `#pc`.
6. **three.js ab r155 rechnet physikalisch:** Punktlichter mit `decay: 0` und begrenzter Distanz verwenden, sonst sind Lichter in mm-Einheiten unsichtbar. RectAreaLight braucht `RectAreaLightUniformsLib.init()` und wirkt nur auf Standard-/Physical-Materialien.
7. **Fernseh-Video:** stumm, im DOM (2px, unsichtbar), Standbild-Textur bis zum Event `playing`, bei jeder Interaktion, `visibilitychange` und alle 2.5s `play()` erneut anstossen.
8. **Klick-Durchlässigkeit:** Desktop-HTML ausserhalb des PC-Zustands `pointer-events:none`, sonst fängt es Klicks auf Monitor/Fernseher ab.
9. **Performance:** alle Blätter in einem InstancedMesh, `pixelRatio ≤ 1.5` (schwache Geräte 1, ohne Antialiasing, automatische Absenkung bei < ~35 fps), three.js lazy laden. Schatten nur auf Wunsch neu: `shadowMap.autoUpdate = false`, pro Szene ein Dirty-Flag; die Sonnen-Schattenkarte wird einmal gerechnet, die Flur-Spot-Karte nur während die Tür aufgeht. Die Startseite darf nicht laggen (ausdrücklicher Wunsch).
10. **Medien:** Web-Encodes liegen in `public/media/` (CatSleep 3 MB mit Ton, vier Fellow-Tenants-Clips je < 1 MB, Ausflug Blueme 31 MB). Nie die 4K-Master ausliefern. **Der Fernseh-Film braucht eine Tonspur**, sonst bewirkt „Ton an“ nichts (die erste TV-Version war ohne Ton kodiert).
11. **Schwarze Box hinter der Tür:** Die BackSide-Box für den Nebel darf nur von der Türwand (HZ-1600) bis knapp hinter die tiefste Nebel-Pose reichen (Tiefe 4000, Mitte HZ-3620). Reicht sie weiter, schliesst sie Kameras im Zimmer ein und alles wird schwarz (passiert mit der Handy-Kamera bei z = 4700).
12. **Ruhezustand am PC:** Die Szene wird dann nur alle 250 ms (Handy 1 s) gezeichnet, weil Desktop bzw. Handy-Oberfläche sie verdecken. Spart Akku.
13. **Test-Hilfen nur in der Entwicklung:** `window.__engine` und `?flat` (simuliert fehlendes WebGL) hängen an `import.meta.env.DEV` und fehlen im Build.
14. **Passwort / Dokumente:** Backend unverändert (bcrypt-Hash in `SITE_PASSWORD_HASH`, signiertes Cookie mit `SESSION_SECRET`, PDFs im privaten Blob-Store). „Alle herunterladen“ zippt im Browser (fflate), damit das 4,5-MB-Limit von Vercel-Functions nicht greift. Ablauf siehe README.
15. **Medien-Stand:** vier eigene Songs (.m4a, `public/media/songs/`), Film "Isabella's Lullaby", Blender-Modelle als .glb mit Vorschaubild (`public/media/blender/`, Viewer `src/apps/modelViewer.js`: lädt erst auf Klick, zeichnet nur bei Bedarf, Animation max. 30 fps). Person1 aus Rigify: beim Export nur den Armature-Modifier mit Objekt "rig" behalten, sonst T-Pose.
16. **Zwei Szenen:** Zimmer und Flur sind getrennte `Scene`s (scene.js `target`); gezeichnet wird die, in der die Kamera steht (z > HZ/2 = Flur). So rechnet das Zimmer keine Flurlampen. Das Zimmer wird im Flur per `compileAsync` vorkompiliert.
17. **Stadt (city.js):** Instanzen von Kiste/Zylinder/Kegel, eigener unbeleuchteter Shader (Fensterraster, Tag/Nacht, Dunst). `vInfo` muss `flat varying` sein, sonst rauschen die Zufallswerte pro Pixel. Aufgeteilt in 16 Kacheln (Sektoren ums Fenster × 3 Ringe) mit `LOD`: ab 1.6 km einfacher Shader ohne Raster und ohne Kleinteile. `cull(camera)`: Fenster nicht im Bild → Stadt und Himmel aus; sonst nur Kacheln in der Pyramide Kamera→Fensteröffnung (AABB-Test). Rechnet nur neu, wenn sich die Kamera bewegt. Kamera `near 50, far 9e6`.
18. **Sonnenschatten dicht machen:** linke Wand (Shape mit Loch, `shadowSide: DoubleSide`), Decke und eine unsichtbare Vorderwand (Wand mit der Wohnungstür) werfen Schatten. Die Vorderwand zeigt mit der Rückseite zur Kamera (Backface-Culling, also unsichtbar) und ist viel breiter als das Zimmer, sonst fällt an der Ecke ein Lichtstreifen herein. **Layers helfen nicht:** der Schattendurchgang prüft die Layers der Hauptkamera. Alle Standard-Materialien im Zimmer empfangen Schatten, sonst leuchten Poster tagsüber durch die Wand.
19. **Fenster-Ansicht:** Zustand `window`, Pose nah an der Scheibe, Blick schräg die Avenue hinunter; leichtes Wiegen der Kamera zeigt die Tiefe (nicht bei reduzierter Bewegung). Startblick im Zimmer leicht nach links gedreht (Ziel x = -250), damit das Fenster bei 16:9 im Bild ist.
20. **Zimmer-Details:** Texturen werden im Browser gemalt (`textures.js`), Comic-Noten/"Zzz" als Sprites (`fx.js`), Kratzbaum mit zwei atmenden Katzen (blaugrau einfarbig wie im Film; grau getigert mit feinen schwarzen Streifen), Miguel auf dem Sofa von hinten (CABAÑERO 14, rechter Arm auf der Lehne), FC-Thun-Meisterposter an der linken Wand.
22. **Strasse (city.js):** prozeduraler Shader auf einer eigenen Fläche nur für den sichtbaren Teil (Avenue 300 m hinunter, Querstrassen 140 m hinein): Asphalt, Gehsteige mit Fugen, Randsteine, grüner Velostreifen, Spurlinien, Zebrastreifen, nachts Lichtkegel. Linien per fwidth-Box-Filter, damit nichts flimmert. Der Rest-Boden liegt 20 cm tiefer (kein Z-Fighting). Platzhalter in Shader-Strings mit `replaceAll` ersetzen (ein `replace` liess den Shader still scheitern; Fehler stehen dann nur in `renderer.info.programs[].diagnostics`).
23. **Optimierungen ohne sichtbare Änderung (mit Pixelvergleich geprüft):** `optimize.js mergeStatic` legt identische Materialien zusammen und verschmilzt unbewegte Meshes pro Material (Zimmer 215 → 68 Objekte, Flur 21 → 11); was sich bewegt oder angesprochen wird, steht in `keep`, Materialien, die setDay ändert, in `protect`. Lichtmodi: Lichter mit Intensität 0 werden aus der Szene genommen (Nacht ohne Sonne samt Schattenkarte, Tag ohne zwei LEDs), alle Varianten werden vorab mit compileAsync übersetzt, der Wechsel erzeugt keine neuen Shader. Comic-Effekte sind eine einzige InstancedMesh mit Billboard-Shader (wie Sprites). Bildrate max. ~60–80/s. Am PC pausiert der Fernseher (Video, Licht-Messung). Locken 12×9 statt 16×12 Segmente, Blätter ohne Rückseiten. Ergebnis Zimmeransicht: ~250 → 116 Draw-Calls pro Bild; Fensteransicht 36, Handy 63. Achtung: Flächen, die exakt gleich hoch liegen, flimmern; nach dem Zusammenlegen wird das sichtbar (Kissen auf der Sofalehne deshalb 6 mm höher).
24. **Handy = Diorama:** Im Hochformat zeigt das Zimmer sich von schräg oben wie ein Puppenhaus (`dioramaPose`, fov 28, Neigung ~54°). Wände, die zur Kamera zeigen, verschwinden durch Backface-Culling von selbst; dunkle Wandkronen und eine Bodenplatte (über der Decke / 15 mm unter dem Boden, im Zimmer unsichtbar) geben den Modell-Schnitt. Horizontal ziehen dreht das Diorama (±0.9 rad, mit Nachschwung), Tippen auf Objekte oder auf die beschrifteten Knöpfe (Fernseher, PC · Inhalte, Fenster) fliegt hinein. Von oben: kein Raumnebel (sonst verschluckt er das Zimmer aus 30 m), keine Stadt, ruhiger Hintergrund (Nacht #0b0d12, Tag #d6cfc4), Belichtung steigt mit der Kamerahöhe. Jede Pose hat ein eigenes fov, Übergänge mischen es mit. Szenenwahl: Flur nur, wenn die Kamera vorne UND unter Deckenhöhe steht.
25. **iOS-Tippen:** iOS löst `click` nur auf Elementen mit eigenem Listener aus. Die 3D-Fläche nimmt deshalb Klicks selbst an (`.stage` ohne `pointer-events: none`, Listener auf der Leinwand, `touch-action: none`). Ein Listener nur auf `window` reicht auf dem iPhone nicht.
26. **Test-Hilfen (nur DEV):** `__engine.debugPose(pos, look)`, `debugWorld`, `debugRenderer`, `debugCamera`, `world.city.stats()`, `__viewer` im Modell-Viewer.
