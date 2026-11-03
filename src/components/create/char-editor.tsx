'use client'

import { charPinyin } from '@/lib/data'

/* ============================================================
   CharEditor — "Sửa nghĩa và phiên âm" theo tham chiếu
   xiehanzi: mỗi chữ trong danh sách có thể chỉnh pinyin /
   nghĩa Việt; giá trị chỉnh tay đè lên dữ liệu tự động.
   ============================================================ */

export type CharMeta = Record<string, { py?: string; vi?: string }>

export default function CharEditor({
  chars,
  meta,
  onChange,
}: {
  chars: string[]
  meta: CharMeta
  onChange: (next: CharMeta) => void
}) {
  const setOne = (ch: string, patch: { py?: string; vi?: string }) => {
    onChange({ ...meta, [ch]: { ...meta[ch], ...patch } })
  }
  const resetOne = (ch: string) => {
    const next = { ...meta }
    delete next[ch]
    onChange(next)
  }

  return (
    <div className="custom-scroll mt-2 max-h-60 space-y-1.5 overflow-y-auto rounded-xl bg-[var(--cream)] p-2 ring-1 ring-[#ead9cd]">
      <p className="px-1 text-[10.5px] font-bold text-[#8d7484]">
        Chỉnh tay sẽ đè lên phiên âm &amp; nghĩa tự động — bấm ↺ để trả về mặc định.
      </p>
      {chars.map((ch) => {
        const over = meta[ch]
        return (
          <div key={ch} className="flex items-center gap-2 rounded-lg bg-white px-2 py-1.5 ring-1 ring-[#ead9cd]">
            <span className="font-cn grid h-8 w-8 shrink-0 place-items-center rounded-md bg-[var(--pastel-pink-soft)] text-lg leading-none text-[#4f3d4a]">
              {ch}
            </span>
            <input
              type="text"
              value={over?.py ?? ''}
              onChange={(e) => setOne(ch, { py: e.target.value })}
              placeholder={charPinyin(ch) || 'pinyin'}
              aria-label={`Phiên âm của ${ch}`}
              className="w-24 shrink-0 rounded-md bg-[var(--cream)] px-2 py-1.5 text-[11px] font-bold text-[#c2547e] ring-1 ring-[#ead9cd] placeholder:text-[#c9a2b3]/70 focus:outline-none focus:ring-2 focus:ring-[#f0b9c9]"
            />
            <input
              type="text"
              value={over?.vi ?? ''}
              onChange={(e) => setOne(ch, { vi: e.target.value })}
              placeholder="nghĩa tiếng Việt"
              aria-label={`Nghĩa của ${ch}`}
              className="min-w-0 flex-1 rounded-md bg-[var(--cream)] px-2 py-1.5 text-[11px] font-semibold text-[#4f3d4a] ring-1 ring-[#ead9cd] placeholder:text-[#c9a2b3]/70 focus:outline-none focus:ring-2 focus:ring-[#f0b9c9]"
            />
            <button
              onClick={() => resetOne(ch)}
              disabled={!over}
              aria-label={`Trả về mặc định cho ${ch}`}
              className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold text-[#8d7484] transition-colors hover:bg-[var(--pastel-butter)]/60 disabled:opacity-30"
            >
              ↺
            </button>
          </div>
        )
      })}
    </div>
  )
}
