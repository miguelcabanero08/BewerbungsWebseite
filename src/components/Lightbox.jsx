import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { HiXMark } from 'react-icons/hi2'
import { useLightbox } from '../context/LightboxContext.jsx'

// Global gemountetes Zoom-Overlay (einmal in App.jsx). Jede Komponente kann
// via useLightbox().openLightbox({ type, src, alt }) ein Bild/Video vergrössert
// anzeigen. Schliessen per Klick daneben, X-Knopf oder Escape.
export default function Lightbox() {
  const { media, closeLightbox } = useLightbox()

  useEffect(() => {
    if (!media) return
    function onKeyDown(e) {
      if (e.key === 'Escape') closeLightbox()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [media, closeLightbox])

  return (
    <AnimatePresence>
      {media && (
        <motion.div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm sm:p-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeLightbox}
        >
          <button
            type="button"
            onClick={closeLightbox}
            aria-label="Schliessen"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-6 sm:top-6"
          >
            <HiXMark size={22} />
          </button>

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ type: 'spring', damping: 24, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative"
          >
            {media.type === 'video' ? (
              <video
                src={media.src}
                controls
                autoPlay
                loop
                className="max-h-[86vh] max-w-[92vw] rounded-xl shadow-2xl"
              />
            ) : (
              <img
                src={media.src}
                alt={media.alt || ''}
                className="max-h-[86vh] max-w-[92vw] rounded-xl object-contain shadow-2xl"
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
