// Eigene App-Icons im flachen Windows-11-Stil (keine Microsoft-Grafiken).
const folderBase = (
  <>
    <path d="M4 12a3 3 0 0 1 3-3h11l4 4h19a3 3 0 0 1 3 3v21a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3Z" fill="#e8a930" />
    <path d="M4 18h40v19a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3Z" fill="#ffc94d" />
  </>
)

const ICONS = {
  user: (
    <>
      {folderBase}
      <circle cx="24" cy="25" r="4.5" fill="#7a4d00" />
      <path d="M15.5 36a8.5 8.5 0 0 1 17 0Z" fill="#7a4d00" />
    </>
  ),
  folder: (
    <>
      {folderBase}
      <path d="M14 33l6-8 5 6 3-4 6 6Z" fill="#7a4d00" opacity=".8" />
    </>
  ),
  lock: (
    <>
      {folderBase}
      <rect x="18" y="26" width="12" height="10" rx="1.5" fill="#7a4d00" />
      <path d="M20.5 26v-3a3.5 3.5 0 0 1 7 0v3" fill="none" stroke="#7a4d00" strokeWidth="2.4" />
    </>
  ),
  music: (
    <>
      <rect x="4" y="4" width="40" height="40" rx="9" fill="#1fb35a" />
      <path d="M19 33V15l15-3v17" fill="none" stroke="#fff" strokeWidth="3" strokeLinejoin="round" />
      <circle cx="15.5" cy="33" r="4.5" fill="#fff" />
      <circle cx="30.5" cy="29" r="4.5" fill="#fff" />
    </>
  ),
  film: (
    <>
      <rect x="4" y="8" width="40" height="32" rx="5" fill="#1d1d22" />
      <path d="M4 15h40M4 33h40" stroke="#ffb547" strokeWidth="2" />
      <g fill="#ffb547">
        {[8, 16, 24, 32].map((x) => <rect key={`t${x}`} x={x} y="10" width="4" height="3" rx=".5" />)}
        {[8, 16, 24, 32].map((x) => <rect key={`b${x}`} x={x} y="35" width="4" height="3" rx=".5" />)}
      </g>
      <path d="M21 19.5v9l8-4.5Z" fill="#fff" />
    </>
  ),
  cube: (
    <>
      <path d="M24 5 41 14v20L24 43 7 34V14Z" fill="#e8762b" />
      <path d="M24 5 41 14 24 23 7 14Z" fill="#ffa55c" />
      <path d="M24 23v20L7 34V14Z" fill="#c95c17" />
      <circle cx="24" cy="23" r="5" fill="none" stroke="#fff" strokeWidth="2.2" />
    </>
  ),
  door: (
    <>
      <rect x="4" y="4" width="40" height="40" rx="9" fill="#141518" />
      <rect x="15" y="9" width="18" height="31" rx="1" fill="#3a2a22" />
      <rect x="15" y="9" width="18" height="31" rx="1" fill="none" stroke="#7a1f1f" strokeWidth="1.6" />
      <circle cx="24" cy="17" r="2.2" fill="#e04848" />
      <circle cx="29.5" cy="26" r="1.6" fill="#c9a26a" />
    </>
  ),
  making: (
    <>
      <rect x="4" y="9" width="40" height="33" rx="5" fill="#2a2348" />
      <path d="M6 9.5 42 4l1 6.5L7 16Z" fill="#ffb547" />
      <path d="M13 8.4l4 6M22 7l4 6M31 5.7l4 6" stroke="#2a2348" strokeWidth="2.6" />
      <path d="M18 23l-6 6 6 6M30 23l6 6-6 6M26 21l-4 16" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  note: (
    <>
      <path d="M10 5h20l9 9v29H10Z" fill="#fff" />
      <path d="M30 5v9h9" fill="#d6e4f5" />
      <path d="M15 21h18M15 26h18M15 31h18M15 36h11" stroke="#4a78b5" strokeWidth="2" />
      <path d="M10 5h20l9 9v29H10Z" fill="none" stroke="#9aa9bd" strokeWidth="1.2" />
    </>
  ),
  bin: (
    <>
      <path d="M12 14h24l-2.5 28h-19Z" fill="#dfe6ee" stroke="#9aa9bd" strokeWidth="1.2" />
      <rect x="10" y="9" width="28" height="5" rx="1.5" fill="#c4cfdb" />
      <path d="M19 20l1 17M24 20v17M29 20l-1 17" stroke="#9aa9bd" strokeWidth="1.6" />
      <path d="M17 25l5 3-1 5-5-2Z" fill="#ffc94d" />
    </>
  ),
}

export function AppIcon({ name, size = 48, className }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      {ICONS[name]}
    </svg>
  )
}

// Kleine Linien-Icons für Bedienelemente (eine Strichstärke, currentColor)
export function UiIcon({ name, size = 16 }) {
  const p = { width: size, height: size, viewBox: '0 0 16 16', 'aria-hidden': true, focusable: false, fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' }
  switch (name) {
    case 'min': return <svg {...p}><path d="M3 8.5h10" /></svg>
    case 'max': return <svg {...p}><rect x="3.5" y="3.5" width="9" height="9" rx="1" /></svg>
    case 'restore': return <svg {...p}><rect x="3" y="5.5" width="7.5" height="7.5" rx="1" /><path d="M5.5 5.5V3.5a.5.5 0 0 1 .5-.5h6.5a.5.5 0 0 1 .5.5V10a.5.5 0 0 1-.5.5h-2" /></svg>
    case 'close': return <svg {...p}><path d="M4 4l8 8M12 4l-8 8" /></svg>
    case 'back': return <svg {...p}><path d="M10 3 5 8l5 5" /></svg>
    case 'down': return <svg {...p} strokeWidth="2"><path d="M8 2v11M3.5 8.5 8 13l4.5-4.5" /></svg>
    case 'external': return <svg {...p}><path d="M9 3h4v4M13 3 7 9M11.5 9.5V13H3V4.5h3.5" /></svg>
    case 'power': return <svg {...p} strokeWidth="1.8"><path d="M8 1.5v6M4.4 3.7a5.5 5.5 0 1 0 7.2 0" /></svg>
    case 'lock': return <svg {...p}><rect x="3" y="7" width="10" height="7" rx="1.2" /><path d="M5 7V5a3 3 0 0 1 6 0v2" /></svg>
    case 'download': return <svg {...p}><path d="M8 2v8M4.5 6.5 8 10l3.5-3.5M3 13.5h10" /></svg>
    case 'play': return <svg {...p} fill="currentColor" stroke="none"><path d="M4.5 2.5v11l9-5.5Z" /></svg>
    case 'pause': return <svg {...p} fill="currentColor" stroke="none"><rect x="3.5" y="2.5" width="3" height="11" rx=".6" /><rect x="9.5" y="2.5" width="3" height="11" rx=".6" /></svg>
    case 'card': return <svg {...p}><rect x="1.8" y="3.2" width="12.4" height="9.6" rx="1.6" /><circle cx="5.6" cy="7" r="1.5" /><path d="M3.4 10.6a2.3 2.3 0 0 1 4.4 0M9.6 6.4h2.8M9.6 9h2.8" /></svg>
    case 'iso': return <svg {...p}><path d="M8 1.8 13.5 5v6L8 14.2 2.5 11V5Z" /><path d="M2.5 5 8 8.2 13.5 5M8 8.2v6" /></svg>
    case 'eye': return <svg {...p}><path d="M1.5 8s2.4-4.5 6.5-4.5S14.5 8 14.5 8s-2.4 4.5-6.5 4.5S1.5 8 1.5 8Z" /><circle cx="8" cy="8" r="2" /></svg>
    case 'sun': return <svg {...p}><circle cx="8" cy="8" r="3" /><path d="M8 1.2v1.6M8 13.2v1.6M1.2 8h1.6M13.2 8h1.6M3.2 3.2l1.1 1.1M11.7 11.7l1.1 1.1M3.2 12.8l1.1-1.1M11.7 4.3l1.1-1.1" /></svg>
    case 'moon': return <svg {...p}><path d="M13.2 10.1A5.6 5.6 0 0 1 5.9 2.8a5.6 5.6 0 1 0 7.3 7.3Z" /></svg>
    case 'help': return <svg {...p}><circle cx="8" cy="8" r="6.5" /><path d="M6.2 6.2a1.9 1.9 0 0 1 3.7.6c0 1.3-1.9 1.6-1.9 2.8" /><circle cx="8" cy="11.7" r=".7" fill="currentColor" stroke="none" /></svg>
    case 'bell': return <svg {...p} fill="currentColor" stroke="none" viewBox="0 0 18 18"><path d="M9 2.2a4.8 4.8 0 0 0-4.8 4.8v3.4L2.6 13h12.8l-1.6-2.6V7A4.8 4.8 0 0 0 9 2.2Z" /><path d="M7.2 14.6a1.9 1.9 0 0 0 3.6 0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
    case 'github': return <svg {...p} fill="currentColor" stroke="none"><path d="M8 .7a7.3 7.3 0 0 0-2.3 14.2c.4.1.5-.2.5-.4v-1.3c-2 .4-2.5-.9-2.5-.9-.3-.8-.8-1.1-.8-1.1-.7-.5 0-.5 0-.5.7.1 1.1.8 1.1.8.7 1.1 1.7.8 2.1.6.1-.5.3-.8.5-1-1.6-.2-3.3-.8-3.3-3.6 0-.8.3-1.5.8-2-.1-.2-.3-.9.1-1.9 0 0 .6-.2 2 .8a6.9 6.9 0 0 1 3.6 0c1.4-1 2-.8 2-.8.4 1 .2 1.7.1 1.9.5.5.8 1.2.8 2 0 2.8-1.7 3.4-3.3 3.6.3.2.5.7.5 1.4v2c0 .2.1.5.6.4A7.3 7.3 0 0 0 8 .7Z" /></svg>
    default: return null
  }
}
