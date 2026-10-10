import { useLanguage } from '../context/LanguageContext.jsx'
import { useDesk } from '../desk/DeskContext.jsx'
import { ui } from '../i18n/ui.js'
import { ueberMich } from '../i18n/ueberMich.js'
import { skillTiers } from '../data/skills.js'
import { interestMedia } from '../data/media.js'
import MusicPlayer from './MusicPlayer.jsx'

const TABS = ['profile', 'path', 'skills', 'free', 'songs']

export default function AboutApp({ tab = 'profile', onTab }) {
  const { language } = useLanguage()
  const t = ui[language]
  const a = ueberMich[language]
  const active = TABS.includes(tab) ? tab : 'profile'

  function onKeyDown(e) {
    const i = TABS.indexOf(active)
    if (e.key === 'ArrowRight') { e.preventDefault(); onTab(TABS[(i + 1) % TABS.length]) }
    if (e.key === 'ArrowLeft') { e.preventDefault(); onTab(TABS[(i - 1 + TABS.length) % TABS.length]) }
  }

  return (
    <div className="about">
      <div className="tabs" role="tablist" aria-label={t.apps.about} onKeyDown={onKeyDown}>
        {TABS.map((id) => (
          <button
            key={id}
            role="tab"
            id={`about-tab-${id}`}
            aria-selected={active === id}
            aria-controls="about-panel"
            tabIndex={active === id ? 0 : -1}
            className={active === id ? 'on' : ''}
            onClick={() => onTab(id)}
          >
            {t.about.tabs[id]}
          </button>
        ))}
      </div>
      <div className="tabpanel scroll" role="tabpanel" id="about-panel" aria-labelledby={`about-tab-${active}`} data-scroll>
        {active === 'profile' && <Profile t={t} a={a} />}
        {active === 'path' && <Path a={a} />}
        {active === 'skills' && <Skills t={t} a={a} />}
        {active === 'free' && <Free t={t} a={a} />}
        {active === 'songs' && <MusicPlayer embedded />}
      </div>
    </div>
  )
}

function Profile({ t, a }) {
  return (
    <div className="pad profile">
      <aside className="profile-side">
        <img src="/images/portrait.webp" alt={a.portraitAlt} width="460" height="575" />
        <dl className="facts">
          {t.about.facts.map(([k, v]) => (
            <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
          ))}
        </dl>
      </aside>
      <div className="profile-main">
        <h2>{a.heading}</h2>
        <p>{a.intro1}</p>
        <p>{a.intro2}</p>
        <h3>{t.about.howIWork}</h3>
        {a.aboutCards.map((c) => (
          <section key={c.title} className="profile-block">
            <h4>{c.title}</h4>
            <p>{c.text}</p>
          </section>
        ))}
      </div>
    </div>
  )
}

function Path({ a }) {
  const { openApp } = useDesk()
  return (
    <div className="pad">
      <h2>{a.sections.schule}</h2>
      <ol className="timeline">
        {[...a.education].reverse().map((e) => (
          <li key={e.period}>
            <span className="period">{e.period}</span>
            <div>
              <h4>{e.title}</h4>
              <p className="muted small">{e.place}</p>
              <p>{e.desc}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="docs-ref">
        {a.docsReference.before}{' '}
        <button type="button" className="link" onClick={() => openApp('docs')}>{a.docsReference.linkText}</button>
        {/^[.,;:]/.test(a.docsReference.after) ? a.docsReference.after : ` ${a.docsReference.after}`}
      </p>
    </div>
  )
}

function Skills({ t, a }) {
  return (
    <div className="pad">
      <h2>{a.sections.staerken}</h2>
      <p className="lead">{a.staerkenIntro}</p>
      <div className="tiers">
        {skillTiers.map(({ tier, items }) => (
          <section key={tier} className={`tier tier-${tier}`}>
            <h4>{t.about.tiers[tier]}</h4>
            <ul>
              {items.map((s) => <li key={s}>{s}</li>)}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}

function Free({ t, a }) {
  const { openApp } = useDesk()
  const appLabel = { films: t.about.openFilms, blender: t.about.openBlender, fellow: t.about.openFellow }
  return (
    <div className="pad">
      <h2>{t.about.tabs.free}</h2>
      <div className="interests">
        {a.interests.map((item, i) => {
          const m = interestMedia[i]
          return (
            <article key={item.title} className={`interest${m && (m.type || m.app) ? '' : ' text-only'}`}>
              {m?.type === 'video' && (
                <video src={m.src} controls playsInline preload="metadata" muted={!m.audio} aria-label={item.title} />
              )}
              {m?.type === 'image' && <img src={m.src} alt={item.title} loading="lazy" />}
              <div>
                <h4>{item.title}</h4>
                <p>{item.text}</p>
                {m?.app && (
                  <button type="button" className="btn" onClick={() => openApp(m.app)}>{appLabel[m.app]}</button>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
