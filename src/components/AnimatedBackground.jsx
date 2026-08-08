export default function AnimatedBackground({ variant = 'default' }) {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-bg">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,color-mix(in_srgb,var(--color-fg)_6%,transparent)_1px,transparent_0)] bg-[length:32px_32px]" />
      <div className="animate-blob absolute -top-40 -left-40 h-[32rem] w-[32rem] rounded-full bg-violet/30 blur-[110px]" />
      <div
        className="animate-blob absolute top-1/3 -right-40 h-[28rem] w-[28rem] rounded-full bg-cyan/20 blur-[110px]"
        style={{ animationDelay: '-6s' }}
      />
      <div
        className="animate-blob absolute -bottom-40 left-1/4 h-[30rem] w-[30rem] rounded-full bg-pink/20 blur-[110px]"
        style={{ animationDelay: '-11s' }}
      />
      {variant === 'default' && (
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-bg" />
      )}
    </div>
  )
}
