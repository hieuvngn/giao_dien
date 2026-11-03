'use client'

import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Footer from '../landing/footer'
import { PushPin, Reveal, WashiTape } from '../landing/decor'
import { ROADMAP_BY_GROUP, ROADMAP_LEVELS } from '@/data/roadmap'
import type { RoadmapGroup } from '@/data/roadmap/types'
import { useToast } from '@/hooks/use-toast'

/* ============================================================
   Tra cứu từ điển — tìm theo chữ Hán / pinyin / nghĩa tiếng Việt
   Route: #/dictionary
   Dữ liệu: tổng hợp toàn bộ từ vựng & ngữ pháp của các lộ trình
   ============================================================ */

type Entry = {
  cn: string
  pinyin: string
  vi: string
  pos?: string
  ex?: { cn: string; pinyin: string; vi: string }
  kind: 'word' | 'grammar'
  levelSlug: string
  levelCode: string
  group: RoadmapGroup
  lessonN: number
  lessonTopic: string
  lessonIcon?: string
}

/* ---------- phát âm ---------- */

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

/* ---------- chuẩn hoá chuỗi tìm kiếm ---------- */

/** Bỏ dấu thanh (pinyin) & dấu tiếng Việt: "nǐ hǎo" → "ni hao", "xin chào" → "xin chao" */
function toBase(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
}

/** So khớp mờ: bỏ hết khoảng trắng để "nihao" vẫn khớp "nǐ hǎo" */
function squash(s: string): string {
  return toBase(s).replace(/[\s'’-]/g, '')
}

/* ---------- toàn bộ dữ liệu từ điển ---------- */

const ENTRIES: Entry[] = (() => {
  const out: Entry[] = []
  for (const level of ROADMAP_LEVELS) {
    for (const lesson of level.vocab) {
      for (const w of lesson.words) {
        out.push({
          cn: w.cn,
          pinyin: w.pinyin,
          vi: w.vi,
          pos: w.pos,
          ex: w.ex,
          kind: 'word',
          levelSlug: level.slug,
          levelCode: level.code,
          group: level.group,
          lessonN: lesson.n,
          lessonTopic: lesson.topic,
          lessonIcon: lesson.icon,
        })
      }
    }
    for (const g of level.grammar) {
      out.push({
        cn: g.cn || g.point,
        pinyin: g.structure,
        vi: g.point,
        pos: 'Ngữ pháp',
        ex: { cn: g.example.cn, pinyin: g.example.pinyin, vi: g.example.vi },
        kind: 'grammar',
        levelSlug: level.slug,
        levelCode: level.code,
        group: level.group,
        lessonN: g.n,
        lessonTopic: g.point,
      })
    }
  }
  return out
})()

const GROUP_FILTERS: { id: RoadmapGroup | 'all'; label: string; emoji: string }[] = [
  { id: 'all', label: 'Tất cả lộ trình', emoji: '🌐' },
  { id: 'hsk', label: 'HSK 3.0', emoji: '🎓' },
  { id: 'yct', label: 'YCT', emoji: '🧒' },
  { id: 'boya', label: 'Boya Chinese', emoji: '📘' },
  { id: 'hanyu', label: 'Giáo trình Hán ngữ', emoji: '📗' },
]

const KIND_FILTERS: { id: 'all' | 'word' | 'grammar'; label: string }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'word', label: 'Từ vựng' },
  { id: 'grammar', label: 'Ngữ pháp' },
]

const QUICK_TERMS = ['你好', '谢谢', '老师', 'học', 'nhà', 'shì']

const PAGE_SIZE = 24

/* ---------- icon ---------- */

function SpeakerIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 5 6 9H2v6h4l5 4V5z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M18.5 5.5a9 9 0 0 1 0 13" />
    </svg>
  )
}

/* ---------- thẻ kết quả ---------- */

function EntryCard({ e, index }: { e: Entry; index: number }) {
  const lessonHref = `#/lesson/${e.levelSlug}/${e.kind === 'word' ? 'v' : 'g'}/${e.lessonN}`
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, delay: Math.min((index % PAGE_SIZE) * 0.03, 0.35), ease: [0.22, 1, 0.36, 1] }}
      className="paper-scrap flex h-full flex-col rounded-2xl px-4 py-4"
    >
      {/* nhãn nguồn */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="rounded-full bg-[var(--pastel-mint)]/60 px-2 py-0.5 text-[10px] font-bold text-[#3f6b50]">{e.levelCode}</span>
        <span className="rounded-full bg-[var(--cream)] px-2 py-0.5 text-[10px] font-bold text-[#8d7484] ring-1 ring-[#ead9cd]">
          {e.kind === 'word' ? `Bài ${e.lessonN}` : `Ngữ pháp ${e.lessonN}`}
        </span>
        {e.pos && <span className="ml-auto rounded-full bg-[var(--pastel-butter)]/60 px-2 py-0.5 text-[10px] font-bold text-[#8a6a1f]">{e.pos}</span>}
      </div>

      {/* từ */}
      <div className="mt-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-cn text-3xl leading-tight text-[#4f3d4a]">{e.cn}</p>
          <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-[#e88aa6]">{e.pinyin}</p>
        </div>
        <button
          type="button"
          onClick={() => speak(e.kind === 'word' ? e.cn : e.ex?.cn || e.cn)}
          aria-label="Nghe phát âm"
          title="Nghe phát âm"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--pastel-sky)] text-[#46688f] shadow-sm transition-transform hover:-translate-y-0.5 hover:scale-105"
        >
          <SpeakerIcon />
        </button>
      </div>

      <p className="mt-1.5 text-sm font-bold text-[#6f5a68]">{e.vi}</p>

      {/* ví dụ */}
      {e.ex && (
        <div className="mt-2.5 rounded-xl bg-[var(--cream)]/70 px-3 py-2 ring-1 ring-[#ead9cd]">
          <p className="font-cn text-sm text-[#3f5c74]">{e.ex.cn}</p>
          {e.kind === 'word' && e.ex.pinyin && <p className="text-[10px] font-semibold italic text-[#7d9cb2]">{e.ex.pinyin}</p>}
          <p className="mt-0.5 text-[11px] font-bold text-[#6f5a68]">→ {e.ex.vi}</p>
        </div>
      )}

      {/* footer — link tới bài học */}
      <a
        href={lessonHref}
        className="mt-auto inline-flex items-center gap-1 pt-3 text-[11px] font-bold text-[#c2547e] transition-colors hover:text-[#e8737f]"
      >
        {e.kind === 'word' ? 'Học bài này' : 'Xem ngữ pháp này'} →
        <span className="ml-1 text-[10px] font-semibold text-[#b58fa0]">{e.lessonIcon ? ` ${e.lessonIcon}` : ''} {e.lessonTopic}</span>
      </a>
    </motion.div>
  )
}

/* ============================================================
   Trang chính
   ============================================================ */

export default function Dictionary() {
  const { toast } = useToast()
  const [query, setQuery] = useState('')
  const [group, setGroup] = useState<RoadmapGroup | 'all'>('all')
  const [levelSlug, setLevelSlug] = useState<string>('all')
  const [kind, setKind] = useState<'all' | 'word' | 'grammar'>('all')
  const [visible, setVisible] = useState(PAGE_SIZE)

  const levelsInGroup = group === 'all' ? [] : ROADMAP_BY_GROUP[group]

  /* lọc */
  const results = useMemo(() => {
    const q = query.trim()
    const sq = squash(q)
    return ENTRIES.filter((e) => {
      if (kind !== 'all' && e.kind !== kind) return false
      if (group !== 'all' && e.group !== group) return false
      if (levelSlug !== 'all' && e.levelSlug !== levelSlug) return false
      if (!sq) return true
      return (
        e.cn.includes(q) ||
        squash(e.pinyin).includes(sq) ||
        squash(e.vi).includes(sq) ||
        (e.ex ? e.ex.cn.includes(q) || squash(e.ex.vi).includes(sq) : false)
      )
    })
  }, [query, group, levelSlug, kind])

  const shown = results.slice(0, visible)
  const wordCount = ENTRIES.filter((e) => e.kind === 'word').length
  const grammarCount = ENTRIES.length - wordCount

  const pickGroup = (g: RoadmapGroup | 'all') => {
    setGroup(g)
    setLevelSlug('all')
    setVisible(PAGE_SIZE)
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#fff6e9] text-[#5d4a57]">
      <main className="relative flex-1 pb-16 pt-20 sm:pt-24">
        <div aria-hidden="true" className="dot-grid absolute inset-0" />

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
          {/* ================= Header ================= */}
          <header className="paper-scrap relative rounded-2xl px-5 py-6 sm:px-7">
            <WashiTape color="var(--pastel-sky)" pattern="dots" rotate={-5} className="-top-3 left-10 h-6 w-20" />
            <PushPin color="#7fb2e5" className="absolute right-8 top-3 scale-75" />

            <div className="flex flex-wrap items-center gap-4">
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[var(--cream)] text-4xl shadow-inner ring-1 ring-[#ead9cd]" aria-hidden="true">
                📖
              </span>
              <div className="min-w-0 flex-1">
                <h1 className="leading-tight">
                  <span className="relative inline-block px-3 py-0.5">
                    <span aria-hidden="true" className="absolute inset-0 -rotate-1 rounded-md bg-[var(--pastel-butter)] opacity-90" />
                    <span className="relative font-display text-2xl font-bold text-[#4f3d4a] sm:text-3xl">Tra cứu từ điển</span>
                  </span>
                  <span className="ml-2 hidden font-cn text-xl text-[#b58fa0] sm:inline">汉语词典</span>
                </h1>
                <p className="mt-1.5 text-sm font-semibold leading-relaxed text-[#8d7484]">
                  Gõ chữ Hán, pinyin (có hoặc không dấu thanh) hoặc nghĩa tiếng Việt — ví dụ: <b className="text-[#4f3d4a]">你好</b>, <b className="text-[#4f3d4a]">nihao</b> hay <b className="text-[#4f3d4a]">xin chào</b>.
                </p>
              </div>
            </div>
          </header>

          {/* ================= Tìm kiếm ================= */}
          <Reveal>
            <section className="paper-scrap relative mt-5 rounded-2xl px-5 py-5 sm:px-7" aria-label="Tìm kiếm từ điển">
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg" aria-hidden="true">🔍</span>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setVisible(PAGE_SIZE)
                  }}
                  placeholder="Tìm chữ Hán, pinyin hoặc nghĩa tiếng Việt…"
                  aria-label="Ô tìm kiếm từ điển"
                  className="w-full rounded-full border-2 border-[#ead9cd] bg-white py-3 pl-11 pr-24 text-sm font-semibold text-[#4f3d4a] shadow-inner outline-none transition-colors placeholder:text-[#c9a2b3] focus:border-[#e88aa6]"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    aria-label="Xoá tìm kiếm"
                    className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full bg-[var(--cream)] text-xs font-bold text-[#8d7484] ring-1 ring-[#ead9cd] transition-colors hover:text-[#e8737f]"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* gợi ý nhanh */}
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#b58fa0]">Thử:</span>
                {QUICK_TERMS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setQuery(t)
                      setVisible(PAGE_SIZE)
                    }}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition-all hover:-translate-y-0.5 ${
                      t.match(/[\u4e00-\u9fff]/) ? 'font-cn bg-[var(--pastel-pink-soft)] text-[#8a4a63]' : 'bg-[var(--pastel-butter)]/55 text-[#8a6a1f]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* bộ lọc lộ trình */}
              <div className="mt-4 flex flex-wrap gap-1.5" role="group" aria-label="Lọc theo lộ trình">
                {GROUP_FILTERS.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => pickGroup(g.id)}
                    aria-pressed={group === g.id}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                      group === g.id
                        ? 'bg-[#4f3d4a] text-white shadow-[0_3px_0_0_#3a2d36]'
                        : 'bg-white/70 text-[#6f5a68] ring-1 ring-[#ead9cd] hover:-translate-y-0.5 hover:text-[#4f3d4a]'
                    }`}
                  >
                    <span aria-hidden="true">{g.emoji}</span>
                    {g.label}
                  </button>
                ))}
              </div>

              {/* bộ lọc cấp độ (khi chọn lộ trình) */}
              {levelsInGroup.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label="Lọc theo cấp độ">
                  <button
                    type="button"
                    onClick={() => {
                      setLevelSlug('all')
                      setVisible(PAGE_SIZE)
                    }}
                    aria-pressed={levelSlug === 'all'}
                    className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                      levelSlug === 'all' ? 'bg-[var(--pastel-lilac)] text-[#6d5a94] ring-1 ring-[#e2d6f0]' : 'bg-white/70 text-[#6f5a68] ring-1 ring-[#ead9cd] hover:-translate-y-0.5'
                    }`}
                  >
                    Mọi cấp độ
                  </button>
                  {levelsInGroup.map((lv) => (
                    <button
                      key={lv.slug}
                      type="button"
                      onClick={() => {
                        setLevelSlug(lv.slug)
                        setVisible(PAGE_SIZE)
                      }}
                      aria-pressed={levelSlug === lv.slug}
                      className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                        levelSlug === lv.slug ? 'bg-[var(--pastel-lilac)] text-[#6d5a94] ring-1 ring-[#e2d6f0]' : 'bg-white/70 text-[#6f5a68] ring-1 ring-[#ead9cd] hover:-translate-y-0.5'
                      }`}
                    >
                      {lv.code}
                    </button>
                  ))}
                </div>
              )}

              {/* bộ lọc loại */}
              <div className="mt-2 flex flex-wrap items-center gap-1.5" role="group" aria-label="Lọc theo loại mục từ">
                {KIND_FILTERS.map((k) => (
                  <button
                    key={k.id}
                    type="button"
                    onClick={() => {
                      setKind(k.id)
                      setVisible(PAGE_SIZE)
                    }}
                    aria-pressed={kind === k.id}
                    className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                      kind === k.id ? 'bg-[var(--pastel-peach)] text-[#a05a3a] ring-1 ring-[#f3d6c2]' : 'bg-white/70 text-[#6f5a68] ring-1 ring-[#ead9cd] hover:-translate-y-0.5'
                    }`}
                  >
                    {k.label}
                  </button>
                ))}
                <span className="ml-auto rounded-full bg-[var(--cream)] px-3 py-1 text-[11px] font-bold text-[#6f5a68] ring-1 ring-[#ead9cd]">
                  Tìm thấy <b className="text-[#c2547e]">{results.length}</b> mục
                </span>
              </div>
            </section>
          </Reveal>

          {/* ================= Kết quả ================= */}
          <section className="mt-5" aria-label="Kết quả tra cứu" aria-live="polite">
            {shown.length > 0 ? (
              <>
                <motion.div layout className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {shown.map((e, i) => (
                    <EntryCard key={`${e.levelSlug}-${e.kind}-${e.lessonN}-${e.cn}`} e={e} index={i} />
                  ))}
                </motion.div>

                {visible < results.length && (
                  <div className="mt-6 text-center">
                    <button
                      type="button"
                      onClick={() => setVisible((v) => v + PAGE_SIZE)}
                      className="rounded-full bg-[#4f3d4a] px-6 py-3 text-sm font-bold text-white shadow-[0_5px_0_0_#3a2d36] transition-transform hover:-translate-y-0.5"
                    >
                      Xem thêm {Math.min(PAGE_SIZE, results.length - visible)} mục ↓
                    </button>
                    <p className="mt-2 text-[11px] font-semibold text-[#b58fa0]">
                      Đang hiển thị {shown.length} / {results.length} mục
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="paper-scrap mx-auto mt-6 max-w-md rounded-2xl px-6 py-10 text-center">
                <span className="text-5xl" aria-hidden="true">🐼</span>
                <p className="mt-3 font-display text-lg font-bold text-[#4f3d4a]">Không tìm thấy mục nào</p>
                <p className="mt-1 text-xs font-semibold leading-relaxed text-[#8d7484]">
                  Từ điển đang dùng dữ liệu từ các bài học mẫu của 4 lộ trình. Thử từ khoá khác như <b>“你好”</b> hoặc <b>“học”</b> nhé!
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery('')
                    pickGroup('all')
                    setKind('all')
                    toast({ title: '🧹 Đã xoá bộ lọc' })
                  }}
                  className="mt-4 rounded-full bg-[var(--pastel-butter)] px-5 py-2 text-xs font-bold text-[#8a6a1f] shadow-[0_4px_0_0_#e3c98a] transition-transform hover:-translate-y-0.5"
                >
                  Xoá tìm kiếm & bộ lọc
                </button>
              </div>
            )}
          </section>

          {/* ghi chú nguồn dữ liệu */}
          <Reveal delay={0.05}>
            <div className="mt-8 flex items-start gap-3 rounded-2xl bg-[var(--pastel-sky)]/30 px-5 py-4 ring-1 ring-[#cfdff0]">
              <span className="text-2xl" aria-hidden="true">📚</span>
              <p className="text-xs font-semibold leading-relaxed text-[#46688f]">
                Từ điển tổng hợp <b>{wordCount} mục từ vựng</b> và <b>{grammarCount} điểm ngữ pháp</b> từ toàn bộ bài học của HSK 3.0, YCT, Boya Chinese và Giáo trình Hán ngữ.
                Nhấn vào loa 🔊 để nghe phát âm, hoặc mở thẳng bài học chứa từ đó.
              </p>
            </div>
          </Reveal>
        </div>
      </main>

      <Footer />
    </div>
  )
}
