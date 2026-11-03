'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Footer from '../landing/footer'
import { PushPin, Reveal, SectionHeading, SquiggleDoodle, WashiTape } from '../landing/decor'
import { VIDEOS, videoDuration, fmtTime } from '@/lib/data'

const LEVELS = ['Tất cả', 'HSK 1', 'HSK 2', 'HSK 3', 'HSK 4', 'HSK 5']

const LEVEL_COLOR: Record<string, string> = {
  'HSK 1': 'var(--pastel-pink)',
  'HSK 2': 'var(--pastel-butter)',
  'HSK 3': 'var(--pastel-mint)',
  'HSK 4': 'var(--pastel-sky)',
  'HSK 5': 'var(--pastel-lilac)',
}

export default function ShadowingList() {
  const [filter, setFilter] = useState('Tất cả')
  const list = filter === 'Tất cả' ? VIDEOS : VIDEOS.filter((v) => v.level === filter)

  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-[#fff6e9] text-[#5d4a57]">

      <main className="relative flex-1 pt-24 sm:pt-28">
        <div aria-hidden="true" className="dot-grid absolute inset-0" />

        <div className="relative mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <div className="pt-4">
            <SectionHeading
              tag="Luyện nghe · nói theo bóng"
              tagColor="var(--pastel-sky)"
              title="Shadowing"
              titleAccent="影子跟读"
              sub="Nghe – lặp lại theo video từng câu, bắt chước ngữ điệu như cái bóng. Chọn một bài để bắt đầu!"
            />
          </div>

          {/* ---------- bộ lọc cấp độ ---------- */}
          <Reveal delay={0.2} className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {LEVELS.map((lv) => (
              <button
                key={lv}
                onClick={() => setFilter(lv)}
                aria-pressed={filter === lv}
                className={`rounded-full px-4 py-2 text-xs font-bold transition-all duration-200 ${
                  filter === lv
                    ? 'scale-105 bg-[#e8737f] text-white shadow-[0_3px_0_0_#d1708f]'
                    : 'paper-scrap text-[#6f5a68] hover:-translate-y-0.5'
                }`}
              >
                {lv}
              </button>
            ))}
          </Reveal>

          {/* ---------- lưới video ---------- */}
          <motion.div
            layout
            className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {list.map((v, i) => (
              <motion.a
                layout
                key={v.id}
                href={`#/shadowing/${v.id}`}
                initial={{ opacity: 0, y: 34 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.55, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -8, rotate: 0 }}
                style={{ rotate: i % 2 === 0 ? -1.2 : 1.2 }}
                className="paper-scrap group block overflow-visible rounded-2xl p-3"
              >
                {/* thumbnail */}
                <div
                  className="relative aspect-video overflow-hidden rounded-xl ring-1 ring-black/5"
                  style={{ background: `linear-gradient(135deg, ${v.hueSoft}, ${v.hue})` }}
                >
                  <span
                    aria-hidden="true"
                    className="font-cn pointer-events-none absolute -right-3 -top-4 select-none text-[5.5rem] leading-none opacity-25"
                  >
                    {v.cn[0]}
                  </span>
                  <span
                    aria-hidden="true"
                    className="font-cn pointer-events-none absolute bottom-1 left-3 select-none text-2xl opacity-60"
                  >
                    {v.cn}
                  </span>

                  {/* nút play */}
                  <span className="absolute inset-0 grid place-items-center">
                    <span className="grid h-14 w-14 place-items-center rounded-full bg-white/85 shadow-md transition-transform duration-300 group-hover:scale-110">
                      <svg viewBox="0 0 24 24" className="ml-1 h-6 w-6 fill-[#e8737f]" aria-hidden="true">
                        <path d="M8 5.5v13l11-6.5-11-6.5z" />
                      </svg>
                    </span>
                  </span>

                  {/* thời lượng */}
                  <span className="absolute bottom-2 right-2 rounded-full bg-[#4f3d4a]/80 px-2.5 py-0.5 text-[11px] font-bold text-white">
                    {fmtTime(videoDuration(v))}
                  </span>

                  <WashiTape
                    color={LEVEL_COLOR[v.level]}
                    pattern="dots"
                    rotate={-6}
                    className="-top-1 left-1/2 z-10 h-5 w-16 -translate-x-1/2"
                  />
                </div>

                {/* thông tin */}
                <div className="px-1.5 pb-1 pt-3">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="rounded-full px-2.5 py-0.5 text-[11px] font-bold text-[#6f5a68]"
                      style={{ backgroundColor: LEVEL_COLOR[v.level] }}
                    >
                      {v.level}
                    </span>
                    <span className="text-[11px] font-semibold text-[#b58fa0]">♥ {v.views} lượt học</span>
                  </div>
                  <h2 className="mt-2 font-display text-lg font-bold leading-snug text-[#4f3d4a] transition-colors group-hover:text-[#e8737f]">
                    {v.title}
                  </h2>
                  <p className="mt-1 line-clamp-2 text-xs font-medium leading-relaxed text-[#8d7484]">
                    {v.desc}
                  </p>
                  <p className="mt-2 text-[11px] font-bold text-[#b58fa0]">✎ {v.lines.length} câu phụ đề · pinyin + nghĩa</p>
                </div>
              </motion.a>
            ))}
          </motion.div>

          {/* mẹo nhỏ */}
          <Reveal delay={0.15} className="mt-12 flex justify-center">
            <div className="paper-scrap relative max-w-lg rotate-1 rounded-xl px-6 py-4 text-center">
              <PushPin color="#f0b429" className="absolute -top-2.5 left-1/2 -translate-x-1/2" />
              <p className="text-sm font-semibold text-[#6f5a68]">
                Mẹo: nghe 3 lần → tắt pinyin → nói theo đúng nhịp{' '}
                <span className="font-cn text-[#e8737f]">加油</span>!
              </p>
              <SquiggleDoodle className="mx-auto mt-1 h-2.5 w-32" color="#f2b8cb" />
            </div>
          </Reveal>
        </div>
      </main>

      <Footer />
    </div>
  )
}
