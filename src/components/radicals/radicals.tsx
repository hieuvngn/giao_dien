'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Footer from '../landing/footer'
import { PushPin, Reveal, WashiTape } from '../landing/decor'
import { RADICALS } from '@/data/radicals'
import type { Radical } from '@/data/radicals'

/* ============================================================
   Trang Bộ thủ — nền móng của chữ Hán
   Route: #/radicals
   Tìm kiếm · lọc theo số nét · đánh dấu "Đã nhớ" (localStorage)
   ============================================================ */

const KNOWN_KEY = 'nkhn.radicals.known'

/* ---------- phát âm ---------- */

function speak(text: string) {
  try {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'zh-CN'
    u.rate = 0.8
    const voice = window.speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith('zh'))
    if (voice) u.voice = voice
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(u)
  } catch {
    /* im lặng */
  }
}

/** Bỏ dấu để tìm "nhan", "nhan nhan", "thuy"… */
function toBase(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
}

const STROKE_FILTERS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const

const STROKE_COLORS: Record<number, string> = {
  1: 'bg-[var(--pastel-pink)] text-[#8a4a63]',
  2: 'bg-[var(--pastel-peach)] text-[#a05a3a]',
  3: 'bg-[var(--pastel-butter)] text-[#8a6a1f]',
  4: 'bg-[var(--pastel-mint)] text-[#3f6b50]',
  5: 'bg-[var(--pastel-sky)] text-[#46688f]',
  6: 'bg-[var(--pastel-lilac)] text-[#6d5a94]',
  7: 'bg-[var(--pastel-pink)] text-[#8a4a63]',
  8: 'bg-[var(--pastel-butter)] text-[#8a6a1f]',
  9: 'bg-[var(--pastel-mint)] text-[#3f6b50]',
}

/* ---------- thẻ bộ thủ ---------- */

function RadicalCard({
  r,
  known,
  onToggle,
  index,
}: {
  r: Radical
  known: boolean
  onToggle: () => void
  index: number
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 18, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, delay: Math.min((index % 12) * 0.04, 0.4), ease: [0.22, 1, 0.36, 1] }}
      className={`paper-scrap relative flex flex-col rounded-2xl px-4 py-4 transition-shadow ${
        known ? 'ring-2 ring-[#8fbf7f]' : ''
      }`}
    >
      {/* hàng đầu: bộ thủ + phát âm + số nét */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-baseline gap-1.5">
          <p className="font-cn text-4xl leading-none text-[#4f3d4a]">{r.char}</p>
          {r.variant && <p className="font-cn text-lg text-[#b58fa0]">({r.variant})</p>}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => speak(r.char)}
            aria-label={`Nghe phát âm bộ ${r.vi}`}
            title="Nghe phát âm"
            className="grid h-8 w-8 place-items-center rounded-full bg-[var(--pastel-sky)] text-[#46688f] shadow-sm transition-transform hover:-translate-y-0.5 hover:scale-105"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M11 5 6 9H2v6h4l5 4V5z" />
              <path d="M15.5 8.5a5 5 0 0 1 0 7" />
            </svg>
          </button>
          <span className={`grid h-8 w-8 place-items-center rounded-full text-[11px] font-extrabold ${STROKE_COLORS[r.strokes] ?? 'bg-[var(--cream)] text-[#6f5a68]'}`} title={`${r.strokes} nét`}>
            {r.strokes}
          </span>
        </div>
      </div>

      {/* tên bộ */}
      <p className="mt-2.5 text-sm font-extrabold text-[#4f3d4a]">
        Bộ {r.vi} <span className="ml-1 text-xs font-bold uppercase tracking-[0.12em] text-[#e88aa6]">{r.pinyin}</span>
      </p>
      <p className="mt-0.5 text-xs font-semibold text-[#8d7484]">{r.meaning}</p>

      {/* chữ mẫu */}
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {r.words.map((w) => (
          <button
            key={w.c}
            type="button"
            onClick={() => speak(w.c)}
            title={`${w.p} — ${w.v}`}
            className="group rounded-xl bg-[var(--cream)]/80 px-2.5 py-1.5 text-left ring-1 ring-[#ead9cd] transition-all hover:-translate-y-0.5 hover:bg-white"
          >
            <span className="block font-cn text-base leading-tight text-[#3f5c74]">{w.c}</span>
            <span className="block text-[10px] font-bold text-[#8d7484]">{w.v}</span>
          </button>
        ))}
      </div>

      {/* đánh dấu đã nhớ */}
      <div className="mt-3 flex justify-center">
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={known}
          className={`inline-flex items-center rounded-full px-3.5 py-1.5 text-[11px] font-bold ring-1 transition-all ${
            known
              ? 'bg-[var(--pastel-mint)] text-[#3f6b50] ring-[#cfe6d6]'
              : 'bg-white/70 text-[#8d7484] ring-[#ead9cd] hover:-translate-y-0.5 hover:text-[#4f3d4a]'
          }`}
        >
          {known ? '✓ Đã nhớ' : '☆ Đánh dấu đã nhớ'}
        </button>
      </div>
    </motion.div>
  )
}

/* ============================================================
   Trang chính
   ============================================================ */

export default function Radicals() {
  const [query, setQuery] = useState('')
  const [strokes, setStrokes] = useState<number | 'all'>('all')
  const [knownMap, setKnownMap] = useState<Record<string, boolean>>({})

  /* đọc / ghi localStorage sau mount (tránh lệch SSR) */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KNOWN_KEY)
      // eslint-disable-next-line react-hooks/set-state-in-effect -- đọc localStorage chỉ khả dụng phía client sau mount
      if (raw) setKnownMap(JSON.parse(raw) as Record<string, boolean>)
    } catch {
      /* bỏ qua */
    }
  }, [])

  const toggleKnown = (char: string) => {
    setKnownMap((prev) => {
      const next = { ...prev, [char]: !prev[char] }
      try {
        localStorage.setItem(KNOWN_KEY, JSON.stringify(next))
      } catch {
        /* bỏ qua */
      }
      return next
    })
  }

  /* lọc */
  const results = useMemo(() => {
    const q = query.trim()
    const sq = toBase(q)
    return RADICALS.filter((r) => {
      if (strokes !== 'all' && r.strokes !== strokes) return false
      if (!sq) return true
      return (
        r.char === q ||
        r.variant === q ||
        toBase(r.pinyin).replace(/\s/g, '').includes(sq) ||
        toBase(r.vi).includes(sq) ||
        toBase(r.meaning).includes(sq) ||
        r.words.some((w) => w.c.includes(q) || toBase(w.v).includes(sq))
      )
    })
  }, [query, strokes])

  const knownCount = RADICALS.filter((r) => knownMap[r.char]).length
  const pct = Math.round((knownCount / RADICALS.length) * 100)

  return (
    <div className="flex min-h-screen flex-col bg-[#fff6e9] text-[#5d4a57]">
      <main className="relative flex-1 pb-16 pt-20 sm:pt-24">
        <div aria-hidden="true" className="dot-grid absolute inset-0" />

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
          {/* ================= Header ================= */}
          <header className="paper-scrap relative rounded-2xl px-5 py-6 sm:px-7">
            <WashiTape color="var(--pastel-peach)" pattern="dots" rotate={-5} className="-top-3 left-10 h-6 w-20" />
            <PushPin color="#e8737f" className="absolute right-8 top-3 scale-75" />

            <div className="flex flex-wrap items-center gap-4">
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[var(--cream)] font-cn text-3xl text-[#c2547e] shadow-inner ring-1 ring-[#ead9cd]" aria-hidden="true">
                部首
              </span>
              <div className="min-w-0 flex-1">
                <h1 className="leading-tight">
                  <span className="relative inline-block px-3 py-0.5">
                    <span aria-hidden="true" className="absolute inset-0 -rotate-1 rounded-md bg-[var(--pastel-butter)] opacity-90" />
                    <span className="relative font-display text-2xl font-bold text-[#4f3d4a] sm:text-3xl">Bộ thủ</span>
                  </span>
                  <span className="ml-2 hidden font-cn text-xl text-[#b58fa0] sm:inline">汉字部首</span>
                </h1>
                <p className="mt-1.5 text-sm font-semibold leading-relaxed text-[#8d7484]">
                  Nắm vững <b className="text-[#4f3d4a]">~50 bộ thủ</b> phổ biến nhất là bạn nhận ra cấu trúc của hàng nghìn chữ Hán — như biết “gốc rễ” trước khi học “tán cây” 🌳.
                </p>
              </div>
            </div>
          </header>

          {/* ================= Tiến độ ================= */}
          <Reveal>
            <section className="mt-5 rounded-2xl bg-white/70 px-5 py-4 ring-1 ring-[#f0e2d4] sm:px-7" aria-label="Tiến độ học bộ thủ">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-extrabold text-[#4f3d4a]">
                  Đã nhớ <span className="font-display text-lg font-extrabold text-[#c2547e]">{knownCount}</span>
                  <span className="text-[#b58fa0]"> / {RADICALS.length} bộ</span>
                </p>
                <p className="text-[11px] font-bold text-[#b58fa0]">
                  {pct >= 100 ? '🏆 Xuất sắc — đủ bộ thủ phổ biến!' : pct >= 50 ? '💪 Gần nửa đường rồi!' : 'Bắt đầu đánh dấu những bộ bạn đã thuộc nhé!'}
                </p>
              </div>
              <div className="mt-2.5 h-3.5 overflow-hidden rounded-full bg-[var(--cream)] ring-1 ring-[#ead9cd]">
                <motion.div
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full rounded-full bg-gradient-to-r from-[#f3a1ad] to-[#e8737f]"
                />
              </div>
            </section>
          </Reveal>

          {/* ================= Tìm kiếm + lọc ================= */}
          <Reveal delay={0.05}>
            <section className="paper-scrap mt-4 rounded-2xl px-5 py-4 sm:px-7" aria-label="Tìm kiếm bộ thủ">
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg" aria-hidden="true">🔍</span>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Tìm bộ thủ hoặc chữ Hán… (VD: 水, nhan, tay, 花)"
                  aria-label="Ô tìm kiếm bộ thủ"
                  className="w-full rounded-full border-2 border-[#ead9cd] bg-white py-2.5 pl-11 pr-9 text-sm font-semibold text-[#4f3d4a] shadow-inner outline-none transition-colors placeholder:text-[#c9a2b3] focus:border-[#e88aa6]"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    aria-label="Xoá tìm kiếm"
                    className="absolute right-2.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full bg-[var(--cream)] text-xs font-bold text-[#8d7484] ring-1 ring-[#ead9cd] transition-colors hover:text-[#e8737f]"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-1.5" role="group" aria-label="Lọc theo số nét">
                <button
                  type="button"
                  onClick={() => setStrokes('all')}
                  aria-pressed={strokes === 'all'}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                    strokes === 'all'
                      ? 'bg-[#4f3d4a] text-white shadow-[0_3px_0_0_#3a2d36]'
                      : 'bg-white/70 text-[#6f5a68] ring-1 ring-[#ead9cd] hover:-translate-y-0.5'
                  }`}
                >
                  Mọi số nét
                </button>
                {STROKE_FILTERS.map((s) => {
                  const count = RADICALS.filter((r) => r.strokes === s).length
                  if (count === 0) return null
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStrokes(s)}
                      aria-pressed={strokes === s}
                      className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                        strokes === s
                          ? 'bg-[#4f3d4a] text-white shadow-[0_3px_0_0_#3a2d36]'
                          : 'bg-white/70 text-[#6f5a68] ring-1 ring-[#ead9cd] hover:-translate-y-0.5'
                      }`}
                    >
                      {s} nét
                    </button>
                  )
                })}
                <span className="ml-auto rounded-full bg-[var(--cream)] px-3 py-1 text-[11px] font-bold text-[#6f5a68] ring-1 ring-[#ead9cd]">
                  {results.length} bộ
                </span>
              </div>
            </section>
          </Reveal>

          {/* ================= Lưới bộ thủ ================= */}
          <section className="mt-5" aria-label="Danh sách bộ thủ" aria-live="polite">
            {results.length > 0 ? (
              <motion.div layout className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {results.map((r, i) => (
                  <RadicalCard key={r.char} r={r} known={!!knownMap[r.char]} onToggle={() => toggleKnown(r.char)} index={i} />
                ))}
              </motion.div>
            ) : (
              <div className="paper-scrap mx-auto mt-6 max-w-md rounded-2xl px-6 py-10 text-center">
                <span className="text-5xl" aria-hidden="true">🧩</span>
                <p className="mt-3 font-display text-lg font-bold text-[#4f3d4a]">Không tìm thấy bộ thủ nào</p>
                <p className="mt-1 text-xs font-semibold text-[#8d7484]">Thử “khẩu”, “thủy” hoặc gõ trực tiếp chữ Hán nhé!</p>
              </div>
            )}
          </section>

          {/* ghi chú */}
          <Reveal delay={0.05}>
            <div className="mt-8 flex items-start gap-3 rounded-2xl bg-[var(--pastel-lilac)]/30 px-5 py-4 ring-1 ring-[#e2d6f0]">
              <span className="text-2xl" aria-hidden="true">💡</span>
              <p className="text-xs font-semibold leading-relaxed text-[#6d5a94]">
                <b>Mẹo nhớ bộ thủ:</b> mỗi bộ thủ thường hé lộ phần nghĩa của chữ. Ví dụ 氵(thủy) gợi ý về nước — 河 sông, 海 biển;
                讠(ngôn) gợi ý lời nói — 说 nói, 请 mời. Gặp chữ mới, hãy “soi” bộ thủ trước tiên!
              </p>
            </div>
          </Reveal>
        </div>
      </main>

      <Footer />
    </div>
  )
}
