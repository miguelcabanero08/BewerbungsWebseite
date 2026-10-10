import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { songs } from '../data/media.js'

// Ein einziger Player für die ganze Seite: Tab "Songs" in Über mich und die App
// "Meine Songs" zeigen denselben Zustand, ein Song läuft beim Wechsel weiter.
const MusicContext = createContext(null)

export function MusicProvider({ children }) {
  const audioRef = useRef(null)
  const [current, setCurrent] = useState(null)
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)

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
    if (audio.paused) audio.play().catch(() => {})
    else audio.pause()
  }, [current, play])

  const seek = useCallback((fraction) => {
    const audio = audioRef.current
    if (audio && duration) audio.currentTime = Math.max(0, Math.min(1, fraction)) * duration
  }, [duration])

  return (
    <MusicContext.Provider value={{ songs, current, playing, time, duration, play, toggle, seek }}>
      {children}
    </MusicContext.Provider>
  )
}

export function useMusic() {
  const ctx = useContext(MusicContext)
  if (!ctx) throw new Error('useMusic muss innerhalb von MusicProvider verwendet werden')
  return ctx
}
