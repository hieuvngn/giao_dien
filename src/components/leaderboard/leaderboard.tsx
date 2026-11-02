'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Footer from '../landing/footer'
import { PushPin, Reveal, WashiTape } from '../landing/decor'
import { useToast } from '@/hooks/use-toast'

/* ============================================================
   Bảng xếp hạng cộng đồng
   Route: #/leaderboard
   Giải đấu theo tuần · bục vinh danh top 3 · danh sách xếp hạng
   ============================================================ */

type Period = 'week' | 'month' | 'all'

type Player = {
  rank: number
  name: string
  avatar: string
  xp: number
  streak: number
  me?: boolean
}

/* Dữ liệu demo — điểm XP đổi theo tab */
const BOARD: Record<Period, Player[]> = {
  week: [
    { rank: 1, name: 'Minh Anh', avatar: '🐯', xp: 2380, streak: 21 },
    { rank: 2, name: 'Quốc Bảo', avatar: '🐼', xp: 2145, streak: 15 },
    { rank: 3, name: 'Thùy Linh', avatar: '🐰', xp: 1980, streak: 12 },
    { rank: 4, name: 'Gia Hân', avatar: '🦊', xp: 1720, streak: 9 },
    { rank: 5, name: 'Đức Anh', avatar: '🐨', xp: 1655, streak: 7 },
    { rank: 6, name: 'Bảo Ngọc', avatar: '🐸', xp: 1490, streak: 11 },
    { rank: 7, name: 'Hoàng Long', avatar: '🦁', xp: 1310, streak: 5 },
    { rank: 8, name: 'Bạn', avatar: '🐼', xp: 1240, streak: 1, me: true },
    { rank: 9, name: 'Khánh Vy', avatar: '🐧', xp: 1105, streak: 4 },
    { rank: 10, name: 'Tuấn Kiệt', avatar: '🐷', xp: 980, streak: 3 },
  ],
  month: [
    { rank: 1, name: 'Quốc Bảo', avatar: '🐼', xp: 9860, streak: 15 },
    { rank: 2, name: 'Minh Anh', avatar: '🐯', xp: 9420, streak: 21 },
    { rank: 3, name: 'Khánh Vy', avatar: '🐧', xp: 8730, streak: 18 },
    { rank: 4, name: 'Bảo Ngọc', avatar: '🐸', xp: 8110, streak: 11 },
    { rank: 5, name: 'Thùy Linh', avatar: '🐰', xp: 7650, streak: 12 },
    { rank: 6, name: 'Đức Anh', avatar: '🐨', xp: 6980, streak: 7 },
    { rank: 7, name: 'Bạn', avatar: '🐼', xp: 5320, streak: 1, me: true },
    { rank: 8, name: 'Gia Hân', avatar: '🦊', xp: 5105, streak: 9 },
    { rank: 9, name: 'Hoàng Long', avatar: '🦁', xp: 4640, streak: 5 },
    { rank: 10, name: 'Tuấn Kiệt', avatar: '🐷', xp: 4020, streak: 3 },
  ],
  all: [
    { rank: 1, name: 'Thùy Linh', avatar: '🐰', xp: 42850, streak: 12 },
    { rank: 2, name: 'Quốc Bảo', avatar: '🐼', xp: 41020, streak: 15 },
    { rank: 3, name: 'Minh Anh', avatar: '🐯', xp: 39880, streak: 21 },
    { rank: 4, name: 'Khánh Vy', avatar: '🐧', xp: 36410, streak: 18 },
    { rank: 5, name: 'Gia Hân', avatar: '🦊', xp: 33110, streak: 9 },
    { rank: 6, name: 'Đức Anh', avatar: '🐨', xp: 30990, streak: 7 },
    { rank: 7, name: 'Bảo Ngọc', avatar: '🐸', xp: 28740, streak: 11 },
    { rank: 8, name: 'Hoàng Long', avatar: '🦁', xp: 25330, streak: 5 },
    { rank: 9, name: 'Bạn', avatar: '🐼', xp: 1240, streak: 1, me: true },
    { rank: 10, name: 'Tuấn Kiệt', avatar: '🐷', xp: 980, streak: 3 },
  ],
}

const PERIODS: { id: Period; label: string }[] = [
  { id: 'week', label: 'Tuần này' },
  { id: 'month', label: 'Tháng này' },
  { id: 'all', label: 'Mọi thời đại' },
]

const MEDALS = ['🥇', '🥈', '🥉']
const PODIUM_BG = ['bg-[var(--pastel-butter)]/80 ring-[#f2e2b8]', 'bg-[var(--cream)]/90 ring-[#ead9cd]', 'bg-[var(--pastel-peach)]/60 ring-[#f3d6c2]']
const PODIUM_H = ['h-24', 'h-16', 'h-12']

function PeriodPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="tab"
      aria-selected={active}
      className={`inline-flex items-center rounded-full px-5 py-2.5 text-sm font-bold transition-all duration-200 ${
        active
          ? 'bg-[#4f3d4a] text-white shadow-[0_4px_0_0_#3a2d36]'
          : 'paper-scrap text-[#6f5a68] hover:-translate-y-0.5 hover:text-[#4f3d4a]'
      }`}
    >
      {children}
    </button>
  )
}

/* ---------- một hàng trong bảng ---------- */

function PlayerRow({ p, index }: { p: Player; index: number }) {
  return (
    <motion.li
      initial={{ opacity: 0, x: -18 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.3), ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className={`flex items-center gap-3 rounded-2xl px-3.5 py-2.5 ring-1 transition-transform duration-200 hover:-translate-y-0.5 sm:gap-4 sm:px-4 ${
          p.me
            ? 'bg-[var(--pastel-sky)]/45 ring-[#a9c8e8]'
            : 'bg-white/70 ring-[#f0e2d4]'
        }`}
      >
        {/* hạng */}
        <span
          className={`grid h-8 w-8 shrink-0 place-items-center rounded-full font-display text-sm font-extrabold ${
            p.rank <= 3 ? 'bg-[var(--pastel-butter)] text-[#8a6a1f] ring-1 ring-[#f2e2b8]' : 'bg-[var(--cream)] text-[#8d7484] ring-1 ring-[#ead9cd]'
          }`}
        >
          {p.rank}
        </span>

        {/* avatar + tên */}
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--pastel-pink-soft)] text-xl shadow-inner" aria-hidden="true">
          {p.avatar}
        </span>
        <span className="min-w-0 flex-1">
          <span className={`block truncate text-sm font-bold ${p.me ? 'text-[#46688f]' : 'text-[#4f3d4a]'}`}>
            {p.name}
            {p.me && <span className="ml-1.5 rounded-full bg-[#46688f] px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-white">Bạn</span>}
          </span>
          <span className="mt-0.5 flex items-center gap-1 text-[10px] font-bold text-[#b58fa0]">
            🔥 {p.streak} ngày streak
          </span>
        </span>

        {/* XP */}
        <span className="text-right">
          <span className="block font-display text-base font-extrabold leading-none text-[#c2547e]">{p.xp.toLocaleString('vi-VN')}</span>
          <span className="block text-[9px] font-bold uppercase tracking-[0.14em] text-[#b58fa0]">XP</span>
        </span>
      </div>
    </motion.li>
  )
}

/* ============================================================
   Trang chính
   ============================================================ */

export default function Leaderboard() {
  const { toast } = useToast()
  const [period, setPeriod] = useState<Period>('week')
  const players = BOARD[period]
  const podium = players.slice(0, 3)
  const rest = players.slice(3)
  const me = players.find((p) => p.me)
  const topAdvance = period === 'week' ? 5 : period === 'month' ? 10 : 3

  return (
    <div className="flex min-h-screen flex-col bg-[#fff6e9] text-[#5d4a57]">
      <main className="relative flex-1 pb-16 pt-20 sm:pt-24">
        <div aria-hidden="true" className="dot-grid absolute inset-0" />

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6">
          {/* ================= Header ================= */}
          <header className="paper-scrap relative rounded-2xl px-5 py-6 sm:px-7">
            <WashiTape color="var(--pastel-butter)" pattern="dots" rotate={-5} className="-top-3 left-10 h-6 w-20" />
            <PushPin color="#f0b429" className="absolute right-8 top-3 scale-75" />

            <div className="flex flex-wrap items-center gap-4">
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[var(--cream)] text-4xl shadow-inner ring-1 ring-[#ead9cd]" aria-hidden="true">
                🏆
              </span>
              <div className="min-w-0 flex-1">
                <h1 className="leading-tight">
                  <span className="relative inline-block px-3 py-0.5">
                    <span aria-hidden="true" className="absolute inset-0 -rotate-1 rounded-md bg-[var(--pastel-butter)] opacity-90" />
                    <span className="relative font-display text-2xl font-bold text-[#4f3d4a] sm:text-3xl">Bảng xếp hạng</span>
                  </span>
                  <span className="ml-2 hidden font-cn text-xl text-[#b58fa0] sm:inline">排行榜</span>
                </h1>
                <p className="mt-1.5 text-sm font-semibold leading-relaxed text-[#8d7484]">
                  Đua tốc độ ghi nhớ cùng cả cộng đồng — mỗi từ bạn ôn hôm nay đều tính điểm. Cùng nhau 进步 nhé!
                </p>
              </div>
            </div>
          </header>

          {/* ================= Giải đấu hiện tại ================= */}
          <Reveal>
            <section className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto]" aria-label="Giải đấu hiện tại">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--pastel-peach)]/70 via-[var(--pastel-butter)]/55 to-[var(--pastel-butter)]/40 px-5 py-4 ring-1 ring-[#f3d6c2]">
                <WashiTape color="var(--pastel-mint)" pattern="stripes" rotate={2} className="-right-3 -top-2 h-5 w-16" />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b06a3b]">Giải đấu hiện tại</p>
                <p className="mt-0.5 font-display text-xl font-extrabold text-[#7a4b5e]">🐯 Giải Hổ Vàng · Hạng “Học Máu”</p>
                <p className="mt-1 text-xs font-semibold leading-relaxed text-[#8a6a1f]">
                  Top <b>{topAdvance}</b> của bảng sẽ thăng lên <b>Giải Rồng Ngọc</b> 🐉 — 5 hạng cuối rớt xuống Giải Gấu Trúc. Cố lên!
                </p>
              </div>
              <div className="paper-scrap flex flex-col items-center justify-center rounded-2xl px-6 py-4 text-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b58fa0]">Kết thúc sau</p>
                <p className="font-display text-3xl font-extrabold leading-tight text-[#4f3d4a]">3<span className="ml-1 text-sm font-bold text-[#8d7484]">ngày</span></p>
                <p className="text-[10px] font-semibold text-[#b58fa0]">23:59 Chủ nhật</p>
              </div>
            </section>
          </Reveal>

          {/* ================= Tabs kỳ xếp hạng ================= */}
          <div className="mt-5 flex flex-wrap items-center gap-2" role="tablist" aria-label="Chọn kỳ xếp hạng">
            {PERIODS.map((p) => (
              <PeriodPill key={p.id} active={period === p.id} onClick={() => setPeriod(p.id)}>
                {p.label}
              </PeriodPill>
            ))}
          </div>

          {/* ================= Bục vinh danh top 3 ================= */}
          <Reveal>
            <section className="mt-5 grid grid-cols-3 items-end gap-2 sm:gap-4" aria-label="Top 3">
              {podium.map((p, i) => {
                const order = [1, 0, 2] // 2 · 1 · 3 trên màn hình
                const player = podium[order[i]]
                return (
                  <motion.div
                    key={player.rank}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, delay: 0.1 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-col items-center"
                  >
                    <span className="mb-1 text-2xl sm:text-3xl" aria-hidden="true">{MEDALS[player.rank - 1]}</span>
                    <span
                      className={`grid place-items-center rounded-full text-3xl shadow-md sm:text-4xl ${player.rank === 1 ? 'h-16 w-16 bg-[var(--pastel-butter)] ring-4 ring-[#f0b429]/50 sm:h-20 sm:w-20' : 'h-14 w-14 bg-[var(--cream)] ring-2 ring-[#ead9cd] sm:h-16 sm:w-16'}`}
                      aria-hidden="true"
                    >
                      {player.avatar}
                    </span>
                    <p className="mt-1.5 max-w-full truncate text-xs font-extrabold text-[#4f3d4a] sm:text-sm">{player.name}</p>
                    <p className="font-display text-sm font-extrabold text-[#c2547e] sm:text-base">{player.xp.toLocaleString('vi-VN')} XP</p>
                    <div
                      className={`mt-2 w-full rounded-t-2xl ring-1 ${PODIUM_BG[player.rank - 1]} ${PODIUM_H[player.rank - 1]} relative flex items-start justify-center pt-1.5`}
                    >
                      <span className="font-cn text-2xl font-bold text-[#b58fa0]/70" aria-hidden="true">{['一', '二', '三'][player.rank - 1]}</span>
                    </div>
                  </motion.div>
                )
              })}
            </section>
          </Reveal>

          {/* ================= Danh sách hạng 4+ ================= */}
          <Reveal delay={0.05}>
            <section className="paper-scrap relative mt-5 rounded-2xl px-3.5 py-5 sm:px-5" aria-label="Danh sách xếp hạng">
              <ul className="space-y-2">
                {rest.map((p, i) => (
                  <PlayerRow key={p.name} p={p} index={i} />
                ))}
              </ul>

              <p className="mt-4 border-t border-dashed border-[#ead9cd] pt-3 text-center text-[11px] font-bold text-[#b58fa0]">
                Bảng {PERIODS.find((x) => x.id === period)?.label.toLowerCase()} · điểm XP = số thẻ học + ôn × độ khó
              </p>
            </section>
          </Reveal>

          {/* ================= CTA ------------------------------------ */}
          <Reveal delay={0.05}>
            <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl bg-[var(--pastel-mint)]/40 px-5 py-5 text-center ring-1 ring-[#cfe6d6] sm:flex-row sm:text-left">
              <span className="text-3xl" aria-hidden="true">⚔️</span>
              <p className="flex-1 text-xs font-semibold leading-relaxed text-[#3f6b50]">
                <b>{me ? `Bạn đang hạng ${me.rank} với ${me.xp.toLocaleString('vi-VN')} XP.` : 'Chưa có điểm tuần này.'}</b>{' '}
                Ôn 1 bài (~5 phút) mỗi ngày là đủ để leo thêm 2–3 hạng trước Chủ nhật!
              </p>
              <a
                href="#/review"
                className="shrink-0 rounded-full bg-[#3f6b50] px-5 py-2.5 text-xs font-bold text-white shadow-[0_4px_0_0_#2e513c] transition-transform hover:-translate-y-0.5"
              >
                ▶ Ôn để lấy điểm
              </a>
            </div>
          </Reveal>

          {/* nút chia sẻ */}
          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => toast({ title: '📣 Đã chép liên kết bảng xếp hạng!', description: 'Gửi cho bạn bè cùng thi đua nhé (demo).' })}
              className="text-xs font-bold text-[#8d7484] underline decoration-dashed underline-offset-4 transition-colors hover:text-[#e8737f]"
            >
              Mời bạn bè vào giải đấu
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
