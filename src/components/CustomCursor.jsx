import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false)
  const [hovering, setHovering] = useState(false)
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const ringX = useSpring(x, { stiffness: 300, damping: 30, mass: 0.5 })
  const ringY = useSpring(y, { stiffness: 300, damping: 30, mass: 0.5 })

  // Nur auf "echten" Desktop-Ansichten aktiv: Maus vorhanden UND Viewport ab
  // md-Breakpoint (768px) — reagiert live auf Grössenänderung, nicht nur beim Laden.
  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine) and (min-width: 768px)')
    function updateEnabled() {
      setEnabled(mq.matches)
    }
    updateEnabled()
    mq.addEventListener('change', updateEnabled)
    return () => mq.removeEventListener('change', updateEnabled)
  }, [])

  useEffect(() => {
    if (!enabled) {
      document.body.classList.remove('cursor-none')
      return
    }

    document.body.classList.add('cursor-none')

    function handleMove(e) {
      x.set(e.clientX)
      y.set(e.clientY)
      document.documentElement.style.setProperty('--spot-x', `${e.clientX}px`)
      document.documentElement.style.setProperty('--spot-y', `${e.clientY}px`)
    }
    function handleOver(e) {
      setHovering(!!e.target.closest('a, button, input, [data-cursor-hover]'))
    }

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseover', handleOver)
    return () => {
      document.body.classList.remove('cursor-none')
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseover', handleOver)
    }
  }, [enabled, x, y])

  if (!enabled) return null

  return (
    <>
      <div className="cursor-spotlight" />
      <motion.div
        style={{ left: x, top: y }}
        className="pointer-events-none fixed z-[200] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fg"
      />
      <motion.div
        style={{ left: ringX, top: ringY }}
        animate={{
          width: hovering ? 56 : 32,
          height: hovering ? 56 : 32,
          opacity: hovering ? 0.5 : 0.8,
        }}
        transition={{ duration: 0.2 }}
        className="pointer-events-none fixed z-[200] -translate-x-1/2 -translate-y-1/2 rounded-full border border-fg/60"
      />
    </>
  )
}
