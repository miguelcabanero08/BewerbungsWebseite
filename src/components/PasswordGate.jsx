import { useState, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { HiLockClosed, HiLockOpen, HiXMark } from 'react-icons/hi2'
import { useAuth } from '../context/AuthContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import { passwordGate } from '../i18n/passwordGate.js'

export default function PasswordGate({ open, onClose, onUnlocked, title, description }) {
  const { unlock } = useAuth()
  const { language } = useLanguage()
  const t = passwordGate[language]
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)
  const [errorMessage, setErrorMessage] = useState(t.genericError)
  const [attempt, setAttempt] = useState(0)
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) {
      setValue('')
      setError(false)
      setAttempt(0)
      setSuccess(false)
      setSubmitting(false)
      const timer = setTimeout(() => inputRef.current?.focus(), 350)
      return () => clearTimeout(timer)
    }
  }, [open])

  useEffect(() => {
    if (attempt > 0) inputRef.current?.focus()
  }, [attempt])

  async function handleSubmit(e) {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    const result = await unlock(value)
    setSubmitting(false)

    if (result.ok) {
      setSuccess(true)
      setTimeout(() => {
        onUnlocked?.()
      }, 700)
    } else {
      setErrorMessage(result.error || t.genericError)
      setError(true)
      setAttempt((a) => a + 1)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="gradient-border glass relative w-full max-w-sm rounded-2xl p-8 text-center shadow-2xl"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 22, stiffness: 260 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              aria-label={t.close}
              className="absolute right-4 top-4 text-fg/40 transition hover:text-fg"
            >
              <HiXMark size={20} />
            </button>

            <motion.div
              key={`icon-${attempt}`}
              className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet to-cyan"
              initial={{ x: 0 }}
              animate={attempt > 0 ? { x: [0, -10, 10, -8, 8, -4, 4, 0] } : { x: 0 }}
              transition={{ duration: 0.5 }}
            >
              {success ? (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <HiLockOpen size={28} className="text-fg" />
                </motion.div>
              ) : (
                <HiLockClosed size={26} className="text-fg" />
              )}
            </motion.div>

            <h2 className="font-display text-xl font-semibold text-fg">
              {title || t.defaultTitle}
            </h2>
            <p className="mt-2 text-sm text-fg/50">{description || t.defaultDescription}</p>

            <motion.form
              key={`form-${attempt}`}
              onSubmit={handleSubmit}
              className="mt-6"
              initial={{ x: 0 }}
              animate={attempt > 0 ? { x: [0, -10, 10, -8, 8, -4, 4, 0] } : { x: 0 }}
              transition={{ duration: 0.45 }}
            >
              <input
                ref={inputRef}
                type="password"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={t.placeholder}
                disabled={submitting}
                className="w-full rounded-lg border border-fg/10 bg-fg/5 px-4 py-3 text-center text-fg placeholder-fg/30 outline-none transition focus:border-violet focus:ring-2 focus:ring-violet/40 disabled:opacity-50"
              />
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 text-sm text-pink"
                  >
                    {errorMessage}
                  </motion.p>
                )}
              </AnimatePresence>
              <button
                type="submit"
                disabled={submitting}
                className="mt-5 w-full rounded-lg bg-gradient-to-r from-violet via-cyan to-pink bg-[length:200%_auto] bg-left px-4 py-3 font-medium text-fg transition-[background-position] duration-500 hover:bg-right disabled:cursor-wait disabled:opacity-70"
              >
                {submitting ? t.submitting : t.submit}
              </button>
            </motion.form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
