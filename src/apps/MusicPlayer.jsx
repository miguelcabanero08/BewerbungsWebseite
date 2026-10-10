import { useLanguage } from '../context/LanguageContext.jsx'
import { useMusic } from '../context/MusicContext.jsx'
import { ui } from '../i18n/ui.js'
import { UiIcon } from '../desk/icons.jsx'

const fmt = (s) => {
  if (!Number.isFinite(s) || s <= 0) return '–:––'
  const m = Math.floor(s / 60), r = Math.floor(s % 60)
  return `${m}:${String(r).padStart(2, '0')}`
}

export default function MusicPlayer({ embedded = false }) {
  const { language } = useLanguage()
  const t = ui[language].music
  const { songs, current, playing, time, duration, play, toggle, seek } = useMusic()
  const empty = songs.length === 0

  function onSeek(e) {
    const r = e.currentTarget.getBoundingClientRect()
    seek((e.clientX - r.left) / r.width)
  }
  function onSeekKey(e) {
    if (!duration) return
    if (e.key === 'ArrowRight') { e.preventDefault(); seek((time + 5) / duration) }
    if (e.key === 'ArrowLeft') { e.preventDefault(); seek((time - 5) / duration) }
  }

  return (
    <div className={`player${embedded ? ' embedded' : ''}`}>
      <header className="pl-head">
        <img className="pl-cover" src="/images/portrait.webp" alt="" />
        <div>
          <small>{t.playlist}</small>
          <h2>{t.title}</h2>
          <p>{t.by}</p>
        </div>
      </header>

      <div className="tracks" data-scroll>
        {empty ? (
          <p className="pl-empty">{t.empty}</p>
        ) : (
          <ol>
            {songs.map((s, i) => (
              <li key={s.id}>
                <button type="button" className={`track${current === s.id ? ' on' : ''}`} onClick={() => play(s.id)}>
                  <span className="n">{current === s.id && playing ? <UiIcon name="play" size={12} /> : i + 1}</span>
                  <span className="title">{s.title}{s.note && <small>{s.note}</small>}</span>
                </button>
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="pl-bar">
        <button type="button" className="playbtn" onClick={toggle} disabled={empty} aria-label={playing ? t.pause : t.play}>
          <UiIcon name={playing ? 'pause' : 'play'} size={14} />
        </button>
        <span className="time">{fmt(time)}</span>
        <div
          className="prog"
          role="slider"
          tabIndex={empty ? -1 : 0}
          aria-label={t.track}
          aria-valuemin={0}
          aria-valuemax={Math.round(duration) || 0}
          aria-valuenow={Math.round(time)}
          onClick={onSeek}
          onKeyDown={onSeekKey}
        >
          <i style={{ width: duration ? `${(time / duration) * 100}%` : '0%' }} />
        </div>
        <span className="time">{fmt(duration)}</span>
      </div>
    </div>
  )
}
