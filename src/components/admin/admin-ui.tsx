'use client'

import type { ReactNode } from 'react'

/* ============================================================
   UI dùng chung cho Trung tâm Quản trị (#/admin)
   - Badge: nhãn trạng thái
   - StatCard: thẻ số liệu
   - Switch: công tắc bật/tắt
   - TableShell / Pager / EmptyState / RowBtn: khung bảng dữ liệu
   ============================================================ */

export type AdminSectionId =
  | 'overview'
  | 'users'
  | 'lessons'
  | 'vocab'
  | 'videos'
  | 'exams'
  | 'settings'

export type BadgeTone = 'mint' | 'pink' | 'butter' | 'sky' | 'lilac' | 'cream' | 'red'

const BADGE_TONES: Record<BadgeTone, string> = {
  mint: 'bg-[var(--pastel-mint)] text-[#3f6b50] ring-[#cfe6d6]',
  pink: 'bg-[var(--pastel-pink)] text-[#8a4a63] ring-[#f3c4d3]',
  butter: 'bg-[var(--pastel-butter)] text-[#8a6a1f] ring-[#f2e2b8]',
  sky: 'bg-[var(--pastel-sky)] text-[#46688f] ring-[#cfe0ef]',
  lilac: 'bg-[var(--pastel-lilac)] text-[#6d5a94] ring-[#e2d6f0]',
  cream: 'bg-[var(--cream)] text-[#8d7484] ring-[#ead9cd]',
  red: 'bg-[#fbe3e7] text-[#c2435c] ring-[#f3c4d3]',
}

export function Badge({ tone = 'cream', children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ring-1 ${BADGE_TONES[tone]}`}
    >
      {children}
    </span>
  )
}

/* ---------- Thẻ số liệu tổng quan ---------- */

const TILE_TONES: Record<string, string> = {
  pink: 'bg-[var(--pastel-pink)] ring-[#f3c4d3]',
  butter: 'bg-[var(--pastel-butter)] ring-[#f2e2b8]',
  mint: 'bg-[var(--pastel-mint)] ring-[#cfe6d6]',
  sky: 'bg-[var(--pastel-sky)] ring-[#cfe0ef]',
  lilac: 'bg-[var(--pastel-lilac)] ring-[#e2d6f0]',
  peach: 'bg-[var(--pastel-peach)] ring-[#f3dcc6]',
}

export function StatCard({
  emoji,
  value,
  label,
  sub,
  tone = 'pink',
  delay = 0,
}: {
  emoji: string
  value: string
  label: string
  sub?: string
  tone?: 'pink' | 'butter' | 'mint' | 'sky' | 'lilac' | 'peach'
  delay?: number
}) {
  return (
    <div
      className={`paper-scrap flex items-center gap-3 rounded-2xl p-4 ring-1 ${TILE_TONES[tone]}`}
      style={{ animation: 'fade-up .5s ease-out both', animationDelay: `${delay}s` }}
    >
      <span
        className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/55 text-2xl shadow-inner"
        aria-hidden="true"
      >
        {emoji}
      </span>
      <span className="min-w-0">
        <span className="block font-display text-xl font-extrabold leading-none text-[#4f3d4a]">{value}</span>
        <span className="mt-1 block truncate text-[11px] font-bold text-[#5d4a57]">{label}</span>
        {sub && <span className="mt-0.5 block text-[10px] font-semibold text-[#b58fa0]">{sub}</span>}
      </span>
    </div>
  )
}

/* ---------- Công tắc bật/tắt ---------- */

export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full ring-1 transition-colors duration-200 ${
        checked ? 'bg-[var(--pastel-mint)] ring-[#a9cdb6]' : 'bg-[var(--cream)] ring-[#ead9cd]'
      }`}
    >
      <span
        className={`absolute top-1/2 -translate-y-1/2 rounded-full bg-white shadow-sm ring-1 transition-all duration-200 ${
          checked ? 'left-[calc(100%-1.375rem)] ring-[#a9cdb6]' : 'left-1 ring-[#d9c3b4]'
        }`}
        style={{ height: '1.125rem', width: '1.125rem' }}
      />
    </button>
  )
}

/* ---------- Khung bảng dữ liệu ---------- */

export function TableShell({ head, children }: { head: ReactNode[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] border-separate border-spacing-0 text-left">
        <thead>
          <tr>
            {head.map((h, i) => (
              <th
                key={i}
                className="border-b-2 border-dashed border-[#e7c9d4] px-3 pb-2 pt-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#b58fa0]"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

/* ---------- Phân trang ---------- */

export function Pager({
  page,
  pages,
  onPage,
}: {
  page: number
  pages: number
  onPage: (p: number) => void
}) {
  if (pages <= 1) return null
  return (
    <div className="flex items-center justify-between gap-2 border-t border-dashed border-[#ead9cd] px-1 pt-3">
      <button
        type="button"
        onClick={() => onPage(Math.max(1, page - 1))}
        disabled={page <= 1}
        className="rounded-xl bg-[var(--cream)] px-3 py-1.5 text-[11px] font-extrabold text-[#6f5a68] ring-1 ring-[#ead9cd] transition-all enabled:hover:-translate-y-0.5 disabled:opacity-40"
      >
        ← Trước
      </button>
      <span className="text-[11px] font-bold text-[#b58fa0]">
        Trang {page}/{pages}
      </span>
      <button
        type="button"
        onClick={() => onPage(Math.min(pages, page + 1))}
        disabled={page >= pages}
        className="rounded-xl bg-[var(--cream)] px-3 py-1.5 text-[11px] font-extrabold text-[#6f5a68] ring-1 ring-[#ead9cd] transition-all enabled:hover:-translate-y-0.5 disabled:opacity-40"
      >
        Sau →
      </button>
    </div>
  )
}

/* ---------- Trạng thái rỗng ---------- */

export function EmptyState({ emoji, text }: { emoji: string; text: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 py-10 text-center">
      <span className="text-3xl" aria-hidden="true">
        {emoji}
      </span>
      <p className="text-xs font-bold text-[#b58fa0]">{text}</p>
    </div>
  )
}

/* ---------- Nút hành động nhỏ trong bảng ---------- */

export function RowBtn({
  onClick,
  title,
  children,
  danger = false,
  confirm = false,
}: {
  onClick: () => void
  title: string
  children: ReactNode
  danger?: boolean
  confirm?: boolean
}) {
  const base =
    'grid h-8 w-8 place-items-center rounded-xl text-sm ring-1 transition-all hover:-translate-y-0.5'
  const tone = confirm
    ? 'bg-[#d2495f] text-white ring-[#b23a4f]'
    : danger
      ? 'bg-[#fbe3e7] text-[#c2435c] ring-[#f3c4d3] hover:bg-[var(--pastel-pink)]'
      : 'bg-[var(--cream)] text-[#6f5a68] ring-[#ead9cd] hover:bg-[var(--pastel-butter)]/60'
  return (
    <button type="button" onClick={onClick} title={title} aria-label={title} className={`${base} ${tone}`}>
      {children}
    </button>
  )
}

/* ---------- Chuẩn hoá chuỗi tìm kiếm (bỏ dấu tiếng Việt) ---------- */

export function normSearch(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .trim()
}
