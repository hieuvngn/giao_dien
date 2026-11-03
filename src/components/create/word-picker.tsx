'use client'

import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ROADMAP_BY_GROUP } from '@/data/roadmap'
import type { RoadmapGroup } from '@/data/roadmap/types'
import { rankVocab, searchVocab, type DbWord } from '@/lib/vocab-db'

/* ============================================================
   WordPicker — tìm & chọn từ từ kho từ vựng của trang
   (tổng hợp toàn bộ lộ trình) để đưa vào danh sách tập viết
   ============================================================ */

const PICK_GROUP_FILTERS: { id: RoadmapGroup | 'all'; label: string; emoji: string }[] = [
  { id: 'all', label: 'Tất cả', emoji: '🌐' },
  { id: 'hsk', label: 'HSK 3.0', emoji: '🎓' },
  { id: 'yct', label: 'YCT', emoji: '🧒' },
  { id: 'boya', label: 'Boya', emoji: '📘' },
  { id: 'hanyu', label: 'Hán ngữ', emoji: '📗' },
]

const PAGE = 30
const BULK_CAP = 50

const GROUP_TINT: Record<RoadmapGroup, string> = {
  hsk: 'bg-[var(--pastel-pink)] text-[#8a4a63]',
  yct: 'bg-[var(--pastel-mint)] text-[#3f6b50]',
  boya: 'bg-[var(--pastel-sky)] text-[#46688f]',
  hanyu: 'bg-[var(--pastel-peach)] text-[#a05a3a]',
}

export default function WordPicker({
  selected,
  onToggle,
  onAddMany,
}: {
  selected: string[]
  onToggle: (cn: string) => void
  onAddMany: (words: DbWord[]) => void
}) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [group, setGroup] = useState<RoadmapGroup | 'all'>('all')
  const [levelSlug, setLevelSlug] = useState('all')
  const [shown, setShown] = useState(PAGE)

  const selectedSet = useMemo(() => new Set(selected), [selected])

  const levels = useMemo(() => (group === 'all' ? [] : ROADMAP_BY_GROUP[group]), [group])

  const results = useMemo(() => {
    const found = searchVocab({ q, group, levelSlug })
    return rankVocab(found, q)
  }, [q, group, levelSlug])

  const visible = results.slice(0, shown)

  const pickGroup = (g: RoadmapGroup | 'all') => {
    setGroup(g)
    setLevelSlug('all')
    setShown(PAGE)
  }

  return (
    <div className="mt-2.5 rounded-xl bg-[var(--cream)] p-2.5 ring-1 ring-[#ead9cd]">
      {/* nút mở/đóng */}
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 text-left"
      >
        <span className="flex items-center gap-2 text-xs font-extrabold text-[#46688f]">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-[var(--pastel-sky)] text-sm">🔎</span>
          Chọn từ có sẵn trong kho
          <span className="rounded-full bg-white px-1.5 py-0.5 text-[10px] font-bold text-[#8d7484] ring-1 ring-[#ead9cd]">
            kho
          </span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="rounded-full bg-[var(--pastel-sky)] px-2 py-0.5 text-[10px] font-extrabold text-[#46688f]">
            {selected.length} đã chọn
          </span>
          <span className={`text-xs font-bold text-[#8d7484] transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-2.5">
              {/* ô tìm kiếm */}
              <div className="relative">
                <input
                  type="text"
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value)
                    setShown(PAGE)
                  }}
                  placeholder="Tìm chữ Hán, pinyin hoặc nghĩa (vd: 你好, hoc, chào)…"
                  className="custom-scroll w-full rounded-lg bg-white px-3 py-2 pr-8 text-xs font-semibold text-[#4f3d4a] ring-1 ring-[#ead9cd] placeholder:text-[#c9a2b3] focus:outline-none focus:ring-2 focus:ring-[#f0b9c9]"
                  aria-label="Tìm từ trong kho từ vựng"
                />
                {q && (
                  <button
                    onClick={() => setQ('')}
                    aria-label="Xoá từ khoá"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-[#b58fa0] hover:text-[#d2495f]"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* lọc lộ trình */}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {PICK_GROUP_FILTERS.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => pickGroup(g.id)}
                    aria-pressed={group === g.id}
                    className={`rounded-full px-2.5 py-1 text-[10.5px] font-bold transition-all ${
                      group === g.id
                        ? 'bg-[#46688f] text-white shadow-[0_2px_0_0_#35506f]'
                        : 'bg-white text-[#6f5a68] ring-1 ring-[#ead9cd] hover:bg-[var(--pastel-sky)]/40'
                    }`}
                  >
                    {g.emoji} {g.label}
                  </button>
                ))}
              </div>

              {/* lọc cấp độ */}
              {levels.length > 0 && (
                <div className="custom-scroll mt-1.5 flex max-h-14 flex-wrap gap-1.5 overflow-y-auto">
                  <button
                    onClick={() => {
                      setLevelSlug('all')
                      setShown(PAGE)
                    }}
                    aria-pressed={levelSlug === 'all'}
                    className={`rounded-full px-2.5 py-1 text-[10.5px] font-bold transition-all ${
                      levelSlug === 'all'
                        ? 'bg-[#e8737f] text-white'
                        : 'bg-white text-[#6f5a68] ring-1 ring-[#ead9cd] hover:bg-[var(--pastel-pink-soft)]'
                    }`}
                  >
                    Mọi cấp độ
                  </button>
                  {levels.map((l) => (
                    <button
                      key={l.slug}
                      onClick={() => {
                        setLevelSlug(l.slug)
                        setShown(PAGE)
                      }}
                      aria-pressed={levelSlug === l.slug}
                      className={`rounded-full px-2.5 py-1 text-[10.5px] font-bold transition-all ${
                        levelSlug === l.slug
                          ? 'bg-[#e8737f] text-white'
                          : 'bg-white text-[#6f5a68] ring-1 ring-[#ead9cd] hover:bg-[var(--pastel-pink-soft)]'
                      }`}
                    >
                      {l.code}
                    </button>
                  ))}
                </div>
              )}

              {/* số kết quả */}
              <p className="mt-2 text-[11px] font-bold text-[#8d7484]">
                {results.length} từ khớp
                {q && <> với “{q}”</>} · chọn bằng cách bấm vào từng từ
              </p>

              {/* danh sách kết quả */}
              {results.length === 0 ? (
                <p className="mt-3 rounded-lg bg-white px-3 py-4 text-center text-xs font-semibold text-[#b58fa0] ring-1 ring-[#ead9cd]">
                  🐰 Không tìm thấy từ nào — thử từ khoá khác nhé
                </p>
              ) : (
                <div className="custom-scroll mt-1.5 max-h-64 space-y-1.5 overflow-y-auto pr-1">
                  {visible.map((w) => {
                    const picked = selectedSet.has(w.cn)
                    return (
                      <button
                        key={`${w.cn}-${w.levelSlug}-${w.lessonN}`}
                        onClick={() => onToggle(w.cn)}
                        aria-pressed={picked}
                        className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left transition-all ${
                          picked ? 'bg-[var(--pastel-mint)]/60 ring-1 ring-[#8fbf7f]' : 'bg-white ring-1 ring-[#ead9cd] hover:bg-[var(--pastel-butter)]/40'
                        }`}
                      >
                        <span className="font-cn w-14 shrink-0 text-center text-xl leading-tight text-[#4f3d4a]">{w.cn}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[11px] font-bold text-[#6f5a68]">
                            {w.pinyin || '—'} <span className="font-normal text-[#b58fa0]">· {w.vi}</span>
                          </span>
                          <span className={`mt-0.5 inline-block rounded-full px-1.5 py-0.5 text-[9px] font-extrabold ${GROUP_TINT[w.group]}`}>
                            {w.levelCode}
                            {w.lessonN > 0 && ` · Bài ${w.lessonN}`}
                          </span>
                        </span>
                        <span
                          className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-sm font-black ${
                            picked ? 'bg-[#3f6b50] text-white' : 'bg-[var(--pastel-peach)] text-[#a05c33]'
                          }`}
                          aria-hidden="true"
                        >
                          {picked ? '✓' : '＋'}
                        </span>
                      </button>
                    )
                  })}
                  {results.length > shown && (
                    <button
                      onClick={() => setShown(shown + PAGE)}
                      className="w-full rounded-lg bg-white px-3 py-2 text-[11px] font-extrabold text-[#46688f] ring-1 ring-[#ead9cd] transition-colors hover:bg-[var(--pastel-sky)]/40"
                    >
                      Xem thêm {Math.min(PAGE, results.length - shown)} từ ↓ ({results.length - shown} còn lại)
                    </button>
                  )}
                </div>
              )}

              {/* hành động hàng loạt */}
              {results.length > 0 && (
                <div className="mt-2 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onAddMany(results.slice(0, BULK_CAP))}
                    className="rounded-full bg-[#3f6b50] px-3 py-1.5 text-[11px] font-extrabold text-white shadow-[0_2px_0_0_#33593f] transition-transform hover:-translate-y-0.5"
                  >
                    ＋ Thêm {Math.min(BULK_CAP, results.length)} kết quả vào danh sách
                  </button>
                  <button
                    onClick={() => setOpen(false)}
                    className="rounded-full px-3 py-1.5 text-[11px] font-bold text-[#8d7484] hover:bg-white"
                  >
                    Đóng ▴
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
