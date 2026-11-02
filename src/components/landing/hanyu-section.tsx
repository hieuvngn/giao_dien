'use client'

import { motion } from 'framer-motion'
import { HeartDoodle, PushPin, SectionHeading, WashiTape } from './decor'

const SPINES = [
  { n: '1', color: '#ffd9e2', ink: '#a04a63', tape: 'var(--pastel-pink)', tilt: -2.5 },
  { n: '2', color: '#ffe7cf', ink: '#a05c33', tape: 'var(--pastel-peach)', tilt: 1.5 },
  { n: '3', color: '#fff3c2', ink: '#8a6a1f', tape: 'var(--pastel-butter)', tilt: -1.5 },
  { n: '4', color: '#d8f2e2', ink: '#3f6b50', tape: 'var(--pastel-mint)', tilt: 2 },
  { n: '5', color: '#dceafa', ink: '#46688f', tape: 'var(--pastel-sky)', tilt: -1.8 },
  { n: '6', color: '#ece3fa', ink: '#6b56a0', tape: 'var(--pastel-lilac)', tilt: 2.2 },
]

const GROUPS = [
  { cn: '初级', vi: 'Sơ cấp', vol: 'Quyển 1–2', bg: 'var(--pastel-mint)' },
  { cn: '中级', vi: 'Trung cấp', vol: 'Quyển 3–4', bg: 'var(--pastel-butter)' },
  { cn: '高级', vi: 'Cao cấp', vol: 'Quyển 5–6', bg: 'var(--pastel-pink)' },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}
const spineVar = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 140, damping: 13 } },
}

export default function HanyuSection() {
  return (
    <section id="hanyu" className="relative">
      {/* nền giấy kẻ ô */}
      <div aria-hidden="true" className="absolute inset-x-0 top-8 bottom-8 rotate-[0.5deg] border-y-2 border-dashed border-[#ead9cd] bg-[#fffdf6]" />
      <div aria-hidden="true" className="dot-grid absolute inset-0 opacity-50" />

      <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <SectionHeading
          tag="Kinh điển cho người Việt"
          tagColor="var(--pastel-peach)"
          title="Giáo trình Hán ngữ"
          titleAccent="汉语教程"
          sub="Sáu quyển quốc dân — học chắc gốc, bài nào cũng có chỗ dựa."
        />

        {/* ---------- kệ sách 6 quyển ---------- */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="mt-14 flex flex-wrap items-end justify-center gap-2 sm:gap-4"
        >
          {SPINES.map((s) => (
            <motion.a
              key={s.n}
              href={`#/roadmap/hanyu-${s.n}`}
              variants={spineVar}
              whileHover={{ y: -14, rotate: 0, scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              style={{ rotate: s.tilt }}
              aria-label={`Xem bài học Hán ngữ quyển ${s.n}`}
              title={`Xem bài học quyển ${s.n}`}
              className="relative block w-[47px] cursor-pointer sm:w-[62px]"
            >
              <div
                className="flex h-44 flex-col items-center justify-center gap-3 rounded-md py-3 shadow-[0_6px_12px_-6px_rgba(93,74,87,0.45)] ring-1 ring-black/5 sm:h-52"
                style={{ backgroundColor: s.color }}
              >
                <span className="book-spine font-cn text-[11px] leading-none" style={{ color: s.ink }}>
                  汉语教程
                </span>
                <span className="font-display text-2xl font-bold sm:text-3xl" style={{ color: s.ink }}>
                  {s.n}
                </span>
              </div>
              <WashiTape color={s.tape} pattern="dots" rotate={-8} className="-top-2.5 left-1/2 h-5 w-12 -translate-x-1/2" />
            </motion.a>
          ))}
        </motion.div>

        {/* mặt kệ */}
        <div aria-hidden="true" className="mx-auto mt-1 h-3.5 max-w-2xl rounded-full bg-[#e9c9a4] shadow-[0_10px_18px_-8px_rgba(160,120,80,0.6)]" />

        <p className="mt-3 text-center text-xs font-semibold text-[#b58fa0]">
          Bấm vào từng quyển để xem danh sách bài học
        </p>

        {/* nhóm quyển */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {GROUPS.map((g, i) => (
            <span key={g.vi} className="flex items-center gap-3">
              <span
                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold text-[#6f5a68] shadow-sm"
                style={{ backgroundColor: g.bg }}
              >
                <span className="font-cn text-sm">{g.cn}</span>
                {g.vi} · {g.vol}
              </span>
              {i < GROUPS.length - 1 && <span aria-hidden="true" className="hidden h-1.5 w-1.5 rounded-full bg-[#d9bfc9] sm:block" />}
            </span>
          ))}
        </div>

        {/* note cảm tình */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex items-center justify-center gap-2 text-center text-sm font-semibold text-[#8d7484]"
        >
          <HeartDoodle className="h-4 w-4" />
          Thế hệ thầy cô Việt lớn lên cùng bộ giáo trình này — và giờ là lượt bạn.
        </motion.p>
      </div>
    </section>
  )
}
