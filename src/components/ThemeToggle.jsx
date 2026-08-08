import { HiSun, HiMoon } from 'react-icons/hi2'
import { useTheme } from '../context/ThemeContext.jsx'

const LABEL = {
  dark: { de: 'Heller Modus', en: 'Light mode', fr: 'Mode clair' },
  light: { de: 'Dunkler Modus', en: 'Dark mode', fr: 'Mode sombre' },
}

export default function ThemeToggle({ className = '', language = 'de' }) {
  const { theme, toggleTheme } = useTheme()
  const label = theme === 'dark' ? LABEL.dark[language] : LABEL.light[language]

  return (
    <button
      onClick={toggleTheme}
      aria-label={label}
      className={`flex h-8 w-8 items-center justify-center rounded-full border border-fg/10 bg-fg/5 text-fg/70 transition hover:border-fg/20 hover:text-fg ${className}`}
    >
      {theme === 'dark' ? <HiSun size={15} /> : <HiMoon size={15} />}
    </button>
  )
}
