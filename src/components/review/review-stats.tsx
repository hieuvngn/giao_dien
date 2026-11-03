'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Footer from '../landing/footer'
import { PushPin, Reveal, WashiTape } from '../landing/decor'
import { useToast } from '@/hooks/use-toast'

/* ============================================================
   Trang ôn tập & thống kê học tập
   Route: #/review
   Tabs Từ vựng / Ngữ pháp · 6 số liệu · 2 thẻ hành động · chi tiết ôn tập
   ============================================================ */

type Tab = 'vocab' | 'grammar'

type SummaryStat = {
  label: string
  value: number
  tone?: 'red' | 'green' | 'blue' | 'butter' | 'lilac' | 'plain'
  hint: string
}

type ReviewData = {
  need: number
  added: number
  learning: number
  young: number
  mature: number
  totalSeen: number
  streak: number
  today: number
  week: number
  perDay: number
  perCardSec: number
  totalReviews: number
  monthReviews: number
  grades: { again: number; hard: number; good: number; easy: number }
}

const EMPTY_DATA: ReviewData = {
  need: 0,
  added: 0,
  learning: 0,
  young: 0,
  mature: 0,
  totalSeen: 0,
  streak: 0,
  today: 0,
  week: 0,
  perDay: 0,
  perCardSec: 0,
  totalReviews: 0,
  monthReviews: 0,
  grades: { again: 0, hard: 0, good: 0, easy: 0 },
}

/* Dữ liệu demo khớp trạng thái học hiện tại (từ vựng) */
const VOCAB_DATA: ReviewData = {
  need: 14,
  added: 13,
  learning: 1,
  young: 0,
  mature: 0,
  totalSeen: 14,
  streak: 1,
  today: 0,
  week: 0,
  perDay: 1,
  perCardSec: 52.2,
  totalReviews: 1,
  monthReviews: 0,
  grades: { again: 1, hard: 0, good: 0, easy: 0 },
}

const GRAMMAR_DATA: ReviewData = EMPTY_DATA

const WEEK_DAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN']

/* ---------- icon nhỏ ---------- */

function ClockIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  )
}

/* ================= Tab pill ================= */

function TabPill({
  active,
  badge,
  onClick,
  children,
}: {
  active: boolean
  badge?: number
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="tab"
      aria-selected={active}
      className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-all duration-200 ${
        active
          ? 'bg-[#4f3d4a] text-white shadow-[0_4px_0_0_#3a2d36]'
          : 'paper-scrap text-[#6f5a68] hover:-translate-y-0.5 hover:text-[#4f3d4a]'
      }`}
    >
      {children}
      {badge !== undefined && badge > 0 && (
        <span
          className={`grid h-6 min-w-6 place-items-center rounded-full px-1.5 text-xs font-extrabold ${
            active ? 'bg-[var(--pastel-butter)] text-[#8a6a1f]' : 'bg-[var(--cream)] text-[#8d7484] ring-1 ring-[#ead9cd]'
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  )
}

/* ================= Ô số liệu tổng quan ================= */

const TONE_CLASS: Record<NonNullable<SummaryStat['tone']>, { ring: string; value: string }> = {
  red: { ring: 'ring-[#f3c4d3] bg-[var(--pastel-pink-soft)]/60', value: 'text-[#d2495f]' },
  green: { ring: 'ring-[#cfe6d6] bg-[var(--pastel-mint)]/40', value: 'text-[#3f6b50]' },
  blue: { ring: 'ring-[#cfdff0] bg-[var(--pastel-sky)]/40', value: 'text-[#46688f]' },
  butter: { ring: 'ring-[#f2e2b8] bg-[var(--pastel-butter)]/45', value: 'text-[#8a6a1f]' },
  lilac: { ring: 'ring-[#e2d6f0] bg-[var(--pastel-lilac)]/40', value: 'text-[#6d5a94]' },
  plain: { ring: 'ring-[#ead9cd] bg-white/60', value: 'text-[#4f3d4a]' },
}

function MetricCard({ stat, index }: { stat: SummaryStat; index: number }) {
  const tone = TONE_CLASS[stat.tone ?? 'plain']
  return (
    <Reveal delay={index * 0.05} y={18}>
      <div className={`rounded-2xl px-4 py-3.5 ring-1 transition-transform duration-200 hover:-translate-y-1 ${tone.ring}`}>
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#8d7484]">{stat.label}</p>
        <p className={`mt-1 font-display text-3xl font-extrabold leading-none ${tone.value}`}>{stat.value}</p>
        <p className="mt-1.5 text-[10px] font-semibold leading-snug text-[#b58fa0]">{stat.hint}</p>
      </div>
    </Reveal>
  )
}

/* ================= Biểu đồ 7 ngày ================= */

function WeekChart({ data, label }: { data: number[]; label: string }) {
  const max = Math.max(...data, 1)
  const hasData = data.some((v) => v > 0)

  return (
    <div className="rounded-2xl bg-[var(--cream)]/60 p-4 ring-1 ring-[#f0e2d4]">
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-extrabold text-[#4f3d4a]">7 ngày gần nhất</p>
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#b58fa0]">{label}</p>
      </div>

      <div className="relative mt-4 h-36" aria-hidden="true">
        {/* lưới ngang chấm */}
        <div className="absolute inset-0 flex flex-col justify-between">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="border-t border-dashed border-[#ead9cd]/80" />
          ))}
        </div>

        {/* các cột */}
        <div className="absolute inset-0 flex items-end justify-between gap-2 px-1">
          {data.map((v, i) => (
            <div key={i} className="flex h-full flex-1 flex-col items-center justify-end">
              {v > 0 ? (
                <motion.span
                  initial={{ height: 0 }}
                  animate={{ height: `${(v / max) * 100}%` }}
                  transition={{ duration: 0.6, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full max-w-9 rounded-t-lg bg-gradient-to-t from-[#e8737f] to-[#f3a1ad]"
                />
              ) : (
                <span className="mb-0.5 h-1.5 w-1.5 rounded-full bg-[#ead9cd]" />
              )}
            </div>
          ))}
        </div>

        {/* trạng thái trống */}
        {!hasData && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 pb-5">
            <span className="text-2xl" aria-hidden="true">📭</span>
            <p className="text-[11px] font-bold text-[#b58fa0]">Chưa có lượt ôn nào trong 7 ngày qua</p>
          </div>
        )}
      </div>

      {/* nhãn thứ */}
      <div className="mt-2 flex justify-between gap-2 px-1">
        {WEEK_DAYS.map((day) => (
          <span key={day} className="flex-1 text-center text-[9px] font-bold text-[#b58fa0] sm:text-[10px]">
            {day}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ================= Phân bổ đánh giá ================= */

function GradeBars({ grades, total }: { grades: ReviewData['grades']; total: number }) {
  const rows = [
    { label: 'Quên rồi', value: grades.again, color: '#d2495f' },
    { label: 'Khó', value: grades.hard, color: '#c07a2c' },
    { label: 'Tốt', value: grades.good, color: '#3f6b50' },
    { label: 'Dễ', value: grades.easy, color: '#46688f' },
  ]

  return (
    <div className="rounded-2xl bg-[var(--cream)]/60 p-4 ring-1 ring-[#f0e2d4]">
      <p className="text-sm font-extrabold text-[#4f3d4a]">
        Phân bổ đánh giá <span className="font-semibold text-[#b58fa0]">({total} lượt)</span>
      </p>
      <div className="mt-4 space-y-3.5">
        {rows.map((r) => {
          const pct = total > 0 ? Math.round((r.value / total) * 100) : 0
          return (
            <div key={r.label}>
              <div className="mb-1 flex items-center justify-between text-xs font-bold">
                <span className="text-[#6f5a68]">{r.label}</span>
                <span className="text-[#8d7484]">
                  {r.value} <span className="text-[#b58fa0]">({pct}%)</span>
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-white ring-1 ring-[#ead9cd]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: r.color, minWidth: r.value > 0 ? 8 : 0 }}
                />
              </div>
            </div>
          )
        })}
      </div>
      <p className="mt-3 text-[10px] font-semibold leading-relaxed text-[#b58fa0]">
        Đánh giá sau mỗi lần lật thẻ: “Quên rồi” → thẻ quay lại sớm hơn · “Dễ” → ôn xa hơn.
      </p>
    </div>
  )
}

/* ============================================================
   Trang chính
   ============================================================ */

export default function ReviewStats() {
  const { toast } = useToast()
  const [tab, setTab] = useState<Tab>('vocab')
  const d = tab === 'vocab' ? VOCAB_DATA : GRAMMAR_DATA

  const summary: SummaryStat[] = [
    { label: 'Cần ôn', value: d.need, tone: d.need > 0 ? 'red' : 'plain', hint: 'Thẻ đến hạn ôn hôm nay' },
    { label: 'Mới thêm', value: d.added, tone: 'blue', hint: 'Thẻ mới thêm gần đây' },
    { label: 'Đang học', value: d.learning, tone: 'butter', hint: 'Đang trong chu kỳ ngắn' },
    { label: 'Mới thuộc (< 21 ngày)', value: d.young, tone: 'lilac', hint: 'Chưa ổn định lâu dài' },
    { label: 'Đã thuộc (dài hạn)', value: d.mature, tone: 'green', hint: 'Trôi qua đủ chu kỳ 21 ngày' },
    { label: 'Tổng đã học qua', value: d.totalSeen, tone: 'plain', hint: 'Toàn bộ thẻ đã bắt đầu học' },
  ]

  const subMetrics = [
    { icon: '🔥', label: 'Streak', value: `${d.streak} ngày` },
    { icon: '📅', label: 'Hôm nay', value: `${d.today} lượt` },
    { icon: '🗓️', label: 'Tuần này', value: `${d.week} lượt` },
    { icon: '⚡', label: 'TB / ngày', value: `${d.perDay} lượt` },
    { icon: '⏱️', label: 'TB / thẻ', value: `${d.perCardSec} giây` },
  ]

  const weekData = [0, 0, 0, 0, 0, 0, 0]

  return (
    <div className="flex min-h-screen flex-col bg-[#fff6e9] text-[#5d4a57]">
      <main className="relative flex-1 pb-16 pt-20 sm:pt-24">
        <div aria-hidden="true" className="dot-grid absolute inset-0" />

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
          {/* ================= 1. Header ================= */}
          <header className="paper-scrap relative rounded-2xl px-5 py-6 sm:px-7">
            <WashiTape color="var(--pastel-mint)" pattern="dots" rotate={-5} className="-top-3 left-10 h-6 w-20" />
            <PushPin color="#e8737f" className="absolute right-8 top-3 scale-75" />

            <div className="flex flex-wrap items-center gap-4">
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[var(--cream)] text-4xl shadow-inner ring-1 ring-[#ead9cd]" aria-hidden="true">
                🐯
              </span>
              <div className="min-w-0 flex-1">
                <h1 className="leading-tight">
                  <span className="relative inline-block px-3 py-0.5">
                    <span aria-hidden="true" className="absolute inset-0 -rotate-1 rounded-md bg-[var(--pastel-butter)] opacity-90" />
                    <span className="relative font-display text-2xl font-bold text-[#4f3d4a] sm:text-3xl">Thống kê học tập</span>
                  </span>
                  <span className="ml-2 hidden font-cn text-xl text-[#b58fa0] sm:inline">复习统计</span>
                </h1>
                <p className="mt-1.5 text-sm font-semibold leading-relaxed text-[#8d7484]">
                  Theo dõi tiến độ và kế hoạch ôn tập của bạn — ôn đủ chu kỳ 21 ngày, kiến thức sẽ được nạp vào trí nhớ dài hạn.
                </p>
              </div>
            </div>
          </header>

          {/* ================= 2. Tabs ================= */}
          <div className="mt-5 flex flex-wrap items-center gap-2" role="tablist" aria-label="Chọn bộ thẻ thống kê">
            <TabPill active={tab === 'vocab'} badge={tab === 'vocab' ? VOCAB_DATA.need : undefined} onClick={() => setTab('vocab')}>
              🃏 Từ vựng
            </TabPill>
            <TabPill active={tab === 'grammar'} badge={tab === 'grammar' ? GRAMMAR_DATA.need : undefined} onClick={() => setTab('grammar')}>
              ✏️ Ngữ pháp
            </TabPill>
          </div>

          {/* ================= 3. Số liệu tổng quan ================= */}
          <section className="mt-5" aria-label="Số liệu tổng quan">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {summary.map((s, i) => (
                <MetricCard key={s.label} stat={s} index={i} />
              ))}
            </div>
          </section>

          {/* ================= 4. Thẻ hành động ================= */}
          <section className="mt-5 grid gap-4 md:grid-cols-2" aria-label="Hành động chính">
            {/* Cần ôn hôm nay */}
            <Reveal>
              <div className="paper-scrap relative flex h-full flex-col rounded-2xl px-5 py-5 sm:px-6">
                <WashiTape color="var(--pastel-pink)" pattern="stripes" rotate={3} className="-top-2.5 right-8 h-5 w-14" />

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-lg font-bold text-[#4f3d4a]">Thẻ cần ôn hôm nay</h2>
                    <p className="mt-0.5 text-xs font-semibold text-[#8d7484]">Ôn đúng lúc — nhớ lâu hơn</p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      toast({ title: '🔄 Đã xếp lại bộ thẻ', description: 'Toàn bộ thẻ trong bài sẽ được học lại từ đầu (demo).' })
                    }
                    className="shrink-0 rounded-full bg-[var(--cream)] px-3 py-1.5 text-[11px] font-bold text-[#6f5a68] ring-1 ring-[#ead9cd] transition-all hover:-translate-y-0.5 hover:text-[#4f3d4a]"
                  >
                    Học lại từ đầu
                  </button>
                </div>

                <div className="flex flex-1 items-center gap-4 py-4">
                  <p className="font-display text-7xl font-extrabold leading-none text-[#d2495f]">{d.need}</p>
                  <p className="text-xs font-semibold leading-relaxed text-[#8d7484]">
                    {d.need > 0 ? (
                      <>
                        thẻ đang chờ bạn ôn.
                        <br />
                        Mỗi thẻ chỉ mất <b className="text-[#4f3d4a]">~1 phút</b> thôi!
                      </>
                    ) : (
                      <>
                        Không có thẻ nào đến hạn.
                        <br />
                        Thử học thêm bài mới nhé! ✨
                      </>
                    )}
                  </p>
                </div>

                {d.need > 0 ? (
                  <a
                    href="#/lesson/hsk-1/v/1"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#4f3d4a] px-6 py-3 text-sm font-bold text-white shadow-[0_5px_0_0_#3a2d36] transition-transform hover:-translate-y-0.5"
                  >
                    ▶ Ôn tập ngay
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => toast({ title: '🎉 Không có gì để ôn!', description: 'Học bài mới để bắt đầu chu kỳ ôn tập.' })}
                    className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-full bg-[#d8cdd4] px-6 py-3 text-sm font-bold text-[#9a8a96] shadow-[0_5px_0_0_#c4b7c0]"
                  >
                    ▶ Ôn tập ngay
                  </button>
                )}
              </div>
            </Reveal>

            {/* Lượt ôn tiếp theo */}
            <Reveal delay={0.08}>
              <div className="paper-scrap relative flex h-full flex-col rounded-2xl px-5 py-5 sm:px-6">
                <PushPin color="#7fb2e5" className="absolute right-6 top-3 scale-75" />

                <div>
                  <h2 className="flex items-center gap-2 font-display text-lg font-bold text-[#4f3d4a]">
                    <ClockIcon className="h-5 w-5 text-[#46688f]" />
                    Lượt ôn tập tiếp theo
                  </h2>
                  <p className="mt-0.5 text-xs font-semibold text-[#8d7484]">Đếm ngược đến giờ ôn định sẵn</p>
                </div>

                <div className="flex flex-1 items-center justify-center py-6">
                  <div className="flex items-center gap-3">
                    {['--', '--'].map((seg, i) => (
                      <span key={i} className="flex items-center gap-3">
                        {i > 0 && <span className="font-display text-4xl font-extrabold text-[#c9a2b3]">:</span>}
                        <span className="grid h-20 w-20 place-items-center rounded-2xl bg-[var(--cream)] font-display text-3xl font-extrabold text-[#c9a2b3] ring-1 ring-dashed ring-[#e0cdb9]">
                          {seg}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>

                <p className="rounded-xl bg-[var(--pastel-sky)]/35 px-4 py-2.5 text-center text-[11px] font-bold text-[#46688f]">
                  ⏰ Bạn chưa đặt giờ ôn — mở Cài đặt học tập để thiết lập nhắc nhở mỗi ngày.
                </p>
              </div>
            </Reveal>
          </section>

          {/* ================= 5. Chi tiết ôn tập ================= */}
          <Reveal>
            <section className="paper-scrap relative mt-5 rounded-2xl px-5 py-6 sm:px-7" aria-label="Chi tiết ôn tập">
              <WashiTape color="var(--pastel-lilac)" pattern="dots" rotate={-4} className="-top-3 right-14 h-6 w-20" />

              <h2 className="font-display text-lg font-bold text-[#4f3d4a]">Chi tiết ôn tập</h2>

              {/* hàng chỉ số phụ */}
              <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
                {subMetrics.map((m) => (
                  <div key={m.label} className="rounded-xl bg-[var(--cream)]/70 px-3.5 py-3 ring-1 ring-[#ead9cd]">
                    <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#8d7484]">
                      <span aria-hidden="true">{m.icon}</span>
                      {m.label}
                    </p>
                    <p className="mt-1 font-display text-lg font-extrabold leading-none text-[#4f3d4a]">{m.value}</p>
                  </div>
                ))}
              </div>

              {/* biểu đồ */}
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <WeekChart data={weekData} label="lượt ôn / ngày" />
                <GradeBars grades={d.grades} total={d.totalReviews} />
              </div>

              {/* chân trang */}
              <p className="mt-4 border-t border-dashed border-[#ead9cd] pt-3 text-center text-xs font-bold text-[#8d7484]">
                Tổng: {d.totalReviews} lượt · Tháng này: {d.monthReviews} lượt
              </p>
            </section>
          </Reveal>

          {/* ghi chú chu kỳ 21 ngày */}
          <Reveal delay={0.05}>
            <div className="mt-6 flex items-start gap-3 rounded-2xl bg-[var(--pastel-butter)]/40 px-5 py-4 ring-1 ring-[#f2e2b8]">
              <span className="text-2xl" aria-hidden="true">💡</span>
              <p className="text-xs font-semibold leading-relaxed text-[#8a6a1f]">
                <b>Mẹo nhớ dài hạn:</b> thẻ vừa học sẽ được hỏi lại sau 1 ngày → 3 ngày → 7 ngày → 14 ngày → 21 ngày.
                Hoàn thành đủ chu kỳ, thẻ chuyển sang trạng thái <b>“Đã thuộc (dài hạn)”</b> và bạn gần như không bao giờ quên nữa!
              </p>
            </div>
          </Reveal>
        </div>
      </main>

      <Footer />
    </div>
  )
}
