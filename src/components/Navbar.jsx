import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
  useMotionTemplate,
} from 'framer-motion'
import { HiBars3, HiXMark } from 'react-icons/hi2'
import { useLanguage } from '../context/LanguageContext.jsx'
import { common } from '../i18n/common.js'
import LanguageSwitcher from './LanguageSwitcher.jsx'
import ThemeToggle from './ThemeToggle.jsx'

// Inline statt der alten .text-gradient-Klasse — siehe Home.jsx für die Begründung
// (Build-Pipeline entfernt -webkit-background-clip auch aus handgeschriebenem CSS,
// dadurch war Farbverlauf-Text auf Safari/iOS unsichtbar).
const logoGradientStyle = {
  backgroundImage: 'linear-gradient(90deg, var(--color-violet), var(--color-cyan), var(--color-pink))',
  backgroundSize: '200% auto',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
  WebkitTextFillColor: 'transparent',
  animation: 'gradient 6s ease infinite',
}

function NavItem({ to, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `group relative text-sm font-medium transition-colors ${
          isActive ? 'text-fg' : 'text-fg/60 hover:text-fg'
        }`
      }
    >
      {label}
      <span className="absolute -bottom-1 left-0 h-px w-0 bg-gradient-to-r from-violet via-cyan to-pink transition-all duration-300 group-hover:w-full" />
    </NavLink>
  )
}

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { language } = useLanguage()
  const t = common[language]
  const { scrollY } = useScroll()
  const marginTop = useTransform(scrollY, [0, 100], [16, 8])
  const scale = useTransform(scrollY, [0, 100], [1, 0.97])
  const shadowOpacity = useTransform(scrollY, [0, 100], [0, 0.35])
  const boxShadow = useMotionTemplate`0 10px 30px -10px rgba(0,0,0,${shadowOpacity})`

  const links = [
    { to: '/ueber-mich', label: t.nav.ueberMich },
    { to: '/projekte', label: t.nav.projekte },
    { to: '/dokumente', label: t.nav.dokumente },
    { to: '/impressum', label: t.nav.impressum },
  ]

  return (
    <header className="fixed inset-x-0 top-0 z-40">
      <motion.div
        style={{ marginTop, scale, boxShadow }}
        className="glass-nav mx-auto flex max-w-5xl items-center justify-between rounded-full px-6 py-3"
      >
        <NavLink to="/" className="font-display text-lg font-semibold tracking-tight text-fg">
          <span style={logoGradientStyle}>{t.nav.logo}</span>
        </NavLink>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <NavItem key={l.to} {...l} />
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle language={language} />
          <LanguageSwitcher className="hidden md:block" />
          <button
            className="text-fg md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label={t.nav.menu}
          >
            {open ? <HiXMark size={24} /> : <HiBars3 size={24} />}
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="glass-nav mx-4 mt-2 flex flex-col gap-4 rounded-2xl p-6 md:hidden"
          >
            {links.map((l) => (
              <NavItem key={l.to} {...l} onClick={() => setOpen(false)} />
            ))}
            <div className="flex items-center justify-between border-t border-fg/10 pt-4">
              <LanguageSwitcher />
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
