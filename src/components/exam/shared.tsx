'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { QChoice, QOrder } from '@/data/exams'

/* ============================================================
   Phần dùng chung cho Luyện tập & Thi thử
   ============================================================ */

/** Phát âm tiếng Trung bằng Web Speech API */
export function speak(text: string) {
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

/** Thanh audio giả lập phong cách đề thi — bấm để nghe lại */
export function AudioBar({ text, dark = false }: { text: string; dark?: boolean }) {
  const [playing, setPlaying] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const play = () => {
    speak(text)
    setPlaying(false)
    if (timer.current) clearTimeout(timer.current)
    // nhịp vẽ tiếp theo để animation chạy lại từ đầu
    requestAnimationFrame(() => {
      setPlaying(true)
      timer.current = setTimeout(() => setPlaying(false), 1800)
    })
  }

  return (
    <div
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 ring-1 ${
        dark ? 'bg-[#f6f3ea] ring-[#e2d9c6]' : 'bg-[var(--pastel-sky)]/25 ring-[#cfe0ef]'
      }`}
    >
      <button
        type="button"
        onClick={play}
        aria-label="Nghe audio"
        className={`grid h-11 w-11 shrink-0 place-items-center rounded-full text-white shadow-md transition-transform hover:scale-105 active:scale-95 ${
          playing ? 'bg-[#d2495f]' : 'bg-[#46688f]'
        }`}
      >
        {playing ? (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
            <rect x="6" y="5" width="4" height="14" rx="1" />
            <rect x="14" y="5" width="4" height="14" rx="1" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="ml-0.5 h-5 w-5" fill="currentColor" aria-hidden="true">
            <path d="M8 5.5v13l11-6.5-11-6.5z" />
          </svg>
        )}
      </button>

      {/* sóng audio + tiến trình */}
      <div className="min-w-0 flex-1">
        <div className={`flex h-5 items-end gap-[3px] ${playing ? '' : 'opacity-60'}`} aria-hidden="true">
          {[10, 16, 8, 20, 12, 18, 9, 15, 11, 19, 8, 14].map((h, i) => (
            <motion.span
              key={i}
              className="w-[4px] rounded-full bg-[#46688f]"
              animate={playing ? { height: [h * 0.4, h, h * 0.5, h * 0.9, h * 0.35] } : { height: h * 0.45 }}
              transition={playing ? { duration: 0.9, repeat: Infinity, delay: i * 0.05 } : { duration: 0.3 }}
            />
          ))}
        </div>
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-[#d9e4ef]">
          <motion.div
            key={playing ? 'go' : 'idle'}
            className="h-full rounded-full bg-[#46688f]"
            initial={false}
            animate={{ width: playing ? '100%' : '0%' }}
            transition={{ duration: playing ? 1.8 : 0.2, ease: 'linear' }}
          />
        </div>
      </div>

      <span className="hidden shrink-0 text-[10px] font-bold uppercase tracking-wider text-[#7a94ab] sm:block">
        {playing ? 'Đang phát' : 'Nghe lại'}
      </span>
    </div>
  )
}

/** Ô chữ cái A/B/C */
export function LetterBox({ label, filled = false, dark = false }: { label: string; filled?: boolean; dark?: boolean }) {
  return (
    <span
      className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-sm font-extrabold transition-colors ${
        filled
          ? dark
            ? 'bg-[#4f3d4a] text-white'
            : 'bg-[#4f3d4a] text-white'
          : dark
            ? 'bg-[#f1ecdf] text-[#8d7484] ring-1 ring-[#e2d9c6]'
            : 'bg-[var(--cream)] text-[#8d7484] ring-1 ring-[#ead9cd]'
      }`}
      aria-hidden="true"
    >
      {label}
    </span>
  )
}

/* ---------- Dòng lựa chọn (choice) — dùng cho cả 2 chế độ ---------- */

export function ChoiceRow({
  q,
  opt,
  selected,
  revealed,
  onPick,
}: {
  q: QChoice
  opt: QChoice['options'][number]
  selected: boolean
  revealed: boolean
  onPick: () => void
}) {
  const isRight = opt.label === q.answer
  let cls = 'bg-white ring-[#ead9cd] hover:ring-[#d8bfcf] hover:-translate-y-0.5'
  if (!revealed && selected) cls = 'bg-[var(--pastel-sky)]/40 ring-2 ring-[#46688f]'
  if (revealed && isRight) cls = 'bg-[var(--pastel-mint)]/50 ring-2 ring-[#7fae8f]'
  if (revealed && selected && !isRight) cls = 'bg-[var(--pastel-pink)]/40 ring-2 ring-[#d2495f]'

  return (
    <button
      type="button"
      disabled={revealed}
      onClick={onPick}
      className={`flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-left ring-1 transition-all ${cls} ${revealed ? 'cursor-default' : 'cursor-pointer'}`}
    >
      <LetterBox label={opt.label} filled={revealed ? isRight : selected} />
      <span className="min-w-0 flex-1">
        {opt.cn && <span className="block font-cn text-xl leading-snug text-[#3f5c74]">{opt.cn}</span>}
        <span className="block text-xs font-bold text-[#8d7484]">{opt.vi}</span>
      </span>
      {revealed && isRight && <span className="text-lg" aria-label="Đáp án đúng">✅</span>}
      {revealed && selected && !isRight && <span className="text-lg" aria-label="Bạn đã chọn sai">❌</span>}
    </button>
  )
}

/* ---------- Câu sắp xếp từ (order) — dùng cho cả 2 chế độ ---------- */

export function OrderQuestion({
  q,
  draft,
  revealed,
  onPlace,
  onRemove,
  onClear,
}: {
  q: QOrder
  draft: string[]
  revealed: boolean
  onPlace: (t: string) => void
  onRemove: (i: number) => void
  onClear: () => void
}) {
  // các từ còn lại ở ngân hàng từ (trừ những từ đã được xếp)
  const used = [...draft]
  const remaining = q.tokens.filter((t) => {
    const i = used.indexOf(t)
    if (i >= 0) {
      used.splice(i, 1)
      return false
    }
    return true
  })

  return (
    <div className="space-y-3">
      {/* chỗ xếp câu */}
      <div className="flex min-h-[64px] flex-wrap items-center gap-2 rounded-2xl border-2 border-dashed border-[#ead9cd] bg-[var(--cream)]/50 px-3 py-3">
        {draft.length === 0 && (
          <span className="text-xs font-bold text-[#b58fa0]">Bấm vào các từ bên dưới để xếp thành câu…</span>
        )}
        {draft.map((t, i) => (
          <button
            key={`${t}-${i}`}
            type="button"
            disabled={revealed}
            onClick={() => onRemove(i)}
            className={`rounded-xl bg-white px-3 py-1.5 font-cn text-lg text-[#3f5c74] ring-1 ring-[#ead9cd] shadow-sm transition-all ${
              revealed ? 'cursor-default' : 'hover:-translate-y-0.5 hover:ring-[#d8bfcf]'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ngân hàng từ */}
      <div className="flex flex-wrap gap-2">
        {remaining.map((t, i) => (
          <button
            key={`${t}-bank-${i}`}
            type="button"
            disabled={revealed}
            onClick={() => onPlace(t)}
            className="rounded-xl bg-white px-3 py-1.5 font-cn text-lg text-[#4f3d4a] ring-1 ring-[#ead9cd] shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[var(--pastel-butter)]/50 disabled:cursor-default disabled:opacity-50"
          >
            {t}
          </button>
        ))}
        <button
          type="button"
          onClick={onClear}
          disabled={revealed || draft.length === 0}
          className="ml-auto rounded-xl px-3 py-1.5 text-xs font-extrabold text-[#c2547e] transition-colors hover:bg-[var(--pastel-pink-soft)] disabled:opacity-40"
        >
          ↺ Xoá
        </button>
      </div>
    </div>
  )
}
