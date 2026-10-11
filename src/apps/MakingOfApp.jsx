import { useLanguage } from '../context/LanguageContext.jsx'
import { makingOf } from '../i18n/makingOf.js'
import { UiIcon } from '../desk/icons.jsx'

const REPO = 'https://github.com/miguelcabanero08/BewerbungsWebseite'

// Wie diese Seite gebaut ist: Technik, Zahlen, Ablauf und gelöste Probleme
export default function MakingOfApp() {
  const { language } = useLanguage()
  const t = makingOf[language]
  return (
    <div className="pad scroll making" data-scroll>
      <h2>{t.title}</h2>
      <p className="lead">{t.lead}</p>

      <h3>{t.stackTitle}</h3>
      <ul className="mk-stack">{t.stack.map((s) => <li key={s}>{s}</li>)}</ul>

      <h3>{t.numbersTitle}</h3>
      <ul className="mk-numbers">
        {t.numbers.map(([n, text]) => <li key={text}><b>{n}</b><span>{text}</span></li>)}
      </ul>

      <h3>{t.howTitle}</h3>
      <ol className="mk-how">
        {t.how.map(([title, text]) => <li key={title}><h4>{title}</h4><p>{text}</p></li>)}
      </ol>

      <h3>{t.problemsTitle}</h3>
      <ul className="mk-problems">
        {t.problems.map(([problem, fix]) => (
          <li key={problem}>
            <p><span className="tag wip">{t.problem}</span> {problem}</p>
            <p><span className="tag live">{t.fix}</span> {fix}</p>
          </li>
        ))}
      </ul>

      <h3>{t.careTitle}</h3>
      <ul className="mk-care">{t.care.map((c) => <li key={c}>{c}</li>)}</ul>

      <div className="actions">
        <a className="btn" href={REPO} target="_blank" rel="noreferrer"><UiIcon name="github" size={14} /> {t.code}</a>
      </div>
    </div>
  )
}
