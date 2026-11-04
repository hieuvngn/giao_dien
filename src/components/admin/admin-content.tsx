'use client'

import { useMemo, useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { GROUPS, ROADMAP_LEVELS } from '@/data/roadmap'
import type { RoadmapGroup } from '@/data/roadmap'
import { Badge, EmptyState, Pager, RowBtn, Switch, TableShell, normSearch, type BadgeTone } from './admin-ui'

/* ============================================================
   Quản trị · Nội dung học tập
   - LessonsSection: quản lý 4 lộ trình (HSK / YCT / Boya / Hán ngữ)
   - VocabSection: quản lý toàn bộ kho từ vựng (dữ liệu thật 700+ mục)
   ============================================================ */

const GROUP_TONE: Record<RoadmapGroup, BadgeTone> = { hsk: 'pink', yct: 'mint', boya: 'sky', hanyu: 'peach' }
const GROUP_LABEL: Record<RoadmapGroup, string> = { hsk: 'HSK 3.0', yct: 'YCT', boya: 'Boya', hanyu: 'Hán ngữ' }

/* ================= Bài học & Lộ trình ================= */

type PubState = Record<string, boolean>

const initialPublish = () => {
  const map: PubState = {}
  ROADMAP_LEVELS.forEach((l) => (map[l.slug] = true))
  map['boya-3'] = false
  map['hanyu-5'] = false
  return map
}

export function LessonsSection() {
  const { toast } = useToast()
  const [group, setGroup] = useState<RoadmapGroup>('hsk')
  const [pub, setPub] = useState<PubState>(initialPublish)

  const levels = ROADMAP_LEVELS.filter((l) => l.group === group)

  const toggleLevel = (slug: string, name: string, next: boolean) => {
    setPub((p) => ({ ...p, [slug]: next }))
    toast({
      title: next ? `Đã xuất bản "${name}" 📤` : `Đã chuyển "${name}" về bản nháp 📥`,
      description: 'Demo — trạng thái chỉ lưu trong phiên này.',
    })
  }

  return (
    <section aria-label="Quản lý bài học và lộ trình" className="paper-scrap rounded-3xl p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold text-[#4f3d4a]">
            Bài học &amp; Lộ trình <span className="ml-1 font-cn text-base text-[#e88aa6]">课程管理</span>
          </h2>
          <p className="mt-0.5 text-xs font-semibold text-[#8d7484]">
            {ROADMAP_LEVELS.length} cấp độ · 4 giáo trình · bật/tắt xuất bản từng cấp độ.
          </p>
        </div>
        <button
          type="button"
          onClick={() => toast({ title: 'Mở form thêm bài học (demo) ✨', description: 'Trong bản thật sẽ có trình soạn bài với từ vựng, ngữ pháp, audio.' })}
          className="rounded-xl bg-[#4f3d4a] px-3.5 py-2 text-xs font-extrabold text-white shadow-[0_3px_0_0_#3a2d36] transition-all hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none"
        >
          ＋ Thêm bài học
        </button>
      </div>

      {/* pill chọn giáo trình */}
      <div className="mt-4 flex flex-wrap gap-1.5" role="tablist" aria-label="Chọn giáo trình">
        {(Object.keys(GROUPS) as RoadmapGroup[]).map((g) => (
          <button
            key={g}
            type="button"
            role="tab"
            aria-selected={group === g}
            onClick={() => setGroup(g)}
            className={`rounded-full px-3.5 py-1.5 text-[11px] font-extrabold ring-1 transition-all ${
              group === g
                ? 'bg-[#4f3d4a] text-white ring-[#4f3d4a] shadow-sm'
                : 'bg-white/60 text-[#6f5a68] ring-[#ead9cd] hover:bg-[var(--pastel-butter)]/50'
            }`}
          >
            {GROUPS[g].name.replace('Lộ trình ', '').replace(' · Tiếng Trung thiếu nhi', '')} ·{' '}
            {ROADMAP_LEVELS.filter((l) => l.group === g).length} cấp
          </button>
        ))}
      </div>

      {/* danh sách cấp độ */}
      <ul className="mt-4 space-y-2">
        {levels.map((l) => (
          <li
            key={l.slug}
            className="flex flex-wrap items-center gap-3 rounded-2xl bg-white/55 px-3.5 py-3 ring-1 ring-[#f2e4da] transition hover:bg-white/80"
          >
            <span className="shrink-0">
              <Badge tone={GROUP_TONE[l.group]}>{l.code}</Badge>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-extrabold text-[#4f3d4a]">
                {l.vi} <span className="ml-1 font-cn text-[#b58fa0]">{l.cn}</span>
              </span>
              <span className="mt-0.5 block truncate text-[10px] font-semibold text-[#b58fa0]">
                {l.vocab.length} bài từ vựng · {l.grammar.length} điểm ngữ pháp · {l.words} từ chuẩn
              </span>
            </span>
            <span className="flex items-center gap-2">
              <span className="hidden text-[10px] font-bold text-[#8d7484] sm:inline">
                {pub[l.slug] ? 'Đang hiển thị' : 'Bản nháp'}
              </span>
              <Switch
                checked={pub[l.slug] ?? true}
                onChange={(v) => toggleLevel(l.slug, l.code, v)}
                label={`Xuất bản ${l.code}`}
              />
              <RowBtn
                onClick={() => toast({ title: `Sửa nội dung ${l.code} (demo) ✏️`, description: 'Trình soạn bài sẽ mở ở đây trong bản thật.' })}
                title={`Sửa ${l.code}`}
              >
                ✏️
              </RowBtn>
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-3 rounded-xl bg-[var(--pastel-butter)]/40 px-3 py-2 text-[10px] font-semibold text-[#8a6a1f] ring-1 ring-[#f2e2b8]">
        💡 Mẹo: cấp độ tắt xuất bản sẽ ẩn khỏi trang chủ và sidebar học tập ngay lập tức.
      </p>
    </section>
  )
}

/* ================= Từ vựng ================= */

type VocabRow = {
  cn: string
  pinyin: string
  vi: string
  pos?: string
  level: string
  group: RoadmapGroup
  topic: string
}

const ALL_VOCAB: VocabRow[] = ROADMAP_LEVELS.flatMap((lvl) =>
  lvl.vocab.flatMap((les) =>
    les.words.map((w) => ({
      cn: w.cn,
      pinyin: w.pinyin,
      vi: w.vi,
      pos: w.pos,
      level: lvl.code,
      group: lvl.group,
      topic: les.topic,
    })),
  ),
)

const LEVEL_CODES = ROADMAP_LEVELS.map((l) => l.code)
const VOCAB_PER_PAGE = 10

export function VocabSection() {
  const { toast } = useToast()
  const [rows, setRows] = useState<VocabRow[]>(ALL_VOCAB)
  const [q, setQ] = useState('')
  const [level, setLevel] = useState('all')
  const [page, setPage] = useState(1)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ cn: '', pinyin: '', vi: '', level: 'HSK 1' })

  const filtered = useMemo(() => {
    const nq = normSearch(q)
    return rows.filter((w) => {
      if (level !== 'all' && w.level !== level) return false
      if (nq && !normSearch(`${w.cn} ${w.pinyin} ${w.vi} ${w.topic ?? ''}`).includes(nq)) return false
      return true
    })
  }, [rows, q, level])

  const pages = Math.max(1, Math.ceil(filtered.length / VOCAB_PER_PAGE))
  const safePage = Math.min(page, pages)
  const view = filtered.slice((safePage - 1) * VOCAB_PER_PAGE, safePage * VOCAB_PER_PAGE)

  const addWord = () => {
    if (!form.cn.trim()) {
      toast({ title: 'Chưa nhập chữ Hán ✍️', description: 'Ô “Chữ Hán” là bắt buộc.' })
      return
    }
    const grp = (ROADMAP_LEVELS.find((l) => l.code === form.level)?.group ?? 'hsk') as RoadmapGroup
    setRows((prev) => [
      { cn: form.cn.trim(), pinyin: form.pinyin.trim() || '—', vi: form.vi.trim() || '(chưa có nghĩa)', level: form.level, group: grp, topic: 'Từ mới (admin)' },
      ...prev,
    ])
    setForm({ cn: '', pinyin: '', vi: '', level: form.level })
    setAdding(false)
    setPage(1)
    toast({ title: 'Đã thêm từ mới vào kho 📖', description: 'Từ sẽ xuất hiện trong từ điển sau khi đồng bộ (demo).' })
  }

  const removeWord = (w: VocabRow) => {
    setRows((prev) => prev.filter((x) => x.cn !== w.cn || x.level !== w.level || x.vi !== w.vi))
    toast({ title: `Đã xoá “${w.cn}” khỏi kho từ 🗑️` })
  }

  const selectCls =
    'rounded-xl bg-white/70 px-2.5 py-2 text-[11px] font-bold text-[#5d4a57] ring-1 ring-[#ead9cd] outline-none transition focus:ring-[#e8aa96]'
  const inputCls =
    'w-full rounded-xl bg-white/70 px-3 py-2 text-xs font-semibold text-[#5d4a57] ring-1 ring-[#ead9cd] outline-none transition placeholder:text-[#c9a2b3] focus:ring-[#e8aa96]'

  return (
    <section aria-label="Quản lý từ vựng" className="paper-scrap rounded-3xl p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold text-[#4f3d4a]">
            Kho từ vựng <span className="ml-1 font-cn text-base text-[#e88aa6]">词汇管理</span>
          </h2>
          <p className="mt-0.5 text-xs font-semibold text-[#8d7484]">
            Đang quản lý <b className="text-[#c2547e]">{rows.length}</b> mục · đọc trực tiếp từ dữ liệu các lộ trình.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          aria-expanded={adding}
          className="rounded-xl bg-[var(--pastel-mint)] px-3.5 py-2 text-xs font-extrabold text-[#3f6b50] ring-1 ring-[#a9cdb6] transition-all hover:-translate-y-0.5"
        >
          {adding ? '✕ Đóng form' : '＋ Thêm từ mới'}
        </button>
      </div>

      {/* form thêm từ */}
      {adding && (
        <div className="mt-4 rounded-2xl bg-[var(--pastel-butter)]/35 p-3.5 ring-1 ring-[#f2e2b8]">
          <div className="grid gap-2 sm:grid-cols-4">
            <input
              type="text"
              value={form.cn}
              onChange={(e) => setForm({ ...form, cn: e.target.value })}
              placeholder="Chữ Hán * ví dụ: 时间"
              className={inputCls}
              aria-label="Chữ Hán"
            />
            <input
              type="text"
              value={form.pinyin}
              onChange={(e) => setForm({ ...form, pinyin: e.target.value })}
              placeholder="Pinyin ví dụ: shíjiān"
              className={inputCls}
              aria-label="Pinyin"
            />
            <input
              type="text"
              value={form.vi}
              onChange={(e) => setForm({ ...form, vi: e.target.value })}
              placeholder="Nghĩa tiếng Việt"
              className={inputCls}
              aria-label="Nghĩa tiếng Việt"
            />
            <select
              value={form.level}
              onChange={(e) => setForm({ ...form, level: e.target.value })}
              className={selectCls}
              aria-label="Cấp độ"
            >
              {LEVEL_CODES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-2.5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="rounded-xl bg-white/70 px-3.5 py-2 text-[11px] font-extrabold text-[#6f5a68] ring-1 ring-[#ead9cd] transition hover:bg-white"
            >
              Huỷ
            </button>
            <button
              type="button"
              onClick={addWord}
              className="rounded-xl bg-[#4f3d4a] px-3.5 py-2 text-[11px] font-extrabold text-white shadow-[0_3px_0_0_#3a2d36] transition-all hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none"
            >
              💾 Lưu vào kho
            </button>
          </div>
        </div>
      )}

      {/* tìm kiếm + lọc */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setPage(1)
          }}
          placeholder="🔍 Tìm chữ Hán, pinyin hoặc nghĩa…"
          className="min-w-52 flex-1 rounded-xl bg-white/70 px-3.5 py-2 text-xs font-semibold text-[#5d4a57] ring-1 ring-[#ead9cd] outline-none transition placeholder:text-[#c9a2b3] focus:ring-[#e8aa96]"
          aria-label="Tìm kiếm từ vựng"
        />
        <select
          value={level}
          onChange={(e) => {
            setLevel(e.target.value)
            setPage(1)
          }}
          className={selectCls}
          aria-label="Lọc theo cấp độ"
        >
          <option value="all">Mọi cấp độ</option>
          {LEVEL_CODES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* bảng từ */}
      <div className="mt-4">
        {view.length === 0 ? (
          <EmptyState emoji="🔍" text="Không có từ nào khớp — thử từ khoá khác nhé." />
        ) : (
          <TableShell head={['Chữ Hán', 'Pinyin', 'Nghĩa', 'Từ loại', 'Cấp độ', 'Chủ đề', '']}>
            {view.map((w, i) => (
              <tr key={`${w.cn}-${w.level}-${i}`} className="group">
                <td className="border-b border-dashed border-[#f2e4da] px-3 py-2">
                  <span className="font-cn text-lg text-[#4f3d4a]">{w.cn}</span>
                </td>
                <td className="border-b border-dashed border-[#f2e4da] px-3 py-2 text-xs font-semibold italic text-[#8d7484]">{w.pinyin}</td>
                <td className="border-b border-dashed border-[#f2e4da] px-3 py-2 text-xs font-bold text-[#5d4a57]">{w.vi}</td>
                <td className="border-b border-dashed border-[#f2e4da] px-3 py-2 text-[11px] font-semibold text-[#8d7484]">{w.pos ?? '—'}</td>
                <td className="border-b border-dashed border-[#f2e4da] px-3 py-2">
                  <Badge tone={GROUP_TONE[w.group]}>{w.level}</Badge>
                </td>
                <td className="border-b border-dashed border-[#f2e4da] px-3 py-2 text-[11px] font-semibold text-[#8d7484]">{w.topic}</td>
                <td className="border-b border-dashed border-[#f2e4da] px-3 py-2">
                  <div className="flex justify-end">
                    <RowBtn onClick={() => removeWord(w)} title={`Xoá ${w.cn}`} danger>
                      🗑
                    </RowBtn>
                  </div>
                </td>
              </tr>
            ))}
          </TableShell>
        )}
      </div>

      <div className="mt-3">
        <Pager page={safePage} pages={pages} onPage={setPage} />
      </div>
    </section>
  )
}
