import { useRef, useState, useEffect } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

export default function TiltCard({
  children,
  className = '',
  tiltStrength = 8,
  glare = true,
  ...props
}) {
  const ref = useRef(null)
  const x = useMotionValue(0.5)
  const y = useMotionValue(0.5)

  const springX = useSpring(x, { stiffness: 200, damping: 20 })
  const springY = useSpring(y, { stiffness: 200, damping: 20 })

  const rotateX = useTransform(springY, [0, 1], [tiltStrength, -tiltStrength])
  const rotateY = useTransform(springX, [0, 1], [-tiltStrength, tiltStrength])

  // Touch-Geräte feuern kein mousemove, der Tilt bleibt dort dauerhaft bei 0deg — das
  // transform (perspective(...) rotateX(0deg) rotateY(0deg)) wird trotzdem gesetzt, sobald
  // die Motion Values gebunden sind, und bringt dort rein gar nichts. Es macht den Wrapper
  // aber zu einem eigenen 3D-Compositing-Kontext, und genau das lässt -webkit-background-
  // clip:text in Kind-Elementen (z.B. den Namen auf der Startseite) in Safari/WebKit
  // teilweise komplett unsichtbar werden. Darum: auf Geräten ohne Maus (kein hover, kein
  // fine pointer — betrifft alle Touchscreens, gleiches Feature-Detection-Muster wie in
  // CustomCursor.jsx) gar kein transform setzen statt eines wirkungslosen Identitäts-Werts.
  const [tiltEnabled, setTiltEnabled] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    function updateEnabled() {
      setTiltEnabled(mq.matches)
    }
    updateEnabled()
    mq.addEventListener('change', updateEnabled)
    return () => mq.removeEventListener('change', updateEnabled)
  }, [])

  function handleMouseMove(e) {
    const rect = ref.current.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    x.set(px)
    y.set(py)
    if (glare) {
      ref.current.style.setProperty('--mx', `${px * 100}%`)
      ref.current.style.setProperty('--my', `${py * 100}%`)
    }
  }

  function handleMouseLeave() {
    x.set(0.5)
    y.set(0.5)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={tiltEnabled ? handleMouseMove : undefined}
      onMouseLeave={tiltEnabled ? handleMouseLeave : undefined}
      style={tiltEnabled ? { rotateX, rotateY, transformPerspective: 800 } : undefined}
      className={className}
      {...props}
    >
      {children}
      {glare && <div className="tilt-glare" />}
    </motion.div>
  )
}
