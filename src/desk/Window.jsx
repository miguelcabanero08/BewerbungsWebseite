import { useRef } from 'react'
import { DESK_W, DESK_H } from '../data/apps.js'
import { AppIcon, UiIcon } from './icons.jsx'

// Ein Desktop-Fenster: verschiebbar an der Titelleiste, minimieren, maximieren, schliessen.
export default function Window({ win, app, title, labels, focused, dispatch, children }) {
  const ref = useRef(null)
  const drag = useRef(null)

  function onPointerDown(e) {
    if (e.button !== 0 || win.max || e.target.closest('.wc')) return
    const layer = ref.current?.closest('.desk-layer')
    const scale = layer ? layer.getBoundingClientRect().width / DESK_W : 1
    drag.current = { sx: e.clientX, sy: e.clientY, ox: win.x, oy: win.y, scale: scale || 1 }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  function onPointerMove(e) {
    const d = drag.current
    if (!d) return
    const x = Math.max(-win.w + 120, Math.min(DESK_W - 120, d.ox + (e.clientX - d.sx) / d.scale))
    const y = Math.max(0, Math.min(DESK_H - 90, d.oy + (e.clientY - d.sy) / d.scale))
    dispatch({ type: 'move', id: win.id, x, y })
  }
  function onPointerUp() { drag.current = null }

  return (
    <section
      ref={ref}
      className={`win${focused ? ' focus' : ''}${win.max ? ' max' : ''}`}
      style={{ left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.z }}
      aria-label={title}
      onPointerDown={() => { if (!focused) dispatch({ type: 'focus', id: win.id }) }}
    >
      <div
        className="titlebar"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={(e) => { if (!e.target.closest('.wc')) dispatch({ type: 'toggleMax', id: win.id }) }}
      >
        <AppIcon name={app.icon} size={16} />
        <span className="tt">{title}</span>
        <button type="button" className="wc" aria-label={labels.minimize} onClick={() => dispatch({ type: 'minimize', id: win.id })}>
          <UiIcon name="min" size={12} />
        </button>
        <button type="button" className="wc" aria-label={win.max ? labels.restore : labels.maximize} onClick={() => dispatch({ type: 'toggleMax', id: win.id })}>
          <UiIcon name={win.max ? 'restore' : 'max'} size={12} />
        </button>
        <button type="button" className="wc x" aria-label={labels.close} onClick={() => dispatch({ type: 'close', id: win.id })}>
          <UiIcon name="close" size={12} />
        </button>
      </div>
      <div className="wbody">{children}</div>
    </section>
  )
}
