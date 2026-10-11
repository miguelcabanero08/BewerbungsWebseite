import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { songs } from '../data/media.js'

// Ein einziger Player für die ganze Seite: Tab "Songs" in Über mich und die App
// "Meine Songs" zeigen denselben Zustand, ein Song läuft beim Wechsel weiter.
// Schliessen der Fenster stoppt (Experience → stop), TV-Ton blendet aus (duck).
const MusicContext = createContext(null)

export function MusicProvider({ children }) {
  const audioRef = useRef(null)
  const [current, setCurrent] = useState(null)
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const fadeRef = useRef(0) // laufende Ausblendung (rAF-Id)
  const duckRef = useRef({ on: false, resume: false })

  useEffect(() => {
    const audio = new Audio()
    audio.preload = 'metadata'
    audioRef.current = audio
    const onTime = () => setTime(audio.currentTime)
    const onMeta = () => setDuration(Number.isFinite(audio.duration) ? audio.duration : 0)
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onMeta)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('ended', onPause)
    return () => {
      cancelAnimationFrame(fadeRef.current)
      audio.pause()
      audio.removeAttribute('src')
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('loadedmetadata', onMeta)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('ended', onPause)
      audioRef.current = null
    }
  }, [])

  const play = useCallback((id) => {
    const audio = audioRef.current
    const song = songs.find((s) => s.id === id)
    if (!audio || !song) return
    // selbst gestartet: eine Ausblendung durch den Fernseher ist damit erledigt
    cancelAnimationFrame(fadeRef.current)
    audio.volume = 1
    duckRef.current.resume = false
    if (current !== id) {
      audio.src = song.src
      setCurrent(id)
      setTime(0)
      setDuration(0)
    }
    audio.play().catch(() => {})
  }, [current])

  const toggle = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (!current && songs[0]) { play(songs[0].id); return }
    cancelAnimationFrame(fadeRef.current)
    audio.volume = 1
    duckRef.current.resume = false
    if (audio.paused) audio.play().catch(() => {})
    else audio.pause()
  }, [current, play])

  // Lautstärke weich ändern. iOS ignoriert audio.volume (immer 1): dort wirkt
  // nur das Pausieren am Ende, die Musik verstummt also nach `ms` statt zu gleiten.
  const fadeTo = useCallback((target, ms, done) => {
    const audio = audioRef.current
    if (!audio) return
    cancelAnimationFrame(fadeRef.current)
    const from = audio.volume, t0 = performance.now()
    const step = (now) => {
      // der rAF-Zeitstempel kann knapp vor t0 liegen (DESIGN.md Note 3): k begrenzen
      const k = Math.min(1, Math.max(0, (now - t0) / ms))
      audio.volume = Math.min(1, Math.max(0, from + (target - from) * k))
      if (k < 1) fadeRef.current = requestAnimationFrame(step)
      else done?.()
    }
    fadeRef.current = requestAnimationFrame(step)
  }, [])

  // ganz anhalten und zurück an den Anfang (Fenster geschlossen)
  const stop = useCallback(() => {
    const audio = audioRef.current
    duckRef.current = { on: false, resume: false }
    if (!audio || !current) return
    cancelAnimationFrame(fadeRef.current)
    audio.pause()
    audio.volume = 1
    audio.currentTime = 0
    setTime(0)
  }, [current])

  // Fernseher mit Ton hat Vorrang: Songs ausblenden und pausieren, danach wieder einblenden
  const duck = useCallback((on) => {
    const audio = audioRef.current
    const d = duckRef.current
    if (!audio || on === d.on) return
    d.on = on
    if (on) {
      d.resume = !audio.paused
      if (d.resume) fadeTo(0, 600, () => audio.pause())
    } else if (d.resume) {
      d.resume = false
      audio.play().then(() => fadeTo(1, 800)).catch(() => { audio.volume = 1 })
    }
  }, [fadeTo])

  const seek = useCallback((fraction) => {
    const audio = audioRef.current
    if (audio && duration) audio.currentTime = Math.max(0, Math.min(1, fraction)) * duration
  }, [duration])

  return (
    <MusicContext.Provider value={{ songs, current, playing, time, duration, play, toggle, seek, stop, duck }}>
      {children}
    </MusicContext.Provider>
  )
}

export function useMusic() {
  const ctx = useContext(MusicContext)
  if (!ctx) throw new Error('useMusic muss innerhalb von MusicProvider verwendet werden')
  return ctx
}
