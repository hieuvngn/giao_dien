'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Footer from '../landing/footer'
import { PushPin, Reveal, WashiTape } from '../landing/decor'
import { useToast } from '@/hooks/use-toast'

/* ============================================================
   Thành tựu — huy hiệu ghi nhận tiến trình học
   Route: #/achievements
   Số liệu nhất quán với trang Ôn tập: streak 1 ngày · 14 thẻ · 1 lượt ôn
   ============================================================ */

type AchCategory = 'streak' | 'vocab' | 'roadmap' | 'social'

type Achievement = {
  id: string
  emoji: string
  name: string
  desc: string
  category: AchCategory
  current: number
  goal: number
  unit?: string
}

type AchState = {
  knownTotal: number
  studiedLessons: number
}

const CATEGORY_FILTERS: { id: AchCategory | 'all'; label: string; emoji: string }[] = [
  { id: 'all', label: 'Tất cả', emoji: '🏅' },
  { id: 'streak', label: 'Chuỗi ngày', emoji: '🔥' },
  { id: 'vocab', label: 'Từ vựng', emoji: '🃏' },
  { id: 'roadmap', label: 'Lộ trình', emoji: '🗺️' },
  { id: 'social', label: 'Cộng đồng', emoji: '🤝' },
]

/* Danh sách huy hiệu — current được cập nhật thật khi có dữ liệu */
function buildAchievements(state: AchState): Achievement[] {
  return [
    // Chuỗi ngày
    { id: 'first-day', emoji: '🌱', name: 'Bước đầu tiên', desc: 'Học trong 1 ngày', category: 'streak', current: 1, goal: 1, unit: 'ngày' },
    { id: 'streak-3', emoji: '🔥', name: 'Lửa ấm dần', desc: 'Streak 3 ngày liên tục', category: 'streak', current: 1, goal: 3, unit: 'ngày' },
    { id: 'streak-7', emoji: '☄️', name: 'Tuần hoàn hảo', desc: 'Streak 7 ngày liên tục', category: 'streak', current: 1, goal: 7, unit: 'ngày' },
    { id: 'streak-21', emoji: '🐉', name: 'Hóa rồng', desc: 'Streak 21 ngày — kiến thức vào trí nhớ dài hạn', category: 'streak', current: 1, goal: 21, unit: 'ngày' },

    // Từ vựng
    { id: 'cards-10', emoji: '🃏', name: 'Khai chiến', desc: 'Học 10 thẻ đầu tiên', category: 'vocab', current: Math.max(14, state.knownTotal), goal: 10, unit: 'thẻ' },
    { id: 'cards-100', emoji: '📚', name: 'Trăm thẻ tiến', desc: 'Học 100 thẻ', category: 'vocab', current: Math.max(14, state.knownTotal), goal: 100, unit: 'thẻ' },
    { id: 'reviews-10', emoji: '🔁', name: 'Ôn đều tay', desc: 'Hoàn thành 10 lượt ôn tập', category: 'vocab', current: 1, goal: 10, unit: 'lượt' },
    { id: 'perfect-lesson', emoji: '💯', name: 'Trọn vẹn', desc: 'Thuộc tất cả thẻ của một bài', category: 'vocab', current: 0, goal: 1, unit: 'bài' },

    // Lộ trình
    { id: 'lesson-1', emoji: '🐯', name: 'Xin chào HSK', desc: 'Học bài đầu tiên của HSK 1', category: 'roadmap', current: Math.min(1, state.studiedLessons), goal: 1, unit: 'bài' },
    { id: 'hsk1-done', emoji: '🎓', name: 'Chinh phục HSK 1', desc: 'Hoàn thành toàn bộ bài học HSK 1', category: 'roadmap', current: 0, goal: 1, unit: 'cấp độ' },
    { id: 'yct-start', emoji: '🧒', name: 'Mở lớp YCT', desc: 'Học một bài trong lộ trình YCT', category: 'roadmap', current: 0, goal: 1, unit: 'bài' },
    { id: 'boya-start', emoji: '📘', name: 'Khởi động Boya', desc: 'Học một bài trong giáo trình Boya', category: 'roadmap', current: 0, goal: 1, unit: 'bài' },

    // Cộng đồng
    { id: 'join-league', emoji: '⚔️', name: 'Vào trận', desc: 'Tham gia bảng xếp hạng tuần', category: 'social', current: 1, goal: 1, unit: 'giải' },
    { id: 'top-5', emoji: '🥇', name: 'Ngôi sao bảng xếp hạng', desc: 'Lọt top 5 bảng tuần', category: 'social', current: 0, goal: 1, unit: 'lần' },
    { id: 'friend-3', emoji: '🤝', name: 'Tam mã', desc: 'Mời 3 người bạn cùng học', category: 'social', current: 0, goal: 3, unit: 'bạn' },
    { id: 'share-1', emoji: '📣', name: 'Người truyền cảm hứng', desc: 'Chia sẻ thành tích lần đầu', category: 'social', current: 0, goal: 1, unit: 'lần' },
  ]
}

/* ---------- huy hiệu ---------- */

function AchievementCard({ a, index }: { a: Achievement; index: number }) {
  const unlocked = a.current >= a.goal
  const pct = Math.min(100, Math.round((a.current / a.goal) * 100))

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 18, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, delay: Math.min((index % 8) * 0.05, 0.35), ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3, rotate: unlocked ? [0, -1.5, 1.5, 0] : 0 }}
      className={`paper-scrap relative flex flex-col items-center rounded-2xl px-4 py-5 text-center ${
        unlocked ? '' : 'opacity-80'
      }`}
    >
      {/* vòng huy hiệu */}
      <span
        className={`relative grid h-16 w-16 place-items-center rounded-full text-3xl ${
          unlocked
            ? 'bg-gradient-to-br from-[var(--pastel-butter)] to-[#f5d98a] shadow-[0_4px_12px_rgba(240,180,41,0.35)] ring-4 ring-[#f0b429]/40'
            : 'bg-[var(--cream)] grayscale-[0.7] opacity-60 ring-2 ring-dashed ring-[#e0cdb9]'
        }`}
        aria-hidden="true"
      >
        {a.emoji}
        {unlocked && (
          <span className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-[var(--pastel-mint)] text-[10px] font-extrabold text-[#3f6b50] ring-2 ring-[#fffdf6]">
            ✓
          </span>
        )}
      </span>

      <p className={`mt-3 text-sm font-extrabold ${unlocked ? 'text-[#4f3d4a]' : 'text-[#8d7484]'}`}>{a.name}</p>
      <p className="mt-0.5 text-[11px] font-semibold leading-snug text-[#b58fa0]">{a.desc}</p>

      {/* tiến độ */}
      <div className="mt-3 w-full">
        <div className="h-2 overflow-hidden rounded-full bg-[var(--cream)] ring-1 ring-[#ead9cd]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className={`h-full rounded-full ${unlocked ? 'bg-[#8fbf7f]' : 'bg-gradient-to-r from-[#f3a1ad] to-[#e8737f]'}`}
          />
        </div>
        <p className={`mt-1.5 text-[10px] font-extrabold ${unlocked ? 'text-[#3f6b50]' : 'text-[#b58fa0]'}`}>
          {unlocked ? '🏆 Đã đạt được!' : `${a.current}/${a.goal} ${a.unit ?? ''}`}
        </p>
      </div>
    </motion.div>
  )
}

/* ============================================================
   Trang chính
   ============================================================ */

export default function Achievements() {
  const { toast } = useToast()
  const [cat, setCat] = useState<AchCategory | 'all'>('all')
  const [state, setState] = useState<AchState>({ knownTotal: 0, studiedLessons: 0 })

  /* đếm thẻ đã thuộc + bài đã học thật từ localStorage */
  useEffect(() => {
    try {
      let knownTotal = 0
      const studiedIds = new Set<string>()
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (!key) continue
        if (key.startsWith('nkhn.known:')) {
          const marks = JSON.parse(localStorage.getItem(key) ?? '{}') as Record<string, 'known' | 'unknown'>
          knownTotal += Object.values(marks).filter((m) => m === 'known').length
        } else if (key === 'nkhn.studies') {
          const studies = JSON.parse(localStorage.getItem(key) ?? '{}') as Record<string, number>
          for (const s of Object.keys(studies)) studiedIds.add(s)
        }
      }
      // eslint-disable-next-line react-hooks/set-state-in-effect -- số liệu chỉ đọc được từ localStorage phía client
      setState({ knownTotal, studiedLessons: studiedIds.size })
    } catch {
      /* bỏ qua */
    }
  }, [])

  const all = useMemo(() => buildAchievements(state), [state])
  const shown = useMemo(() => all.filter((a) => cat === 'all' || a.category === cat), [all, cat])

  const unlockedCount = all.filter((a) => a.current >= a.goal).length
  const nextAch = all.find((a) => a.current < a.goal)

  /* tiến độ XP tổng quan (nhất quán với bảng xếp hạng: 1.240 XP) */
  const xp = 1240
  const xpToNext = 2000

  return (
    <div className="flex min-h-screen flex-col bg-[#fff6e9] text-[#5d4a57]">
      <main className="relative flex-1 pb-16 pt-20 sm:pt-24">
        <div aria-hidden="true" className="dot-grid absolute inset-0" />

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6">
          {/* ================= Header ================= */}
          <header className="paper-scrap relative rounded-2xl px-5 py-6 sm:px-7">
            <WashiTape color="var(--pastel-butter)" pattern="dots" rotate={-5} className="-top-3 left-10 h-6 w-20" />
            <PushPin color="#7fb2e5" className="absolute right-8 top-3 scale-75" />

            <div className="flex flex-wrap items-center gap-4">
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[var(--cream)] text-4xl shadow-inner ring-1 ring-[#ead9cd]" aria-hidden="true">
                🏅
              </span>
              <div className="min-w-0 flex-1">
                <h1 className="leading-tight">
                  <span className="relative inline-block px-3 py-0.5">
                    <span aria-hidden="true" className="absolute inset-0 -rotate-1 rounded-md bg-[var(--pastel-butter)] opacity-90" />
                    <span className="relative font-display text-2xl font-bold text-[#4f3d4a] sm:text-3xl">Thành tựu</span>
                  </span>
                  <span className="ml-2 hidden font-cn text-xl text-[#b58fa0] sm:inline">学习成就</span>
                </h1>
                <p className="mt-1.5 text-sm font-semibold leading-relaxed text-[#8d7484]">
                  Mỗi huy hiệu là một cột mốc trên hành trình học tiếng Trung của bạn — thu thập đủ bộ sưu tập nào!
                </p>
              </div>
            </div>
          </header>

          {/* ================= Cấp độ + huy hiệu đạt ================= */}
          <Reveal>
            <section className="mt-5 grid gap-4 md:grid-cols-2" aria-label="Tổng quan thành tựu">
              {/* XP */}
              <div className="paper-scrap rounded-2xl px-5 py-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-extrabold text-[#4f3d4a]">🐼 Cấp độ “Học Máu”</p>
                  <p className="font-display text-sm font-extrabold text-[#c2547e]">{xp.toLocaleString('vi-VN')} XP</p>
                </div>
                <div className="mt-2.5 h-3 overflow-hidden rounded-full bg-[var(--cream)] ring-1 ring-[#ead9cd]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.round((xp / xpToNext) * 100)}%` }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full rounded-full bg-gradient-to-r from-[#c9a2e8] to-[#8f6fc9]"
                  />
                </div>
                <p className="mt-2 text-[11px] font-bold text-[#b58fa0]">
                  Còn {(xpToNext - xp).toLocaleString('vi-VN')} XP nữa lên hạng “Chăm Chỉ” — học thêm {Math.ceil((xpToNext - xp) / 40)} thẻ!
                </p>
              </div>

              {/* huy hiệu */}
              <div className="rounded-2xl bg-[var(--pastel-butter)]/45 px-5 py-4 ring-1 ring-[#f2e2b8]">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-extrabold text-[#4f3d4a]">Bộ sưu tập huy hiệu</p>
                  <p className="font-display text-sm font-extrabold text-[#8a6a1f]">
                    {unlockedCount}/{all.length}
                  </p>
                </div>
                <div className="mt-2.5 flex flex-wrap gap-1">
                  {all.map((a) => (
                    <span
                      key={a.id}
                      title={`${a.name} — ${a.desc}`}
                      className={`grid h-8 w-8 place-items-center rounded-full text-base ${a.current >= a.goal ? 'bg-white/80 shadow-sm' : 'bg-white/40 grayscale opacity-50'}`}
                      aria-hidden="true"
                    >
                      {a.emoji}
                    </span>
                  ))}
                </div>
                {nextAch && (
                  <p className="mt-2 text-[11px] font-bold text-[#8a6a1f]">
                    Gần nhất: {nextAch.emoji} {nextAch.name} — {nextAch.current}/{nextAch.goal} {nextAch.unit}
                  </p>
                )}
              </div>
            </section>
          </Reveal>

          {/* ================= Bộ lọc ================= */}
          <Reveal delay={0.05}>
            <div className="mt-5 flex flex-wrap items-center gap-1.5" role="group" aria-label="Lọc theo nhóm thành tựu">
              {CATEGORY_FILTERS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCat(c.id)}
                  aria-pressed={cat === c.id}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                    cat === c.id
                      ? 'bg-[#4f3d4a] text-white shadow-[0_3px_0_0_#3a2d36]'
                      : 'bg-white/70 text-[#6f5a68] ring-1 ring-[#ead9cd] hover:-translate-y-0.5'
                  }`}
                >
                  <span aria-hidden="true">{c.emoji}</span> {c.label}
                </button>
              ))}
              <span className="ml-auto rounded-full bg-[var(--cream)] px-3 py-1 text-[11px] font-bold text-[#6f5a68] ring-1 ring-[#ead9cd]">
                {shown.length} huy hiệu
              </span>
            </div>
          </Reveal>

          {/* ================= Lưới huy hiệu ================= */}
          <section className="mt-4" aria-label="Danh sách huy hiệu" aria-live="polite">
            <motion.div layout className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {shown.map((a, i) => (
                <AchievementCard key={a.id} a={a} index={i} />
              ))}
            </motion.div>
          </section>

          {/* CTA chia sẻ */}
          <Reveal delay={0.05}>
            <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl bg-[var(--pastel-mint)]/40 px-5 py-5 text-center ring-1 ring-[#cfe6d6] sm:flex-row sm:text-left">
              <span className="text-3xl" aria-hidden="true">🎉</span>
              <p className="flex-1 text-xs font-semibold leading-relaxed text-[#3f6b50]">
                <b>Đã đạt {unlockedCount} huy hiệu!</b> Khoe thành tích với bạn bè để cùng nhau học cho có động lực nhé.
              </p>
              <button
                type="button"
                onClick={() => toast({ title: '📣 Đã chép liên kết chia sẻ!', description: 'Dán vào nhóm lớp để mọi người cùng thấy (demo).' })}
                className="shrink-0 rounded-full bg-[#3f6b50] px-5 py-2.5 text-xs font-bold text-white shadow-[0_4px_0_0_#2e513c] transition-transform hover:-translate-y-0.5"
              >
                Chia sẻ thành tích
              </button>
            </div>
          </Reveal>
        </div>
      </main>

      <Footer />
    </div>
  )
}
