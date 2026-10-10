import { createContext, useContext } from 'react'

// Gibt Apps die Möglichkeit, andere Apps zu öffnen (z. B. "Filme ansehen" in Über mich).
export const DeskContext = createContext(null)

export function useDesk() {
  const ctx = useContext(DeskContext)
  if (!ctx) throw new Error('useDesk muss innerhalb von DeskContext verwendet werden')
  return ctx
}
