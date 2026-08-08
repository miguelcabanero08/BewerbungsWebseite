import { motion } from 'framer-motion'

export default function Reveal({
  children,
  delay = 0,
  y = 28,
  once = true,
  className = '',
  as = 'div',
  ...props
}) {
  const Component = motion[as] ?? motion.div

  return (
    <Component
      initial={{ opacity: 0, y, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once, margin: '-80px' }}
      transition={{ duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
      {...props}
    >
      {children}
    </Component>
  )
}
