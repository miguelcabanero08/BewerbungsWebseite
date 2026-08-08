import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const STORAGE_KEY = 'theme'
const ThemeContext = createContext(null)

function getInitialTheme() {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  // Dark Mode ist der Standard beim ersten Besuch, unabhängig von der
  // Systemeinstellung. Wer Light bevorzugt, kann es über den Toggle wählen —
  // die Wahl wird oben per localStorage gemerkt.
  return 'dark'
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getInitialTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const setTheme = useCallback((next) => {
    localStorage.setItem(STORAGE_KEY, next)
    setThemeState(next)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setTheme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme muss innerhalb von ThemeProvider verwendet werden')
  return ctx
}
