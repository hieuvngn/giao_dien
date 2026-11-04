'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useToast } from '@/hooks/use-toast'
import Footer from '../landing/footer'
import { PushPin, Reveal, WashiTape } from '../landing/decor'
import { Badge, StatCard, Switch, type AdminSectionId } from './admin-ui'
import { UsersSection } from './admin-users'
import { LessonsSection, VocabSection } from './admin-content'
import { ExamsSection, VideosSection } from './admin-media'

/* ============================================================
   Trung tâm Quản trị — route #/admin
   7 khu: Tổng quan · Người dùng · Bài học · Từ vựng · Video AI
          · Đề thi · Cài đặt
   Toàn bộ dữ liệu là demo cục bộ (frontend-only)
   ============================================================ */

const TABS: { id: AdminSectionId; emoji: string; label: string }[] = [
  { id: 'overview', emoji: '📊', label: 'Tổng quan' },
  { id: 'users', emoji: '👥', label: 'Người dùng' },
  { id: 'lessons', emoji: '📚', label: 'Bài học' },
  { id: 'vocab', emoji: '📖', label: 'Từ vựng' },
  { id: 'videos', emoji: '🎬', label: 'Video AI' },
  { id: 'exams', emoji: '📝', label: 'Đề thi' },
  { id: 'settings', emoji: '⚙️', label: 'Cài đặt' },
]

/* ---------- Dữ liệu biểu đồ ---------- */

const WEEK_BARS = [
  { d: 'T2', v: 420 },
  { d: 'T3', v: 512 },
  { d: 'T4', v: 468 },
  { d: 'T5', v: 590 },
  { d: 'T6', v: 645 },
  { d: 'T7', v: 730 },
  { d: 'CN', v: 512 },
]

const DONUT = [
  { label: 'HSK 1–2', pct: 38, color: '#e8737f' },
  { label: 'HSK 3–4', pct: 31, color: '#f0b429' },
  { label: 'HSK 5–6', pct: 19, color: '#7fae8f' },
  { label: 'YCT · Boya · khác', pct: 12, color: '#8b9fc4' },
]

/* tính sẵn các cung tròn (stroke-dasharray / offset) cho biểu đồ donut */
function buildDonutArcs() {
  const R = 42
  const C = 2 * Math.PI * R
  let acc = 0
  return DONUT.map((s) => {
    const dash = (s.pct / 100) * C
    const arc = { ...s, dash, offset: -acc }
    acc += dash
    return arc
  })
}

const ACTIVITIES = [
  { emoji: '🎬', text: 'Whisper xử lý xong video “Một ngày ở Bắc Kinh” (142 từ)', time: '5 phút trước' },
  { emoji: '👩‍🎓', text: 'Minh Anh hoàn thành HSK 1 · Bài 5 “Gia đình”', time: '12 phút trước' },
  { emoji: '📝', text: 'Mai Chi xuất bản đề “HSK 3 · Đề nâng cao”', time: '1 giờ trước' },
  { emoji: '📖', text: 'Thêm 12 từ mới vào HSK 2 · Chủ đề Mua sắm', time: '2 giờ trước' },
  { emoji: '🚫', text: 'Khoá tài khoản phamvanduc@yeah.net (spam bình luận)', time: '3 giờ trước' },
]

/* ================= Tổng quan ================= */

function OverviewSection({ onGo }: { onGo: (s: AdminSectionId) => void }) {
  const maxBar = Math.max(...WEEK_BARS.map((b) => b.v))
  const arcs = buildDonutArcs()

  const quick: { emoji: string; label: string; to: AdminSectionId; cls: string }[] = [
    { emoji: '📚', label: 'Thêm bài học', to: 'lessons', cls: 'bg-[var(--pastel-pink)]/70 ring-[#f3c4d3] text-[#8a4a63]' },
    { emoji: '📖', label: 'Thêm từ vựng', to: 'vocab', cls: 'bg-[var(--pastel-butter)]/70 ring-[#f2e2b8] text-[#8a6a1f]' },
    { emoji: '🎬', label: 'Phân tích video', to: 'videos', cls: 'bg-[var(--pastel-sky)]/70 ring-[#cfe0ef] text-[#46688f]' },
    { emoji: '📝', label: 'Tạo đề thi', to: 'exams', cls: 'bg-[var(--pastel-mint)]/70 ring-[#cfe6d6] text-[#3f6b50]' },
  ]

  return (
    <div className="space-y-4">
      {/* thẻ số liệu */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard emoji="👥" value="12.847" label="Học viên đang theo học" sub="+324 tuần này" tone="pink" delay={0} />
        <StatCard emoji="📚" value="486" label="Bài học đã xuất bản" sub="4 giáo trình" tone="butter" delay={0.06} />
        <StatCard emoji="📖" value="723" label="Mục từ vựng trong kho" sub="7 cấp độ HSK" tone="mint" delay={0.12} />
        <StatCard emoji="🎬" value="156" label="Video AI đã xử lý" sub="Whisper v3 Turbo" tone="sky" delay={0.18} />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* cột đồ thị */}
        <Reveal className="lg:col-span-3">
          <div className="paper-scrap h-full rounded-3xl p-4 sm:p-5">
            <h3 className="font-display text-sm font-bold text-[#4f3d4a]">
              Lượt học 7 ngày qua <span className="ml-1 font-cn text-xs text-[#b58fa0]">学习热度</span>
            </h3>
            <div className="mt-4 flex gap-2 sm:gap-3" aria-hidden="true">
              {WEEK_BARS.map((b, i) => (
                <div key={b.d} className="flex flex-1 flex-col items-center gap-1.5">
                  <span className="text-[10px] font-extrabold text-[#8a6a1f]">{b.v}</span>
                  <div className="flex h-28 w-full items-end">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: Math.round((b.v / maxBar) * 110) }}
                      transition={{ duration: 0.6, delay: 0.15 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                      className={`w-full rounded-t-lg ${i === WEEK_BARS.length - 2 ? 'bg-[var(--pastel-pink)] ring-[#f3c4d3]' : 'bg-[var(--pastel-butter)] ring-[#f2e2b8]'} ring-1`}
                      title={`${b.d}: ${b.v} lượt`}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-[#b58fa0]">{b.d}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 border-t border-dashed border-[#ead9cd] pt-2.5 text-[10px] font-semibold text-[#b58fa0]">
              🔥 Cao điểm: Thứ 7 (730 lượt) — Trung bình 553 lượt/ngày
            </p>
          </div>
        </Reveal>

        {/* donut phân bố */}
        <Reveal delay={0.08} className="lg:col-span-2">
          <div className="paper-scrap h-full rounded-3xl p-4 sm:p-5">
            <h3 className="font-display text-sm font-bold text-[#4f3d4a]">
              Phân bố cấp độ <span className="ml-1 font-cn text-xs text-[#b58fa0]">水平分布</span>
            </h3>
            <div className="mt-3 flex items-center gap-4">
              <svg viewBox="0 0 110 110" className="h-32 w-32 shrink-0 -rotate-90" role="img" aria-label="Biểu đồ tròn phân bố cấp độ">
                {arcs.map((s) => (
                  <circle
                    key={s.label}
                    cx="55"
                    cy="55"
                    r="42"
                    fill="none"
                    stroke={s.color}
                    strokeWidth="13"
                    strokeDasharray={`${s.dash} ${2 * Math.PI * 42 - s.dash}`}
                    strokeDashoffset={s.offset}
                    strokeLinecap="butt"
                  />
                ))}
                <circle cx="55" cy="55" r="30" fill="#fffdf6" />
              </svg>
              <ul className="min-w-0 flex-1 space-y-1.5">
                {DONUT.map((s) => (
                  <li key={s.label} className="flex items-center gap-2 text-[11px] font-bold text-[#5d4a57]">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: s.color }} aria-hidden="true" />
                    <span className="min-w-0 flex-1 truncate">{s.label}</span>
                    <span className="font-display font-extrabold text-[#4f3d4a]">{s.pct}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* hoạt động gần đây */}
        <Reveal delay={0.05} className="lg:col-span-3">
          <div className="paper-scrap h-full rounded-3xl p-4 sm:p-5">
            <h3 className="font-display text-sm font-bold text-[#4f3d4a]">
              Hoạt động gần đây <span className="ml-1 font-cn text-xs text-[#b58fa0]">最新动态</span>
            </h3>
            <ul className="mt-3 space-y-1">
              {ACTIVITIES.map((a) => (
                <li key={a.text} className="flex items-start gap-2.5 rounded-xl px-2 py-2 transition-colors hover:bg-[var(--cream)]">
                  <span className="text-base leading-none" aria-hidden="true">
                    {a.emoji}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-bold leading-snug text-[#5d4a57]">{a.text}</span>
                    <span className="mt-0.5 block text-[10px] font-semibold text-[#b58fa0]">{a.time}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        {/* thao tác nhanh */}
        <Reveal delay={0.12} className="lg:col-span-2">
          <div className="paper-scrap h-full rounded-3xl p-4 sm:p-5">
            <h3 className="font-display text-sm font-bold text-[#4f3d4a]">Thao tác nhanh</h3>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {quick.map((qk) => (
                <button
                  key={qk.to}
                  type="button"
                  onClick={() => onGo(qk.to)}
                  className={`flex flex-col items-center gap-1.5 rounded-2xl px-2 py-4 text-center ring-1 transition-all hover:-translate-y-0.5 hover:shadow-md ${qk.cls}`}
                >
                  <span className="text-2xl" aria-hidden="true">
                    {qk.emoji}
                  </span>
                  <span className="text-[11px] font-extrabold">{qk.label}</span>
                </button>
              ))}
            </div>
            <div className="mt-3 rounded-2xl bg-[var(--pastel-lilac)]/40 p-3 ring-1 ring-[#e2d6f0]">
              <p className="text-[10px] font-bold text-[#6d5a94]">
                🛡️ Chế độ quản trị demo — mọi thay đổi chỉ tồn tại trong phiên hiện tại.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  )
}

/* ================= Cài đặt ================= */

const FEATURE_TOGGLES: { key: string; emoji: string; label: string; desc: string; on: boolean }[] = [
  { key: 'video', emoji: '🎬', label: 'AI Video Learning', desc: 'Học qua video YouTube / Bilibili với Whisper', on: true },
  { key: 'leaderboard', emoji: '🏆', label: 'Bảng xếp hạng', desc: 'Công khai BXH tuần & tổng cho mọi học viên', on: true },
  { key: 'email', emoji: '✉️', label: 'Email nhắc học', desc: 'Gửi mail động viên khi học viên quên streak', on: true },
  { key: 'maintenance', emoji: '🔧', label: 'Chế độ bảo trì', desc: 'Website chỉ hiện trang thông báo bảo trì', on: false },
]

function SettingsSection() {
  const { toast } = useToast()
  const [features, setFeatures] = useState(() => Object.fromEntries(FEATURE_TOGGLES.map((f) => [f.key, f.on])))
  const [site, setSite] = useState({ name: 'Nhật ký Hán ngữ', slogan: 'Học từng chữ, ghi từng trang', email: 'hello@nhatkyhanngu.vn' })

  const inputCls =
    'w-full rounded-xl bg-white/70 px-3.5 py-2.5 text-xs font-semibold text-[#5d4a57] ring-1 ring-[#ead9cd] outline-none transition focus:ring-[#e8aa96]'

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* tính năng */}
      <section aria-label="Bật tắt tính năng" className="paper-scrap rounded-3xl p-4 sm:p-6">
        <h2 className="font-display text-lg font-bold text-[#4f3d4a]">
          Tính năng <span className="ml-1 font-cn text-base text-[#e88aa6]">功能开关</span>
        </h2>
        <p className="mt-0.5 text-xs font-semibold text-[#8d7484]">Bật / tắt từng khu vực của website ngay lập tức.</p>
        <ul className="mt-4 space-y-2">
          {FEATURE_TOGGLES.map((f) => (
            <li key={f.key} className="flex items-center gap-3 rounded-2xl bg-white/55 px-3.5 py-3 ring-1 ring-[#f2e4da]">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--pastel-butter)]/60 text-lg" aria-hidden="true">
                {f.emoji}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-extrabold text-[#4f3d4a]">{f.label}</span>
                <span className="block truncate text-[10px] font-semibold text-[#b58fa0]">{f.desc}</span>
              </span>
              <Switch
                checked={features[f.key]}
                onChange={(v) => {
                  setFeatures((p) => ({ ...p, [f.key]: v }))
                  toast({ title: v ? `Đã bật “${f.label}” ✅` : `Đã tắt “${f.label}” ⏸️` })
                }}
                label={`Bật tắt ${f.label}`}
              />
            </li>
          ))}
        </ul>
      </section>

      <div className="space-y-4">
        {/* thông tin site */}
        <section aria-label="Thông tin website" className="paper-scrap rounded-3xl p-4 sm:p-6">
          <h2 className="font-display text-lg font-bold text-[#4f3d4a]">
            Thông tin website <span className="ml-1 font-cn text-base text-[#e88aa6]">站点信息</span>
          </h2>
          <div className="mt-4 space-y-2.5">
            <label className="block">
              <span className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-[#b58fa0]">Tên website</span>
              <input type="text" value={site.name} onChange={(e) => setSite({ ...site, name: e.target.value })} className={inputCls} />
            </label>
            <label className="block">
              <span className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-[#b58fa0]">Slogan</span>
              <input type="text" value={site.slogan} onChange={(e) => setSite({ ...site, slogan: e.target.value })} className={inputCls} />
            </label>
            <label className="block">
              <span className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-[#b58fa0]">Email hỗ trợ</span>
              <input type="text" value={site.email} onChange={(e) => setSite({ ...site, email: e.target.value })} className={inputCls} />
            </label>
          </div>
          <button
            type="button"
            onClick={() => toast({ title: 'Đã lưu thông tin website 💾', description: 'Cấu hình mới sẽ áp dụng cho lần truy cập sau (demo).' })}
            className="mt-4 w-full rounded-xl bg-[#4f3d4a] py-2.5 text-xs font-extrabold text-white shadow-[0_3px_0_0_#3a2d36] transition-all hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none"
          >
            💾 Lưu thay đổi
          </button>
        </section>

        {/* vùng nguy hiểm */}
        <section aria-label="Vùng thao tác nguy hiểm" className="rounded-3xl bg-[#fbe3e7]/60 p-4 ring-1 ring-[#f3c4d3] sm:p-6">
          <h2 className="font-display text-lg font-bold text-[#c2435c]">⚠️ Vùng nguy hiểm</h2>
          <p className="mt-0.5 text-xs font-semibold text-[#a4556a]">Các thao tác ảnh hưởng lớn — hãy cân nhắc kỹ.</p>
          <div className="mt-3.5 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => toast({ title: 'Đã dọn bộ nhớ đệm 🧹', description: 'Cache phụ đề và ảnh đã được làm mới.' })}
              className="rounded-xl bg-white/80 px-3.5 py-2.5 text-xs font-extrabold text-[#a05a3a] ring-1 ring-[#f3dcc6] transition-all hover:-translate-y-0.5"
            >
              🧹 Dọn bộ nhớ đệm
            </button>
            <button
              type="button"
              onClick={() => toast({ title: 'Đã đặt lại dữ liệu demo 🔁', description: 'Toàn bộ dữ liệu mẫu trở về trạng thái ban đầu.' })}
              className="rounded-xl bg-[#d2495f] px-3.5 py-2.5 text-xs font-extrabold text-white shadow-[0_3px_0_0_#b23a4f] transition-all hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none"
            >
              🔁 Đặt lại dữ liệu demo
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}

/* ================= Trang chính ================= */

export default function AdminHub() {
  const [section, setSection] = useState<AdminSectionId>('overview')

  return (
    <div className="flex min-h-screen flex-col bg-[#fff6e9] text-[#5d4a57]">
      <main className="relative flex-1 pb-16 pt-20 sm:pt-24">
        <div aria-hidden="true" className="dot-grid absolute inset-0" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          {/* ===== Header ===== */}
          <Reveal>
            <header className="paper-scrap relative rounded-3xl px-5 py-6 sm:px-8 sm:py-7">
              <WashiTape color="var(--pastel-lilac)" pattern="dots" rotate={-5} className="-top-3 left-10 h-6 w-20" />
              <PushPin color="#8b7fc4" className="absolute right-8 top-3 scale-75" />

              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="leading-tight">
                    <span className="relative inline-block px-3 py-0.5">
                      <span aria-hidden="true" className="absolute inset-0 -rotate-1 rounded-md bg-[var(--pastel-lilac)] opacity-80" />
                      <span className="relative font-display text-2xl font-bold text-[#4f3d4a] sm:text-3xl">Trung tâm Quản trị</span>
                      <span className="relative ml-2 hidden font-cn text-2xl text-[#8b7fc4] sm:inline" aria-hidden="true">
                        管理中心
                      </span>
                    </span>
                  </h1>
                  <p className="mt-2 max-w-lg text-sm font-semibold text-[#8d7484]">
                    Quản lý toàn bộ website: học viên, bài học, kho từ vựng, video AI, đề thi và cấu hình hệ thống.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="hidden text-right sm:block">
                    <p className="text-xs font-extrabold text-[#4f3d4a]">Quản trị viên</p>
                    <p className="text-[10px] font-semibold text-[#b58fa0]">admin@nhatkyhanngu.vn</p>
                  </div>
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--pastel-lilac)] text-2xl shadow-inner" aria-hidden="true">
                    🛡️
                  </span>
                  <a
                    href="#/"
                    className="rounded-xl bg-white/70 px-3 py-2 text-[11px] font-extrabold text-[#6f5a68] ring-1 ring-[#ead9cd] transition-all hover:-translate-y-0.5 hover:bg-white"
                  >
                    ← Xem website
                  </a>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-1.5">
                <Badge tone="lilac">🛡️ Quyền: Quản trị viên</Badge>
                <Badge tone="butter">🧪 Chế độ demo</Badge>
                <Badge tone="mint">🌐 Nhật ký Hán ngữ v1.0</Badge>
              </div>
            </header>
          </Reveal>

          {/* ===== Tab điều hướng khu vực ===== */}
          <nav aria-label="Các khu vực quản trị" className="mt-5 overflow-x-auto pb-1">
            <div className="flex w-max gap-1.5 rounded-2xl bg-white/60 p-1.5 ring-1 ring-[#ead9cd]">
              {TABS.map((t) => {
                const active = section === t.id
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSection(t.id)}
                    aria-current={active ? 'page' : undefined}
                    className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-extrabold transition-all ${
                      active
                        ? 'bg-[#4f3d4a] text-white shadow-[0_3px_0_0_#3a2d36]'
                        : 'text-[#6f5a68] hover:bg-[var(--pastel-butter)]/50'
                    }`}
                  >
                    <span aria-hidden="true">{t.emoji}</span>
                    {t.label}
                  </button>
                )
              })}
            </div>
          </nav>

          {/* ===== Nội dung khu vực ===== */}
          <div className="mt-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={section}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              >
                {section === 'overview' && <OverviewSection onGo={setSection} />}
                {section === 'users' && <UsersSection />}
                {section === 'lessons' && <LessonsSection />}
                {section === 'vocab' && <VocabSection />}
                {section === 'videos' && <VideosSection />}
                {section === 'exams' && <ExamsSection />}
                {section === 'settings' && <SettingsSection />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
