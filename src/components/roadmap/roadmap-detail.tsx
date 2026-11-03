'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Footer from '../landing/footer'
import { PushPin, StarDoodle, WashiTape } from '../landing/decor'
import { GROUPS, findRoadmapLevel, neighborLevels } from '@/data/roadmap'
import type { RoadmapLevel } from '@/data/roadmap'

/* Màu chữ cho badge chặng theo màu nền */
const STAGE_INK: Record<string, string> = {
  'var(--pastel-mint)': '#3f6b50',
  'var(--pastel-butter)': '#8a6a1f',
  'var(--pastel-pink)': '#a04a63',
}

export default function RoadmapDetail({ slug }: { slug?: string }) {
  const level = findRoadmapLevel(slug)

  if (!level) {
    return (
      <div className="flex min-h-screen flex-col bg-[#fff6e9] text-[#5d4a57]">
        <main className="flex flex-1 items-center justify-center px-4 pb-16 pt-24">
          <div className="paper-scrap relative -rotate-1 rounded-2xl px-8 py-10 text-center">
            <PushPin color="#e8737f" className="absolute -top-2.5 left-8" />
            <p className="font-cn text-5xl text-[#c2547e]">迷路</p>
            <h1 className="mt-3 font-display text-xl font-bold text-[#4f3d4a]">Không tìm thấy lộ trình này</h1>
            <p className="mt-2 text-sm font-medium text-[#8d7484]">
              Đường dẫn có thể đã bị đổi tên hoặc bạn nhập sai địa chỉ.
            </p>
            <a
              href="#/"
              className="mt-6 inline-block rounded-full bg-[#e8737f] px-6 py-3 text-sm font-bold text-white shadow-[0_5px_0_0_#d1708f] transition-transform hover:-translate-y-0.5"
            >
              Về trang chủ
            </a>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return <LevelDetail key={level.slug} level={level} />
}

function LevelDetail({ level }: { level: RoadmapLevel }) {
  const [tab, setTab] = useState<'vocab' | 'grammar'>('vocab')
  const group = GROUPS[level.group]
  const { prev, next } = neighborLevels(level.slug)

  return (
    <div className="flex min-h-screen flex-col bg-[#fff6e9] text-[#5d4a57]">
      <main className="relative flex-1 pt-20 sm:pt-24">
        <div aria-hidden="true" className="dot-grid absolute inset-0" />

        <div className="relative mx-auto max-w-4xl px-4 pb-16 sm:px-6">
          {/* quay lại */}
          <a
            href="#/"
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-[#8d7484] transition-colors hover:text-[#e8737f]"
          >
            ← Về các lộ trình
          </a>

          {/* ---------- thẻ tiêu đề ---------- */}
          <header className="paper-scrap relative mt-4 rounded-2xl px-5 py-7 sm:px-8">
            <WashiTape color={level.tape} pattern="dots" rotate={-5} className="-top-3 left-1/2 h-6 w-24 -translate-x-1/2" />
            <PushPin color="#f0b429" className="absolute right-6 top-3 scale-75" />
            <StarDoodle className="absolute -right-3 -top-4 h-6 w-6" color="#f0b429" />

            <div className="flex flex-wrap items-center gap-3">
              <span
                aria-hidden="true"
                className="grid h-10 w-10 place-items-center rounded-full font-cn text-lg shadow-sm"
                style={{ backgroundColor: level.stageBg, color: STAGE_INK[level.stageBg] ?? '#6f5a68' }}
              >
                {level.stage}
              </span>
              <h1 className="font-display text-3xl font-bold leading-none text-[#4f3d4a] sm:text-4xl">{level.code}</h1>
              <span className="font-cn text-xl text-[#b58fa0]">{level.cn}</span>
            </div>

            <p className="mt-3 font-display text-lg font-bold text-[#e8737f]">{level.vi}</p>
            <p className="mt-1 max-w-xl text-sm font-medium leading-relaxed text-[#8d7484]">{level.tagline}</p>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[var(--cream)] px-3 py-1.5 text-xs font-bold text-[#6f5a68] ring-1 ring-[#ead9cd]">
                ✎ ≈ {level.words} từ
              </span>
              <span className="rounded-full bg-[var(--pastel-pink-soft)] px-3 py-1.5 text-xs font-bold text-[#a04a63]">
                {level.vocab.length} bài từ vựng
              </span>
              <span className="rounded-full bg-[var(--pastel-mint)] px-3 py-1.5 text-xs font-bold text-[#3f6b50]">
                {level.grammar.length} bài ngữ pháp
              </span>
              <a
                href={group.anchor}
                className="rounded-full px-3 py-1.5 text-xs font-bold text-[#6f5a68] shadow-sm transition-transform hover:-translate-y-0.5"
                style={{ backgroundColor: group.tape }}
                title="Xem tất cả cấp độ trong lộ trình này"
              >
                Thuộc: {group.name}
              </a>
            </div>
          </header>

          {/* ---------- tab Từ vựng / Ngữ pháp ---------- */}
          <div className="mt-8 flex flex-wrap items-center gap-2.5" role="tablist" aria-label="Loại bài học">
            <TabBtn active={tab === 'vocab'} onClick={() => setTab('vocab')}>
              📖 Bài từ vựng
              <span className="opacity-70"> ({level.vocab.length})</span>
            </TabBtn>
            <TabBtn active={tab === 'grammar'} onClick={() => setTab('grammar')}>
              ✏️ Bài ngữ pháp
              <span className="opacity-70"> ({level.grammar.length})</span>
            </TabBtn>
          </div>

          <div className="paper-scrap mt-3 rounded-2xl p-4 sm:p-6" role="tabpanel">
            {tab === 'vocab' ? <VocabList level={level} /> : <GrammarList level={level} />}
          </div>

          {/* ---------- trước / sau ---------- */}
          <nav className="mt-8 flex items-center justify-between gap-3" aria-label="Chuyển cấp độ liền kề">
            {prev ? (
              <a
                href={`#/roadmap/${prev.slug}`}
                className="paper-scrap rounded-full px-4 py-2.5 text-xs font-bold text-[#6f5a68] transition-transform hover:-translate-y-0.5"
              >
                ← {prev.code}
              </a>
            ) : (
              <span aria-hidden="true" />
            )}
            <span className="font-cn text-sm text-[#c9a2b3]">{level.cn}</span>
            {next ? (
              <a
                href={`#/roadmap/${next.slug}`}
                className="paper-scrap rounded-full px-4 py-2.5 text-xs font-bold text-[#6f5a68] transition-transform hover:-translate-y-0.5"
              >
                {next.code} →
              </a>
            ) : (
              <span aria-hidden="true" />
            )}
          </nav>

          <p className="mt-6 text-center text-[11px] font-medium text-[#b58fa0]">
            Danh sách bài học mang tính minh hoạ theo cấu trúc giáo trình — nội dung chi tiết sẽ được bổ sung dần.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}

/* ================= Tab button ================= */

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`rounded-full px-4 py-2.5 text-xs font-bold transition-all duration-200 sm:text-sm ${
        active
          ? 'scale-105 bg-[#e8737f] text-white shadow-[0_3px_0_0_#d1708f]'
          : 'paper-scrap text-[#6f5a68] hover:-translate-y-0.5'
      }`}
    >
      {children}
    </button>
  )
}

/* ================= Danh sách bài từ vựng ================= */

function VocabList({ level }: { level: RoadmapLevel }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {level.vocab.map((ls, i) => (
        <motion.a
          key={ls.n}
          href={`#/lesson/${level.slug}/v/${ls.n}`}
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-30px' }}
          transition={{ duration: 0.4, delay: (i % 2) * 0.06, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -4 }}
          className="block rounded-xl bg-white/80 p-4 ring-1 ring-[#f0e2d4] transition-shadow hover:shadow-md"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <span
                className="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold"
                style={{ backgroundColor: level.tape, color: '#7a4b5e' }}
              >
                Bài {ls.n}
              </span>
              <h3 className="mt-1.5 font-cn text-xl text-[#4f3d4a]">{ls.cn}</h3>
              {ls.pinyin ? <p className="text-xs font-semibold text-[#b58fa0]">{ls.pinyin}</p> : null}
            </div>
            {ls.icon ? (
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--cream)] text-xl ring-1 ring-[#ead9cd]" aria-hidden="true">
                {ls.icon}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm font-bold text-[#6f5a68]">{ls.topic}</p>

          <ul className="mt-3 space-y-1.5">
            {ls.words.map((w) => (
              <li
                key={w.cn}
                className="flex flex-wrap items-baseline gap-x-2 rounded-lg bg-[var(--cream)] px-2.5 py-1.5"
              >
                <span className="font-cn text-base text-[#4f3d4a]">{w.cn}</span>
                <span className="text-[11px] font-semibold text-[#a98ea0]">{w.pinyin}</span>
                <span className="ml-auto text-right text-[11px] font-semibold text-[#8d7484]">{w.vi}</span>
              </li>
            ))}
          </ul>
          {ls.more ? <p className="mt-2 text-[11px] font-bold text-[#c9a2b3]">+ {ls.more} từ khác trong bài</p> : null}

          <p className="mt-3 inline-flex items-center gap-1 rounded-full bg-[var(--pastel-butter)] px-3 py-1 text-[11px] font-bold text-[#8a6a1f] transition-transform group-hover:translate-x-0.5">
            🃏 Học ngay với Flashcard →
          </p>
        </motion.a>
      ))}
    </div>
  )
}

/* ================= Danh sách bài ngữ pháp ================= */

function GrammarList({ level }: { level: RoadmapLevel }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {level.grammar.map((g, i) => (
        <motion.a
          key={g.n}
          href={`#/lesson/${level.slug}/g/${g.n}`}
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-30px' }}
          transition={{ duration: 0.4, delay: (i % 2) * 0.06, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -4 }}
          className="block rounded-xl bg-white/80 p-4 ring-1 ring-[#f0e2d4] transition-shadow hover:shadow-md"
        >
          <div className="flex items-start justify-between gap-2">
            <span
              className="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold"
              style={{ backgroundColor: 'var(--pastel-mint)', color: '#3f6b50' }}
            >
              Ngữ pháp {g.n}
            </span>
            <span className="text-[10px] font-bold text-[#c9a2b3]">✏️ Học ngay →</span>
          </div>
          <h3 className="mt-1.5 text-sm font-bold text-[#4f3d4a]">{g.point}</h3>
          {g.cn ? <p className="text-xs font-semibold text-[#b58fa0]">{g.cn}</p> : null}

          <p className="mt-2 inline-block rounded-lg bg-[var(--pastel-butter)]/60 px-2.5 py-1 font-cn text-sm text-[#8a6a1f]">
            {g.structure}
          </p>

          <div className="mt-3 rounded-lg bg-[#f4fbff] p-3 ring-1 ring-[#e3eef6]">
            <p className="font-cn text-lg leading-snug text-[#3f5c74]">{g.example.cn}</p>
            <p className="mt-0.5 text-xs font-semibold italic text-[#7d9cb2]">{g.example.pinyin}</p>
            <p className="mt-0.5 text-xs font-bold text-[#6f5a68]">{g.example.vi}</p>
          </div>
        </motion.a>
      ))}
    </div>
  )
}
