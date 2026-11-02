'use client'

import { motion } from 'framer-motion'
import {
  ArrowDoodle,
  PushPin,
  Reveal,
  SectionHeading,
  StarDoodle,
  WashiTape,
} from './decor'

type HskCard = {
  slug: string
  level: string
  cn: string
  stage: '初' | '中' | '高'
  words: string
  desc: string
  tape: string
  pin?: string
}

const STAGE_STYLE: Record<HskCard['stage'], string> = {
  初: 'bg-[var(--pastel-mint)] text-[#3f6b50]',
  中: 'bg-[var(--pastel-butter)] text-[#8a6a1f]',
  高: 'bg-[var(--pastel-pink)] text-[#a04a63]',
}

const HSK_CARDS: HskCard[] = [
  { slug: 'hsk-1', level: 'HSK 1', cn: '一级', stage: '初', words: '500', desc: 'Bắt đầu từ con số 0', tape: 'var(--pastel-pink)' },
  { slug: 'hsk-2', level: 'HSK 2', cn: '二级', stage: '初', words: '1.272', desc: 'Giao tiếp hằng ngày', tape: 'var(--pastel-peach)' },
  { slug: 'hsk-3', level: 'HSK 3', cn: '三级', stage: '初', words: '2.245', desc: 'Chủ đề quen thuộc', tape: 'var(--pastel-butter)' },
  { slug: 'hsk-4', level: 'HSK 4', cn: '四级', stage: '中', words: '3.245', desc: 'Trò chuyện trôi chảy', tape: 'var(--pastel-mint)' },
  { slug: 'hsk-5', level: 'HSK 5', cn: '五级', stage: '中', words: '4.316', desc: 'Đọc báo · xem phim', tape: 'var(--pastel-sky)' },
  { slug: 'hsk-6', level: 'HSK 6', cn: '六级', stage: '中', words: '5.456', desc: 'Nghe hiểu như người bản xứ', tape: 'var(--pastel-lilac)' },
  { slug: 'hsk-7-9', level: 'HSK 7–9', cn: '七至九级', stage: '高', words: '11.092', desc: 'Học thuật & công việc', tape: '#f6bcd0' },
]

const ROTATIONS = [-2.5, 2, -1.8, 1.6, -2.2, 2.4, -2.6]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
}

const cardVar = {
  hidden: { opacity: 0, y: 46, scale: 0.9 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 120, damping: 14 },
  },
}

const STAGES = [
  { cn: '初等', name: 'Sơ cấp', range: 'HSK 1–3', bg: 'var(--pastel-mint)' },
  { cn: '中等', name: 'Trung cấp', range: 'HSK 4–6', bg: 'var(--pastel-butter)' },
  { cn: '高等', name: 'Cao cấp', range: 'HSK 7–9', bg: 'var(--pastel-pink)' },
]

export default function HskRoadmap() {
  return (
    <section id="hsk" className="relative py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          tag="Chặng 1 · Chuẩn mới 2021"
          tagColor="var(--pastel-pink)"
          title="Lộ trình HSK 3.0"
          titleAccent="中文水平考试"
          sub="Ba chặng · chín cấp độ · 11.092 từ — đi hết lộ trình là chạm đích tiếng Trung thành thạo."
        />

        {/* chú thích 3 chặng */}
        <Reveal delay={0.2} className="mt-6 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
          {STAGES.map((s, i) => (
            <span key={s.name} className="flex items-center gap-2.5 sm:gap-3">
              <span
                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold text-[#6f5a68] shadow-sm"
                style={{ backgroundColor: s.bg }}
              >
                <span className="font-cn text-sm">{s.cn}</span>
                {s.name} · {s.range}
              </span>
              {i < STAGES.length - 1 && <ArrowDoodle className="hidden h-4 w-10 sm:block" />}
            </span>
          ))}
        </Reveal>

        {/* ---------- lộ trình 7 thẻ ---------- */}
        <div className="relative mt-14">
          {/* đường nét đứt phía sau (desktop) */}
          <div aria-hidden="true" className="dashed-road absolute left-6 right-6 top-1/2 hidden lg:block" />
          <StarDoodle aria-hidden className="absolute -top-5 left-2 hidden h-6 w-6 lg:block" color="#f0b429" />
          <StarDoodle aria-hidden className="absolute -top-4 right-2 hidden h-5 w-5 lg:block" color="#e8a3b8" />

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            className="relative z-10 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-5 lg:grid-cols-7"
          >
            {HSK_CARDS.map((c, i) => {
              const offsetCls =
                i % 2 === 0
                  ? 'lg:-translate-y-7 xl:-translate-y-9'
                  : 'lg:translate-y-7 xl:translate-y-9 translate-y-0'
              return (
                <div key={c.level} className={`${offsetCls} ${i >= 4 ? 'max-sm:col-span-1' : ''} ${i === 6 ? 'col-span-2 sm:col-span-4 lg:col-span-1' : ''}`}>
                  <motion.a
                    href={`#/roadmap/${c.slug}`}
                    variants={cardVar}
                    whileHover={{ rotate: 0, y: -10, scale: 1.04, zIndex: 20 }}
                    whileTap={{ scale: 0.97 }}
                    style={{ rotate: ROTATIONS[i] }}
                    aria-label={`Xem bài học ${c.level}`}
                    className="paper-scrap group relative flex h-full cursor-pointer flex-col gap-1.5 rounded-2xl px-3.5 pb-4 pt-5 sm:px-4"
                  >
                    {/* ghim / băng dính xen kẽ */}
                    {i % 2 === 0 ? (
                      <WashiTape color={c.tape} pattern={i % 3 === 0 ? 'dots' : 'stripes'} rotate={i % 2 === 0 ? -5 : 5} className="-top-2.5 left-1/2 h-5 w-14 -translate-x-1/2" />
                    ) : (
                      <PushPin color={i === 6 ? '#c2547e' : '#f0b429'} className="absolute -top-2 left-1/2 -translate-x-1/2" />
                    )}

                    <div className="flex items-start justify-between gap-1">
                      <h3 className="font-display text-lg font-bold leading-none text-[#4f3d4a] sm:text-xl">
                        {c.level}
                      </h3>
                      <span
                        aria-hidden="true"
                        className={`grid h-6 w-6 shrink-0 place-items-center rounded-full font-cn text-[13px] ${STAGE_STYLE[c.stage]}`}
                      >
                        {c.stage}
                      </span>
                    </div>

                    <p className="font-cn text-sm text-[#b58fa0]">{c.cn}</p>

                    <p className="min-h-8 text-[11px] font-semibold leading-snug text-[#8d7484] sm:min-h-0 sm:text-xs">
                      {c.desc}
                    </p>

                    <div className="mt-auto flex items-center justify-between gap-1 pt-1">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--cream)] px-2.5 py-1 text-[11px] font-bold text-[#6f5a68] ring-1 ring-[#ead9cd]">
                        ✎ ≈ {c.words} từ
                      </span>
                      <span className="hidden text-[10px] font-bold text-[#c2547e] opacity-0 transition-opacity group-hover:opacity-100 sm:block">
                        Xem bài học ↗
                      </span>
                    </div>
                  </motion.a>
                </div>
              )
            })}
          </motion.div>
        </div>

        {/* note nhỏ cuối lộ trình */}
        <Reveal delay={0.3} className="mt-16 flex justify-center lg:mt-20">
          <div className="paper-scrap relative max-w-md -rotate-1 rounded-xl px-6 py-4 text-center">
            <PushPin color="#8fbfe0" className="absolute -top-2.5 left-1/2 -translate-x-1/2" />
            <p className="text-sm font-semibold text-[#6f5a68]">
              Mỗi cấp độ là một trang sổ — <span className="font-cn text-[#c2547e]">加油</span> chinh phục dần cho tới đích!
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
