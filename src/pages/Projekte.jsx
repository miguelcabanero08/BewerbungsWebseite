import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { projects } from '../data/projects.js'
import ProjectCard from '../components/ProjectCard.jsx'
import ProjectExpanded from '../components/ProjectExpanded.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import { projekte } from '../i18n/projekte.js'

const EASE = [0.16, 1, 0.3, 1]

export default function Projekte() {
  const [expandedId, setExpandedId] = useState(null)
  const { language } = useLanguage()
  const t = projekte[language]

  const items = projects.map((meta) => {
    const content = t.projects[meta.id]
    return {
      ...meta,
      title: content.title,
      category: t.categories[content.category],
      description: content.description,
      abstract: content.abstract,
    }
  })

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') setExpandedId(null)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-4xl font-bold text-fg sm:text-5xl"
      >
        {t.title}
      </motion.h1>
      <p className="mt-4 max-w-xl text-fg/60">{t.intro}</p>

      <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((p, i) => {
          const isExpanded = p.id === expandedId
          return (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{
                duration: 0.6,
                delay: (i % 3) * 0.06,
                ease: EASE,
                layout: { duration: 0.5, ease: EASE },
              }}
              className={isExpanded ? 'h-full sm:col-span-2 lg:col-span-3 xl:col-span-4' : 'h-full'}
            >
              <AnimatePresence initial={false}>
                {isExpanded ? (
                  <motion.div
                    key="expanded"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ProjectExpanded project={p} onClose={() => setExpandedId(null)} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="card"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="h-full"
                  >
                    <ProjectCard project={p} onExpand={() => setExpandedId(p.id)} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
