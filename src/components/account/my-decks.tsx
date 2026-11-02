'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Footer from '../landing/footer'
import { PushPin, Reveal, WashiTape } from '../landing/decor'
import { ROADMAP_LEVELS } from '@/data/roadmap'
import type { RoadmapGroup } from '@/data/roadmap'
import { useToast } from '@/hooks/use-toast'

/* ============================================================
   Bộ thẻ của tôi — các bộ thẻ theo bài học + tiến độ thật
   Route: #/my-decks
   Dữ liệu: nkhn.known:{slug}:{kind}:{n} (từ trang flashcard)
   ============================================================ */

type GroupFilter = RoadmapGroup | 'all'
type KindFilter = 'v' | 'g'

type Deck = {
  id: string
  kind: KindFilter
  group: RoadmapGroup
  levelSlug: string
  levelCode: string
  title: string
  sub: string
  icon: string
  lessonN: number
  total: number
  known: number
  studied: boolean // đã mở học lần nào chưa
}

/* ---------- icon nhỏ ---------- */

function SpeakerIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 5 6 9H2v6h4l5 4V5z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
    </svg>
  )
}

function MetricBox({ label, value, tone }: { label: string; value: number | string; tone: 'pink' | 'green' | 'butter' | 'sky' }) {
  const cls = {
    pink: 'bg-[var(--pastel-pink-soft)]/60 ring-[#f3c4d3] text-[#d2495f]',
    green: 'bg-[var(--pastel-mint)]/40 ring-[#cfe6d6] text-[#3f6b50]',
    butter: 'bg-[var(--pastel-butter)]/45 ring-[#f2e2b8] text-[#8a6a1f]',
    sky: 'bg-[var(--pastel-sky)]/40 ring-[#cfdff0] text-[#46688f]',
  }[tone]
  return (
    <div className={`rounded-2xl px-4 py-3 ring-1 ${cls}`}>
      <p className="font-display text-2xl font-extrabold leading-none">{value}</p>
      <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.1em] text-[#6f5a68]">{label}</p>
    </div>
  )
}

/* ---------- một bộ thẻ ---------- */

function DeckCard({ deck, index }: { deck: Deck; index: number }) {
  const pct = deck.total > 0 ? Math.round((deck.known / deck.total) * 100) : 0
  const done = deck.known >= deck.total && deck.total > 0
  const started = deck.known > 0 || deck.studied
  const href = deck.kind === 'v' ? `#/lesson/${deck.levelSlug}/v/${deck.lessonN}` : `#/lesson/${deck.levelSlug}/g/${deck.lessonN}`

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min((index % 12) * 0.03, 0.35), ease: [0.22, 1, 0.36, 1] }}
      className="paper-scrap rounded-2xl px-4 py-4"
    >
      <div className="flex items-start gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[var(--cream)] text-2xl shadow-inner ring-1 ring-[#ead9cd]" aria-hidden="true">
          {deck.icon ?? (deck.kind === 'v' ? '🃏' : '✏️')}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-[var(--pastel-mint)]/60 px-2 py-0.5 text-[10px] font-bold text-[#3f6b50]">{deck.levelCode}</span>
            {done ? (
              <span className="rounded-full bg-[var(--pastel-butter)] px-2 py-0.5 text-[10px] font-bold text-[#8a6a1f]">🏆 Hoàn thành</span>
            ) : started ? (
              <span className="rounded-full bg-[var(--pastel-sky)]/60 px-2 py-0.5 text-[10px] font-bold text-[#46688f]">Đang học</span>
            ) : (
              <span className="rounded-full bg-[var(--cream)] px-2 py-0.5 text-[10px] font-bold text-[#8d7484] ring-1 ring-[#ead9cd]">Chưa học</span>
            )}
          </div>
          <p className="mt-1.5 truncate text-sm font-extrabold text-[#4f3d4a]">
            {deck.kind === 'v' ? `Bài ${deck.lessonN} — ${deck.title}` : deck.title}
          </p>
          <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] font-semibold text-[#b58fa0]">
            <SpeakerIcon className="h-3 w-3" />
            {deck.sub} · {deck.total} thẻ
          </p>
        </div>

        <div className="w-24 shrink-0 text-right sm:w-32">
          <p className="font-display text-lg font-extrabold leading-none text-[#c2547e]">
            {deck.known}
            <span className="text-xs font-bold text-[#b58fa0]">/{deck.total}</span>
          </p>
          <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#b58fa0]">đã thuộc</p>
        </div>
      </div>

      {/* thanh tiến độ */}
      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[var(--cream)] ring-1 ring-[#ead9cd]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className={`h-full rounded-full ${done ? 'bg-[#8fbf7f]' : 'bg-gradient-to-r from-[#f3a1ad] to-[#e8737f]'}`}
        />
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <p className="text-[11px] font-bold text-[#8d7484]">{pct}% hoàn thành</p>
        <a
          href={href}
          className="rounded-full bg-[#4f3d4a] px-4 py-2 text-[11px] font-bold text-white shadow-[0_3px_0_0_#3a2d36] transition-transform hover:-translate-y-0.5"
        >
          {started ? (done ? '▶ Học lại' : '▶ Tiếp tục') : '▶ Bắt đầu học'}
        </a>
      </div>
    </motion.li>
  )
}

/* ============================================================
   Trang chính
   ============================================================ */

export default function MyDecks() {
  const { toast } = useToast()
  const [group, setGroup] = useState<GroupFilter>('all')
  const [kind, setKind] = useState<KindFilter>('v')
  const [onlyActive, setOnlyActive] = useState(false)
  const [visible, setVisible] = useState(12)
  const [progress, setProgress] = useState<Record<string, { known: number; total: number; studied: boolean }>>({})

  /* đọc tiến độ thật từ localStorage sau mount */
  useEffect(() => {
    try {
      const studies = JSON.parse(localStorage.getItem('nkhn.studies') ?? '{}') as Record<string, number>

      // tổng số thẻ của từng bài từ vựng
      const vocabTotals: Record<string, number> = {}
      for (const lv of ROADMAP_LEVELS) {
        for (const les of lv.vocab) vocabTotals[`${lv.slug}:v:${les.n}`] = les.words.length
      }

      const acc: Record<string, { known: number; total: number; studied: boolean }> = {}
      const grammarKnown: Record<string, Set<string>> = {}

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (!key || !key.startsWith('nkhn.known:')) continue
        const [, slug, k, n] = key.split(':')
        const raw = localStorage.getItem(key)
        if (!raw) continue
        const marks = JSON.parse(raw) as Record<string, 'known' | 'unknown'>
        if (k === 'v') {
          const id = `${slug}:v:${n}`
          const known = Object.values(marks).filter((m) => m === 'known').length
          acc[id] = { known, total: vocabTotals[id] ?? Object.keys(marks).length, studied: true }
        } else if (k === 'g') {
          const set = (grammarKnown[`${slug}:g`] ??= new Set<string>())
          for (const [mid, m] of Object.entries(marks)) {
            if (m === 'known') set.add(mid.split(':').pop() ?? mid)
          }
        }
      }

      // bộ thẻ ngữ pháp: 1 bộ / cấp độ
      for (const lv of ROADMAP_LEVELS) {
        acc[`${lv.slug}:g`] = {
          known: grammarKnown[`${lv.slug}:g`]?.size ?? 0,
          total: lv.grammar.length,
          studied: Object.keys(studies).some((s) => s.startsWith(`${lv.slug}:g:`)),
        }
      }

      // bài đã từng mở (kể cả chưa đánh dấu thẻ nào)
      for (const s of Object.keys(studies)) {
        const [slug, k, n] = s.split(':')
        if (k !== 'v') continue
        const id = `${slug}:v:${n}`
        if (!acc[id]) acc[id] = { known: 0, total: vocabTotals[id] ?? 0, studied: true }
        else acc[id] = { ...acc[id], studied: true }
      }

      setProgress(acc)
    } catch {
      /* bỏ qua */
    }
  }, [])

  /* danh sách bộ thẻ */
  const decks = useMemo<Deck[]>(() => {
    const out: Deck[] = []
    for (const lv of ROADMAP_LEVELS) {
      if (group !== 'all' && lv.group !== group) continue

      if (kind === 'v') {
        for (const les of lv.vocab) {
          const p = progress[`${lv.slug}:v:${les.n}`]
          out.push({
            id: `${lv.slug}:v:${les.n}`,
            kind: 'v',
            group: lv.group,
            levelSlug: lv.slug,
            levelCode: lv.code,
            title: les.topic,
            sub: les.cn,
            icon: les.icon,
            lessonN: les.n,
            total: les.words.length,
            known: p?.known ?? 0,
            studied: p?.studied ?? false,
          })
        }
      } else {
        const p = progress[`${lv.slug}:g`]
        out.push({
          id: `${lv.slug}:g`,
          kind: 'g',
          group: lv.group,
          levelSlug: lv.slug,
          levelCode: lv.code,
          title: `Ngữ pháp ${lv.code}`,
          sub: `${lv.grammar.length} điểm ngữ pháp`,
          icon: '✏️',
          lessonN: 1,
          total: lv.grammar.length,
          known: p?.known ?? 0,
          studied: p?.studied ?? false,
        })
      }
    }
    return out
  }, [group, kind, progress])

  const filtered = useMemo(
    () => decks.filter((d) => (onlyActive ? d.known > 0 || d.studied : true)),
    [decks, onlyActive],
  )
  const shown = filtered.slice(0, visible)

  const totalKnown = decks.reduce((s, d) => s + d.known, 0)
  const activeCount = decks.filter((d) => d.known > 0 || d.studied).length
  const doneCount = decks.filter((d) => d.total > 0 && d.known >= d.total).length

  const GROUPS: { id: GroupFilter; label: string }[] = [
    { id: 'all', label: '🌐 Tất cả' },
    { id: 'hsk', label: '🎓 HSK' },
    { id: 'yct', label: '🧒 YCT' },
    { id: 'boya', label: '📘 Boya' },
    { id: 'hanyu', label: '📗 Hán ngữ' },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-[#fff6e9] text-[#5d4a57]">
      <main className="relative flex-1 pb-16 pt-20 sm:pt-24">
        <div aria-hidden="true" className="dot-grid absolute inset-0" />

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6">
          {/* ================= Header ================= */}
          <header className="paper-scrap relative rounded-2xl px-5 py-6 sm:px-7">
            <WashiTape color="var(--pastel-pink)" pattern="dots" rotate={-5} className="-top-3 left-10 h-6 w-20" />
            <PushPin color="#f0b429" className="absolute right-8 top-3 scale-75" />

            <div className="flex flex-wrap items-center gap-4">
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[var(--cream)] text-4xl shadow-inner ring-1 ring-[#ead9cd]" aria-hidden="true">
                🃏
              </span>
              <div className="min-w-0 flex-1">
                <h1 className="leading-tight">
                  <span className="relative inline-block px-3 py-0.5">
                    <span aria-hidden="true" className="absolute inset-0 -rotate-1 rounded-md bg-[var(--pastel-butter)] opacity-90" />
                    <span className="relative font-display text-2xl font-bold text-[#4f3d4a] sm:text-3xl">Bộ thẻ của tôi</span>
                  </span>
                  <span className="ml-2 hidden font-cn text-xl text-[#b58fa0] sm:inline">我的卡组</span>
                </h1>
                <p className="mt-1.5 text-sm font-semibold leading-relaxed text-[#8d7484]">
                  Mỗi bài học là một bộ thẻ riêng — tiến độ dưới đây được ghi lại tự động mỗi lần bạn đánh dấu “Đã thuộc / Chưa thuộc”.
                </p>
              </div>
            </div>
          </header>

          {/* ================= Số liệu ================= */}
          <Reveal>
            <section className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Tổng quan bộ thẻ">
              <MetricBox label="Bộ thẻ" value={decks.length} tone="sky" />
              <MetricBox label="Thẻ đã thuộc" value={totalKnown} tone="green" />
              <MetricBox label="Bộ đang học" value={activeCount} tone="butter" />
              <MetricBox label="Bộ hoàn thành" value={doneCount} tone="pink" />
            </section>
          </Reveal>

          {/* ================= Bộ lọc ================= */}
          <Reveal delay={0.05}>
            <div className="mt-5 flex flex-wrap items-center gap-1.5" role="group" aria-label="Lọc bộ thẻ">
              {GROUPS.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => {
                    setGroup(g.id)
                    setVisible(12)
                  }}
                  aria-pressed={group === g.id}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                    group === g.id
                      ? 'bg-[#4f3d4a] text-white shadow-[0_3px_0_0_#3a2d36]'
                      : 'bg-white/70 text-[#6f5a68] ring-1 ring-[#ead9cd] hover:-translate-y-0.5'
                  }`}
                >
                  {g.label}
                </button>
              ))}
              <span className="mx-1 h-5 w-px bg-[#ead9cd]" aria-hidden="true" />
              {(
                [
                  { id: 'v', label: '🃏 Từ vựng' },
                  { id: 'g', label: '✏️ Ngữ pháp' },
                ] as const
              ).map((k) => (
                <button
                  key={k.id}
                  type="button"
                  onClick={() => {
                    setKind(k.id)
                    setVisible(12)
                  }}
                  aria-pressed={kind === k.id}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                    kind === k.id
                      ? 'bg-[var(--pastel-peach)] text-[#a05a3a] ring-1 ring-[#f3d6c2]'
                      : 'bg-white/70 text-[#6f5a68] ring-1 ring-[#ead9cd] hover:-translate-y-0.5'
                  }`}
                >
                  {k.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setOnlyActive((v) => !v)
                  setVisible(12)
                }}
                aria-pressed={onlyActive}
                className={`ml-auto rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                  onlyActive ? 'bg-[var(--pastel-sky)] text-[#46688f] ring-1 ring-[#cfdff0]' : 'bg-white/70 text-[#6f5a68] ring-1 ring-[#ead9cd] hover:-translate-y-0.5'
                }`}
              >
                {onlyActive ? '✓ Chỉ bộ đang học' : 'Chỉ bộ đang học'}
              </button>
            </div>
          </Reveal>

          {/* ================= Danh sách bộ thẻ ================= */}
          <section className="mt-4" aria-label="Danh sách bộ thẻ" aria-live="polite">
            {shown.length > 0 ? (
              <>
                <motion.ul layout className="space-y-3">
                  {shown.map((d, i) => (
                    <DeckCard key={d.id} deck={d} index={i} />
                  ))}
                </motion.ul>

                {visible < filtered.length && (
                  <div className="mt-6 text-center">
                    <button
                      type="button"
                      onClick={() => setVisible((v) => v + 12)}
                      className="rounded-full bg-[#4f3d4a] px-6 py-3 text-sm font-bold text-white shadow-[0_5px_0_0_#3a2d36] transition-transform hover:-translate-y-0.5"
                    >
                      Xem thêm {Math.min(12, filtered.length - visible)} bộ ↓
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="paper-scrap mx-auto mt-6 max-w-md rounded-2xl px-6 py-10 text-center">
                <span className="text-5xl" aria-hidden="true">🗂️</span>
                <p className="mt-3 font-display text-lg font-bold text-[#4f3d4a]">Chưa có bộ thẻ nào ở đây</p>
                <p className="mt-1 text-xs font-semibold text-[#8d7484]">Bật lại bộ lọc hoặc bắt đầu một bài học để tạo bộ thẻ đầu tiên!</p>
              </div>
            )}
          </section>

          {/* ================= Tạo bộ thẻ riêng ================= */}
          <Reveal delay={0.05}>
            <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-[#e7c9d4] bg-[var(--pastel-pink-soft)]/40 px-5 py-5 text-center sm:flex-row sm:text-left">
              <span className="text-3xl" aria-hidden="true">✨</span>
              <p className="flex-1 text-xs font-semibold leading-relaxed text-[#8a4a63]">
                <b>Tạo bộ thẻ riêng của bạn</b> — ghép các từ đã ghim ⭐ trong bài học thành một bộ ôn tập theo chủ đề riêng.
              </p>
              <button
                type="button"
                onClick={() => toast({ title: '✨ Tính năng sắp ra mắt!', description: 'Bộ thẻ tùy chỉnh đang được xây dựng.' })}
                className="shrink-0 rounded-full bg-[#c2547e] px-5 py-2.5 text-xs font-bold text-white shadow-[0_4px_0_0_#a34266] transition-transform hover:-translate-y-0.5"
              >
                ＋ Tạo bộ thẻ mới
              </button>
            </div>
          </Reveal>
        </div>
      </main>

      <Footer />
    </div>
  )
}
