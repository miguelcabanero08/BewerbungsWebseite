import { useLanguage } from '../context/LanguageContext.jsx'
import { common } from '../i18n/common.js'

export default function Footer() {
  const { language } = useLanguage()

  return (
    <footer className="relative z-10 mt-24 border-t border-fg/10 py-8 text-center text-sm text-fg/40">
      <p>
        © {new Date().getFullYear()} {common[language].footer}
      </p>
    </footer>
  )
}
