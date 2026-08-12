import { motion } from 'framer-motion'

export default function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-10 mx-auto w-full max-w-[1600px] px-6 pb-24 pt-36 sm:px-8 lg:px-12 xl:px-16"
    >
      {children}
    </motion.div>
  )
}
