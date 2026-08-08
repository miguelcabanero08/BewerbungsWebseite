import { useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { HiArrowUpRight } from 'react-icons/hi2'
import { FaGithub } from 'react-icons/fa6'
import ImagePlaceholder from './ImagePlaceholder.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import { projekte } from '../i18n/projekte.js'

export default function ProjectCard({ project, onExpand }) {
  const { language } = useLanguage()
  const t = projekte[language]
  const [hovered, setHovered] = useState(false)
  const ref = useRef(null)

  const x = useMotionValue(0.5)
  const y = useMotionValue(0.5)
  const springX = useSpring(x, { stiffness: 200, damping: 20 })
  const springY = useSpring(y, { stiffness: 200, damping: 20 })
  const rotateX = useTransform(springY, [0, 1], [6, -6])
  const rotateY = useTransform(springX, [0, 1], [-6, 6])

  function handleMouseMove(e) {
    const rect = ref.current.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    x.set(px)
    y.set(py)
    ref.current.style.setProperty('--mx', `${px * 100}%`)
    ref.current.style.setProperty('--my', `${py * 100}%`)
  }

  function handleMouseLeave() {
    x.set(0.5)
    y.set(0.5)
    setHovered(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onExpand?.()
    }
  }

  return (
    <motion.div
      ref={ref}
      role="button"
      tabIndex={0}
      onClick={onExpand}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-fg/10 bg-surface-2 transition-colors hover:border-fg/20"
    >
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-violet/0 via-cyan/0 to-pink/0 opacity-0 transition-opacity duration-500 group-hover:from-violet/20 group-hover:via-cyan/10 group-hover:to-pink/20 group-hover:opacity-100" />
      <div className="tilt-glare" />

      <div className="relative">
        <ImagePlaceholder src={project.image} alt={project.title} className="aspect-video w-full" />
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-end bg-gradient-to-t from-bg via-bg/70 to-transparent p-4"
            >
              <p className="font-display text-sm font-semibold text-fg">{project.title}</p>
              <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-fg/70">
                {project.description}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between">
          <span className="rounded-full border border-fg/10 bg-fg/5 px-3 py-1 text-xs font-medium text-fg/60">
            {project.category}
          </span>
          <HiArrowUpRight className="text-fg/30 transition group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-fg" />
        </div>

        <h3 className="mt-4 line-clamp-2 min-h-[3.5rem] font-display text-lg font-semibold text-fg">
          {project.title}
        </h3>
        <p className="mt-2 text-sm text-fg/50">{t.viewProject}</p>
        <div className="flex-1" />

        <a
          href={project.github}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-fg/10 bg-fg/5 py-2.5 text-sm font-medium text-fg/70 transition hover:border-fg/20 hover:bg-fg/10 hover:text-fg"
        >
          <FaGithub size={16} /> {t.githubRepo}
        </a>
      </div>
    </motion.div>
  )
}
