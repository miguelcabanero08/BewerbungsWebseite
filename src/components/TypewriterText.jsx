import { useEffect, useState } from 'react'

// Kleine, selbstgebaute Typewriter-Animation (tippen -> pausieren -> löschen -> nächstes
// Wort), bewusst ohne zusätzliche Abhängigkeit. `words` sollte eine stabile Referenz sein
// (z.B. aus den statischen i18n-Daten), sonst startet der Effekt bei jedem Render neu.
export default function TypewriterText({
  words = [],
  typingSpeed = 55,
  deletingSpeed = 28,
  pause = 1800,
  className = '',
}) {
  const [text, setText] = useState('')
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState('typing') // 'typing' | 'deleting'

  useEffect(() => {
    if (words.length === 0) return undefined

    const reduced =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      setText(words[0])
      return undefined
    }

    const current = words[index % words.length]
    let timeout

    if (phase === 'typing') {
      if (text.length < current.length) {
        timeout = setTimeout(() => setText(current.slice(0, text.length + 1)), typingSpeed)
      } else {
        timeout = setTimeout(() => setPhase('deleting'), pause)
      }
    } else {
      if (text.length > 0) {
        timeout = setTimeout(() => setText(text.slice(0, -1)), deletingSpeed)
      } else {
        setPhase('typing')
        setIndex((i) => (i + 1) % words.length)
      }
    }

    return () => clearTimeout(timeout)
  }, [text, phase, index, words, typingSpeed, deletingSpeed, pause])

  return (
    <span className={className}>
      {text}
      <span
        aria-hidden="true"
        className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[0.15em] animate-pulse bg-current align-middle"
      />
    </span>
  )
}
