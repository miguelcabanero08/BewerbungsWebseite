import { lazy, Suspense, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll } from 'framer-motion'
import {
  HiAcademicCap,
  HiLightBulb,
  HiFlag,
  HiBriefcase,
  HiCodeBracket,
  HiCpuChip,
  HiCircleStack,
  HiWrenchScrewdriver,
  HiPuzzlePiece,
  HiMusicalNote,
  HiUserGroup,
  HiFilm,
  HiUser,
} from 'react-icons/hi2'
import { GiSoccerBall } from 'react-icons/gi'
import CountUp from '../components/CountUp.jsx'
import Reveal from '../components/Reveal.jsx'
import TiltCard from '../components/TiltCard.jsx'
import ImagePlaceholder from '../components/ImagePlaceholder.jsx'
import VideoPlaceholder from '../components/VideoPlaceholder.jsx'
// gsap-Abhängigkeit erst laden, wenn tatsächlich ein Karussell gebraucht wird.
const DepthCarousel = lazy(() => import('../components/DepthCarousel.jsx'))
import { useLanguage } from '../context/LanguageContext.jsx'
import { ueberMich } from '../i18n/ueberMich.js'

// Sprachunabhängige Meta-Daten (Icons, Bilder, Skill-Werte) — Texte kommen aus
// src/i18n/ueberMich.js, per Index zugeordnet.
const ABOUT_ICONS = [HiLightBulb, HiAcademicCap, HiBriefcase, HiFlag]

// Games/Filme sind Eigennamen — unübersetzt, daher hier statt in ueberMich.js.
const GAME_ITEMS = [
  { image: '/images/games/subnautica.jpg', alt: 'Subnautica' },
  { image: '/images/games/satisfactory.avif', alt: 'Satisfactory' },
  { image: '/images/games/ea-sports-fc.webp', alt: 'EA Sports FC' },
  { image: '/images/games/ark-survival-evolved.webp', alt: 'ARK: Survival Evolved' },
]

const MOVIE_ITEMS = [
  { image: '/images/movies/marvel.jpg', alt: 'Marvel' },
  { image: '/images/movies/supernatural.jpg', alt: 'Supernatural' },
  { image: '/images/movies/smallville.jpg', alt: 'Smallville' },
  { image: '/images/movies/dexter.jpg', alt: 'Dexter' },
  { image: '/images/movies/breaking-bad.jpg', alt: 'Breaking Bad' },
  { image: '/images/movies/the-mentalist.jpg', alt: 'The Mentalist' },
]

const SKILL_GROUPS_META = [
  {
    icon: HiCodeBracket,
    skills: [
      { name: 'Java', level: 65 },
      { name: 'C#', level: 85 },
      { name: 'JavaScript', level: 80 },
      { name: 'TypeScript', level: 75 },
      { name: 'Python', level: 45 },
      { name: 'PHP', level: 40 },
    ],
  },
  {
    icon: HiCpuChip,
    skills: [
      { name: 'HTML & CSS', level: 85 },
      { name: 'React', level: 75 },
      { name: 'Next.js', level: 65 },
      { name: 'Tailwind CSS', level: 70 },
    ],
  },
  {
    icon: HiCircleStack,
    skills: [
      { name: 'SQL', level: 75 },
      { name: 'MongoDB', level: 70 },
      { name: 'Redis', level: 60 },
      { name: 'Neo4j', level: 60 },
    ],
  },
  {
    icon: HiWrenchScrewdriver,
    skills: [
      { name: 'Git, GitHub & GitLab', level: 80 },
      { name: 'VS Code & Visual Studio', level: 85 },
      { name: 'Docker', level: 70 },
      { name: 'Kubernetes', level: 55 },
      { name: 'Azure', level: 75 },
      { name: 'Unity', level: 45 },
      { name: 'Figma', level: 50 },
    ],
  },
]

const INTERESTS_META = [
  { icon: HiPuzzlePiece, media: 'carousel', items: GAME_ITEMS },
  { icon: HiMusicalNote, media: 'video', video: '/videos/musik-gitarre.mp4', hasAudio: true },
  { icon: HiUserGroup, media: 'video', video: '/videos/sport.mp4', hasAudio: false },
  { icon: HiFilm, media: 'carousel', items: MOVIE_ITEMS },
  { icon: GiSoccerBall, media: 'image', image: '/images/manchester-united.jpg' },
]

function groupAverage(skills) {
  return Math.round(skills.reduce((sum, s) => sum + s.level, 0) / skills.length)
}

function Timeline({ items }) {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 0.85', 'end 0.6'],
  })

  return (
    <div ref={containerRef} className="relative pl-8">
      <div className="absolute left-0 top-0 h-full w-px bg-fg/10" />
      <motion.div
        style={{ scaleY: scrollYProgress }}
        className="absolute left-0 top-0 h-full w-px origin-top bg-gradient-to-b from-violet via-cyan to-pink"
      />
      {items.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, delay: i * 0.08 }}
          className="relative mb-10 last:mb-0"
        >
          <span className="absolute -left-[41px] flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet to-cyan text-fg">
            <HiAcademicCap size={16} />
          </span>
          <p className="font-mono text-xs uppercase tracking-wider text-cyan">{item.period}</p>
          <h3 className="mt-1 font-display text-lg font-semibold text-fg">{item.title}</h3>
          <p className="text-sm text-fg/50">{item.place}</p>
          <p className="mt-2 text-sm leading-relaxed text-fg/60">{item.desc}</p>
        </motion.div>
      ))}
    </div>
  )
}

function CircularMeter({ label, value, delay = 0 }) {
  const size = 116
  const stroke = 7
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={stroke}
            className="fill-none stroke-fg/10"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={stroke}
            strokeLinecap="round"
            stroke="url(#meter-gradient)"
            className="fill-none"
            style={{ strokeDasharray: circumference }}
            initial={{ strokeDashoffset: circumference }}
            whileInView={{ strokeDashoffset: circumference - (circumference * value) / 100 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 1.2, delay, ease: [0.16, 1, 0.3, 1] }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center font-display text-2xl font-bold text-fg">
          <CountUp value={value} suffix="%" />
        </div>
      </div>
      <p className="mt-3 text-sm text-fg/50">{label}</p>
    </div>
  )
}

function SkillBar({ name, level, delay }) {
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-sm">
        <span className="text-fg/80">{name}</span>
        <span className="text-fg/40">
          <CountUp value={level} suffix="%" />
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-fg/10">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${level}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded-full bg-gradient-to-r from-violet via-cyan to-pink"
        />
      </div>
    </div>
  )
}

function SectionHeading({ eyebrow, title }) {
  return (
    <div className="mb-10">
      <p className="font-mono text-xs uppercase tracking-wider text-cyan">{eyebrow}</p>
      <h2 className="mt-2 font-display text-3xl font-bold text-fg sm:text-4xl">{title}</h2>
    </div>
  )
}

export default function UeberMich() {
  const { language } = useLanguage()
  const t = ueberMich[language]

  const education = t.education
  const aboutCards = t.aboutCards.map((card, i) => ({ ...card, icon: ABOUT_ICONS[i] }))
  const groups = SKILL_GROUPS_META.map((meta, i) => ({
    ...meta,
    title: t.groupTitles[i],
    skills: meta.skills,
  }))
  const interests = t.interests.map((item, i) => ({ ...item, ...INTERESTS_META[i] }))

  return (
    <div>
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="meter-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="50%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
      </svg>

      {/* Hero: Intro-Text + Portrait */}
      {/* Mobile: Überschrift, Bild, Text. Ab lg: ursprüngliches Zwei-Spalten-Layout. */}
      <div className="lg:hidden">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-4xl font-bold text-fg sm:text-5xl"
        >
          {t.heading}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="gradient-border relative mt-8 rounded-3xl"
        >
          <ImagePlaceholder
            src="/images/portrait.jpg"
            alt={t.portraitAlt}
            icon={HiUser}
            zoomable
            className="aspect-[3/4] w-full rounded-3xl"
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="mt-8 leading-relaxed text-fg/70"
        >
          {t.intro1}
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.26 }}
          className="mt-4 leading-relaxed text-fg/70"
        >
          {t.intro2}
        </motion.p>
      </div>

      <div className="hidden lg:grid lg:grid-cols-5 lg:items-center lg:gap-12">
        <div className="lg:order-1 lg:col-span-3">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl font-bold text-fg sm:text-5xl"
          >
            {t.heading}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 leading-relaxed text-fg/70"
          >
            {t.intro1}
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="mt-4 leading-relaxed text-fg/70"
          >
            {t.intro2}
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="gradient-border relative lg:order-2 lg:col-span-2 rounded-3xl"
        >
          <ImagePlaceholder
            src="/images/portrait.jpg"
            alt={t.portraitAlt}
            icon={HiUser}
            zoomable
            className="aspect-[3/4] w-full rounded-3xl"
          />
        </motion.div>
      </div>

      {/* Interessen — alternierende Text/Bild-Reihen */}
      <div className="mt-20 space-y-16">
        {interests.map((item, i) => (
          <Reveal key={item.title} delay={i * 0.05}>
            <div
              className={`flex flex-col gap-8 lg:items-center lg:gap-14 ${
                i % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'
              }`}
            >
              <div className="lg:w-2/5">
                {item.media === 'carousel' ? (
                  <div className="relative h-[320px] w-full overflow-hidden rounded-2xl">
                    <Suspense fallback={<div className="h-full w-full animate-pulse bg-fg/5" />}>
                      <DepthCarousel
                        items={item.items}
                        icon={item.icon}
                        autoplay
                        loop
                        cardWidth={170}
                        cardHeight={220}
                        depth={130}
                        spread={40}
                        tilt={20}
                        perspective={900}
                        visibleCards={3}
                        blur={6}
                      />
                    </Suspense>
                  </div>
                ) : item.media === 'video' ? (
                  <VideoPlaceholder
                    src={item.video}
                    hasAudio={item.hasAudio}
                    alt={item.title}
                    icon={item.icon}
                    zoomable
                    className="aspect-[4/3] w-full rounded-2xl"
                  />
                ) : (
                  <ImagePlaceholder
                    src={item.image}
                    alt={item.title}
                    icon={item.icon}
                    zoomable
                    className="aspect-[4/3] w-full rounded-2xl"
                  />
                )}
              </div>
              <div className="lg:w-3/5">
                <h3 className="flex items-center gap-2 font-display text-2xl font-semibold text-fg">
                  <item.icon className="text-cyan" /> {item.title}
                </h3>
                <p className="mt-3 leading-relaxed text-fg/60">{item.text}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-16 max-w-3xl leading-relaxed text-fg/70">
        <p>
          {t.docsReference.before}{' '}
          <Link to="/dokumente" className="group relative font-medium text-fg">
            {t.docsReference.linkText}
            <span className="absolute -bottom-0.5 left-0 h-px w-full bg-gradient-to-r from-violet via-cyan to-pink" />
          </Link>{' '}
          {t.docsReference.after}
        </p>
      </Reveal>

      <motion.nav
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-16 flex flex-wrap gap-x-6 gap-y-2 border-y border-fg/10 py-4"
      >
        <a
          href="#schulischer-weg"
          className="group relative text-sm font-medium text-fg/50 transition-colors hover:text-fg"
        >
          {t.sections.schule}
          <span className="absolute -bottom-1 left-0 h-px w-0 bg-gradient-to-r from-violet via-cyan to-pink transition-all duration-300 group-hover:w-full" />
        </a>
        <a
          href="#staerken"
          className="group relative text-sm font-medium text-fg/50 transition-colors hover:text-fg"
        >
          {t.sections.staerken}
          <span className="absolute -bottom-1 left-0 h-px w-0 bg-gradient-to-r from-violet via-cyan to-pink transition-all duration-300 group-hover:w-full" />
        </a>
      </motion.nav>

      {/* Schulischer Weg */}
      <section id="schulischer-weg" className="scroll-mt-32 pt-16">
        <SectionHeading eyebrow={t.eyebrows.schule} title={t.sections.schule} />

        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
          <div>
            <h3 className="mb-8 flex items-center gap-2 font-display text-xl font-semibold text-fg">
              <HiAcademicCap className="text-violet" /> {t.ausbildung}
            </h3>
            <Timeline items={education} />
          </div>
          <div className="space-y-6">
            {aboutCards.map((card, i) => (
              <Reveal key={card.title} delay={i * 0.08}>
                <TiltCard
                  tiltStrength={4}
                  className="group glass relative overflow-hidden rounded-2xl p-6"
                >
                  <h4 className="flex items-center gap-2 font-display text-lg font-semibold text-fg">
                    <card.icon className="text-pink" /> {card.title}
                  </h4>
                  <p className="mt-2 text-sm leading-relaxed text-fg/60">{card.text}</p>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Stärken */}
      <section id="staerken" className="scroll-mt-32 pt-24">
        <SectionHeading eyebrow={t.eyebrows.staerken} title={t.sections.staerken} />
        <p className="-mt-6 mb-10 max-w-xl text-fg/60">{t.staerkenIntro}</p>

        <Reveal className="glass flex flex-wrap justify-around gap-8 rounded-2xl p-8">
          {groups.map((group, i) => (
            <CircularMeter
              key={group.title}
              label={group.title}
              value={groupAverage(group.skills)}
              delay={i * 0.1}
            />
          ))}
        </Reveal>

        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
          {groups.map((group, gi) => (
            <Reveal key={group.title} delay={gi * 0.1}>
              <TiltCard
                tiltStrength={4}
                className="group glass relative overflow-hidden rounded-2xl p-6"
              >
                <h4 className="mb-6 flex items-center gap-2 font-display text-lg font-semibold text-fg">
                  <group.icon className="text-cyan" /> {group.title}
                </h4>
                <div className="space-y-5">
                  {group.skills.map((s, i) => (
                    <SkillBar key={s.name} {...s} delay={i * 0.1} />
                  ))}
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  )
}
