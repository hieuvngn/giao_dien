'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import Footer from '../landing/footer'
import { PushPin, WashiTape } from '../landing/decor'
import { findRoadmapLevel } from '@/data/roadmap'
import { useToast } from '@/hooks/use-toast'

/* ============================================================
   Trang học chi tiết một bài: flashcard · chế độ học · danh sách từ
   Route: #/lesson/[slug]/v/[n]  (từ vựng)  ·  #/lesson/[slug]/g/[n]  (ngữ pháp)
   ============================================================ */

type Kind = 'v' | 'g'

/* ---------- thẻ học dùng chung ---------- */

type StudyCard = {
  cn: string // chữ Hán / công thức / câu ví dụ
  pinyin: string
  vi: string // nghĩa tiếng Việt
  pos?: string // phân loại từ
  example?: { cn: string; pinyin: string; vi: string } // ví dụ đầy đủ (ngữ pháp)
  speak: string // text để phát âm
}

type Meta = {
  stars: Record<string, boolean>
  pins: Record<string, boolean>
  known: Record<string, 'known' | 'unknown'>
  studyCount: number
}

const EMPTY_META: Meta = { stars: {}, pins: {}, known: {}, studyCount: 0 }

/* ---------- localStorage helpers ---------- */

function lsGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}
function lsSet(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* bỏ qua */
  }
}

const knownKey = (slug: string, kind: Kind, n: number) => `nkhn.known:${slug}:${kind}:${n}`
const studyKey = (slug: string, kind: Kind, n: number) => `${slug}:${kind}:${n}`

/* ---------- phát âm (Web Speech API) ---------- */

function speak(text: string) {
  try {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'zh-CN'
    u.rate = 0.85
    const voice = window.speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith('zh'))
    if (voice) u.voice = voice
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(u)
  } catch {
    /* im lặng */
  }
}

/* ---------- icon nhỏ ---------- */

function SpeakerIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 5 6 9H2v6h4l5 4V5z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M18.5 5.5a9 9 0 0 1 0 13" />
    </svg>
  )
}

function PinIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 17v5" />
      <path d="M9 10.8V4h6v6.8a3 3 0 0 0 .6 1.8l1.8 2.4H6.6l1.8-2.4a3 3 0 0 0 .6-1.8z" />
    </svg>
  )
}

function StarIcon({ filled, className = 'h-4 w-4' }: { filled?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8L12 2z" />
    </svg>
  )
}

/* ---------- dữ liệu chế độ học ---------- */

const FALLBACK_ICONS = ['🐯', '🐰', '🐼', '🐣', '🐱', '🚌', '🐷', '🐸', '🐵', '🦁', '🐨', '🐔']

const OTHER_MODES = [
  { id: 'quiz', label: 'Trắc nghiệm', icon: '📝' },
  { id: 'typing', label: 'Gõ từ', icon: '⌨️' },
  { id: 'reading', label: 'Đọc hiểu', icon: '📖' },
  { id: 'listen', label: 'Nghe ghép câu', icon: '🎧' },
  { id: 'dance', label: 'Hanzi Dance', icon: '💃' },
  { id: 'battle', label: 'Đấu trí', icon: '⚔️', note: 'Xếp hạng' },
]

/* ---------- nút toolbar ---------- */

function ToolBtn({
  active,
  onClick,
  children,
  title,
}: {
  active?: boolean
  onClick: () => void
  children: React.ReactNode
  title?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all duration-200 ${
        active
          ? 'bg-[#4f3d4a] text-white shadow-[0_3px_0_0_#3a2d36]'
          : 'paper-scrap text-[#6f5a68] hover:-translate-y-0.5 hover:text-[#4f3d4a]'
      }`}
    >
      {children}
    </button>
  )
}

/* ============================================================
   Thẻ flashcard — tách thành component con để reset "flipped"
   mỗi lần đổi tab/bài (thông qua key, không cần effect)
   ============================================================ */

function FlashcardView({
  card,
  front,
  isVocab,
  isExampleTab,
  showPinyin,
  autoSpeak,
}: {
  card: StudyCard
  front: 'zh' | 'vi'
  isVocab: boolean
  isExampleTab: boolean
  showPinyin: boolean
  autoSpeak: boolean
}) {
  const [flipped, setFlipped] = useState(false)

  /* tự phát âm khi lật thẻ (đồng bộ với hệ thống bên ngoài, không setState) */
  useEffect(() => {
    if (flipped && autoSpeak) speak(card.speak)
  }, [flipped, autoSpeak, card])

  return (
    <div className="relative mx-auto w-full max-w-xl" style={{ perspective: 1200 }}>
      {/* loa */}
      <button
        type="button"
        onClick={() => speak(card.speak)}
        aria-label="Nghe phát âm"
        title="Nghe phát âm"
        className="absolute -right-2 -top-2 z-20 grid h-10 w-10 place-items-center rounded-full bg-[var(--pastel-sky)] text-[#46688f] shadow-md transition-transform hover:-translate-y-0.5 hover:scale-105 sm:-right-4"
      >
        <SpeakerIcon className="h-5 w-5" />
      </button>

      <div
        role="button"
        tabIndex={0}
        onClick={() => setFlipped((f) => !f)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setFlipped((f) => !f)
          }
        }}
        className="block h-[320px] w-full cursor-pointer select-none rounded-3xl text-left outline-none focus-visible:ring-2 focus-visible:ring-[#e88aa6] sm:h-[360px]"
        aria-label="Lật thẻ"
      >
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="relative h-full w-full"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* mặt trước */}
          <div
            className="paper-scrap absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-3xl px-6 py-10 text-center"
            style={{ backfaceVisibility: 'hidden' }}
          >
            {isExampleTab ? (
              <>
                <p className="rounded-full bg-[var(--pastel-sky)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#46688f]">Câu ví dụ</p>
                <p className="font-cn text-3xl leading-snug text-[#4f3d4a] sm:text-4xl">{card.cn}</p>
                {showPinyin && card.pinyin ? <p className="text-sm font-semibold text-[#b58fa0]">{card.pinyin}</p> : null}
              </>
            ) : front === 'zh' ? (
              <>
                {showPinyin && card.pinyin ? (
                  <p className="text-sm font-bold uppercase tracking-[0.28em] text-[#e88aa6]">{card.pinyin}</p>
                ) : null}
                <p className={`leading-none text-[#4f3d4a] ${isVocab ? 'font-cn text-6xl sm:text-7xl' : 'font-cn text-4xl sm:text-5xl'}`}>{card.cn}</p>
                {isVocab && card.pos ? (
                  <span className="rounded-full bg-[var(--cream)] px-3 py-1 text-[11px] font-bold text-[#6f5a68] ring-1 ring-[#ead9cd]">{card.pos}</span>
                ) : null}
              </>
            ) : (
              <>
                {showPinyin && card.pinyin ? <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#e88aa6]">{card.pinyin}</p> : null}
                <p className="font-display text-4xl font-bold leading-snug text-[#4f3d4a] sm:text-5xl">{card.vi}</p>
                <p className="text-xs font-semibold text-[#b58fa0]">Bạn nhớ mặt kia chứ? 🤔</p>
              </>
            )}
            <p className="absolute bottom-4 text-[11px] font-bold text-[#c9a2b3]">👆 Click để lật</p>
          </div>

          {/* mặt sau */}
          <div
            className="paper-scrap absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-3xl px-6 py-10 text-center ring-2 ring-[var(--pastel-butter)]"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            {isExampleTab ? (
              <>
                <p className="text-sm font-bold italic text-[#7d9cb2]">{card.pinyin}</p>
                <p className="font-display text-2xl font-bold leading-snug text-[#4f3d4a] sm:text-3xl">{card.vi}</p>
              </>
            ) : !isVocab && card.example ? (
              <>
                <p className="rounded-full bg-[var(--pastel-butter)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8a6a1f]">Ví dụ</p>
                <p className="font-cn text-3xl leading-snug text-[#3f5c74]">{card.example.cn}</p>
                {showPinyin ? <p className="text-sm font-semibold italic text-[#7d9cb2]">{card.example.pinyin}</p> : null}
                <p className="text-sm font-bold text-[#6f5a68]">→ {card.example.vi}</p>
              </>
            ) : front === 'zh' ? (
              <>
                {showPinyin && card.pinyin ? <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#e88aa6]">{card.pinyin}</p> : null}
                <p className="font-display text-4xl font-bold leading-snug text-[#4f3d4a] sm:text-5xl">{card.vi}</p>
                {isVocab && card.pos ? (
                  <span className="rounded-full bg-[var(--pastel-butter)] px-3 py-1 text-[11px] font-bold text-[#8a6a1f]">{card.pos}</span>
                ) : null}
              </>
            ) : (
              <>
                <p className={`leading-none text-[#4f3d4a] ${isVocab ? 'font-cn text-6xl sm:text-7xl' : 'font-cn text-4xl'}`}>{card.cn}</p>
                {showPinyin && card.pinyin ? <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#e88aa6]">{card.pinyin}</p> : null}
              </>
            )}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); speak(card.speak) }}
              className="absolute bottom-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-[var(--pastel-sky)]/80 text-[#46688f] transition-transform hover:scale-110"
              aria-label="Nghe phát âm"
            >
              <SpeakerIcon className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

/* ============================================================ */

export default function LessonStudy({ slug, kind, n }: { slug?: string; kind?: Kind; n?: number }) {
  const { toast } = useToast()
  const level = findRoadmapLevel(slug)
  const k: Kind = kind === 'g' ? 'g' : 'v'
  const num = Number(n) || 1

  const vocabLesson = level?.vocab.find((l) => l.n === num)
  const grammarLesson = level?.grammar.find((l) => l.n === num)

  /* ----- trạng thái học ----- */
  const [showPinyin, setShowPinyin] = useState(true)
  const [autoSpeak, setAutoSpeak] = useState(false)
  const [tab, setTab] = useState<'card' | 'example'>('card')
  const [front, setFront] = useState<'zh' | 'vi'>('zh')
  const [auto, setAuto] = useState(false)
  const [idx, setIdx] = useState(0)
  const [shuffled, setShuffled] = useState<{ key: string; order: number[] } | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [meta, setMeta] = useState<Meta>(EMPTY_META)
  const countedRef = useRef(false)

  const deckKey = `${k}:${num}:${tab}`

  /* ----- bộ thẻ ----- */
  const cards: StudyCard[] = useMemo(() => {
    if (!level) return []
    if (tab === 'example') {
      if (k === 'v') {
        return vocabLesson
          ? vocabLesson.words.filter((w) => w.ex).map((w) => ({ cn: w.ex!.cn, pinyin: w.ex!.pinyin, vi: w.ex!.vi, speak: w.ex!.cn }))
          : []
      }
      return grammarLesson
        ? [{ cn: grammarLesson.example.cn, pinyin: grammarLesson.example.pinyin, vi: grammarLesson.example.vi, speak: grammarLesson.example.cn }]
        : []
    }
    if (k === 'v') {
      return vocabLesson
        ? vocabLesson.words.map((w) => ({ cn: w.cn, pinyin: w.pinyin, vi: w.vi, pos: w.pos, speak: w.cn }))
        : []
    }
    return grammarLesson
      ? [{ cn: grammarLesson.structure, pinyin: grammarLesson.cn ?? '', vi: grammarLesson.point, example: grammarLesson.example, speak: grammarLesson.example.cn }]
      : []
  }, [level, k, tab, vocabLesson, grammarLesson])

  /* thứ tự thẻ: dùng thứ tự xáo trộn nếu còn hợp lệ, ngược lại theo thứ tự gốc
     (đổi tab/bài sẽ tự về thứ tự gốc vì key của trạng thái xáo trộn không còn khớp) */
  const order = useMemo(() => {
    if (shuffled && shuffled.key === deckKey && shuffled.order.length === cards.length) return shuffled.order
    return cards.map((_, i) => i)
  }, [shuffled, deckKey, cards])

  const total = cards.length
  const safeIdx = Math.min(idx, Math.max(total - 1, 0))
  const cardIndex = tab === 'card' ? order[safeIdx] ?? safeIdx : safeIdx
  const card: StudyCard | undefined = cards[safeIdx]

  /* ----- khôi phục trạng thái từ localStorage + đếm lượt học ----- */
  useEffect(() => {
    if (!level) return
    const studies = lsGet<Record<string, number>>('nkhn.studies', {})
    if (!countedRef.current) {
      countedRef.current = true
      const key = studyKey(level.slug, k, num)
      studies[key] = (studies[key] ?? 0) + 1
      lsSet('nkhn.studies', studies)
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMeta({
      stars: lsGet('nkhn.stars', {}),
      pins: lsGet('nkhn.pins', {}),
      known: lsGet(knownKey(level.slug, k, num), {}),
      studyCount: studies[studyKey(level.slug, k, num)] ?? 0,
    })
  }, [level, k, num])

  const shuffle = useCallback(() => {
    const arr = cards.map((_, i) => i)
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    setShuffled({ key: deckKey, order: arr })
    setIdx(0)
    toast({ title: '🔀 Đã xáo trộn bộ thẻ!' })
  }, [cards, deckKey, toast])

  /* ----- điều hướng thẻ ----- */
  const go = useCallback(
    (d: 1 | -1) => {
      setIdx((i) => {
        if (total === 0) return 0
        const s = Math.min(i, total - 1)
        if (d === 1) return s + 1 >= total ? 0 : s + 1
        return s - 1 < 0 ? total - 1 : s - 1
      })
    },
    [total],
  )

  const next = useCallback(() => go(1), [go])

  /* tự động chuyển thẻ */
  useEffect(() => {
    if (!auto || total === 0) return
    const t = setInterval(next, 3200)
    return () => clearInterval(t)
  }, [auto, next, total])

  /* đánh dấu thuộc / chưa thuộc */
  const mark = useCallback(
    (m: 'known' | 'unknown') => {
      if (!level || total === 0) return
      const id = `${k}:${num}:${cardIndex}`
      setMeta((prev) => {
        const nextMeta = { ...prev, known: { ...prev.known, [id]: m } }
        lsSet(knownKey(level.slug, k, num), nextMeta.known)
        return nextMeta
      })
      if (m === 'known') toast({ title: '✓ Giỏi lắm! Đã thuộc thẻ này.' })
      else toast({ title: '✗ Không sao, lần sau nhớ nhé!' })
      next()
    },
    [level, total, cardIndex, k, num, next, toast],
  )

  /* bàn phím */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return
      if (e.key === 'ArrowRight') next()
      else if (e.key === 'ArrowLeft') go(-1)
      else if (e.key === ' ') {
        e.preventDefault()
        document.querySelector<HTMLElement>('[aria-label="Lật thẻ"]')?.click()
      } else if (e.key === '1') mark('unknown')
      else if (e.key === '2') mark('known')
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [next, go, mark])

  /* toàn màn hình */
  const toggleFullscreen = () => {
    try {
      if (document.fullscreenElement) void document.exitFullscreen()
      else void document.documentElement.requestFullscreen()
    } catch {
      /* bỏ qua */
    }
  }

  /* ghim / sao */
  const toggleStar = (id: string) => {
    setMeta((prev) => {
      const nextMeta = { ...prev, stars: { ...prev.stars, [id]: !prev.stars[id] } }
      lsSet('nkhn.stars', nextMeta.stars)
      return nextMeta
    })
  }
  const togglePin = (id: string) => {
    const wasPinned = !!meta.pins[id]
    setMeta((prev) => {
      const nextMeta = { ...prev, pins: { ...prev.pins, [id]: !prev.pins[id] } }
      lsSet('nkhn.pins', nextMeta.pins)
      return nextMeta
    })
    toast({
      title: wasPinned ? '📌 Đã bỏ khỏi bộ thẻ' : '📌 Đã thêm vào bộ thẻ của bạn!',
      description: wasPinned ? undefined : 'Xem lại trong menu 🃏 Bộ thẻ của tôi.',
    })
  }

  /* ---------- không tìm thấy ---------- */
  if (!level || (k === 'v' ? !vocabLesson : !grammarLesson)) {
    return (
      <div className="min-h-screen bg-[#fff6e9] text-[#5d4a57]">
        <main className="flex min-h-screen items-center justify-center px-4 pb-16">
          <div className="paper-scrap relative -rotate-1 rounded-2xl px-8 py-10 text-center">
            <PushPin color="#e8737f" className="absolute -top-2.5 left-8" />
            <p className="font-cn text-5xl text-[#c2547e]">迷路</p>
            <h1 className="mt-3 font-display text-xl font-bold text-[#4f3d4a]">Không tìm thấy bài học này</h1>
            <a
              href={level ? `#/roadmap/${level.slug}` : '#/'}
              className="mt-6 inline-block rounded-full bg-[#e8737f] px-6 py-3 text-sm font-bold text-white shadow-[0_5px_0_0_#d1708f] transition-transform hover:-translate-y-0.5"
            >
              ← Về danh sách bài
            </a>
          </div>
        </main>
      </div>
    )
  }

  const lessonIcon = k === 'v' && vocabLesson?.icon ? vocabLesson.icon : FALLBACK_ICONS[(num - 1) % FALLBACK_ICONS.length]
  const knownCount = Object.values(meta.known).filter((v) => v === 'known').length
  const isVocab = k === 'v'
  const backHref = `#/roadmap/${level.slug}`
  const subLabel = isVocab ? `Bài ${num} — Từ vựng ${level.code}` : `Ngữ pháp ${num} — ${level.code}`
  const bigTitle = isVocab ? vocabLesson!.topic : grammarLesson!.point
  const chipLabel = isVocab ? `${vocabLesson!.words.length} từ vựng` : `${level.grammar.length} điểm ngữ pháp`
  const tabA = isVocab ? 'Từ vựng' : 'Cấu trúc'
  const isExampleTab = tab === 'example'

  return (
    <div className="min-h-screen bg-[#fff6e9] text-[#5d4a57]">
      <main className="relative pb-20 pt-20 sm:pt-24">
        <div aria-hidden="true" className="dot-grid absolute inset-0" />

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
          {/* nút quay lại */}
          <a
            href={backHref}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8d7484] transition-colors hover:text-[#e8737f]"
          >
            ← Danh sách bài
          </a>

          {/* ================= 1. Header bài học ================= */}
          <header className="paper-scrap relative mt-3 rounded-2xl px-5 py-6 sm:px-7">
            <WashiTape color={level.tape} pattern="dots" rotate={-5} className="-top-3 left-10 h-6 w-20" />
            <PushPin color="#f0b429" className="absolute right-8 top-3 scale-75" />

            <div className="flex flex-wrap items-center gap-2">
              <span
                className="rounded-full px-3 py-1 text-[11px] font-bold text-[#7a4b5e]"
                style={{ backgroundColor: level.tape }}
              >
                {isVocab ? `Bài ${num}` : `Ngữ pháp ${num}`}
              </span>
              <span className="rounded-full bg-[var(--cream)] px-3 py-1 text-[11px] font-bold text-[#6f5a68] ring-1 ring-[#ead9cd]">
                {chipLabel}
              </span>
              {knownCount > 0 && (
                <span className="rounded-full bg-[var(--pastel-mint)] px-3 py-1 text-[11px] font-bold text-[#3f6b50]">
                  ✓ {knownCount} đã thuộc
                </span>
              )}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-4">
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[var(--cream)] text-4xl shadow-inner ring-1 ring-[#ead9cd]" aria-hidden="true">
                {lessonIcon}
              </span>
              <div className="min-w-0 flex-1">
                <h1 className="leading-tight">
                  <span className="relative inline-block px-3 py-0.5">
                    <span aria-hidden="true" className="absolute inset-0 -rotate-1 rounded-md bg-[var(--pastel-butter)] opacity-90" />
                    <span className="relative font-display text-2xl font-bold text-[#4f3d4a] sm:text-3xl">{bigTitle}</span>
                  </span>
                  {isVocab && vocabLesson?.cn ? <span className="ml-2 font-cn text-xl text-[#b58fa0]">{vocabLesson.cn}</span> : null}
                </h1>
                <p className="mt-1.5 text-sm font-semibold text-[#8d7484]">
                  {subLabel}
                  {isVocab && vocabLesson?.pinyin ? <span className="ml-2 font-cn text-[#b58fa0]">{vocabLesson.pinyin}</span> : null}
                </p>
              </div>

              {/* nút pinyin */}
              <button
                type="button"
                onClick={() => setShowPinyin((v) => !v)}
                aria-pressed={showPinyin}
                title="Bật / tắt phiên âm"
                className={`ml-auto inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold shadow-sm transition-all hover:-translate-y-0.5 ${
                  showPinyin ? 'bg-[var(--pastel-sky)] text-[#46688f]' : 'paper-scrap text-[#8d7484]'
                }`}
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M7 15V9l2.5 3L12 9v6M15 9h3M15 12h2.5M15 15h3" />
                </svg>
                Pinyin: {showPinyin ? 'Bật' : 'Tắt'}
              </button>
            </div>
          </header>

          {/* ================= 2. Thanh công cụ ================= */}
          <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl bg-white/70 p-2.5 ring-1 ring-[#f0e2d4]">
            {/* tabs */}
            <div className="flex items-center gap-1" role="tablist" aria-label="Chế độ xem thẻ">
              <ToolBtn active={!isExampleTab} onClick={() => { setTab('card'); setIdx(0) }}>
                {tabA}
              </ToolBtn>
              <ToolBtn active={isExampleTab} onClick={() => { setTab('example'); setIdx(0) }}>
                Ví dụ
              </ToolBtn>
            </div>

            {/* bộ đếm */}
            <span className="mx-auto rounded-full bg-[var(--cream)] px-4 py-1.5 font-display text-sm font-bold text-[#6f5a68] ring-1 ring-[#ead9cd]">
              {total === 0 ? '0 / 0' : `${safeIdx + 1} / ${total}`}
            </span>

            {/* điều khiển */}
            <div className="flex flex-wrap items-center gap-1.5">
              {isVocab && (
                <ToolBtn active={front === 'vi'} onClick={() => setFront((f) => (f === 'zh' ? 'vi' : 'zh'))} title="Đổi mặt hiển thị của thẻ">
                  VI → ZH
                </ToolBtn>
              )}
              <ToolBtn active={auto} onClick={() => setAuto((v) => !v)} title="Tự động chuyển thẻ sau ~3 giây">
                ▶ Tự động
              </ToolBtn>
              <ToolBtn onClick={shuffle} title="Xáo trộn thứ tự thẻ">
                🔀 Xáo trộn
              </ToolBtn>

              <button
                type="button"
                onClick={toggleFullscreen}
                title="Toàn màn hình"
                aria-label="Toàn màn hình"
                className="grid h-8 w-8 place-items-center rounded-full text-[#8d7484] transition-colors hover:bg-[var(--pastel-butter)]/60 hover:text-[#4f3d4a]"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3" />
                </svg>
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setSettingsOpen((v) => !v)}
                  title="Cài đặt"
                  aria-label="Cài đặt"
                  aria-expanded={settingsOpen}
                  className={`grid h-8 w-8 place-items-center rounded-full transition-colors hover:bg-[var(--pastel-butter)]/60 hover:text-[#4f3d4a] ${settingsOpen ? 'bg-[var(--pastel-butter)]/80 text-[#4f3d4a]' : 'text-[#8d7484]'}`}
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34h.01a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55h.01a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.01a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1z" />
                  </svg>
                </button>

                {settingsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18 }}
                    className="paper-scrap absolute right-0 top-10 z-30 w-56 rounded-2xl p-3"
                    role="dialog"
                    aria-label="Cài đặt thẻ"
                  >
                    <p className="pb-1.5 font-display text-xs font-bold text-[#4f3d4a]">Cài đặt học</p>
                    {[
                      { label: 'Tự phát âm khi lật', value: autoSpeak, set: setAutoSpeak },
                      { label: 'Hiện phiên âm Pinyin', value: showPinyin, set: setShowPinyin },
                    ].map((s) => (
                      <button
                        key={s.label}
                        type="button"
                        role="switch"
                        aria-checked={s.value}
                        onClick={() => s.set(!s.value)}
                        className="flex w-full items-center justify-between gap-2 rounded-xl px-2 py-2 text-left text-xs font-semibold text-[#6f5a68] transition-colors hover:bg-[var(--cream)]"
                      >
                        {s.label}
                        <span className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${s.value ? 'bg-[#8fbf7f]' : 'bg-[#e0d2c4]'}`}>
                          <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${s.value ? 'left-[1.15rem]' : 'left-0.5'}`} />
                        </span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* ================= 3. Thẻ flashcard chính ================= */}
          <section className="mt-6" aria-label="Thẻ học">
            {total === 0 || !card ? (
              <div className="paper-scrap rounded-2xl px-6 py-12 text-center">
                <p className="font-cn text-4xl text-[#c2547e]">没有例子</p>
                <p className="mt-2 text-sm font-semibold text-[#8d7484]">Bài này chưa có câu ví dụ — hãy xem ở tab {tabA} nhé!</p>
              </div>
            ) : (
              <>
                {/* key = deckKey → đổi tab/bài là thẻ tự lật về mặt trước */}
                <FlashcardView
                  key={deckKey}
                  card={card}
                  front={front}
                  isVocab={isVocab}
                  isExampleTab={isExampleTab}
                  showPinyin={showPinyin}
                  autoSpeak={autoSpeak}
                />

                {/* dots tiến độ */}
                <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5" aria-hidden="true">
                  {cards.map((_, i) => {
                    const id = `${k}:${num}:${tab === 'card' ? order[i] ?? i : i}`
                    const st = meta.known[id]
                    return (
                      <span
                        key={i}
                        className={`h-2 rounded-full transition-all ${
                          i === safeIdx ? 'w-5 bg-[#e8737f]' : st === 'known' ? 'w-2 bg-[#8fbf7f]' : st === 'unknown' ? 'w-2 bg-[#f0a2a2]' : 'w-2 bg-[#eadfd6]'
                        }`}
                      />
                    )
                  })}
                </div>

                {/* điều hướng thẻ */}
                <div className="mx-auto mt-4 flex w-full max-w-xl flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => go(-1)}
                    className="paper-scrap rounded-full px-4 py-2.5 text-xs font-bold text-[#6f5a68] transition-transform hover:-translate-y-0.5"
                  >
                    ← Trước
                  </button>
                  <button
                    type="button"
                    onClick={() => mark('unknown')}
                    className="rounded-full bg-[#e26d6d] px-4 py-2.5 text-xs font-bold text-white shadow-[0_3px_0_0_#c25454] transition-transform hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none"
                  >
                    ✕ Chưa thuộc
                  </button>
                  <button
                    type="button"
                    onClick={() => mark('known')}
                    className="rounded-full bg-[#7fbf6e] px-4 py-2.5 text-xs font-bold text-white shadow-[0_3px_0_0_#5f9f50] transition-transform hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none"
                  >
                    ✓ Đã thuộc
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    className="paper-scrap rounded-full px-4 py-2.5 text-xs font-bold text-[#6f5a68] transition-transform hover:-translate-y-0.5"
                  >
                    Sau →
                  </button>
                </div>
                <p className="mt-2 text-center text-[10px] font-semibold text-[#c9a2b3]">
                  Phím tắt: ← → chuyển thẻ · Space lật · 1 Chưa thuộc · 2 Đã thuộc
                </p>
              </>
            )}
          </section>

          {/* ================= 4. Chọn chế độ học ================= */}
          <section className="mt-10" aria-label="Chọn chế độ học">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 className="font-display text-xl font-bold text-[#4f3d4a]">Chọn chế độ học</h2>
                <p className="text-xs font-semibold text-[#8d7484]">Mỗi ngày một trò — học mà chơi, chơi mà học.</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  toast({
                    title: '⌨️ Hướng dẫn gõ pinyin',
                    description: 'Gõ không dấu: "ni hao" → 你好, hoặc kèm thanh điệu: "ni3 hao3".',
                  })
                }
                className="rounded-full px-3 py-1.5 text-xs font-bold text-[#8d7484] underline decoration-dotted underline-offset-4 transition-colors hover:text-[#e8737f]"
              >
                Hướng dẫn gõ
              </button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-7">
              <button
                type="button"
                onClick={() => toast({ title: '🃏 Flashcard', description: 'Bạn đang học ở chế độ này rồi!' })}
                className="flex flex-col items-start gap-1.5 rounded-2xl bg-[#4f3d4a] p-3 text-left text-white shadow-[0_4px_0_0_#3a2d36] transition-transform hover:-translate-y-1"
              >
                <span className="text-xl" aria-hidden="true">🃏</span>
                <span className="text-xs font-bold">Flashcard</span>
                <span className="text-[10px] font-semibold opacity-75">{meta.studyCount > 0 ? `Đã học ${meta.studyCount} lần` : 'Chưa học'}</span>
              </button>

              {OTHER_MODES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() =>
                    toast({
                      title: `${m.icon} ${m.label}`,
                      description: m.note === 'Xếp hạng' ? 'Chế độ xếp hạng sẽ mở sớm — luyện Flashcard thật giỏi nhé!' : 'Chế độ này đang được hoàn thiện, sẽ sớm ra mắt!',
                    })
                  }
                  className="paper-scrap flex flex-col items-start gap-1.5 rounded-2xl p-3 text-left transition-transform hover:-translate-y-1"
                >
                  <span className="text-xl" aria-hidden="true">{m.icon}</span>
                  <span className="text-xs font-bold text-[#4f3d4a]">{m.label}</span>
                  <span className="text-[10px] font-semibold text-[#b58fa0]">{m.note ?? 'Chưa học'}</span>
                </button>
              ))}
            </div>
          </section>

          {/* ================= 5. Thanh hành động ================= */}
          <div className="mt-8 flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="paper-scrap inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-bold text-[#6f5a68] transition-transform hover:-translate-y-0.5"
            >
              🖨 In file
            </button>
            <button
              type="button"
              onClick={() => toast({ title: '🗃️ Cả bài đã có trong bộ thẻ!', description: 'Mở menu 🃏 Bộ thẻ của tôi để ôn lại bất cứ lúc nào.' })}
              className="inline-flex items-center gap-1.5 rounded-full bg-[var(--pastel-mint)] px-4 py-2.5 text-xs font-bold text-[#3f6b50] shadow-sm transition-transform hover:-translate-y-0.5"
            >
              ✓ Cả bài đã có trong bộ thẻ
            </button>
          </div>

          {/* ================= 6. Danh sách từ vựng / ngữ pháp ================= */}
          <section className="mt-8" aria-label={isVocab ? 'Danh sách từ vựng' : 'Danh sách điểm ngữ pháp'}>
            <div className="flex flex-wrap items-end justify-between gap-2">
              <h2 className="font-display text-xl font-bold text-[#4f3d4a]">
                {isVocab ? `Danh sách từ vựng (${vocabLesson!.words.length})` : `Danh sách điểm ngữ pháp (${level.grammar.length})`}
              </h2>
              <p className="text-xs font-semibold text-[#8d7484]">Bấm ghim để thêm vào bộ thẻ · bấm loa để nghe phát âm</p>
            </div>

            {isVocab ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {vocabLesson!.words.map((w, i) => {
                  const id = `v:${num}:${i}`
                  const st = meta.known[`v:${num}:${i}`]
                  return (
                    <motion.article
                      key={`${w.cn}-${i}`}
                      initial={{ opacity: 0, y: 18 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-30px' }}
                      transition={{ duration: 0.4, delay: (i % 3) * 0.06, ease: [0.22, 1, 0.36, 1] }}
                      className={`relative rounded-2xl bg-white/85 p-4 ring-1 transition-shadow hover:shadow-md ${
                        st === 'known' ? 'ring-2 ring-[#8fbf7f]' : st === 'unknown' ? 'ring-2 ring-[#f0a2a2]' : 'ring-[#f0e2d4]'
                      }`}
                    >
                      {/* header: STT + icon */}
                      <div className="flex items-center justify-between">
                        <span className="font-display text-sm font-bold text-[#c9a2b3]">{i + 1}.</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => togglePin(id)}
                            aria-label={meta.pins[id] ? 'Bỏ ghim' : 'Ghim vào bộ thẻ'}
                            aria-pressed={!!meta.pins[id]}
                            className={`grid h-7 w-7 place-items-center rounded-full transition-colors ${meta.pins[id] ? 'bg-[var(--pastel-sky)] text-[#46688f]' : 'text-[#c9b8c4] hover:bg-[var(--cream)] hover:text-[#8d7484]'}`}
                          >
                            <PinIcon className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleStar(id)}
                            aria-label={meta.stars[id] ? 'Bỏ đánh dấu sao' : 'Đánh dấu sao'}
                            aria-pressed={!!meta.stars[id]}
                            className={`grid h-7 w-7 place-items-center rounded-full transition-colors ${meta.stars[id] ? 'text-[#f0b429]' : 'text-[#c9b8c4] hover:bg-[var(--cream)] hover:text-[#8d7484]'}`}
                          >
                            <StarIcon filled={!!meta.stars[id]} className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => speak(w.cn)}
                            aria-label={`Nghe từ ${w.vi}`}
                            className="grid h-7 w-7 place-items-center rounded-full text-[#c9b8c4] transition-colors hover:bg-[var(--pastel-sky)]/60 hover:text-[#46688f]"
                          >
                            <SpeakerIcon className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* nội dung */}
                      <div className="mt-1 text-center">
                        <p className="font-cn text-4xl leading-snug text-[#4f3d4a]">{w.cn}</p>
                        {showPinyin ? <p className="mt-0.5 text-xs font-bold uppercase tracking-[0.2em] text-[#e88aa6]">{w.pinyin}</p> : null}
                        <p className="mt-1 text-sm font-bold text-[#6f5a68]">{w.vi}</p>
                        <div className="mt-2 flex items-center justify-center gap-1.5">
                          {w.pos ? (
                            <span className="rounded-full bg-[var(--cream)] px-2.5 py-0.5 text-[10px] font-bold text-[#6f5a68] ring-1 ring-[#ead9cd]">{w.pos}</span>
                          ) : null}
                          {st === 'known' ? <span className="rounded-full bg-[var(--pastel-mint)] px-2.5 py-0.5 text-[10px] font-bold text-[#3f6b50]">✓ Đã thuộc</span> : null}
                          {st === 'unknown' ? <span className="rounded-full bg-[#fbe4e4] px-2.5 py-0.5 text-[10px] font-bold text-[#c25454]">✗ Chưa thuộc</span> : null}
                        </div>
                      </div>

                      {/* ví dụ */}
                      {w.ex ? (
                        <div className="mt-3 rounded-xl bg-[#f4fbff] p-2.5 ring-1 ring-[#e3eef6]">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-cn text-sm leading-snug text-[#3f5c74]">{w.ex.cn}</p>
                            <button
                              type="button"
                              onClick={() => speak(w.ex!.cn)}
                              aria-label="Nghe câu ví dụ"
                              className="shrink-0 text-[#7d9cb2] transition-transform hover:scale-110"
                            >
                              <SpeakerIcon className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          {showPinyin ? <p className="text-[11px] font-semibold italic text-[#7d9cb2]">{w.ex.pinyin}</p> : null}
                          <p className="text-[11px] font-bold text-[#6f5a68]">→ {w.ex.vi}</p>
                        </div>
                      ) : null}
                    </motion.article>
                  )
                })}
              </div>
            ) : (
              /* danh sách điểm ngữ pháp của cả cấp */
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {level.grammar.map((g, i) => (
                  <a
                    key={g.n}
                    href={`#/lesson/${level.slug}/g/${g.n}`}
                    className={`block rounded-2xl bg-white/85 p-4 ring-1 transition-all hover:-translate-y-0.5 hover:shadow-md ${
                      g.n === num ? 'ring-2 ring-[var(--pastel-butter)]' : 'ring-[#f0e2d4]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-display text-sm font-bold text-[#c9a2b3]">{i + 1}.</span>
                      <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); speak(g.example.cn) }}
                        aria-label="Nghe câu ví dụ"
                        className="grid h-7 w-7 place-items-center rounded-full text-[#c9b8c4] transition-colors hover:bg-[var(--pastel-sky)]/60 hover:text-[#46688f]"
                      >
                        <SpeakerIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <h3 className="mt-1 text-sm font-bold text-[#4f3d4a]">{g.point}</h3>
                    {g.cn ? <p className="font-cn text-xs text-[#b58fa0]">{g.cn}</p> : null}
                    <p className="mt-2 inline-block rounded-lg bg-[var(--pastel-butter)]/60 px-2.5 py-1 font-cn text-sm text-[#8a6a1f]">{g.structure}</p>
                    <div className="mt-3 rounded-xl bg-[#f4fbff] p-3 ring-1 ring-[#e3eef6]">
                      <p className="font-cn text-lg leading-snug text-[#3f5c74]">{g.example.cn}</p>
                      {showPinyin ? <p className="text-xs font-semibold italic text-[#7d9cb2]">{g.example.pinyin}</p> : null}
                      <p className="text-xs font-bold text-[#6f5a68]">→ {g.example.vi}</p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </section>

          {/* điều hướng dưới trang */}
          <div className="mt-10 flex items-center justify-center gap-3">
            <a
              href={backHref}
              className="paper-scrap rounded-full px-5 py-2.5 text-xs font-bold text-[#6f5a68] transition-transform hover:-translate-y-0.5"
            >
              ← Về danh sách bài
            </a>
            <span className="font-cn text-sm text-[#c9a2b3]">{level.cn}</span>
            <a
              href="#/create-file"
              className="paper-scrap rounded-full px-5 py-2.5 text-xs font-bold text-[#6f5a68] transition-transform hover:-translate-y-0.5"
              title="Tạo vở tập viết cho bài này"
            >
              ✎ Tạo vở tập viết →
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
