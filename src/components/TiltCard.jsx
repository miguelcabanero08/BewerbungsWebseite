import { useRef } from 'react'
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
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      className={className}
      {...props}
    >
      {children}
      {glare && <div className="tilt-glare" />}
    </motion.div>
  )
}
