'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Footer from '../landing/footer'
import { PushPin, Reveal, WashiTape } from '../landing/decor'
import { useToast } from '@/hooks/use-toast'

/* ============================================================
   Hồ sơ của tôi — thông tin học viên, mục tiêu & cài đặt
   Route: #/profile
   Số liệu nhất quán: streak 1 ngày · XP 1.240 · TB/thẻ 52.2 giây
   ============================================================ */

/* ---------- icon nhỏ ---------- */

function Switch({ on }: { on: boolean }) {
  return (
    <span
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${on ? 'bg-[#8fbf7f]' : 'bg-[#e0cdb9]'}`}
      aria-hidden="true"
    >
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${on ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
    </span>
  )
}

function StatTile({ emoji, label, value, sub, tone }: { emoji: string; label: string; value: string; sub: string; tone: 'pink' | 'green' | 'butter' | 'lilac' }) {
  const cls = {
    pink: 'bg-[var(--pastel-pink-soft)]/60 ring-[#f3c4d3]',
    green: 'bg-[var(--pastel-mint)]/40 ring-[#cfe6d6]',
    butter: 'bg-[var(--pastel-butter)]/45 ring-[#f2e2b8]',
    lilac: 'bg-[var(--pastel-lilac)]/40 ring-[#e2d6f0]',
  }[tone]
  return (
    <div className={`rounded-2xl px-4 py-3.5 ring-1 ${cls}`}>
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#8d7484]">
        <span aria-hidden="true">{emoji}</span> {label}
      </p>
      <p className="mt-1 font-display text-2xl font-extrabold leading-none text-[#4f3d4a]">{value}</p>
      <p className="mt-1 text-[10px] font-semibold text-[#b58fa0]">{sub}</p>
    </div>
  )
}

/* ============================================================
   Trang chính
   ============================================================ */

export default function Profile() {
  const { toast } = useToast()
  const [knownTotal, setKnownTotal] = useState(0)
  const [studiedLessons, setStudiedLessons] = useState(0)
  const [settings, setSettings] = useState({ pinyin: true, autoSpeak: true, remind: true })

  /* số liệu thật từ localStorage */
  useEffect(() => {
    try {
      let known = 0
      const studied = new Set<string>()
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (!key) continue
        if (key.startsWith('nkhn.known:')) {
          const marks = JSON.parse(localStorage.getItem(key) ?? '{}') as Record<string, 'known' | 'unknown'>
          known += Object.values(marks).filter((m) => m === 'known').length
        } else if (key === 'nkhn.studies') {
          const studies = JSON.parse(localStorage.getItem(key) ?? '{}') as Record<string, number>
          for (const s of Object.keys(studies)) studied.add(s)
        }
      }
      // eslint-disable-next-line react-hooks/set-state-in-effect -- số liệu chỉ đọc được từ localStorage phía client
      setKnownTotal(known)
      setStudiedLessons(studied.size)
    } catch {
      /* bỏ qua */
    }
  }, [])

  const xp = 1240
  const dailyGoal = 10
  const doneToday = 0
  const goalPct = Math.min(100, Math.round((doneToday / dailyGoal) * 100))

  return (
    <div className="flex min-h-screen flex-col bg-[#fff6e9] text-[#5d4a57]">
      <main className="relative flex-1 pb-16 pt-20 sm:pt-24">
        <div aria-hidden="true" className="dot-grid absolute inset-0" />

        <div className="relative mx-auto max-w-3xl px-4 sm:px-6">
          {/* ================= Header: thẻ danh thiếp ================= */}
          <header className="paper-scrap relative rounded-2xl px-5 py-7 sm:px-8">
            <WashiTape color="var(--pastel-lilac)" pattern="dots" rotate={-5} className="-top-3 left-10 h-6 w-20" />
            <PushPin color="#e8737f" className="absolute right-8 top-3 scale-75" />

            <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
              {/* avatar */}
              <span className="relative grid h-20 w-20 shrink-0 place-items-center rounded-full bg-[var(--pastel-lilac)] text-5xl shadow-inner ring-4 ring-white" aria-hidden="true">
                🐼
                <span className="absolute -bottom-1 -right-1 rounded-full bg-[var(--pastel-butter)] px-2 py-0.5 text-[10px] font-extrabold text-[#8a6a1f] ring-2 ring-white">
                  Lv.2
                </span>
              </span>

              <div className="min-w-0 flex-1">
                <h1 className="leading-tight">
                  <span className="relative inline-block px-3 py-0.5">
                    <span aria-hidden="true" className="absolute inset-0 -rotate-1 rounded-md bg-[var(--pastel-butter)] opacity-90" />
                    <span className="relative font-display text-2xl font-bold text-[#4f3d4a] sm:text-3xl">Học viên Nhật ký</span>
                  </span>
                </h1>
                <p className="mt-1.5 text-sm font-semibold text-[#8d7484]">hocvien@nhatkyhanngu.vn</p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="rounded-full bg-[var(--pastel-pink)] px-2.5 py-1 text-[11px] font-bold text-[#8a4a63]">🎓 HSK 1 · 加油</span>
                  <span className="rounded-full bg-[var(--cream)] px-2.5 py-1 text-[11px] font-bold text-[#6f5a68] ring-1 ring-[#ead9cd]">Tham gia 11/2026</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => toast({ title: '✏️ Chỉnh sửa hồ sơ', description: 'Tính năng đổi tên & ảnh đại diện sắp ra mắt!' })}
                className="rounded-full bg-[var(--cream)] px-4 py-2 text-xs font-bold text-[#6f5a68] ring-1 ring-[#ead9cd] transition-all hover:-translate-y-0.5 hover:text-[#4f3d4a]"
              >
                ✏️ Sửa hồ sơ
              </button>
            </div>
          </header>

          {/* ================= Số liệu ================= */}
          <Reveal>
            <section className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Số liệu học tập">
              <StatTile emoji="🔥" label="Streak" value="1 ngày" sub="Học liên tục mỗi ngày" tone="pink" />
              <StatTile emoji="⚡" label="XP" value={xp.toLocaleString('vi-VN')} sub="Hạng 8 bảng tuần" tone="butter" />
              <StatTile emoji="🃏" label="Thẻ đã học" value={String(Math.max(knownTotal, 14))} sub={`${studiedLessons} bài đã mở`} tone="green" />
              <StatTile emoji="⏱️" label="TB / thẻ" value="52.2s" sub="Tốc độ ôn trung bình" tone="lilac" />
            </section>
          </Reveal>

          {/* ================= Mục tiêu hôm nay ================= */}
          <Reveal delay={0.05}>
            <section className="paper-scrap relative mt-5 rounded-2xl px-5 py-5 sm:px-7" aria-label="Mục tiêu học tập hôm nay">
              <WashiTape color="var(--pastel-mint)" pattern="stripes" rotate={3} className="-top-2.5 right-10 h-5 w-14" />

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="font-display text-lg font-bold text-[#4f3d4a]">🎯 Mục tiêu hôm nay</h2>
                  <p className="mt-0.5 text-xs font-semibold text-[#8d7484]">10 thẻ mỗi ngày — đủ để giữ chu kỳ ôn tập hoàn hảo</p>
                </div>
                <p className="font-display text-2xl font-extrabold text-[#c2547e]">
                  {doneToday}<span className="text-sm text-[#b58fa0]">/{dailyGoal} thẻ</span>
                </p>
              </div>

              <div className="mt-3 h-3.5 overflow-hidden rounded-full bg-[var(--cream)] ring-1 ring-[#ead9cd]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${goalPct}%` }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full rounded-full bg-gradient-to-r from-[#a8d8b0] to-[#3f6b50]"
                />
              </div>
              <p className="mt-2 text-[11px] font-bold text-[#8d7484]">
                {doneToday === 0 ? '🌈 Mở một bài học để bắt đầu streak hôm nay nhé!' : 'Tuyệt vời — tiếp tục nhé!'}
              </p>
            </section>
          </Reveal>

          {/* ================= Lộ trình đang theo ================= */}
          <Reveal delay={0.05}>
            <section className="mt-5 grid gap-4 sm:grid-cols-2" aria-label="Lộ trình đang theo">
              <div className="paper-scrap rounded-2xl px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--pastel-pink)] font-cn text-lg text-[#8a4a63]" aria-hidden="true">考</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-extrabold text-[#4f3d4a]">Lộ trình HSK 3.0</p>
                    <p className="text-[11px] font-semibold text-[#b58fa0]">Đang học HSK 1 — Khởi đầu</p>
                  </div>
                  <a href="#/roadmap/hsk-1" className="text-xs font-bold text-[#c2547e] hover:text-[#e8737f]">Mở →</a>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--cream)] ring-1 ring-[#ead9cd]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.round((studiedLessons / Math.max(1, 12)) * 100)}%` }}
                    transition={{ duration: 0.6 }}
                    className="h-full rounded-full bg-gradient-to-r from-[#f3a1ad] to-[#e8737f]"
                  />
                </div>
                <p className="mt-1.5 text-[11px] font-bold text-[#b58fa0]">Tiến độ khởi đầu tuyệt vời — giữ nhịp nhé!</p>
              </div>

              <div className="paper-scrap rounded-2xl px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--pastel-sky)] font-cn text-lg text-[#46688f]" aria-hidden="true">词</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-extrabold text-[#4f3d4a]">Từ vựng đã thuộc</p>
                    <p className="text-[11px] font-semibold text-[#b58fa0]">Tổng hợp mọi lộ trình</p>
                  </div>
                  <a href="#/my-decks" className="text-xs font-bold text-[#c2547e] hover:text-[#e8737f]">Xem →</a>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--cream)] ring-1 ring-[#ead9cd]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, Math.round((Math.max(knownTotal, 14) / 605) * 100))}%` }}
                    transition={{ duration: 0.6 }}
                    className="h-full rounded-full bg-gradient-to-r from-[#a8d8b0] to-[#3f6b50]"
                  />
                </div>
                <p className="mt-1.5 text-[11px] font-bold text-[#b58fa0]">{Math.max(knownTotal, 14)} / 605 từ trong kho học liệu</p>
              </div>
            </section>
          </Reveal>

          {/* ================= Cài đặt học tập ================= */}
          <Reveal delay={0.05}>
            <section className="paper-scrap relative mt-5 rounded-2xl px-5 py-5 sm:px-7" aria-label="Cài đặt học tập">
              <PushPin color="#7fb2e5" className="absolute right-8 top-3 scale-75" />

              <h2 className="font-display text-lg font-bold text-[#4f3d4a]">⚙️ Cài đặt học tập</h2>
              <ul className="mt-3 divide-y divide-dashed divide-[#ead9cd]">
                {(
                  [
                    { key: 'pinyin', emoji: '🔤', title: 'Luôn hiện Pinyin trên thẻ', desc: 'Hiện phiên âm ngay khi lật thẻ' },
                    { key: 'autoSpeak', emoji: '🔊', title: 'Tự động phát âm', desc: 'Đọc to từ mới mỗi lần lật thẻ' },
                    { key: 'remind', emoji: '⏰', title: 'Nhắc học hằng ngày', desc: 'Gửi thông báo lúc 19:00 mỗi tối' },
                  ] as const
                ).map((s) => (
                  <li key={s.key} className="flex items-center gap-3 py-3">
                    <span className="text-xl" aria-hidden="true">{s.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-[#4f3d4a]">{s.title}</p>
                      <p className="text-[11px] font-semibold text-[#b58fa0]">{s.desc}</p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={settings[s.key]}
                      aria-label={s.title}
                      onClick={() => {
                        setSettings((p) => ({ ...p, [s.key]: !p[s.key] }))
                        toast({ title: `${settings[s.key] ? 'Đã tắt' : 'Đã bật'}: ${s.title}` })
                      }}
                    >
                      <Switch on={settings[s.key]} />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          </Reveal>

          {/* thành tựu gần nhất */}
          <Reveal delay={0.05}>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[var(--pastel-butter)]/40 px-5 py-4 ring-1 ring-[#f2e2b8]">
              <p className="flex items-center gap-2 text-xs font-bold text-[#8a6a1f]">
                <span className="text-xl" aria-hidden="true">🏅</span>
                Thành tựu mới nhất: “Bước đầu tiên” — học ngày đầu tiên!
              </p>
              <a href="#/achievements" className="text-xs font-bold text-[#c2547e] underline decoration-dashed underline-offset-4 hover:text-[#e8737f]">
                Xem tất cả thành tựu →
              </a>
            </div>
          </Reveal>
        </div>
      </main>

      <Footer />
    </div>
  )
}
