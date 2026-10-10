import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import { dokumente } from '../i18n/dokumente.js'
import { impressum } from '../i18n/impressum.js'
import { AppIcon, UiIcon } from '../desk/icons.jsx'

// Passwortschutz läuft serverseitig (api/login.js, bcrypt-Hash aus SITE_PASSWORD_HASH,
// signiertes Session-Cookie). Die PDFs kommen aus dem privaten Vercel-Blob-Store
// über api/documents/file.js, nur mit gültiger Session.
export default function DocumentsApp() {
  const { unlocked, checking } = useAuth()
  if (checking) return <div className="pad muted" aria-busy="true" />
  return unlocked ? <DocList /> : <LockScreen />
}

function LockScreen() {
  const { unlock } = useAuth()
  const { language } = useLanguage()
  const t = dokumente[language]
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const inputRef = useRef(null)

  async function onSubmit(e) {
    e.preventDefault()
    if (busy || !value) return
    setBusy(true)
    setError('')
    const res = await unlock(value)
    setBusy(false)
    if (!res.ok) {
      setError(res.error)
      setValue('')
      inputRef.current?.focus()
    }
  }

  return (
    <div className="pad lockbox">
      <AppIcon name="lock" size={64} />
      <h2>{t.lockedTitle}</h2>
      <p className="muted">{t.lockedText}</p>
      <form onSubmit={onSubmit} noValidate>
        <label className="sr" htmlFor="doc-code">{t.codeLabel}</label>
        <input
          ref={inputRef}
          id="doc-code"
          type="password"
          autoComplete="current-password"
          placeholder={t.placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={busy}
          aria-invalid={!!error}
          aria-describedby={error ? 'doc-error' : undefined}
        />
        <button type="submit" className="btn primary" disabled={busy || !value}>
          <UiIcon name="lock" size={14} /> {busy ? t.checking : t.unlock}
        </button>
        <p id="doc-error" className="error" role="alert">{error}</p>
      </form>
    </div>
  )
}

function DocList() {
  const { lock } = useAuth()
  const { language } = useLanguage()
  const t = dokumente[language]
  const email = impressum[language].email
  const [docs, setDocs] = useState(null)
  const [loadError, setLoadError] = useState(false)
  const [zip, setZip] = useState({ busy: false, msg: '' })

  useEffect(() => {
    let cancelled = false
    setLoadError(false)
    fetch(`/api/documents?lang=${language}`, { credentials: 'include' })
      .then((r) => { if (!r.ok) throw new Error(String(r.status)); return r.json() })
      .then((data) => { if (!cancelled) setDocs(data) })
      .catch(() => { if (!cancelled) setLoadError(true) })
    return () => { cancelled = true }
  }, [language])

  // ZIP im Browser bauen: umgeht das 4,5-MB-Antwortlimit von Vercel-Funktionen
  async function downloadAll() {
    if (!docs?.length || zip.busy) return
    setZip({ busy: true, msg: '' })
    try {
      const { zipSync } = await import('fflate')
      const files = {}
      let missing = 0
      for (const d of docs) {
        const res = await fetch(`/api/documents/file?id=${encodeURIComponent(d.id)}&lang=${language}`, { credentials: 'include' })
        if (!res.ok) { missing++; continue }
        files[`${safeName(d.title)}.pdf`] = new Uint8Array(await res.arrayBuffer())
      }
      if (!Object.keys(files).length) throw new Error('empty')
      const data = zipSync(files, { level: 0 }) // PDFs sind schon komprimiert
      const url = URL.createObjectURL(new Blob([data], { type: 'application/zip' }))
      const a = document.createElement('a')
      a.href = url
      a.download = t.zipName
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 10000)
      setZip({ busy: false, msg: missing ? t.zipPartial(missing) : '' })
    } catch {
      setZip({ busy: false, msg: t.zipError })
    }
  }

  return (
    <div className="pad docs">
      <header className="docs-head">
        <div>
          <h2>{t.title}</h2>
          <p className="muted">{t.intro}</p>
        </div>
        <div className="actions">
          <button type="button" className="btn primary" onClick={downloadAll} disabled={!docs?.length || zip.busy}>
            <UiIcon name="download" size={14} /> {zip.busy ? t.zipping : t.downloadAll}
          </button>
          <button type="button" className="btn" onClick={lock}>
            <UiIcon name="lock" size={14} /> {t.lock}
          </button>
        </div>
      </header>
      {zip.msg && <p className="notice" role="status">{zip.msg}</p>}

      {loadError && <p className="error" role="alert">{t.loadError}</p>}
      {!docs && !loadError && <p className="muted" aria-busy="true">{t.loading}</p>}
      {docs && (
        <table className="files">
          <thead>
            <tr><th scope="col">{t.colName}</th><th scope="col">{t.colType}</th><th scope="col"><span className="sr">{t.open}</span></th></tr>
          </thead>
          <tbody>
            {docs.map((d) => (
              <tr key={d.id}>
                <td>
                  <b>{d.title}</b>
                  {d.description && <span className="muted small">{d.description}</span>}
                </td>
                <td>PDF</td>
                <td className="right">
                  <a className="btn" href={`/api/documents/file?id=${encodeURIComponent(d.id)}&lang=${language}`} target="_blank" rel="noreferrer">
                    {t.open} <UiIcon name="external" size={14} />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p className="muted small contact">{t.contact} <a href={`mailto:${email}`}>{email}</a></p>
    </div>
  )
}

function safeName(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w-]+/g, '_').replace(/^_+|_+$/g, '') || 'Dokument'
}
