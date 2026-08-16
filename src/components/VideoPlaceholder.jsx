import { useEffect, useRef, useState } from 'react'
import { HiPhoto, HiSpeakerWave, HiSpeakerXMark, HiMagnifyingGlassPlus } from 'react-icons/hi2'
import { useLightbox } from '../context/LightboxContext.jsx'

// Analog zu ImagePlaceholder.jsx: zeigt einen Farbverlauf-Platzhalter, solange `src`
// fehlt oder (noch) nicht existiert. Sobald die Videodatei vorhanden ist, spielt sie
// automatisch, stumm geschaltet ab (Voraussetzung für Autoplay in allen Browsern).
// Nur wenn `hasAudio` gesetzt ist, erscheint ein kleiner Mute/Unmute-Knopf.
// `zoomable`: Klick öffnet das Video vergrössert (mit Ton/Steuerung) im Lightbox-Overlay.
//
// Das <video>-Element wird erst gemountet, sobald die Karte in Sichtweite kommt: mit
// autoplay laden Browser die Datei sofort beim Mounten, und die beiden Clips auf
// /ueber-mich sind zusammen >7 MB — ohne Gating würden die sofort beim Öffnen der Seite
// geladen, selbst wenn die "Interessen"-Sektion nie gescrollt wird. rootMargin startet
// das Laden schon kurz bevor die Karte sichtbar wird, damit sie bei Erreichen bereits
// bereit ist.
export default function VideoPlaceholder({
  src,
  poster,
  hasAudio = false,
  alt = '',
  className = '',
  icon: Icon = HiPhoto,
  zoomable = false,
}) {
  const videoRef = useRef(null)
  const containerRef = useRef(null)
  const [errored, setErrored] = useState(false)
  const [muted, setMuted] = useState(true)
  const [inView, setInView] = useState(false)
  const { openLightbox } = useLightbox()

  useEffect(() => {
    if (inView || !containerRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true)
      },
      { rootMargin: '200px' }
    )
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [inView])

  if (errored || !src) {
    return (
      <div
        ref={containerRef}
        className={`flex items-center justify-center bg-gradient-to-br from-violet/25 via-cyan/15 to-pink/25 ${className}`}
      >
        <Icon size={36} className="text-fg/30" />
      </div>
    )
  }

  function toggleMute(e) {
    e.stopPropagation()
    setMuted((prev) => {
      const next = !prev
      if (videoRef.current) videoRef.current.muted = next
      return next
    })
  }

  function handleZoom() {
    if (!zoomable) return
    openLightbox({ type: 'video', src, alt })
  }

  return (
    <div
      ref={containerRef}
      className={`group relative overflow-hidden ${zoomable ? 'cursor-zoom-in' : ''} ${className}`}
      onClick={handleZoom}
    >
      {inView ? (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          aria-label={alt}
          autoPlay
          loop
          muted={muted}
          playsInline
          onError={() => setErrored(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet/25 via-cyan/15 to-pink/25">
          <Icon size={36} className="text-fg/30" />
        </div>
      )}
      {zoomable && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/20 group-hover:opacity-100">
          <HiMagnifyingGlassPlus size={22} className="text-white drop-shadow" />
        </div>
      )}
      {hasAudio && (
        <button
          type="button"
          onClick={toggleMute}
          aria-label={muted ? 'Ton einschalten' : 'Ton ausschalten'}
          className="absolute bottom-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-fg backdrop-blur transition hover:bg-black/70"
        >
          {muted ? <HiSpeakerXMark size={12} /> : <HiSpeakerWave size={12} />}
        </button>
      )}
    </div>
  )
}
