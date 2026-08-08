import { HiArrowUpRight, HiXMark, HiOutlineGlobeAlt } from 'react-icons/hi2'
import { FaGithub } from 'react-icons/fa6'
import ImagePlaceholder from './ImagePlaceholder.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import { projekte } from '../i18n/projekte.js'

const FIELD_KEYS = ['ziel', 'technologien', 'meineRolle', 'wasGelernt']

export default function ProjectExpanded({ project, onClose }) {
  const { language } = useLanguage()
  const t = projekte[language]

  return (
    <div className="relative overflow-hidden rounded-2xl border border-fg/10 bg-surface-2">
      <button
        onClick={onClose}
        aria-label={t.close}
        className="absolute right-4 top-4 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-fg/80 backdrop-blur transition hover:bg-black/60 hover:text-fg"
      >
        <HiXMark size={20} />
      </button>

      <ImagePlaceholder
        src={project.image}
        alt={project.title}
        zoomable
        className="aspect-[21/9] w-full sm:aspect-[3/1]"
      />

      <div className="p-6 sm:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <span className="rounded-full border border-fg/10 bg-fg/5 px-3 py-1 text-xs font-medium text-fg/60">
              {project.category}
            </span>
            <h3 className="mt-4 font-display text-2xl font-bold text-fg sm:text-3xl">
              {project.title}
            </h3>
            <p className="mt-3 max-w-2xl leading-relaxed text-fg/60">{project.description}</p>
          </div>

          <div className="flex shrink-0 flex-wrap gap-3">
            {project.live && (
              <a
                href={project.live}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="group flex items-center justify-center gap-2 rounded-lg border border-fg/10 bg-fg/5 px-5 py-3 text-sm font-medium text-fg/80 transition hover:border-fg/20 hover:bg-fg/10 hover:text-fg"
              >
                <HiOutlineGlobeAlt size={16} /> {t.liveSite}
                <HiArrowUpRight className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            )}
            <a
              href={project.github}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="group flex items-center justify-center gap-2 rounded-lg border border-fg/10 bg-fg/5 px-5 py-3 text-sm font-medium text-fg/80 transition hover:border-fg/20 hover:bg-fg/10 hover:text-fg"
            >
              <FaGithub size={16} /> {t.githubRepo}
              <HiArrowUpRight className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
        </div>

        <div className="mt-10 border-t border-fg/10 pt-8">
          <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-cyan">
            {t.abstractHeading}
          </h4>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {FIELD_KEYS.map((key) => (
              <div key={key}>
                <p className="font-display text-sm font-semibold text-fg">{t.fields[key]}</p>
                <p className="mt-1.5 leading-relaxed text-fg/60">{project.abstract[key]}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
