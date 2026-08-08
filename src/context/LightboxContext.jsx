import { createContext, useContext, useState, useCallback } from 'react'

const LightboxContext = createContext(null)

export function LightboxProvider({ children }) {
  const [media, setMedia] = useState(null) // { type: 'image' | 'video', src, alt }

  const openLightbox = useCallback((next) => setMedia(next), [])
  const closeLightbox = useCallback(() => setMedia(null), [])

  return (
    <LightboxContext.Provider value={{ media, openLightbox, closeLightbox }}>
      {children}
    </LightboxContext.Provider>
  )
}

export function useLightbox() {
  const ctx = useContext(LightboxContext)
  if (!ctx) throw new Error('useLightbox muss innerhalb von LightboxProvider verwendet werden')
  return ctx
}
