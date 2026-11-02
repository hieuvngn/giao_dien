'use client'

import { Fragment, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Footer from '../landing/footer'
import { PushPin, Reveal, SectionHeading, WashiTape } from '../landing/decor'
import { PARAGRAPH_SAMPLES, VOCAB_PRESETS, charPinyin, wordPinyin } from '@/lib/data'
import { MEANING_MAP, type DbWord } from '@/lib/vocab-db'
import { RADICALS, type Radical } from '@/data/radicals'
import { useToast } from '@/hooks/use-toast'
import WordPicker from './word-picker'
import StrokeChar from './stroke-char'

/* ============================================================
   Tạo vở tập viết chữ Hán — Route: #/create-file
   6 bố cục: chuẩn từng chữ · bảng thông tin · văn bản liên tục ·
   bộ thủ · thứ tự nét · ô chữ lớn — + nền pastel + watermark
   ============================================================ */

type PaperType = 'tian' | 'mi' | 'square' | 'line'
type PaperBg = 'white' | 'cream' | 'pink' | 'mint' | 'butter'
type LayoutMode = 'std' | 'info' | 'flow' | 'radical' | 'stroke' | 'bigchar'
type RadFilter = 'all' | '1-2' | '3-4' | '5-6' | '7+'

const PAPERS: { id: PaperType; label: string; cn: string; desc: string }[] = [
  { id: 'tian', label: 'Ô chữ giữa', cn: '田字格', desc: 'Ngang dọc giữa ô' },
  { id: 'mi', label: 'Ô tám hướng', cn: '米字格', desc: 'Kèm đường chéo' },
  { id: 'square', label: 'Ô vuông', cn: '方格', desc: 'Ô trơn đơn giản' },
  { id: 'line', label: 'Dòng kẻ', cn: '横线', desc: 'Kẻ dòng ngang' },
]

/* nền giấy pastel theo style trang — in PDF vẫn giữ màu nhờ .ink-exact */
const BACKDROPS: { id: PaperBg; label: string; cn: string; bg: string }[] = [
  { id: 'white', label: 'Trắng tinh', cn: '白', bg: '#ffffff' },
  { id: 'cream', label: 'Kem vintage', cn: '米', bg: '#fffdf4' },
  { id: 'pink', label: 'Hồng đào', cn: '粉', bg: '#fff4f7' },
  { id: 'mint', label: 'Xanh mint', cn: '青', bg: '#f0f8f2' },
  { id: 'butter', label: 'Vàng bơ', cn: '黄', bg: '#fff8e4' },
]

const LAYOUTS: { id: LayoutMode; label: string; cn: string; desc: string }[] = [
  { id: 'std', label: 'Chuẩn từng chữ', cn: '标准', desc: 'Hàng chữ mẫu + hàng trống để chép' },
  { id: 'info', label: 'Bảng thông tin', cn: '信息表', desc: 'Bảng chữ · pinyin · nghĩa + ô luyện' },
  { id: 'flow', label: 'Văn bản liên tục', cn: '文章', desc: 'Đoạn văn chảy đều từng ô trên trang' },
  { id: 'radical', label: 'Bộ thủ', cn: '部首', desc: 'Luyện bộ thủ kèm chữ mẫu chứa nó' },
  { id: 'stroke', label: 'Thứ tự nét', cn: '笔顺', desc: 'Chữ đỏ chỉ thứ tự nét + hàng chữ mờ để tô' },
  { id: 'bigchar', label: 'Ô chữ lớn', cn: '大字格', desc: 'Chữ mẫu to · pinyin · nghĩa + hàng ô tô' },
]

/* tiêu đề đầu trang vở theo bố cục */
const SHEET_HEAD: Record<LayoutMode, { vi: string; cn: string; color: string }> = {
  std: { vi: 'Tập viết chữ Hán', cn: '练字本', color: '#e88aa6' },
  info: { vi: 'Bảng thông tin từ vựng', cn: '信息表', color: '#46688f' },
  flow: { vi: 'Tập chép văn bản', cn: '课文', color: '#3f6b50' },
  radical: { vi: 'Luyện viết bộ thủ', cn: '部首练习', color: '#c07a2c' },
  stroke: { vi: 'Luyện viết theo thứ tự nét', cn: '笔顺练习', color: '#d2495f' },
  bigchar: { vi: 'Ô chữ lớn', cn: '大字格', color: '#46688f' },
}

const STROKE_RANGES: { id: RadFilter; label: string; test: (s: number) => boolean }[] = [
  { id: 'all', label: 'Tất cả', test: () => true },
  { id: '1-2', label: '1–2 nét', test: (s) => s <= 2 },
  { id: '3-4', label: '3–4 nét', test: (s) => s >= 3 && s <= 4 },
  { id: '5-6', label: '5–6 nét', test: (s) => s >= 5 && s <= 6 },
  { id: '7+', label: '7+ nét', test: (s) => s >= 7 },
]

const MAX_WORDS = 200
const PRINT_CAP = 20

type CellItem = { ch: string; py: string; v?: 'model' | 'trace' | 'stroke' }
type InfoRow = { n: number; cn: string; py: string; vi: string }
type StrokeBlock = { word: string; py: string; vi: string; rows: (CellItem | null)[][] }
type BigBand = { ch: string; py: string; vi: string }

const isHan = (c: string) => /\p{Script=Han}/u.test(c)
const radicalMeaning = (c: string) => RADICALS.find((r) => r.char === c || r.variant === c)?.meaning ?? ''
const blankRow = (cols: number): (CellItem | null)[] => Array<CellItem | null>(cols).fill(null)

/* ================= dựng trang — bố cục CHUẨN TỪNG CHỮ ================= */

/* Sắp trang kiểu sách tập viết: mỗi từ chiếm `repeat` hàng liên tiếp —
   hàng đầu là hàng mẫu (từ lặp lại nhiều lần), các hàng sau trống để chép theo.
   modelCell = false → hàng mẫu cũng trống (vở luyện hoàn toàn) */
function buildSheets(words: string[], repeat: number, cols: number, rows: number, modelCell: boolean): (CellItem | null)[][][] {
  const pages: (CellItem | null)[][][] = []
  let page: (CellItem | null)[][] = []
  const pushRow = (row: (CellItem | null)[]) => {
    page.push(row)
    if (page.length === rows) {
      pages.push(page)
      page = []
    }
  }
  words.forEach((w) => {
    const chars = [...w]
    const perRow = Math.max(1, Math.floor(cols / chars.length))
    const sampleRow: (CellItem | null)[] = []
    if (modelCell) {
      for (let k = 0; k < perRow; k++) {
        chars.forEach((ch) => sampleRow.push({ ch, py: charPinyin(ch) }))
      }
    }
    while (sampleRow.length < cols) sampleRow.push(null)
    pushRow(sampleRow)
    for (let r = 1; r < repeat; r++) pushRow(blankRow(cols))
  })
  if (page.length) pages.push(page)
  return pages.length ? pages : [blankPage(cols, rows)]
}

function blankPage(cols: number, rows: number): (CellItem | null)[][] {
  return Array.from({ length: rows }, () => blankRow(cols))
}

/* ================= dựng trang — bố cục BỘ THỦ ================= */

/* Mỗi bộ thủ: 1 hàng mẫu (bộ thủ + các chữ chứa nó) + practiceRows hàng trống */
function buildRadicalSheets(list: Radical[], practiceRows: number, cols: number, rows: number): (CellItem | null)[][][] {
  const pages: (CellItem | null)[][][] = []
  let page: (CellItem | null)[][] = []
  const pushRow = (row: (CellItem | null)[]) => {
    page.push(row)
    if (page.length === rows) {
      pages.push(page)
      page = []
    }
  }
  list.forEach((r) => {
    const row: (CellItem | null)[] = [{ ch: r.char, py: r.pinyin }]
    for (const w of r.words) {
      if (row.length >= cols) break
      row.push({ ch: w.c, py: w.p })
    }
    while (row.length < cols) row.push(null)
    pushRow(row)
    for (let p = 0; p < practiceRows; p++) pushRow(blankRow(cols))
  })
  if (page.length) pages.push(page)
  return pages.length ? pages : [blankPage(cols, rows)]
}

/* ================= dựng trang — bố cục VĂN BẢN LIÊN TỤC ================= */

/* Mỗi chữ một ô, chảy liền mạch hết hàng này sang hàng khác, hết trang đổi trang */
function buildFlowPages(text: string, cols: number, rows: number): (CellItem | null)[][][] {
  const chars = [...text].filter((c) => c.trim() !== '')
  if (!chars.length) return [blankPage(cols, rows)]
  const pyCache = new Map<string, string>()
  const perPage = cols * rows
  const pages: (CellItem | null)[][][] = []
  for (let i = 0; i < chars.length; i += perPage) {
    const slice = chars.slice(i, i + perPage)
    const page: (CellItem | null)[][] = []
    for (let r = 0; r < rows; r++) {
      const rowCells = slice.slice(r * cols, (r + 1) * cols).map((c) => {
        let py = pyCache.get(c)
        if (py === undefined) {
          py = isHan(c) ? charPinyin(c) : ''
          pyCache.set(c, py)
        }
        return { ch: c, py } as CellItem
      })
      while (rowCells.length < cols) rowCells.push(null)
      page.push(rowCells)
    }
    pages.push(page)
  }
  return pages
}

/* ================= dựng trang — bố cục THỨ TỰ NÉT ================= */

/* Mỗi từ 1 khối: dòng tiêu đề (từ · pinyin · nghĩa · sơ đồ thứ tự nét)
   + 1 hàng chữ đỏ lặp đầy hàng + các hàng chữ mờ để tô theo.          */
function buildStrokePages(words: string[], repeat: number, cols: number, rows: number): StrokeBlock[][] {
  const blocks: StrokeBlock[] = words.map((w) => {
    const chars = [...w]
    const py = wordPinyin(w)
    const vi = MEANING_MAP.get(w) ?? ''
    const modelRow: (CellItem | null)[] = []
    for (let c = 0; c < cols; c++) modelRow.push({ ch: chars[c % chars.length], py: charPinyin(chars[c % chars.length]), v: 'model' })
    const rowsAll: (CellItem | null)[][] = [modelRow]
    for (let r = 0; r < Math.max(0, repeat - 1); r++) {
      const row: (CellItem | null)[] = []
      for (let c = 0; c < cols; c++) row.push({ ch: chars[c % chars.length], py: '', v: 'trace' })
      rowsAll.push(row)
    }
    return { word: w, py, vi, rows: rowsAll }
  })
  const perPage = Math.max(1, Math.floor((rows + 0.55) / (repeat + 0.45)))
  const pages: StrokeBlock[][] = []
  for (let i = 0; i < blocks.length; i += perPage) pages.push(blocks.slice(i, i + perPage))
  return pages.length ? pages : [[]]
}

/* ================= dựng trang — bố cục Ô CHỮ LỚN ================= */

/* Tách từng ký tự: mỗi chữ 1 dải — chữ mẫu to + pinyin + nghĩa,
   bên dưới là hàng ô chữ mờ để tô.                              */
function buildBigPages(words: string[], rows: number): BigBand[][] {
  const bands: BigBand[] = []
  const seen = new Set<string>()
  words.forEach((w) =>
    [...w].forEach((c) => {
      if (!isHan(c) || seen.has(c)) return
      seen.add(c)
      bands.push({ ch: c, py: charPinyin(c), vi: MEANING_MAP.get(c) ?? radicalMeaning(c) })
    }),
  )
  const perPage = Math.max(1, Math.floor(rows / 2))
  const pages: BigBand[][] = []
  for (let i = 0; i < bands.length; i += perPage) pages.push(bands.slice(i, i + perPage))
  return pages.length ? pages : [[]]
}

/* ================= dựng trang — bố cục BẢNG THÔNG TIN ================= */

function buildInfoRows(words: string[]): InfoRow[] {
  return words.map((w, i) => ({ n: i + 1, cn: w, py: wordPinyin(w), vi: MEANING_MAP.get(w) ?? '' }))
}

function chunkInfoPages(rowsAll: InfoRow[], per: number): (InfoRow | null)[][] {
  if (!rowsAll.length) return [Array<InfoRow | null>(per).fill(null)]
  const pages: (InfoRow | null)[][] = []
  for (let i = 0; i < rowsAll.length; i += per) {
    const chunk = rowsAll.slice(i, i + per)
    while (chunk.length < per) chunk.push(null)
    pages.push(chunk)
  }
  return pages
}

/* ================= trang giấy (dùng chung preview + in) ================= */

function StrokeCell({ it, paper }: { it: CellItem | null; paper: PaperType }) {
  const cls =
    paper === 'tian' ? 'han-cell han-tian' : paper === 'mi' ? 'han-cell han-mi' : paper === 'line' ? 'han-cell han-line' : 'han-cell'
  return (
    <div className={`${cls} grid min-h-0 place-items-center`} style={{ containerType: 'size' }}>
      {it && (
        <div className="flex h-full w-full flex-col items-center justify-center gap-[3cqw]">
          {it.py && (
            <span className="font-semibold leading-none text-[#e88aa6]" style={{ fontSize: '12cqw' }}>
              {it.py}
            </span>
          )}
          {it.v === 'trace' ? (
            <span className="font-cn leading-none text-[#4f3d4a]" style={{ fontSize: '48cqw', opacity: 0.16 }}>
              {it.ch}
            </span>
          ) : (
            <span className="font-cn leading-none text-[#d2495f]" style={{ fontSize: '48cqw', opacity: 0.88 }}>
              {it.ch}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

function Sheet({
  layout,
  paper,
  bg,
  cols,
  rows,
  gridData,
  infoRows,
  practiceCells,
  showPinyin,
  fadeModel = false,
  strokeBlocks = null,
  bigBands = null,
  traceCells = 8,
  wmText = '',
}: {
  layout: LayoutMode
  paper: PaperType
  bg: string
  cols: number
  rows: number
  gridData: (CellItem | null)[][]
  infoRows: (InfoRow | null)[] | null
  practiceCells: number
  showPinyin: boolean
  fadeModel?: boolean
  strokeBlocks?: StrokeBlock[] | null
  bigBands?: BigBand[] | null
  traceCells?: number
  wmText?: string
}) {
  const cellCls =
    paper === 'tian' ? 'han-cell han-tian' : paper === 'mi' ? 'han-cell han-mi' : paper === 'line' ? 'han-cell han-line' : 'han-cell'
  const head = SHEET_HEAD[layout]
  const charOpacity = fadeModel ? 0.28 : 1

  return (
    <div
      className="ink-exact relative flex h-full w-full flex-col text-[#4f3d4a]"
      style={{ background: bg, containerType: 'inline-size' }}
    >
      {/* watermark in chéo giữa trang (preview + PDF) */}
      {wmText && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 grid select-none place-items-center overflow-hidden">
          <span
            className="wm-mark font-display font-bold"
            style={{ fontSize: wmText.length > 14 ? '8cqw' : wmText.length > 8 ? '11cqw' : '15cqw' }}
          >
            {wmText}
          </span>
        </div>
      )}

      {/* đầu trang vở */}
      <div className="flex items-end justify-between gap-3 border-b-2 border-dashed border-[#eac6d2] pb-2">
        <p className="font-display text-sm font-bold sm:text-base">
          {head.vi} <span className="font-cn" style={{ color: head.color }}>{head.cn}</span>
        </p>
        <p className="text-[10px] font-semibold text-[#8d7484] sm:text-xs">
          Tên <span className="inline-block w-16 border-b border-[#c9a2b3] sm:w-24" /> · Ngày{' '}
          <span className="inline-block w-12 border-b border-[#c9a2b3] sm:w-16" />
        </p>
      </div>

      {/* lưới ô tập viết — chuẩn · liên tục · bộ thủ */}
      {infoRows === null && layout !== 'stroke' && layout !== 'bigchar' && (
        <div
          className="mt-2 grid flex-1 gap-[3px]"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}
        >
          {Array.from({ length: rows * cols }).map((_, i) => {
            const ri = Math.floor(i / cols)
            const ci = i % cols
            const it = gridData[ri]?.[ci] ?? null
            return (
              <div key={i} className={`${cellCls} grid place-items-center`} style={{ containerType: 'size' }}>
                {it && (
                  <div className="flex h-full w-full flex-col items-center justify-center">
                    {showPinyin && it.py && (
                      <span className="font-semibold leading-none text-[#e88aa6]" style={{ fontSize: '14cqw' }}>
                        {it.py}
                      </span>
                    )}
                    <span
                      className="font-cn leading-none text-[#4f3d4a]"
                      style={{ fontSize: '52cqw', opacity: charOpacity }}
                    >
                      {it.ch}
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* khối luyện THỨ TỰ NÉT: tiêu đề từ + hàng mẫu đỏ + hàng tô mờ */}
      {strokeBlocks && strokeBlocks.length > 0 && (
        <div className="mt-1.5 flex min-h-0 flex-1 flex-col gap-[2cqw]">
          {strokeBlocks.map((b, bi) => (
            <div key={bi} className="flex min-h-0 flex-1 flex-col gap-[1.2cqw]">
              <div className="flex items-center gap-[1.6cqw] border-b border-dashed border-[#eac6d2] pb-[0.5cqw]">
                <span className="font-cn font-bold leading-none text-[#4f3d4a]" style={{ fontSize: '4.6cqw' }}>
                  {b.word}
                </span>
                <span className="font-semibold leading-none text-[#e88aa6]" style={{ fontSize: '3.3cqw' }}>
                  {b.py}
                </span>
                {b.vi && (
                  <span className="min-w-0 truncate font-semibold leading-none text-[#8d7484]" style={{ fontSize: '3cqw' }}>
                    {b.vi}
                  </span>
                )}
                <span className="ml-auto flex shrink-0 items-center gap-[1cqw]">
                  {[...b.word].slice(0, 4).map((c, ci) => (
                    <StrokeChar key={`${c}-${ci}`} ch={c} size={7.4} />
                  ))}
                </span>
                <span
                  className="shrink-0 rounded-full bg-[var(--pastel-pink-soft)] px-[1.8cqw] py-[0.6cqw] font-bold text-[#8a4a63]"
                  style={{ fontSize: '2.5cqw' }}
                >
                  笔顺
                </span>
              </div>
              <div
                className="grid min-h-0 flex-1 gap-[3px]"
                style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${b.rows.length}, 1fr)` }}
              >
                {b.rows.flat().map((it, i) => (
                  <StrokeCell key={i} it={it} paper={paper} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* dải Ô CHỮ LỚN: chữ mẫu to + pinyin + nghĩa + hàng ô tô mờ */}
      {bigBands && bigBands.length > 0 && (
        <div className="mt-1.5 flex min-h-0 flex-1 flex-col gap-[2.4cqw]">
          {bigBands.map((b, bi) => (
            <div key={bi} className="flex min-h-0 flex-1 flex-col gap-[1.2cqw]">
              <div className="flex min-h-0 items-stretch gap-[2.4cqw]" style={{ flex: 1.25 }}>
                <div className={`${cellCls} grid shrink-0 place-items-center self-center`} style={{ height: '92%', aspectRatio: '1', containerType: 'size' }}>
                  <span className="font-cn leading-none text-[#4f3d4a]" style={{ fontSize: '56cqw' }}>
                    {b.ch}
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-center gap-[1.2cqw]">
                  <p className="truncate font-bold leading-none text-[#e88aa6]" style={{ fontSize: '4.4cqw' }}>
                    {b.py}
                  </p>
                  <p className="truncate font-semibold leading-none text-[#6f5a68]" style={{ fontSize: '3.6cqw' }}>
                    {b.vi || '—'}
                  </p>
                  <p className="truncate font-semibold leading-none text-[#b58fa0]" style={{ fontSize: '2.7cqw' }}>
                    Tô theo chữ mẫu · 描红
                  </p>
                </div>
                <div className="shrink-0 self-center" style={{ height: '78%', aspectRatio: '1', containerType: 'size' }}>
                  <StrokeChar ch={b.ch} />
                </div>
              </div>
              <div className="grid min-h-0 flex-1 gap-[3px]" style={{ gridTemplateColumns: `repeat(${traceCells}, 1fr)` }}>
                {Array.from({ length: traceCells }).map((_, ci) => (
                  <div key={ci} className={`${cellCls} grid min-h-0 place-items-center`} style={{ containerType: 'size' }}>
                    <span className="font-cn leading-none text-[#4f3d4a]" style={{ fontSize: '52cqw', opacity: 0.15 }}>
                      {b.ch}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* bảng thông tin từ vựng */}
      {infoRows !== null && (
        <div className="mt-2 flex-1" style={{ containerType: 'inline-size' }}>
          <div
            className="grid h-full gap-[3px]"
            style={{
              gridTemplateColumns: `1.6rem 1.1fr 1.25fr 1.7fr repeat(${practiceCells}, minmax(0, 0.75fr))`,
              gridTemplateRows: `repeat(${rows + 1}, 1fr)`,
            }}
          >
            {/* hàng tiêu đề */}
            {['#', '汉字 · Chữ Hán', 'Pinyin', 'Nghĩa Việt'].map((h) => (
              <div
                key={h}
                className="grid place-items-center rounded-[2.5px] border border-[#ecc2cf] bg-[var(--pastel-pink-soft)] px-0.5 text-center font-bold text-[#8a4a63]"
                style={{ fontSize: '1.8cqw' }}
              >
                {h}
              </div>
            ))}
            <div
              className="grid place-items-center rounded-[2.5px] border border-[#ecc2cf] bg-[var(--pastel-pink-soft)] px-0.5 text-center font-bold text-[#8a4a63]"
              style={{ fontSize: '1.8cqw', gridColumn: `span ${practiceCells}` }}
            >
              Luyện viết · 写
            </div>

            {/* các hàng từ */}
            {infoRows.map((r, ri) => (
              <Fragment key={ri}>
                <div
                  className="grid place-items-center overflow-hidden rounded-[2.5px] border border-[#ecc2cf] bg-white font-bold text-[#b58fa0]"
                  style={{ fontSize: '1.9cqw' }}
                >
                  {r ? r.n : ''}
                </div>
                <div
                  className={`grid place-items-center overflow-hidden rounded-[2.5px] border border-[#ecc2cf] bg-white ${cellCls}`}
                  style={{ fontSize: '4.6cqw' }}
                >
                  <span className="font-cn leading-tight" style={{ opacity: r ? 1 : 0 }}>
                    {r?.cn ?? '·'}
                  </span>
                </div>
                <div
                  className="grid place-items-center overflow-hidden rounded-[2.5px] border border-[#ecc2cf] bg-white px-0.5 text-center font-semibold text-[#e88aa6]"
                  style={{ fontSize: '2.1cqw' }}
                >
                  {showPinyin ? r?.py : ''}
                </div>
                <div
                  className="grid place-items-center overflow-hidden rounded-[2.5px] border border-[#ecc2cf] bg-white px-0.5 text-center font-semibold text-[#6f5a68]"
                  style={{ fontSize: '2cqw' }}
                >
                  {r?.vi || ''}
                </div>
                {Array.from({ length: practiceCells }).map((_, ci) => (
                  <div key={ci} className={cellCls} />
                ))}
              </Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ================= nhóm chức năng ================= */

function Group({
  n,
  title,
  cn,
  tape,
  children,
}: {
  n: number
  title: string
  cn: string
  tape: string
  children: React.ReactNode
}) {
  return (
    <div className="paper-scrap relative rounded-2xl p-4">
      <WashiTape color={tape} pattern={n % 2 ? 'dots' : 'stripes'} rotate={n % 2 ? -4 : 4} className="-top-2.5 left-5 h-5 w-14" />
      <h3 className="font-display mb-3 flex items-baseline gap-2 text-sm font-bold text-[#4f3d4a]">
        <span className="grid h-5 w-5 place-items-center rounded-full bg-[var(--pastel-pink)] text-[11px] text-[#8a4a63]">{n}</span>
        {title} <span className="font-cn text-xs font-semibold text-[#b58fa0]">{cn}</span>
      </h3>
      {children}
    </div>
  )
}

function Stepper({ value, setValue, min, max, label }: { value: number; setValue: (n: number) => void; min: number; max: number; label: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs font-semibold text-[#6f5a68]">{label}</span>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setValue(Math.max(min, value - 1))}
          aria-label={`Giảm ${label}`}
          className="grid h-7 w-7 place-items-center rounded-full bg-[var(--pastel-peach)] text-sm font-bold text-[#a05c33] transition-transform hover:scale-110"
        >
          −
        </button>
        <span className="w-7 text-center font-display text-sm font-bold text-[#4f3d4a]">{value}</span>
        <button
          onClick={() => setValue(Math.min(max, value + 1))}
          aria-label={`Tăng ${label}`}
          className="grid h-7 w-7 place-items-center rounded-full bg-[var(--pastel-peach)] text-sm font-bold text-[#a05c33] transition-transform hover:scale-110"
        >
          +
        </button>
      </div>
    </div>
  )
}

function Toggle({ on, setOn, label }: { on: boolean; setOn: (b: boolean) => void; label: string }) {
  return (
    <button onClick={() => setOn(!on)} aria-pressed={on} className="flex w-full items-center justify-between gap-2 py-1">
      <span className="text-xs font-semibold text-[#6f5a68]">{label}</span>
      <span className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${on ? 'bg-[#e8737f]' : 'bg-[#e5d5dc]'}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-200 ${on ? 'left-[22px]' : 'left-0.5'}`} />
      </span>
    </button>
  )
}

/* mini preview cho các bố cục */
function LayoutMini({ id }: { id: LayoutMode }) {
  const cls = 'han-cell grid h-4 w-4 place-items-center font-cn text-[9px] leading-none text-[#4f3d4a]'
  if (id === 'std')
    return (
      <div className="flex gap-0.5">
        <span className={`${cls} han-tian`}>你</span>
        <span className={cls} />
        <span className={cls} />
      </div>
    )
  if (id === 'info')
    return (
      <div className="flex h-4 flex-col gap-px">
        <span className="h-1.5 rounded-[1px] bg-[var(--pastel-pink)]" />
        <span className="h-1 rounded-[1px] bg-[var(--pastel-sky)]/70" />
      </div>
    )
  if (id === 'flow')
    return (
      <div className="flex gap-0.5">
        <span className={`${cls} han-tian`}>今</span>
        <span className={`${cls} han-tian`}>天</span>
        <span className={`${cls} han-tian`}>天</span>
      </div>
    )
  if (id === 'stroke')
    return (
      <div className="flex flex-col gap-0.5">
        <span className={`${cls} !text-[#d2495f]`}>永</span>
        <span className={`${cls} !text-[#4f3d4a] opacity-30`}>永</span>
      </div>
    )
  if (id === 'bigchar')
    return (
      <div className="flex items-center gap-0.5">
        <span className="han-cell han-tian grid h-5 w-5 place-items-center font-cn text-[10px] leading-none">你</span>
        <span className={`${cls} opacity-30`}>你</span>
        <span className={cls} />
      </div>
    )
  return (
    <div className="flex gap-0.5">
      <span className={`${cls} han-tian`}>氵</span>
      <span className={cls}>河</span>
      <span className={cls} />
    </div>
  )
}

/* ================= trang chính ================= */

export default function CreateFile() {
  const { toast } = useToast()

  const [layout, setLayout] = useState<LayoutMode>('std')
  const [paper, setPaper] = useState<PaperType>('tian')
  const [cols, setCols] = useState(8)
  const [rows, setRows] = useState(6)
  const [presetId, setPresetId] = useState(VOCAB_PRESETS[0].id)
  const [wordsInput, setWordsInput] = useState(VOCAB_PRESETS[0].words.map((w) => w.w).join('\n'))
  const [paraSampleId, setParaSampleId] = useState(PARAGRAPH_SAMPLES[0].id)
  const [para, setPara] = useState(PARAGRAPH_SAMPLES[0].text)
  const [repeat, setRepeat] = useState(3)
  const [practiceCells, setPracticeCells] = useState(4)
  const [practiceRows, setPracticeRows] = useState(1)
  const [radicalStroke, setRadicalStroke] = useState<RadFilter>('all')
  const [showPinyin, setShowPinyin] = useState(true)
  const [modelCell, setModelCell] = useState(true)
  const [fadeModel, setFadeModel] = useState(false)
  const [bg, setBg] = useState<PaperBg>('white')
  const [traceCells, setTraceCells] = useState(8)
  const [wmOn, setWmOn] = useState(true)
  const [wmText, setWmText] = useState('Nhật ký Hán ngữ')
  const [pageIdx, setPageIdx] = useState(0)

  /* ---------- dữ liệu nguồn ---------- */
  const words = useMemo(() => wordsInput.split('\n').map((w) => w.trim()).filter(Boolean), [wordsInput])
  const totalChars = useMemo(() => words.reduce((s, w) => s + [...w].length, 0), [words])
  const flowChars = useMemo(() => [...para].filter((c) => c.trim() !== '').length, [para])
  const radicals = useMemo(() => {
    const f = STROKE_RANGES.find((r) => r.id === radicalStroke) ?? STROKE_RANGES[0]
    return RADICALS.filter((r) => f.test(r.strokes))
  }, [radicalStroke])

  /* ---------- dựng trang theo bố cục ---------- */
  const sheets = useMemo(() => buildSheets(words, repeat, cols, rows, modelCell), [words, repeat, cols, rows, modelCell])
  const radicalSheets = useMemo(() => buildRadicalSheets(radicals, practiceRows, cols, rows), [radicals, practiceRows, cols, rows])
  const flowPages = useMemo(() => buildFlowPages(para, cols, rows), [para, cols, rows])
  const infoPages = useMemo(() => chunkInfoPages(buildInfoRows(words), Math.max(3, rows)), [words, rows])
  const strokePages = useMemo(() => buildStrokePages(words, repeat, cols, rows), [words, repeat, cols, rows])
  const bigPages = useMemo(() => buildBigPages(words, rows), [words, rows])
  const charCount = useMemo(() => words.reduce((s, w) => s + [...w].filter(isHan).length, 0), [words])

  const gridPages = layout === 'flow' ? flowPages : layout === 'radical' ? radicalSheets : sheets
  const pages =
    layout === 'info'
      ? infoPages.length
      : layout === 'stroke'
        ? strokePages.length
        : layout === 'bigchar'
          ? bigPages.length
          : gridPages.length
  const safePage = Math.min(pageIdx, pages - 1)
  const bgCss = BACKDROPS.find((b) => b.id === bg)?.bg ?? '#ffffff'
  const wmMark = wmOn ? wmText.trim() : ''

  /* ---------- hành động ---------- */
  const pickLayout = (l: LayoutMode) => {
    setLayout(l)
    if (l === 'stroke' && repeat < 2) setRepeat(2)
    setPageIdx(0)
  }

  const loadPreset = (id: string) => {
    const p = VOCAB_PRESETS.find((x) => x.id === id)
    if (!p) return
    setPresetId(id)
    setWordsInput(p.words.map((w) => w.w).join('\n'))
    if (layout === 'flow' || layout === 'radical') pickLayout('std')
    setPageIdx(0)
  }

  const loadParaSample = (id: string) => {
    const s = PARAGRAPH_SAMPLES.find((x) => x.id === id)
    if (!s) return
    setParaSampleId(id)
    setPara(s.text)
    setPageIdx(0)
  }

  /* thêm / bớt một từ (khi bấm từ trong kho) */
  const toggleWord = (cn: string) => {
    const lines = wordsInput.split('\n').map((t) => t.trim())
    if (lines.includes(cn)) {
      setWordsInput(lines.filter((l) => l !== cn).join('\n'))
      return
    }
    const clean = lines.filter(Boolean)
    if (clean.length >= MAX_WORDS) {
      toast({ title: 'Danh sách đã đủ 200 từ', description: 'Xoá bớt để thêm từ mới nhé' })
      return
    }
    setWordsInput([...clean, cn].join('\n'))
    setPresetId('')
  }

  /* thêm hàng loạt kết quả tìm kiếm */
  const addMany = (ws: DbWord[]) => {
    const lines = wordsInput.split('\n').map((t) => t.trim()).filter(Boolean)
    const have = new Set(lines)
    const add = ws.map((w) => w.cn).filter((cn) => !have.has(cn))
    if (!add.length) {
      toast({ title: '🧺 Tất cả từ khớp đều đã nằm trong danh sách' })
      return
    }
    const room = MAX_WORDS - lines.length
    if (room <= 0) {
      toast({ title: 'Danh sách đã đủ 200 từ', description: 'Xoá bớt để thêm từ mới nhé' })
      return
    }
    const added = add.slice(0, room)
    setWordsInput([...lines, ...added].join('\n'))
    setPresetId('')
    toast({ title: `＋ Đã thêm ${added.length} từ vào danh sách` })
  }

  const resetAll = () => {
    setLayout('std')
    setPaper('tian')
    setCols(8)
    setRows(6)
    setRepeat(3)
    setPracticeCells(4)
    setPracticeRows(1)
    setRadicalStroke('all')
    setShowPinyin(true)
    setModelCell(true)
    setFadeModel(false)
    setBg('white')
    setTraceCells(8)
    setWmOn(true)
    setWmText('Nhật ký Hán ngữ')
    setParaSampleId(PARAGRAPH_SAMPLES[0].id)
    setPara(PARAGRAPH_SAMPLES[0].text)
    setPresetId(VOCAB_PRESETS[0].id)
    setWordsInput(VOCAB_PRESETS[0].words.map((w) => w.w).join('\n'))
    setPageIdx(0)
    toast({ title: '⟲ Đã đặt lại toàn bộ tuỳ chọn' })
  }

  /* ---------- nhãn số liệu theo bố cục ---------- */
  const estimate =
    layout === 'std'
      ? `${words.length} từ × ${repeat} hàng · khoảng ${pages} trang A4`
      : layout === 'info'
        ? `Bảng ${words.length} từ · ${practiceCells} ô luyện mỗi từ · khoảng ${pages} trang`
        : layout === 'flow'
          ? `${flowChars} chữ · khoảng ${pages} trang`
          : layout === 'stroke'
            ? `${words.length} từ · ${repeat} hàng mỗi từ (1 mẫu + ${Math.max(0, repeat - 1)} tô) · khoảng ${pages} trang`
            : layout === 'bigchar'
              ? `${charCount} chữ tách riêng · ${traceCells} ô tô mỗi chữ · khoảng ${pages} trang`
              : `${radicals.length} bộ thủ · khoảng ${pages} trang`

  /* ---------- các nhóm chức năng (đánh số động) ---------- */
  const groups: { key: string; title: string; cn: string; tape: string; body: React.ReactNode }[] = []

  groups.push({
    key: 'layout',
    title: 'Chế độ bố cục',
    cn: '布局',
    tape: 'var(--pastel-lilac)',
    body: (
      <div className="grid grid-cols-2 gap-2">
        {LAYOUTS.map((l) => {
          const active = layout === l.id
          return (
            <button
              key={l.id}
              onClick={() => pickLayout(l.id)}
              aria-pressed={active}
              className={`flex flex-col gap-1 rounded-xl px-3 py-2.5 text-left transition-all ${
                active
                  ? 'bg-[var(--pastel-lilac)]/45 shadow-[0_4px_10px_-6px_rgba(93,74,87,0.4)] ring-2 ring-[#c9b8ec]'
                  : 'ring-1 ring-[#ead9cd] hover:bg-[var(--cream)]'
              }`}
            >
              <span className="flex items-center justify-between gap-1">
                <span className="font-cn text-sm font-bold text-[#6d5a94]">{l.cn}</span>
                <LayoutMini id={l.id} />
              </span>
              <span className="text-xs font-extrabold text-[#4f3d4a]">{l.label}</span>
              <span className="text-[10px] font-semibold leading-snug text-[#8d7484]">{l.desc}</span>
            </button>
          )
        })}
      </div>
    ),
  })

  if (layout !== 'radical') {
    groups.push({
      key: 'preset',
      title: layout === 'flow' ? 'Mẫu đoạn văn' : 'Mẫu từ vựng',
      cn: layout === 'flow' ? '范文' : '词库',
      tape: 'var(--pastel-butter)',
      body: layout === 'flow' ? (
        <div className="flex flex-wrap gap-2">
          {PARAGRAPH_SAMPLES.map((s) => (
            <button
              key={s.id}
              onClick={() => loadParaSample(s.id)}
              aria-pressed={paraSampleId === s.id}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                paraSampleId === s.id
                  ? 'bg-[#c9952c] text-white shadow-[0_3px_0_0_#a87a20]'
                  : 'ring-1 ring-[#ead9cd] text-[#6f5a68] hover:bg-[var(--cream)]'
              }`}
            >
              ¶ {s.name}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {VOCAB_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => loadPreset(p.id)}
              aria-pressed={presetId === p.id}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                presetId === p.id
                  ? 'bg-[#e8737f] text-white shadow-[0_3px_0_0_#d1708f]'
                  : 'ring-1 ring-[#ead9cd] text-[#6f5a68] hover:bg-[var(--cream)]'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      ),
    })
  }

  groups.push({
    key: 'source',
    title:
      layout === 'flow' ? 'Đoạn văn & giấy ô' : layout === 'radical' ? 'Chọn bộ thủ' : 'Danh sách từ vựng',
    cn: layout === 'flow' ? '段落' : layout === 'radical' ? '部首' : '生词表',
    tape: layout === 'flow' ? 'var(--pastel-mint)' : layout === 'radical' ? 'var(--pastel-peach)' : 'var(--pastel-sky)',
    body:
      layout === 'flow' ? (
        <div>
          <textarea
            value={para}
            onChange={(e) => {
              setPara(e.target.value)
              setParaSampleId('')
            }}
            rows={4}
            placeholder="Dán hoặc viết đoạn văn tiếng Trung muốn chép…"
            className="custom-scroll font-cn w-full resize-none rounded-xl bg-[#fffdf6] p-3 text-sm leading-relaxed text-[#4f3d4a] ring-1 ring-[#ead9cd] focus:outline-none focus:ring-2 focus:ring-[#f0b9c9]"
            aria-label="Đoạn văn muốn chép"
          />
          <p className="mt-2 text-[11px] font-semibold text-[#b58fa0]">
            → {flowChars} chữ · mỗi trang chứa {cols * rows} chữ · dấu câu cũng chiếm một ô như giấy ô vuông thật
          </p>
        </div>
      ) : layout === 'radical' ? (
        <div>
          <div className="flex flex-wrap gap-2">
            {STROKE_RANGES.map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  setRadicalStroke(f.id)
                  setPageIdx(0)
                }}
                aria-pressed={radicalStroke === f.id}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                  radicalStroke === f.id
                    ? 'bg-[#c07a2c] text-white shadow-[0_3px_0_0_#a3652a]'
                    : 'ring-1 ring-[#ead9cd] text-[#6f5a68] hover:bg-[var(--cream)]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11px] font-semibold text-[#b58fa0]">
            → Đang luyện {radicals.length}/{RADICALS.length} bộ thủ · mỗi bộ có 1 hàng mẫu kèm chữ chứa bộ đó
          </p>
        </div>
      ) : (
        <div>
          <textarea
            value={wordsInput}
            onChange={(e) => {
              setWordsInput(e.target.value)
              setPresetId('')
            }}
            rows={4}
            placeholder={'Mỗi dòng một từ, ví dụ:\n你好\n谢谢'}
            className="custom-scroll font-cn w-full resize-none rounded-xl bg-[#fffdf6] p-3 text-sm leading-relaxed text-[#4f3d4a] ring-1 ring-[#ead9cd] focus:outline-none focus:ring-2 focus:ring-[#f0b9c9]"
            aria-label="Danh sách từ vựng, mỗi dòng một từ"
          />
          <div className="mt-2 flex items-center justify-between">
            <p className="text-[11px] font-bold text-[#b58fa0]">
              {words.length} từ · {totalChars} chữ
            </p>
            <button onClick={() => { setWordsInput(''); setPresetId('') }} className="rounded-full px-3 py-1 text-[11px] font-bold text-[#c2547e] hover:bg-[var(--pastel-pink-soft)]">
              Xoá hết
            </button>
          </div>
          {/* chips xem nhanh */}
          {words.length > 0 && (
            <div className="custom-scroll mt-2 flex max-h-24 flex-wrap gap-1.5 overflow-y-auto">
              {words.slice(0, 14).map((w, i) => (
                <span key={i} className="rounded-full bg-[var(--cream)] px-2.5 py-1 text-[11px] font-semibold text-[#6f5a68] ring-1 ring-[#ead9cd]">
                  <span className="font-cn">{w}</span> <span className="text-[#b58fa0]">{wordPinyin(w)}</span>
                </span>
              ))}
              {words.length > 14 && <span className="self-center text-[11px] font-bold text-[#b58fa0]">+{words.length - 14}…</span>}
            </div>
          )}
          {/* kho từ vựng: tìm & chọn */}
          <WordPicker selected={words} onToggle={toggleWord} onAddMany={addMany} />
        </div>
      ),
  })

  groups.push({
    key: 'pages',
    title: 'Trang & số lần viết',
    cn: '页',
    tape: 'var(--pastel-lilac)',
    body: (
      <div className="space-y-2.5">
        {(layout === 'std' || layout === 'stroke') && (
          <Stepper
            label={layout === 'stroke' ? 'Số hàng mỗi từ (1 mẫu + tô)' : 'Số lần viết mỗi từ'}
            value={repeat}
            setValue={(n) => { setRepeat(n); setPageIdx(0) }}
            min={layout === 'stroke' ? 2 : 1}
            max={layout === 'stroke' ? 4 : 6}
          />
        )}
        {layout === 'info' && <Stepper label="Ô luyện viết mỗi từ" value={practiceCells} setValue={(n) => setPracticeCells(n)} min={2} max={8} />}
        {layout === 'radical' && <Stepper label="Hàng trống mỗi bộ thủ" value={practiceRows} setValue={(n) => setPracticeRows(n)} min={1} max={3} />}
        {layout === 'flow' && <p className="text-xs font-semibold text-[#6f5a68]">Đoạn văn chảy liên tục — không cần số lần viết.</p>}
        {layout === 'bigchar' && <p className="text-xs font-semibold text-[#6f5a68]">Mỗi chữ 1 dải: chữ mẫu to + hàng ô tô — không cần số lần viết.</p>}
        <p className="text-[11px] font-semibold text-[#b58fa0]">
          → {estimate} · in tối đa {PRINT_CAP} trang mỗi lần
        </p>
      </div>
    ),
  })

  groups.push({
    key: 'display',
    title: 'Hiển thị',
    cn: '显示',
    tape: 'var(--pastel-pink)',
    body: (
      <div className="space-y-1">
        <Toggle on={showPinyin} setOn={setShowPinyin} label={layout === 'info' ? 'Cột pinyin' : 'Pinyin trên chữ mẫu'} />
        {layout === 'std' && <Toggle on={modelCell} setOn={setModelCell} label="Hàng mẫu có chữ" />}
        {(layout === 'std' || layout === 'flow' || layout === 'radical') && <Toggle on={fadeModel} setOn={setFadeModel} label="Chữ mẫu nhạt để tô theo" />}
        {layout === 'stroke' && <p className="pt-1 text-[10.5px] font-semibold text-[#b58fa0]">Chữ đỏ có đánh số thứ tự nét — hàng bên dưới là chữ mờ để tô theo.</p>}
        {layout === 'bigchar' && <p className="pt-1 text-[10.5px] font-semibold text-[#b58fa0]">Bên phải mỗi chữ là sơ đồ thứ tự nét thật (dữ liệu 笔顺 của hơn 9.000 ký tự).</p>}
        {layout === 'info' && <p className="pt-1 text-[10.5px] font-semibold text-[#b58fa0]">Nghĩa Việt tự điền từ kho từ vựng; chữ ngoài kho sẽ để trống cho bạn tự viết.</p>}
      </div>
    ),
  })

  groups.push({
    key: 'print',
    title: 'In file',
    cn: '打印',
    tape: 'var(--pastel-mint)',
    body: (
      <div className="space-y-2">
        <motion.button
          onClick={() => window.print()}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="w-full rounded-2xl bg-[#e8737f] px-5 py-3.5 font-display text-base font-bold text-white shadow-[0_5px_0_0_#d1708f]"
        >
          🖨 In / Lưu PDF
        </motion.button>
        <p className="text-center text-[11px] font-semibold text-[#b58fa0]">
          Trong hộp thoại in, chọn <strong className="text-[#6f5a68]">“Save as PDF”</strong> để tải vở về máy
        </p>

        {/* watermark bản quyền cho PDF */}
        <div className="rounded-xl bg-[var(--cream)] p-2.5 ring-1 ring-[#ead9cd]">
          <Toggle on={wmOn} setOn={setWmOn} label="Watermark bản quyền" />
          {wmOn && (
            <input
              type="text"
              value={wmText}
              maxLength={30}
              onChange={(e) => setWmText(e.target.value)}
              placeholder="Tên sẽ in chéo giữa trang…"
              className="mt-1.5 w-full rounded-lg bg-white px-3 py-2 text-xs font-bold text-[#4f3d4a] ring-1 ring-[#ead9cd] placeholder:text-[#c9a2b3] focus:outline-none focus:ring-2 focus:ring-[#f0b9c9]"
              aria-label="Nội dung watermark"
            />
          )}
          <p className="mt-1.5 text-[10.5px] font-semibold leading-snug text-[#b58fa0]">
            Watermark in chéo giữa mỗi trang PDF. Khi lưu, nhớ bật <strong className="text-[#6f5a68]">“Background graphics”</strong> để giữ màu nền giấy &amp; watermark.
          </p>
        </div>

        <button
          onClick={resetAll}
          className="paper-scrap w-full rounded-full px-4 py-2 text-xs font-bold text-[#6f5a68] hover:-translate-y-0.5 transition-transform"
        >
          ⟲ Đặt lại mặc định
        </button>
      </div>
    ),
  })

  return (
    <>
      {/* ================= GIAO DIỆN (ẩn khi in) ================= */}
      <div className="screen-root flex min-h-screen flex-col overflow-x-clip bg-[#fff6e9] text-[#5d4a57]">

        <main className="relative flex-1 pt-24 sm:pt-28">
          <div aria-hidden="true" className="dot-grid absolute inset-0" />

          <div className="relative mx-auto max-w-6xl px-4 pb-20 sm:px-6">
            <div className="pt-4">
              <SectionHeading
                tag="Công cụ tạo tài liệu"
                tagColor="var(--pastel-peach)"
                title="Tạo Vở Tập Viết Chữ Hán"
                titleAccent="练字本"
                sub="Sáu bố cục · 4 mẫu ô · 5 nền giấy pastel · watermark PDF · kho từ vựng sẵn có — xem trước từng trang rồi in."
              />
            </div>

            <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
              {/* ================= CỘT TRÁI: PREVIEW ================= */}
              <Reveal className="lg:sticky lg:top-24">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-display flex items-center gap-2 text-lg font-bold text-[#4f3d4a]">
                    Xem trước <span className="font-cn text-sm text-[#e88aa6]">预览</span>
                    <PushPin color="#e8737f" className="translate-y-0.5 scale-75" />
                  </h2>
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-full bg-[var(--pastel-lilac)] px-3 py-1 text-[11px] font-bold text-[#6d5a94]">
                      {LAYOUTS.find((l) => l.id === layout)?.label}
                    </span>
                    <span className="rounded-full bg-[var(--pastel-mint)] px-3 py-1 text-[11px] font-bold text-[#3f6b50]">A4 · khổ dọc</span>
                  </div>
                </div>

                {/* khổng giấy A4 */}
                <div className="paper-scrap relative mx-auto w-full max-w-[540px] rotate-[0.6deg] rounded-lg p-3 shadow-[0_18px_40px_-18px_rgba(93,74,87,0.35)] sm:p-4">
                  <WashiTape color="var(--pastel-butter)" pattern="grid" rotate={-5} className="-top-2.5 right-10 z-10 h-5 w-16" />
                  <div className="aspect-[210/297] w-full rounded-md ring-1 ring-[#ead9cd]">
                    <Sheet
                      layout={layout}
                      paper={paper}
                      bg={bgCss}
                      cols={cols}
                      rows={rows}
                      gridData={layout === 'info' || layout === 'stroke' || layout === 'bigchar' ? [] : gridPages[safePage] ?? []}
                      infoRows={layout === 'info' ? infoPages[safePage] ?? null : null}
                      practiceCells={practiceCells}
                      showPinyin={showPinyin}
                      fadeModel={fadeModel}
                      strokeBlocks={layout === 'stroke' ? strokePages[safePage] ?? null : null}
                      bigBands={layout === 'bigchar' ? bigPages[safePage] ?? null : null}
                      traceCells={traceCells}
                      wmText={wmMark}
                    />
                  </div>
                </div>

                {/* chuyển trang */}
                <div className="mx-auto mt-4 flex max-w-[540px] items-center justify-center gap-3">
                  <button
                    onClick={() => setPageIdx(Math.max(0, safePage - 1))}
                    disabled={safePage === 0}
                    className="paper-scrap rounded-full px-4 py-2 text-sm font-bold text-[#6f5a68] disabled:opacity-40"
                    aria-label="Trang trước"
                  >
                    ‹
                  </button>
                  <span className="font-display text-sm font-bold text-[#4f3d4a]">
                    Trang {safePage + 1} / {pages}
                  </span>
                  <button
                    onClick={() => setPageIdx(Math.min(pages - 1, safePage + 1))}
                    disabled={safePage >= pages - 1}
                    className="paper-scrap rounded-full px-4 py-2 text-sm font-bold text-[#6f5a68] disabled:opacity-40"
                    aria-label="Trang sau"
                  >
                    ›
                  </button>
                </div>
              </Reveal>

              {/* ================= CỘT PHẢI: CHỨC NĂNG ================= */}
              <div className="flex flex-col gap-5">
                {/* 1 · chọn mẫu giấy */}
                <Reveal delay={0.05}>
                  <Group n={1} title="Chọn mẫu giấy" cn="纸" tape="var(--pastel-pink)">
                    <div className="grid grid-cols-2 gap-2">
                      {PAPERS.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setPaper(p.id)}
                          aria-pressed={paper === p.id}
                          className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-all ${
                            paper === p.id
                              ? 'bg-[var(--pastel-pink-soft)] shadow-[0_4px_10px_-6px_rgba(93,74,87,0.4)] ring-2 ring-[#f0b9c9]'
                              : 'ring-1 ring-[#ead9cd] hover:bg-[var(--cream)]'
                          }`}
                        >
                          <span className={`h-8 w-8 shrink-0 bg-white ${p.id === 'tian' ? 'han-cell han-tian' : p.id === 'mi' ? 'han-cell han-mi' : p.id === 'line' ? 'han-cell han-line' : 'han-cell'}`} />
                          <span>
                            <span className="font-cn block text-sm font-bold text-[#4f3d4a]">{p.cn}</span>
                            <span className="block text-[10px] font-semibold text-[#8d7484]">{p.desc}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </Group>
                </Reveal>

                {/* 2 · nền giấy pastel */}
                <Reveal delay={0.06}>
                  <Group n={2} title="Nền giấy" cn="纸色" tape="var(--pastel-butter)">
                    <div className="flex flex-wrap gap-2">
                      {BACKDROPS.map((b) => (
                        <button
                          key={b.id}
                          onClick={() => setBg(b.id)}
                          aria-pressed={bg === b.id}
                          className={`flex items-center gap-2 rounded-full py-1.5 pl-2 pr-3 transition-all ${
                            bg === b.id
                              ? 'bg-[var(--pastel-pink-soft)] shadow-[0_3px_8px_-4px_rgba(93,74,87,0.4)] ring-2 ring-[#f0b9c9]'
                              : 'ring-1 ring-[#ead9cd] hover:bg-[var(--cream)]'
                          }`}
                        >
                          <span className="h-5 w-5 shrink-0 rounded-full ring-1 ring-[#d8c7bd]" style={{ background: b.bg }} />
                          <span className="font-cn text-sm font-bold text-[#4f3d4a]">{b.cn}</span>
                          <span className="text-[10px] font-semibold text-[#8d7484]">{b.label}</span>
                        </button>
                      ))}
                    </div>
                    <p className="mt-2 text-[11px] font-semibold text-[#b58fa0]">→ 5 nền theo bảng màu của trang — in PDF vẫn giữ màu khi bật “Background graphics”.</p>
                  </Group>
                </Reveal>

                {/* 3 · lưới ô */}
                <Reveal delay={0.09}>
                  <Group n={3} title="Lưới ô" cn="格" tape="var(--pastel-peach)">
                    <div className="space-y-2.5">
                      <Stepper label="Số ô mỗi hàng (cột)" value={cols} setValue={setCols} min={4} max={12} />
                      <Stepper label="Số hàng mỗi trang" value={rows} setValue={(n) => { setRows(n); setPageIdx(0) }} min={3} max={10} />
                      {layout === 'bigchar' && <Stepper label="Ô tô theo mỗi chữ" value={traceCells} setValue={(n) => setTraceCells(n)} min={4} max={12} />}
                      <p className="text-[11px] font-semibold text-[#b58fa0]">→ Mỗi trang có {cols * rows} ô tập viết</p>
                    </div>
                  </Group>
                </Reveal>

                {/* 4+ · các nhóm động */}
                {groups.map((g, i) => (
                  <Reveal key={g.key} delay={0.12 + i * 0.03}>
                    <Group n={i + 4} title={g.title} cn={g.cn} tape={g.tape}>
                      {g.body}
                    </Group>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>

      {/* ================= BẢN IN (chỉ hiện khi in) ================= */}
      <div className="print-only" aria-hidden="true">
        {layout === 'info'
          ? infoPages.slice(0, PRINT_CAP).map((rowsData, p) => (
              <div key={p} className="print-page ink-exact" style={{ background: bgCss }}>
                <Sheet
                  layout="info"
                  paper={paper}
                  bg={bgCss}
                  cols={cols}
                  rows={rows}
                  gridData={[]}
                  infoRows={rowsData}
                  practiceCells={practiceCells}
                  showPinyin={showPinyin}
                  wmText={wmMark}
                />
              </div>
            ))
          : layout === 'stroke'
            ? strokePages.slice(0, PRINT_CAP).map((blocks, p) => (
                <div key={p} className="print-page ink-exact" style={{ background: bgCss }}>
                  <Sheet
                    layout="stroke"
                    paper={paper}
                    bg={bgCss}
                    cols={cols}
                    rows={rows}
                    gridData={[]}
                    infoRows={null}
                    practiceCells={practiceCells}
                    showPinyin={showPinyin}
                    strokeBlocks={blocks}
                    traceCells={traceCells}
                    wmText={wmMark}
                  />
                </div>
              ))
            : layout === 'bigchar'
              ? bigPages.slice(0, PRINT_CAP).map((bands, p) => (
                  <div key={p} className="print-page ink-exact" style={{ background: bgCss }}>
                    <Sheet
                      layout="bigchar"
                      paper={paper}
                      bg={bgCss}
                      cols={cols}
                      rows={rows}
                      gridData={[]}
                      infoRows={null}
                      practiceCells={practiceCells}
                      showPinyin={showPinyin}
                      bigBands={bands}
                      traceCells={traceCells}
                      wmText={wmMark}
                    />
                  </div>
                ))
              : gridPages.slice(0, PRINT_CAP).map((rd, p) => (
                  <div key={p} className="print-page ink-exact" style={{ background: bgCss }}>
                    <Sheet
                      layout={layout}
                      paper={paper}
                      bg={bgCss}
                      cols={cols}
                      rows={rows}
                      gridData={rd}
                      infoRows={null}
                      practiceCells={practiceCells}
                      showPinyin={showPinyin}
                      fadeModel={fadeModel}
                      wmText={wmMark}
                    />
                  </div>
                ))}
      </div>
    </>
  )
}
