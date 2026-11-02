'use client'

import { motion } from 'framer-motion'
import {
  HeartDoodle,
  PushPin,
  SquiggleDoodle,
  StarDoodle,
  WashiTape,
} from './decor'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14, delayChildren: 0.1 } },
}

const item = {
  hidden: { opacity: 0, y: 34 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
}

const MARQUEE_WORDS = [
  'HSK 3.0',
  '你好',
  'YCT',
  '学习',
  'Boya Chinese',
  '加油',
  'Giáo trình Hán ngữ',
  '谢谢',
  '9 cấp độ',
  '再见',
]

function MarqueeStrip() {
  const row = [...MARQUEE_WORDS, ...MARQUEE_WORDS]
  return (
    <div
      className="relative overflow-hidden border-y-2 border-dashed border-[#e7c9d4] bg-[var(--pastel-pink-soft)]/70 py-3"
      aria-hidden="true"
    >
      <div className="marquee-track items-center gap-8">
        {row.map((w, i) => (
          <span key={i} className="flex items-center gap-8 whitespace-nowrap">
            <span className={`text-sm font-bold tracking-wider text-[#a06d80] ${/[一-龥]/.test(w) ? 'font-cn text-base' : 'font-display uppercase'}`}>
              {w}
            </span>
            <StarDoodle className="h-3.5 w-3.5 shrink-0" color={i % 2 ? '#f2b8cb' : '#f5c98f'} />
          </span>
        ))}
      </div>
    </div>
  )
}

/* Một tấm polaroid trong collage */
function Polaroid({
  children,
  tapeColor,
  tapePattern = 'stripes',
  tapeRotate = -5,
  rotate,
  className = '',
  pin,
}: {
  children: React.ReactNode
  tapeColor: string
  tapePattern?: 'stripes' | 'dots' | 'grid' | 'solid'
  tapeRotate?: number
  rotate: number
  className?: string
  pin?: string
}) {
  return (
    <motion.div
      whileHover={{ rotate: 0, y: -10, scale: 1.04, zIndex: 20 }}
      transition={{ type: 'spring', stiffness: 260, damping: 18 }}
      style={{ rotate }}
      className={`paper-scrap absolute rounded-xl p-3 pb-4 ${className}`}
    >
      {pin ? (
        <PushPin color={pin} className="absolute -top-2 left-1/2 -translate-x-1/2" />
      ) : (
        <WashiTape color={tapeColor} pattern={tapePattern} rotate={tapeRotate} className="-top-3 left-1/2 h-6 w-20 -translate-x-1/2" />
      )}
      {children}
    </motion.div>
  )
}

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-28 sm:pt-32">
      {/* nền chấm bi kiểu vở giấy */}
      <div aria-hidden="true" className="dot-grid absolute inset-0" />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#fff6e9]" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6 lg:pb-24">
        {/* ---------- Cột chữ ---------- */}
        <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col items-start gap-5">
          <motion.div variants={item} className="relative">
            <span className="inline-block rounded-full bg-[var(--pastel-mint)] px-4 py-1.5 text-xs font-bold tracking-[0.16em] text-[#4e7a5f] uppercase shadow-sm">
              ✎ Lộ trình rõ ràng · Học là nhớ
            </span>
            <WashiTape color="var(--pastel-butter)" pattern="grid" rotate={8} className="-top-3 -left-4 h-5 w-14" />
          </motion.div>

          <motion.h1
            variants={item}
            className="font-display text-4xl font-bold leading-[1.12] text-[#4f3d4a] sm:text-5xl lg:text-[3.4rem]"
          >
            Tiếng Trung{' '}
            <span className="relative inline-block text-[#e8737f]">
              dễ như dán sổ tay
              <SquiggleDoodle className="absolute -bottom-2 left-0 h-3.5 w-full" color="#f2b8cb" />
            </span>
            , từng chữ một
          </motion.h1>

          <motion.p variants={item} className="max-w-md text-base font-medium leading-relaxed text-[#8d7484] sm:text-lg">
            Bốn chặng hành trình — <strong className="text-[#6f5a68]">HSK 3.0 · YCT · Boya · Giáo trình Hán ngữ</strong> — gọn gàng trên một trang giấy.
          </motion.p>

          <motion.div variants={item} className="mt-1 flex flex-wrap items-center gap-3">
            <motion.a
              href="#hsk"
              whileHover={{ y: -3, rotate: -1 }}
              whileTap={{ scale: 0.97 }}
              className="rounded-full bg-[#e8737f] px-6 py-3 text-sm font-bold text-white shadow-[0_5px_0_0_#d1708f] transition-shadow hover:shadow-[0_7px_0_0_#d1708f] sm:text-base"
            >
              Khám phá lộ trình ↓
            </motion.a>
            <motion.a
              href="#cta"
              whileHover={{ y: -3, rotate: 1 }}
              whileTap={{ scale: 0.97 }}
              className="paper-scrap rounded-full px-6 py-3 text-sm font-bold text-[#6f5a68] sm:text-base"
            >
              Học thử miễn phí
            </motion.a>
          </motion.div>

          {/* sticker 통계 */}
          <motion.div variants={item} className="mt-3 flex flex-wrap items-center gap-6">
            {[
              ['9', 'cấp độ HSK'],
              ['4', 'giáo trình chọn lọc'],
              ['0₫', 'bài test đầu vào'],
            ].map(([num, label]) => (
              <div key={label} className="flex items-baseline gap-1.5">
                <span className="font-display text-2xl font-bold text-[#e8737f]">{num}</span>
                <span className="text-xs font-semibold tracking-wide text-[#8d7484]">{label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* ---------- Collage polaroid ---------- */}
        <div className="relative mx-auto h-[380px] w-full max-w-md sm:h-[430px]" aria-hidden="true">
          {/* vòng tròn pastel nền sau */}
          <div className="absolute inset-6 rounded-full bg-[var(--pastel-butter)]/50 blur-0" />
          <div className="absolute inset-16 rounded-full bg-[var(--pastel-sky)]/40" />

          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -8 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            {/* Card 你好 */}
            <Polaroid tapeColor="var(--pastel-sky)" tapePattern="dots" tapeRotate={-6} rotate={-7} className="left-0 top-6 w-44 sm:w-52">
              <div className="line-paper grid place-items-center rounded-lg bg-[#f4fbff] py-5">
                <span className="font-cn text-5xl text-[#3f5c74] sm:text-6xl">你好</span>
                <span className="mt-1 text-xs font-semibold tracking-wider text-[#7d9cb2]">nǐ hǎo</span>
              </div>
              <p className="mt-2 text-center text-xs font-bold text-[#6f5a68]">Xin chào</p>
            </Polaroid>

            {/* Card 汉 sticker to */}
            <Polaroid tapeColor="var(--pastel-pink)" tapeRotate={5} rotate={5} pin="#e8737f" className="right-0 top-0 w-40 sm:w-48">
              <div className="grid place-items-center rounded-lg bg-[#fff4f7] py-6">
                <span className="wiggle font-cn text-6xl text-[#c2547e] sm:text-7xl">汉</span>
              </div>
              <p className="mt-2 text-center text-xs font-bold text-[#6f5a68]">hán · chữ Trung</p>
            </Polaroid>

            {/* Card 谢谢 */}
            <Polaroid tapeColor="var(--pastel-mint)" tapePattern="grid" tapeRotate={-8} rotate={-3} className="bottom-14 left-8 w-40 sm:w-48">
              <div className="grid place-items-center rounded-lg bg-[#f2fbf5] py-5">
                <span className="font-cn text-4xl text-[#3f6b50] sm:text-5xl">谢谢</span>
                <span className="mt-1 text-xs font-semibold tracking-wider text-[#79a88b]">xiè xie</span>
              </div>
              <p className="mt-2 text-center text-xs font-bold text-[#6f5a68]">Cảm ơn</p>
            </Polaroid>

            {/* Note nhỏ 加油 */}
            <motion.div
              whileHover={{ rotate: 0, scale: 1.06 }}
              style={{ rotate: 8 }}
              className="paper-scrap absolute bottom-0 right-4 w-36 rounded-lg p-3 sm:w-40"
            >
              <PushPin color="#f0b429" className="absolute -top-2 left-3" />
              <p className="font-cn text-center text-2xl text-[#a2732c]">加油</p>
              <p className="mt-1 text-center text-[11px] font-bold text-[#8d7484]">Cố lên nha!</p>
            </motion.div>

            {/* doodles nổi */}
            <StarDoodle className="floaty absolute -left-2 bottom-24 h-6 w-6" />
            <HeartDoodle className="floaty-slow absolute -top-4 right-24 h-5 w-5" color="#e8a3b8" />
            <StarDoodle className="floaty-slow absolute right-2 bottom-28 h-4 w-4" color="#b7a8e0" />
          </motion.div>
        </div>
      </div>

      {/* ---------- marquee washi ---------- */}
      <MarqueeStrip />
    </section>
  )
}
