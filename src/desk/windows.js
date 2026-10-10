// Zustand der geöffneten Fenster. Wird vom Desktop (Fenster) und vom Handy
// (Vollbild-Apps) gemeinsam genutzt, damit der Monitor im Zimmer immer den
// aktuellen Stand zeigt, egal von wo aus man etwas geöffnet hat.
import { appById, DESK_W, DESK_H } from '../data/apps.js'

const TASKBAR_H = 48

export const initialWindows = { wins: {}, focus: null, z: 10, cascade: 0 }

export function windowsReducer(st, action) {
  switch (action.type) {
    case 'open': {
      const { id, tab } = action
      const existing = st.wins[id]
      const z = st.z + 1
      if (existing) {
        return {
          ...st, z, focus: id,
          wins: { ...st.wins, [id]: { ...existing, z, min: false, tab: tab ?? existing.tab } },
        }
      }
      const app = appById(id)
      if (!app) return st
      const step = st.cascade % 6
      const x = Math.max(8, Math.min(140 + step * 34, DESK_W - app.w - 12))
      const y = Math.max(8, Math.min(28 + step * 26, DESK_H - TASKBAR_H - app.h - 8))
      return {
        ...st, z, focus: id, cascade: st.cascade + 1,
        wins: { ...st.wins, [id]: { id, x, y, w: app.w, h: app.h, z, min: false, max: false, tab } },
      }
    }
    case 'close': {
      const wins = { ...st.wins }
      delete wins[action.id]
      return { ...st, wins, focus: st.focus === action.id ? topVisible(wins) : st.focus }
    }
    case 'focus': {
      const w = st.wins[action.id]
      if (!w) return st
      const z = st.z + 1
      return { ...st, z, focus: action.id, wins: { ...st.wins, [action.id]: { ...w, z, min: false } } }
    }
    case 'minimize': {
      const w = st.wins[action.id]
      if (!w) return st
      const wins = { ...st.wins, [action.id]: { ...w, min: true } }
      return { ...st, wins, focus: st.focus === action.id ? topVisible(wins) : st.focus }
    }
    case 'toggleMax': {
      const w = st.wins[action.id]
      if (!w) return st
      return { ...st, wins: { ...st.wins, [action.id]: { ...w, max: !w.max } } }
    }
    case 'move': {
      const w = st.wins[action.id]
      if (!w) return st
      return { ...st, wins: { ...st.wins, [action.id]: { ...w, x: action.x, y: action.y } } }
    }
    case 'setTab': {
      const w = st.wins[action.id]
      if (!w) return st
      return { ...st, wins: { ...st.wins, [action.id]: { ...w, tab: action.tab } } }
    }
    default:
      return st
  }
}

function topVisible(wins) {
  let best = null
  for (const w of Object.values(wins)) if (!w.min && (!best || w.z > best.z)) best = w
  return best ? best.id : null
}
