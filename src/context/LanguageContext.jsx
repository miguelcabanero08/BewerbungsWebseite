import { createContext, useContext, useState, useCallback } from 'react'

const STORAGE_KEY = 'language'
export const LANGUAGES = ['de', 'en', 'fr']
const DEFAULT_LANGUAGE = 'de'

const LanguageContext = createContext(null)

function getInitialLanguage() {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored && LANGUAGES.includes(stored)) return stored
  return DEFAULT_LANGUAGE
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(getInitialLanguage)

  const setLanguage = useCallback((lang) => {
    if (!LANGUAGES.includes(lang)) return
    localStorage.setItem(STORAGE_KEY, lang)
    setLanguageState(lang)
  }, [])

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage muss innerhalb von LanguageProvider verwendet werden')
  return ctx
}
