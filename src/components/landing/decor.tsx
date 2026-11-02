'use client'

import { motion } from 'framer-motion'
import type { CSSProperties, ReactNode } from 'react'

/* ================= Washi tape ================= */

type TapePattern = 'stripes' | 'dots' | 'grid' | 'solid'

const PATTERN_CLASS: Record<TapePattern, string> = {
  stripes: '',
  dots: 'washi-dots',
  grid: 'washi-grid',
  solid: 'washi-solid',
}

export function WashiTape({
  color = 'var(--pastel-pink)',
  pattern = 'stripes',
  rotate = -4,
  className = '',
  style,
}: {
  color?: string
  pattern?: TapePattern
  rotate?: number
  className?: string
  style?: CSSProperties
}) {
  return (
    <span
      aria-hidden="true"
      className={`washi ${PATTERN_CLASS[pattern]} ${className}`}
      style={{ '--tape': color, transform: `rotate(${rotate}deg)`, ...style } as CSSProperties}
    />
  )
}

/* ================= Push pin ================= */

export function PushPin({
  color = '#f18aa9',
  className = '',
  style,
}: {
  color?: string
  className?: string
  style?: CSSProperties
}) {
  return (
    <span
      aria-hidden="true"
      className={`pushpin ${className}`}
      style={{ '--pin': color, ...style } as CSSProperties}
    />
  )
}

/* ================= Paper card ================= */

export function PaperCard({
  children,
  className = '',
  style,
}: {
  children: ReactNode
  className?: string
  style?: CSSProperties
}) {
  return (
    <div className={`paper-scrap rounded-2xl ${className}`} style={style}>
      {children}
    </div>
  )
}

/* ================= Scroll reveal ================= */

export function Reveal({
  children,
  delay = 0,
  y = 28,
  className = '',
  once = true,
}: {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
  once?: boolean
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-60px' }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

/* ================= Section heading (taped label + title) ================= */

export function SectionHeading({
  tag,
  tagColor = 'var(--pastel-butter)',
  title,
  titleAccent,
  sub,
  align = 'center',
}: {
  tag: string
  tagColor?: string
  title: ReactNode
  titleAccent?: string
  sub?: string
  align?: 'center' | 'left'
}) {
  const alignCls = align === 'center' ? 'items-center text-center' : 'items-start text-left'
  return (
    <div className={`flex flex-col gap-3 ${alignCls}`}>
      <Reveal>
        <span className="relative inline-block px-5 py-1.5">
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-md -rotate-2 opacity-90"
            style={{ backgroundColor: tagColor }}
          />
          <span className="relative text-xs font-bold tracking-[0.18em] uppercase text-[#7a5c68]">
            {tag}
          </span>
        </span>
      </Reveal>
      <Reveal delay={0.08}>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.6rem] font-bold leading-tight text-[#4f3d4a]">
          {title} {titleAccent ? <span className="font-cn text-[#e88aa6]">{titleAccent}</span> : null}
        </h2>
      </Reveal>
      {sub ? (
        <Reveal delay={0.16}>
          <p className="max-w-xl text-sm sm:text-base text-[#8d7484] font-medium">{sub}</p>
        </Reveal>
      ) : null}
    </div>
  )
}

/* ================= Doodles ================= */

export function StarDoodle({ className = '', color = '#f5b73f' }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill={color} aria-hidden="true" className={className}>
      <path d="M12 2l2.4 6.9L21 11l-6.6 2.1L12 20l-2.4-6.9L3 11l6.6-2.1L12 2z" />
    </svg>
  )
}

export function HeartDoodle({ className = '', color = '#f18aa9' }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill={color} aria-hidden="true" className={className}>
      <path d="M12 21s-7.5-4.7-9.5-9.2C1.2 8.9 3 5.5 6.4 5.1c2-.2 3.9.8 5.6 2.7 1.7-1.9 3.6-2.9 5.6-2.7 3.4.4 5.2 3.8 3.9 6.7C19.5 16.3 12 21 12 21z" />
    </svg>
  )
}

export function SquiggleDoodle({ className = '', color = '#8fbfe0' }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 120 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M4 14c8-10 14 8 22-2s14 8 22-2 14 8 22-2 14 8 22-2 14 8 22-2"
        stroke={color}
        strokeWidth="3.2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function ArrowDoodle({ className = '', color = '#c9a2b3' }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 64 24" fill="none" aria-hidden="true" className={className}>
      <path d="M2 12c14 0 30 0 52 0" stroke={color} strokeWidth="3" strokeLinecap="round" strokeDasharray="1 7" />
      <path d="M46 4l10 8-10 8" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function PandaSticker({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <g>
        <circle cx="18" cy="16" r="9" fill="#4a3f46" />
        <circle cx="46" cy="16" r="9" fill="#4a3f46" />
        <circle cx="32" cy="34" r="24" fill="#fffdf6" stroke="#4a3f46" strokeWidth="2.5" />
        <circle cx="22" cy="30" r="6.5" fill="#4a3f46" />
        <circle cx="42" cy="30" r="6.5" fill="#4a3f46" />
        <circle cx="23.5" cy="28.5" r="2" fill="#fff" />
        <circle cx="43.5" cy="28.5" r="2" fill="#fff" />
        <ellipse cx="32" cy="41" rx="4.5" ry="3.5" fill="#4a3f46" />
        <path d="M32 44.5c-3 3-7 2-8.5-1M32 44.5c3 3 7 2 8.5-1" stroke="#4a3f46" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        <circle cx="14" cy="40" r="5" fill="#ffc9d8" opacity=".8" />
        <circle cx="50" cy="40" r="5" fill="#ffc9d8" opacity=".8" />
      </g>
    </svg>
  )
}
