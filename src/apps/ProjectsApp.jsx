import { useMemo, useState } from 'react'
import { useLanguage } from '../context/LanguageContext.jsx'
import { ui } from '../i18n/ui.js'
import { projekte } from '../i18n/projekte.js'
import { projects } from '../data/projects.js'
import { AppIcon, UiIcon } from '../desk/icons.jsx'

const FILTERS = ['all', 'live', 'private', 'school']
const FIELD_KEYS = ['ziel', 'technologien', 'meineRolle', 'wasGelernt']

export default function ProjectsApp() {
  const { language } = useLanguage()
  const t = ui[language].explorer
  const p = projekte[language]
  const [filter, setFilter] = useState('all')
  const [openId, setOpenId] = useState(null)

  const items = useMemo(() => projects.map((meta) => {
    const c = p.projects[meta.id]
    return { ...meta, title: c.title, category: c.category, description: c.description, abstract: c.abstract }
  }), [p])

  const visible = items.filter((it) =>
    filter === 'all' ||
    (filter === 'live' && it.status === 'live') ||
    (filter === 'private' && it.category === 'privat') ||
    (filter === 'school' && it.category === 'schule'))
  const open = items.find((it) => it.id === openId)
  const filterLabel = { all: t.all, live: t.live, private: t.private, school: t.school }

  return (
    <div className="explorer">
      <nav className="ex-side" aria-label={t.all}>
        {FILTERS.map((f) => (
          <button key={f} type="button" className={filter === f ? 'on' : ''} aria-pressed={filter === f} onClick={() => { setFilter(f); setOpenId(null) }}>
            <AppIcon name="folder" size={18} /> {filterLabel[f]}
          </button>
        ))}
      </nav>
      <div className="ex-main scroll" data-scroll>
        <p className="ex-path">
          {t.root} › {t.user} › {p.title}{filter !== 'all' ? ` › ${filterLabel[filter]}` : ''}
          {open ? ` › ${open.title}` : ` · ${t.items(visible.length)}`}
        </p>
        {open ? (
          <Detail it={open} t={t} p={p} onBack={() => setOpenId(null)} />
        ) : (
          <ul className="tiles">
            {visible.map((it) => (
              <li key={it.id}>
                <button type="button" className="tile" onClick={() => setOpenId(it.id)}>
                  <img src={it.image} alt="" loading="lazy" />
                  <b>{it.title}</b>
                  <Tags it={it} t={t} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function Tags({ it, t }) {
  return (
    <span className="tags">
      {it.status && <span className={`tag ${it.status}`}>{t.status[it.status]}</span>}
      <span className={`tag ${it.category === 'schule' ? 'school' : 'private'}`}>{it.category === 'schule' ? t.status.school : t.status.private}</span>
    </span>
  )
}

function Detail({ it, t, p, onBack }) {
  return (
    <article className="detail">
      <button type="button" className="btn back" onClick={onBack}><UiIcon name="back" size={14} /> {t.back}</button>
      <div className="detail-grid">
        <div className="detail-media">
          {it.video ? (
            <video src={it.video} poster={it.image} autoPlay muted loop playsInline controls aria-label={it.title} />
          ) : it.gallery ? (
            <div className="gallery">{it.gallery.map((src) => <img key={src} src={src} alt="" loading="lazy" />)}</div>
          ) : (
            <img src={it.image} alt="" />
          )}
        </div>
        <div>
          <h2>{it.title}</h2>
          <Tags it={it} t={t} />
          <p className="lead">{it.description}</p>
          <div className="actions">
            {it.live && (
              <a className="btn primary" href={it.live} target="_blank" rel="noreferrer">
                {t.liveSite} <UiIcon name="external" size={14} />
              </a>
            )}
            {it.github && (
              <a className="btn" href={it.github} target="_blank" rel="noreferrer">
                <UiIcon name="github" size={14} /> {t.github}
              </a>
            )}
          </div>
        </div>
      </div>
      {it.abstract && (
        <section className="abstract">
          <h3>{p.abstractHeading}</h3>
          <dl>
            {FIELD_KEYS.map((k) => it.abstract[k] && (
              <div key={k}><dt>{p.fields[k]}</dt><dd>{it.abstract[k]}</dd></div>
            ))}
          </dl>
        </section>
      )}
    </article>
  )
}
