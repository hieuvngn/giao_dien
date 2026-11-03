'use client'

import { motion } from 'framer-motion'
import {
  HeartDoodle,
  PandaSticker,
  PushPin,
  SectionHeading,
  SquiggleDoodle,
  StarDoodle,
  WashiTape,
} from './decor'

const YCT_LEVELS = [
  {
    slug: 'yct-1',
    n: 'YCT 1',
    cn: '一级',
    words: '80',
    desc: 'Làm quen những từ đầu tiên',
    tape: 'var(--pastel-mint)',
    Icon: PandaSticker,
    rotate: -2.4,
  },
  {
    slug: 'yct-2',
    n: 'YCT 2',
    cn: '二级',
    words: '150',
    desc: 'Câu đơn giản đời thường',
    tape: 'var(--pastel-butter)',
    Icon: StarStar,
    rotate: 2,
  },
  {
    slug: 'yct-3',
    n: 'YCT 3',
    cn: '三级',
    words: '300',
    desc: 'Trò chuyện cùng bạn bè',
    tape: 'var(--pastel-pink)',
    Icon: HeartIcon,
    rotate: -1.6,
  },
  {
    slug: 'yct-4',
    n: 'YCT 4',
    cn: '四级',
    words: '600',
    desc: 'Tự tin nói ý kiến của mình',
    tape: 'var(--pastel-sky)',
    Icon: SquiggleIcon,
    rotate: 2.4,
  },
]

/* bọc doodle thành component có className */
function StarStar({ className = '' }: { className?: string }) {
  return <StarDoodle className={className} color="#f0b429" />
}
function HeartIcon({ className = '' }: { className?: string }) {
  return <HeartDoodle className={className} color="#e8737f" />
}
function SquiggleIcon({ className = '' }: { className?: string }) {
  return <SquiggleDoodle className={`h-10 ${className}`} color="#7fb2d8" />
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}
const cardVar = {
  hidden: { opacity: 0, y: 40, scale: 0.92 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 120, damping: 14 } },
}

export default function YctSection() {
  return (
    <section id="yct" className="relative">
      {/* dải giấy trắng giữa trang */}
      <div aria-hidden="true" className="absolute inset-x-0 top-6 bottom-6 -rotate-[0.6deg] border-y-2 border-dashed border-[#ead9cd] bg-[#fffdf6]" />
      <div aria-hidden="true" className="dot-grid absolute inset-0 opacity-60" />

      <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <SectionHeading
          tag="Dành cho các bạn nhỏ 8–15 tuổi"
          tagColor="var(--pastel-mint)"
          title="YCT – Tiếng Trung thiếu nhi"
          titleAccent="少儿汉语"
          sub="Bốn bước nhỏ × tư duy vui vẻ — để bé yêu tiếng Trung ngay từ cấp độ đầu tiên."
        />

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {YCT_LEVELS.map(({ slug, n, cn, words, desc, tape, Icon, rotate }) => (
            <motion.a
              key={n}
              href={`#/roadmap/${slug}`}
              variants={cardVar}
              whileHover={{ rotate: 0, y: -10, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{ rotate }}
              aria-label={`Xem bài học ${n}`}
              className="paper-scrap group relative flex cursor-pointer flex-col items-center gap-2 rounded-2xl px-5 pb-6 pt-7 text-center"
            >
              <WashiTape color={tape} pattern="dots" rotate={-6} className="-top-3 left-1/2 h-6 w-20 -translate-x-1/2" />

              <span className="grid h-16 w-16 place-items-center rounded-full bg-[var(--cream)] ring-2 ring-[#f0e2d4]">
                <Icon className="h-9 w-9" />
              </span>

              <h3 className="font-display text-xl font-bold text-[#4f3d4a]">{n}</h3>
              <p className="font-cn text-sm text-[#b58fa0]">{cn}</p>
              <p className="text-sm font-semibold leading-snug text-[#8d7484]">{desc}</p>

              <span className="mt-2 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold text-[#6f5a68]" style={{ backgroundColor: tape }}>
                ✎ ≈ {words} từ
              </span>

              <span className="text-[10px] font-bold text-[#c2547e] opacity-0 transition-opacity group-hover:opacity-100">
                Xem bài học ↗
              </span>
            </motion.a>
          ))}
        </motion.div>

        {/* sticker khuyến khích */}
        <motion.div
          initial={{ opacity: 0, rotate: -6, scale: 0.8 }}
          whileInView={{ opacity: 1, rotate: -3, scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 160, damping: 12, delay: 0.25 }}
          className="relative mx-auto mt-10 w-fit"
        >
          <div className="paper-scrap relative flex items-center gap-3 rounded-xl px-5 py-3">
            <PushPin color="#e8737f" className="absolute -top-2 left-4" />
            <span className="font-cn text-2xl text-[#3f6b50]">小步前进</span>
            <span className="text-sm font-bold text-[#8d7484]">— bé đi chậm, bé đi xa ✿</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
