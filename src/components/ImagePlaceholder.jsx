import { useState } from 'react'
import { HiPhoto, HiMagnifyingGlassPlus } from 'react-icons/hi2'
import { useLightbox } from '../context/LightboxContext.jsx'

// `src` kann ein einzelner Bildpfad oder ein Array von Pfaden sein — bei mehreren
// Bildern (z.B. Hochformat-Screenshots, die nicht in ein Video-Seitenverhältnis
// passen) werden sie nebeneinander als Streifen gerendert.
// `zoomable`: Klick öffnet das jeweilige Bild vergrössert im Lightbox-Overlay.
export default function ImagePlaceholder({
  src,
  alt = '',
  className = '',
  icon: Icon = HiPhoto,
  zoomable = false,
}) {
  const images = Array.isArray(src) ? src : src ? [src] : []
  const [erroredIndexes, setErroredIndexes] = useState(() => new Set())
  const { openLightbox } = useLightbox()

  function markErrored(i) {
    setErroredIndexes((prev) => new Set(prev).add(i))
  }

  function handleZoom(e, imgSrc) {
    if (!zoomable) return
    e.stopPropagation()
    openLightbox({ type: 'image', src: imgSrc, alt })
  }

  const visibleImages = images.filter((_, i) => !erroredIndexes.has(i))

  if (visibleImages.length === 0) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-violet/25 via-cyan/15 to-pink/25 ${className}`}
      >
        <Icon size={36} className="text-fg/30" />
      </div>
    )
  }

  if (images.length === 1) {
    return (
      <div className={`group relative overflow-hidden ${className}`}>
        <img
          src={images[0]}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={() => markErrored(0)}
          onClick={(e) => handleZoom(e, images[0])}
          className={`h-full w-full object-cover ${zoomable ? 'cursor-zoom-in' : ''}`}
        />
        {zoomable && <ZoomHint />}
      </div>
    )
  }

  return (
    <div className={`flex gap-px overflow-hidden bg-fg/10 ${className}`}>
      {images.map(
        (s, i) =>
          !erroredIndexes.has(i) && (
            <div key={s} className="group relative h-full min-w-0 flex-1">
              <img
                src={s}
                alt={alt}
                loading="lazy"
                decoding="async"
                onError={() => markErrored(i)}
                onClick={(e) => handleZoom(e, s)}
                className={`h-full w-full object-cover ${zoomable ? 'cursor-zoom-in' : ''}`}
              />
              {zoomable && <ZoomHint small />}
            </div>
          )
      )}
    </div>
  )
}

function ZoomHint({ small = false }) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/20 group-hover:opacity-100">
      <HiMagnifyingGlassPlus size={small ? 16 : 22} className="text-white drop-shadow" />
    </div>
  )
}
