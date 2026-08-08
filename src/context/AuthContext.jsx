import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useLanguage } from './LanguageContext.jsx'
import { passwordGate } from '../i18n/passwordGate.js'

// Der Zugang wird jetzt echt server-seitig geprüft (siehe /server) statt im
// Browser-Code — das Passwort taucht nirgends mehr im Frontend-Bundle auf.
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const { language } = useLanguage()
  const [unlocked, setUnlocked] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    let cancelled = false

    fetch(`/api/session?lang=${language}`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setUnlocked(!!data.authorized)
      })
      .catch(() => {
        if (!cancelled) setUnlocked(false)
      })
      .finally(() => {
        if (!cancelled) setChecking(false)
      })

    return () => {
      cancelled = true
    }
  }, [language])

  const unlock = useCallback(
    async (password) => {
      try {
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ password, lang: language }),
        })

        if (res.ok) {
          setUnlocked(true)
          return { ok: true }
        }

        const data = await res.json().catch(() => ({}))
        return { ok: false, error: data.error || passwordGate[language].genericError }
      } catch {
        return { ok: false, error: passwordGate[language].unreachableError }
      }
    },
    [language]
  )

  const lock = useCallback(async () => {
    try {
      await fetch('/api/logout', { method: 'POST', credentials: 'include' })
    } catch {
      // ignorieren — lokalen Zustand trotzdem zurücksetzen
    }
    setUnlocked(false)
  }, [])

  return (
    <AuthContext.Provider value={{ unlocked, checking, unlock, lock }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth muss innerhalb von AuthProvider verwendet werden')
  return ctx
}
