export default function Marquee({ items, speed = 28, className = '' }) {
  return (
    <div className={`group relative w-full overflow-hidden ${className}`}>
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-bg to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-bg to-transparent" />
      <div
        className="animate-marquee flex w-max items-center gap-10 group-hover:[animation-play-state:paused]"
        style={{ '--marquee-duration': `${speed}s` }}
      >
        {[...items, ...items].map((item, i) => (
          <span key={i} className="shrink-0 font-mono text-sm tracking-wide text-fg/40">
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
