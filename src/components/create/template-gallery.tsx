'use client'

import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  TEMPLATES,
  TEMPLATE_GROUPS,
  TEMPLATE_LEVELS,
  SUGGESTED_IDS,
  type GroupId,
  type Template,
  type TplLevel,
} from './templates'

/* ============================================================
   TemplateGallery — chọn mẫu giấy theo tham chiếu xiehanzi:
   · 6 mẫu gợi ý (学 大 一 简 你 红) hiện sẵn
   · "Xem cả 24 mẫu" mở kho: tìm kiếm + lọc cấp độ + lọc nhóm
   · mỗi mẫu: icon chữ Hán · tên · mô tả · tag · nút yêu thích
   ============================================================ */

function TemplateCard({
  t,
  active,
  fav,
  onPick,
  onFav,
}: {
  t: Template
  active: boolean
  fav: boolean
  onPick: () => void
  onFav: () => void
}) {
  const level = TEMPLATE_LEVELS.find((l) => l.id === t.level)!
  return (
    <div
      className={`relative flex gap-3 rounded-xl p-3 text-left transition-all ${
        active
          ? 'bg-[var(--pastel-pink-soft)] shadow-[0_4px_10px_-6px_rgba(93,74,87,0.4)] ring-2 ring-[#f0b9c9]'
          : 'bg-white ring-1 ring-[#ead9cd] hover:bg-[var(--cream)]'
      }`}
    >
      <button onClick={onPick} aria-pressed={active} className="flex min-w-0 flex-1 gap-3 text-left">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[#f5efe2] ring-1 ring-[#e8dfcd]">
          <span className="font-cn text-base font-bold leading-none text-[#4f3d4a]">{t.icon}</span>
        </span>
        <span className="min-w-0">
          <span className="block truncate text-xs font-extrabold text-[#4f3d4a]">{t.name}</span>
          <span className="mt-0.5 block text-[10.5px] font-semibold leading-snug text-[#8d7484]">{t.desc}</span>
          <span className="mt-1 flex flex-wrap items-center gap-1">
            <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-extrabold ${level.chip}`}>{level.label}</span>
            {t.tags.slice(0, 2).map((tg) => (
              <span key={tg} className="rounded-full bg-[var(--cream)] px-1.5 py-0.5 text-[9px] font-bold text-[#8d7484] ring-1 ring-[#ead9cd]">
                {tg}
              </span>
            ))}
          </span>
        </span>
      </button>
      <button
        onClick={onFav}
        aria-label={fav ? `Bỏ yêu thích mẫu ${t.name}` : `Yêu thích mẫu ${t.name}`}
        aria-pressed={fav}
        className={`absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full text-sm transition-transform hover:scale-110 ${
          fav ? 'text-[#e8737f]' : 'text-[#c9a2b3] hover:text-[#e8737f]'
        }`}
      >
        {fav ? '♥' : '♡'}
      </button>
    </div>
  )
}

export default function TemplateGallery({
  activeId,
  favs,
  onPick,
  onFav,
}: {
  activeId: string
  favs: string[]
  onPick: (t: Template) => void
  onFav: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [q, setQ] = useState('')
  const [level, setLevel] = useState<TplLevel | 'all'>('all')
  const [group, setGroup] = useState<GroupId | 'all'>('all')

  const suggested = useMemo(
    () => SUGGESTED_IDS.map((id) => TEMPLATES.find((t) => t.id === id)!).filter(Boolean),
    [],
  )

  const filtered = useMemo(() => {
    const base = q.trim().toLowerCase()
    return TEMPLATES.filter((t) => {
      if (level !== 'all' && t.level !== level) return false
      if (group !== 'all' && t.group !== group) return false
      if (!base) return true
      const hay = `${t.name} ${t.desc} ${t.tags.join(' ')} ${t.icon}`.toLowerCase()
      return hay.includes(base)
    })
  }, [q, level, group])

  const groupsShown = useMemo(
    () =>
      TEMPLATE_GROUPS.map((g) => ({ ...g, items: filtered.filter((t) => t.group === g.id) })).filter(
        (g) => g.items.length > 0,
      ),
    [filtered],
  )

  const favFirst = useMemo(() => {
    if (!favs.length) return groupsShown
    return groupsShown.map((g) => ({
      ...g,
      items: [...g.items].sort((a, b) => Number(favs.includes(b.id)) - Number(favs.includes(a.id))),
    }))
  }, [groupsShown, favs])

  return (
    <div>
      {/* 6 mẫu gợi ý */}
      {!expanded && (
        <div className="grid grid-cols-2 gap-2">
          {suggested.map((t) => (
            <TemplateCard key={t.id} t={t} active={activeId === t.id} fav={favs.includes(t.id)} onPick={() => onPick(t)} onFav={() => onFav(t.id)} />
          ))}
          <button
            onClick={() => setExpanded(true)}
            className="col-span-2 rounded-xl px-3 py-2.5 text-xs font-extrabold text-[#6f5a68] ring-1 ring-[#ead9cd] transition-colors hover:bg-[var(--cream)]"
          >
            🗂 Xem cả 24 mẫu
          </button>
        </div>
      )}

      {/* kho 24 mẫu */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-1">
              <button
                onClick={() => setExpanded(false)}
                className="mb-2 w-full rounded-xl px-3 py-2 text-xs font-extrabold text-[#6f5a68] ring-1 ring-[#ead9cd] transition-colors hover:bg-[var(--cream)]"
              >
                ▴ Thu gọn về 6 mẫu gợi ý
              </button>

              {/* tìm kiếm */}
              <div className="relative">
                <input
                  type="text"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Tìm mẫu… (vd: bộ thủ, HSK, thư pháp)"
                  className="w-full rounded-xl bg-white px-3 py-2 pr-8 text-xs font-semibold text-[#4f3d4a] ring-1 ring-[#ead9cd] placeholder:text-[#c9a2b3] focus:outline-none focus:ring-2 focus:ring-[#f0b9c9]"
                  aria-label="Tìm mẫu giấy"
                />
                {q && (
                  <button
                    onClick={() => setQ('')}
                    aria-label="Xoá từ khoá"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#b58fa0] hover:text-[#d2495f]"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* lọc cấp độ */}
              <div className="mt-2 flex flex-wrap gap-1.5">
                <button
                  onClick={() => setLevel('all')}
                  aria-pressed={level === 'all'}
                  className={`rounded-full px-2.5 py-1 text-[10.5px] font-bold transition-all ${
                    level === 'all' ? 'bg-[#4f3d4a] text-white shadow-[0_2px_0_0_#3a2d36]' : 'bg-white text-[#6f5a68] ring-1 ring-[#ead9cd] hover:bg-[var(--cream)]'
                  }`}
                >
                  Tất cả cấp độ
                </button>
                {TEMPLATE_LEVELS.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setLevel(level === l.id ? 'all' : l.id)}
                    aria-pressed={level === l.id}
                    className={`rounded-full px-2.5 py-1 text-[10.5px] font-bold transition-all ${
                      level === l.id ? 'bg-[#4f3d4a] text-white shadow-[0_2px_0_0_#3a2d36]' : 'bg-white text-[#6f5a68] ring-1 ring-[#ead9cd] hover:bg-[var(--cream)]'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>

              {/* lọc nhóm */}
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                <button
                  onClick={() => setGroup('all')}
                  aria-pressed={group === 'all'}
                  className={`rounded-full px-2.5 py-1 text-[10.5px] font-bold transition-all ${
                    group === 'all' ? 'bg-[#e8737f] text-white shadow-[0_2px_0_0_#d1708f]' : 'bg-white text-[#6f5a68] ring-1 ring-[#ead9cd] hover:bg-[var(--cream)]'
                  }`}
                >
                  Tất cả nhóm
                </button>
                {TEMPLATE_GROUPS.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setGroup(group === g.id ? 'all' : g.id)}
                    aria-pressed={group === g.id}
                    className={`rounded-full px-2.5 py-1 text-[10.5px] font-bold transition-all ${
                      group === g.id ? 'bg-[#e8737f] text-white shadow-[0_2px_0_0_#d1708f]' : 'bg-white text-[#6f5a68] ring-1 ring-[#ead9cd] hover:bg-[var(--cream)]'
                    }`}
                  >
                    {g.name}
                  </button>
                ))}
              </div>

              <p className="mt-2 text-[11px] font-bold text-[#8d7484]">Tìm thấy {filtered.length} mẫu</p>

              {/* danh sách theo nhóm */}
              <div className="custom-scroll mt-1.5 max-h-[26rem] space-y-3 overflow-y-auto pr-1">
                {favFirst.length === 0 && (
                  <p className="rounded-lg bg-white px-3 py-4 text-center text-xs font-semibold text-[#b58fa0] ring-1 ring-[#ead9cd]">
                    🐰 Không có mẫu nào khớp — thử từ khoá khác nhé
                  </p>
                )}
                {favFirst.map((g) => (
                  <div key={g.id}>
                    <p className="text-xs font-extrabold text-[#4f3d4a]">
                      {g.name} <span className="text-[#b58fa0]">({g.items.length})</span>
                      <span className="ml-1.5 text-[10px] font-semibold text-[#b58fa0]">{g.desc}</span>
                    </p>
                    <div className="mt-1.5 space-y-1.5">
                      {g.items.map((t) => (
                        <TemplateCard key={t.id} t={t} active={activeId === t.id} fav={favs.includes(t.id)} onPick={() => onPick(t)} onFav={() => onFav(t.id)} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
