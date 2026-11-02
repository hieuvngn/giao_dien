'use client'

import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useToast } from '@/hooks/use-toast'
import Footer from '../landing/footer'
import {
  HeartDoodle,
  PandaSticker,
  PushPin,
  Reveal,
  SquiggleDoodle,
  StarDoodle,
  WashiTape,
} from '../landing/decor'

/* ============================================================
   Đăng nhập / Đăng ký
   Route: #/login · #/register
   Giao diện demo — validate phía client, chưa kết nối backend.
   ============================================================ */

type Mode = 'login' | 'register'
type ToastFn = ReturnType<typeof useToast>['toast']

const EMAIL_RE = /^\S+@\S+\.\S+$/

const INPUT =
  'w-full rounded-xl bg-white/85 px-4 py-2.5 text-sm font-semibold text-[#4f3d4a] ring-1 ring-[#ead9cd] transition-shadow placeholder:font-medium placeholder:text-[#cbb3c0] focus:outline-none focus:ring-2 focus:ring-[#f0a8bf]'
const INPUT_ERR = ' ring-[#e7a1ad] focus:ring-[#d2495f]'

/* ---------- Trường nhập dùng chung ---------- */

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string
  hint?: React.ReactNode
  error?: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8d7484]">{label}</span>
        {hint}
      </span>
      {children}
      {error && (
        <span className="mt-1 flex items-center gap-1 text-[11px] font-bold text-[#d2495f]">
          <span aria-hidden="true">⚠️</span>
          {error}
        </span>
      )}
    </label>
  )
}

function EyeBtn({ show, onClick }: { show: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
      className="absolute right-2.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-[#b58fa0] transition-colors hover:bg-[var(--pastel-butter)]/60 hover:text-[#4f3d4a]"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
        <circle cx="12" cy="12" r="3" />
        {show && <path d="M4 4l16 16" />}
      </svg>
    </button>
  )
}

/* ---------- Icon mạng xã hội ---------- */

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z" />
      <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path fill="#1877F2" d="M24 12c0-6.63-5.37-12-12-12S0 5.37 0 12c0 5.99 4.39 10.95 10.13 11.85v-8.38H7.08V12h3.05V9.36c0-3.01 1.79-4.67 4.53-4.67 1.31 0 2.68.23 2.68.23v2.95h-1.51c-1.49 0-1.95.92-1.95 1.87V12h3.32l-.53 3.47h-2.79v8.38C19.61 22.95 24 17.99 24 12z" />
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-[#4a3f46]" fill="currentColor" aria-hidden="true">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  )
}

function SocialRow({ toast }: { toast: ToastFn }) {
  const socials = [
    { id: 'google', label: 'Google', icon: <GoogleIcon /> },
    { id: 'facebook', label: 'Facebook', icon: <FacebookIcon /> },
    { id: 'apple', label: 'Apple', icon: <AppleIcon /> },
  ]
  return (
    <>
      <div className="flex items-center gap-3" role="separator" aria-label="hoặc">
        <span className="h-px flex-1 bg-[#ead9cd]" />
        <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#c9a2b3]">hoặc tiếp tục với</span>
        <span className="h-px flex-1 bg-[#ead9cd]" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {socials.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() =>
              toast({ title: `Đăng nhập bằng ${s.label} (demo)`, description: 'Giao diện mẫu — chưa kết nối dịch vụ nhé.' })
            }
            className="flex items-center justify-center gap-1.5 rounded-xl bg-white/85 px-2 py-2.5 text-xs font-extrabold text-[#6f5a68] ring-1 ring-[#ead9cd] transition-all hover:-translate-y-0.5 hover:ring-[#f0a8bf]"
          >
            {s.icon}
            <span className="hidden sm:inline">{s.label}</span>
            <span className="sr-only sm:hidden">{s.label}</span>
          </button>
        ))}
      </div>
    </>
  )
}

/* ---------- Form Đăng nhập ---------- */

function LoginForm({ toast }: { toast: ToastFn }) {
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [show, setShow] = useState(false)
  const [remember, setRemember] = useState(true)
  const [errors, setErrors] = useState<{ email?: string; pw?: string }>({})

  const clearErr = (k: 'email' | 'pw') =>
    setErrors((prev) => (prev[k] ? { ...prev, [k]: undefined } : prev))

  const validate = () => {
    const e: typeof errors = {}
    if (!EMAIL_RE.test(email)) e.email = 'Email chưa đúng định dạng nhé'
    if (pw.length < 6) e.pw = 'Mật khẩu cần ít nhất 6 ký tự'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validate()) {
      toast({ title: 'Kiểm tra lại thông tin nhé 🥺', description: 'Vài ô chưa điền đúng.' })
      return
    }
    toast({ title: '🎉 Đăng nhập thành công!', description: 'Giao diện demo — hẹn gặp bạn trong nhật ký nhé.' })
  }

  const forgot = () => {
    if (!EMAIL_RE.test(email)) {
      toast({ title: '💌 Nhập email trước đã nhé', description: 'Mình sẽ gửi hướng dẫn đặt lại mật khẩu qua email.' })
      return
    }
    toast({ title: '📬 Đã gửi email đặt lại mật khẩu', description: 'Kiểm tra hộp thư của bạn nhé (demo).' })
  }

  return (
    <form onSubmit={submit} noValidate className="mt-6 space-y-4">
      <div>
        <h3 className="font-display text-xl font-bold text-[#4f3d4a]">
          Mừng bạn trở lại <span aria-hidden="true">🎈</span>
        </h3>
        <p className="mt-1 text-xs font-semibold text-[#8d7484]">
          Đăng nhập để tiếp tục viết nhật ký tiếng Trung của bạn.
        </p>
      </div>

      <Field label="Email" error={errors.email}>
        <span className="relative block">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              clearErr('email')
            }}
            placeholder="ban@nhatkyhanngu.vn"
            autoComplete="email"
            className={INPUT + (errors.email ? INPUT_ERR : '') + ' pr-10'}
          />
          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm" aria-hidden="true">✉️</span>
        </span>
      </Field>

      <Field
        label="Mật khẩu"
        error={errors.pw}
        hint={
          <button type="button" onClick={forgot} className="text-[11px] font-bold text-[#c2547e] transition-colors hover:text-[#e8737f] hover:underline">
            Quên mật khẩu?
          </button>
        }
      >
        <span className="relative block">
          <input
            type={show ? 'text' : 'password'}
            value={pw}
            onChange={(e) => {
              setPw(e.target.value)
              clearErr('pw')
            }}
            placeholder="••••••••"
            autoComplete="current-password"
            className={INPUT + (errors.pw ? INPUT_ERR : '') + ' pr-11'}
          />
          <EyeBtn show={show} onClick={() => setShow(!show)} />
        </span>
      </Field>

      <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-[#6f5a68]">
        <input
          type="checkbox"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
          className="h-4 w-4 rounded accent-[#e8737f]"
        />
        Ghi nhớ đăng nhập trên máy này
      </label>

      <button
        type="submit"
        className="w-full rounded-2xl bg-[#4f3d4a] px-4 py-3 text-sm font-extrabold text-white shadow-[0_4px_0_0_#3a2d36] transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_0_0_#3a2d36] active:translate-y-0.5 active:shadow-none"
      >
        Đăng nhập <span aria-hidden="true">→</span>
      </button>

      <SocialRow toast={toast} />

      <p className="text-center text-xs font-semibold text-[#8d7484]">
        Chưa có tài khoản?{' '}
        <a
          href="#/register"
          className="font-extrabold text-[#c2547e] underline decoration-wavy decoration-[#f2b8cb] underline-offset-2 transition-colors hover:text-[#e8737f]"
        >
          Đăng ký ngay
        </a>
      </p>
    </form>
  )
}

/* ---------- Form Đăng ký ---------- */

const STRENGTH_COLORS = ['#ead9cd', '#d2495f', '#c07a2c', '#7fae8f', '#3f6b50']
const STRENGTH_LABELS = ['Hãy nhập mật khẩu', 'Yếu', 'Khá ổn', 'Tốt', 'Rất mạnh']

function RegisterForm({ toast }: { toast: ToastFn }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [show, setShow] = useState(false)
  const [show2, setShow2] = useState(false)
  const [agree, setAgree] = useState(false)
  const [errors, setErrors] = useState<{ name?: string; email?: string; pw?: string; pw2?: string; agree?: string }>({})

  const clearErr = (k: 'name' | 'email' | 'pw' | 'pw2' | 'agree') =>
    setErrors((prev) => (prev[k] ? { ...prev, [k]: undefined } : prev))

  /* độ mạnh mật khẩu (chỉ mang tính minh hoạ) */
  const strength = useMemo(() => {
    let s = 0
    if (pw.length >= 6) s++
    if (pw.length >= 10) s++
    if (/\d/.test(pw) && /[a-zA-Z]/.test(pw)) s++
    if (/[^A-Za-z0-9]/.test(pw)) s++
    return Math.min(4, s)
  }, [pw])

  const validate = () => {
    const e: typeof errors = {}
    if (!name.trim()) e.name = 'Cho mình biết tên bạn nhé'
    if (!EMAIL_RE.test(email)) e.email = 'Email chưa đúng định dạng nhé'
    if (pw.length < 6) e.pw = 'Mật khẩu cần ít nhất 6 ký tự'
    if (pw2 !== pw || !pw2) e.pw2 = 'Mật khẩu nhập lại chưa khớp'
    if (!agree) e.agree = 'Bạn cần đồng ý điều khoản để tiếp tục'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validate()) {
      toast({ title: 'Kiểm tra lại thông tin nhé 🥺', description: 'Vài ô chưa điền đúng.' })
      return
    }
    toast({ title: `Chào bạn, ${name.trim()}! 🌱`, description: 'Tài khoản demo đã tạo — chào mừng đến Nhật ký Hán ngữ!' })
  }

  return (
    <form onSubmit={submit} noValidate className="mt-6 space-y-4">
      <div>
        <h3 className="font-display text-xl font-bold text-[#4f3d4a]">
          Tạo tài khoản mới <span aria-hidden="true">🌱</span>
        </h3>
        <p className="mt-1 text-xs font-semibold text-[#8d7484]">
          Một phút là xong — rồi mỗi ngày là một trang nhật ký mới.
        </p>
      </div>

      <Field label="Tên của bạn" error={errors.name}>
        <span className="relative block">
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              clearErr('name')
            }}
            placeholder="VD: Minh Anh"
            autoComplete="name"
            className={INPUT + (errors.name ? INPUT_ERR : '') + ' pr-10'}
          />
          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm" aria-hidden="true">🧑‍🎓</span>
        </span>
      </Field>

      <Field label="Email" error={errors.email}>
        <span className="relative block">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              clearErr('email')
            }}
            placeholder="ban@nhatkyhanngu.vn"
            autoComplete="email"
            className={INPUT + (errors.email ? INPUT_ERR : '') + ' pr-10'}
          />
          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm" aria-hidden="true">✉️</span>
        </span>
      </Field>

      <Field label="Mật khẩu" error={errors.pw}>
        <span className="relative block">
          <input
            type={show ? 'text' : 'password'}
            value={pw}
            onChange={(e) => {
              setPw(e.target.value)
              clearErr('pw')
            }}
            placeholder="Ít nhất 6 ký tự"
            autoComplete="new-password"
            className={INPUT + (errors.pw ? INPUT_ERR : '') + ' pr-11'}
          />
          <EyeBtn show={show} onClick={() => setShow(!show)} />
        </span>
        {pw && (
          <span className="mt-2 block">
            <span className="flex gap-1" aria-hidden="true">
              {[1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  className="h-1.5 flex-1 rounded-full transition-colors duration-300"
                  style={{ backgroundColor: i <= strength ? STRENGTH_COLORS[strength] : '#ead9cd' }}
                />
              ))}
            </span>
            <span className="mt-1 block text-[10px] font-extrabold" style={{ color: STRENGTH_COLORS[strength] }}>
              Độ mạnh: {STRENGTH_LABELS[strength]}
            </span>
          </span>
        )}
      </Field>

      <Field label="Nhập lại mật khẩu" error={errors.pw2}>
        <span className="relative block">
          <input
            type={show2 ? 'text' : 'password'}
            value={pw2}
            onChange={(e) => {
              setPw2(e.target.value)
              clearErr('pw2')
            }}
            placeholder="Gõ lại mật khẩu vừa rồi"
            autoComplete="new-password"
            className={INPUT + (errors.pw2 ? INPUT_ERR : '') + ' pr-11'}
          />
          <EyeBtn show={show2} onClick={() => setShow2(!show2)} />
        </span>
      </Field>

      <div>
        <label className="flex cursor-pointer items-start gap-2 text-xs font-bold leading-relaxed text-[#6f5a68]">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => {
              setAgree(e.target.checked)
              clearErr('agree')
            }}
            className="mt-0.5 h-4 w-4 rounded accent-[#e8737f]"
          />
          <span>
            Tôi đồng ý với{' '}
            <button
              type="button"
              onClick={() => toast({ title: '📄 Điều khoản sử dụng', description: 'Nội dung sẽ được cập nhật sau (demo).' })}
              className="text-[#c2547e] underline decoration-wavy decoration-[#f2b8cb] underline-offset-2 hover:text-[#e8737f]"
            >
              Điều khoản
            </button>{' '}
            &amp;{' '}
            <button
              type="button"
              onClick={() => toast({ title: '🔒 Quyền riêng tư', description: 'Nội dung sẽ được cập nhật sau (demo).' })}
              className="text-[#c2547e] underline decoration-wavy decoration-[#f2b8cb] underline-offset-2 hover:text-[#e8737f]"
            >
              Quyền riêng tư
            </button>
          </span>
        </label>
        {errors.agree && (
          <p className="mt-1 flex items-center gap-1 text-[11px] font-bold text-[#d2495f]">
            <span aria-hidden="true">⚠️</span>
            {errors.agree}
          </p>
        )}
      </div>

      <button
        type="submit"
        className="w-full rounded-2xl bg-[#e8737f] px-4 py-3 text-sm font-extrabold text-white shadow-[0_4px_0_0_#d1708f] transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_0_0_#d1708f] active:translate-y-0.5 active:shadow-none"
      >
        Đăng ký miễn phí <span aria-hidden="true">✨</span>
      </button>

      <SocialRow toast={toast} />

      <p className="text-center text-xs font-semibold text-[#8d7484]">
        Đã có tài khoản?{' '}
        <a
          href="#/login"
          className="font-extrabold text-[#c2547e] underline decoration-wavy decoration-[#f2b8cb] underline-offset-2 transition-colors hover:text-[#e8737f]"
        >
          Đăng nhập
        </a>
      </p>
    </form>
  )
}

/* ---------- Panel trái: giới thiệu ---------- */

const BENEFITS = [
  { icon: '📚', t: '4 lộ trình theo giáo trình thật', d: 'HSK 3.0 · YCT · Boya · Giáo trình Hán ngữ', bg: 'var(--pastel-pink)' },
  { icon: '🃏', t: 'Flashcard & ôn tập thông minh', d: 'Nhắc đúng lúc bạn sắp quên', bg: 'var(--pastel-mint)' },
  { icon: '📝', t: 'Đề thi, thi thử & vở tập viết', d: 'Luyện đề, phòng thi, viết chữ đẹp', bg: 'var(--pastel-sky)' },
  { icon: '🏆', t: 'Streak, XP & thành tựu', d: 'Ghi từng tiến bộ nhỏ mỗi ngày', bg: 'var(--pastel-butter)' },
]

function BrandPanel({ mode }: { mode: Mode }) {
  return (
    <aside className="paper-scrap relative hidden flex-col overflow-hidden rounded-3xl p-7 lg:flex">
      <WashiTape color="var(--pastel-mint)" pattern="dots" rotate={-6} className="-top-3 left-10 h-6 w-24" />
      <PushPin color="#e8737f" className="absolute right-9 top-4 scale-90" />
      <StarDoodle className="absolute right-6 top-24 h-5 w-5 opacity-70" color="#f5b73f" />
      <PandaSticker className="absolute -bottom-4 -right-4 h-24 w-24 -rotate-12 opacity-90" />
      <HeartDoodle className="absolute bottom-28 left-6 h-4 w-4 opacity-60" color="#f2b8cb" />

      <div className="flex items-center gap-2.5">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--pastel-pink)] font-cn text-xl text-[#8a4a63] shadow-inner" aria-hidden="true">
          汉
        </span>
        <span>
          <span className="block font-display text-base font-bold leading-none text-[#4f3d4a]">Nhật ký Hán ngữ</span>
          <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.2em] text-[#b58fa0]">学中文 · 记日记</span>
        </span>
      </div>

      <h2 className="mt-6 font-display text-[1.7rem] font-bold leading-snug text-[#4f3d4a]">
        {mode === 'login' ? 'Chào mừng trở lại,' : 'Mình bắt đầu nhé,'}{' '}
        <span className="relative inline-block">
          bạn ơi
          <SquiggleDoodle className="absolute -bottom-1.5 left-0 h-2.5 w-full" color="#f2b8cb" />
        </span>
        <span className="ml-2 whitespace-nowrap font-cn text-2xl text-[#e88aa6]" aria-hidden="true">
          {mode === 'login' ? '欢迎回来' : '一起加油'}
        </span>
      </h2>

      <p className="mt-3 text-sm font-medium leading-relaxed text-[#8d7484]">
        Một cuốn sổ nhỏ cho hành trình tiếng Trung — flashcard, ôn tập, đề thi và cả những trang vở tập viết đáng yêu.
      </p>

      <ul className="mt-5 space-y-2.5">
        {BENEFITS.map((b) => (
          <li key={b.t} className="flex items-center gap-2.5 rounded-xl bg-white/60 px-3 py-2 ring-1 ring-[#f0e2d5]">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-base shadow-inner" style={{ backgroundColor: b.bg }} aria-hidden="true">
              {b.icon}
            </span>
            <span className="text-xs font-bold text-[#5d4a57]">
              {b.t}
              <span className="block text-[10px] font-semibold text-[#b58fa0]">{b.d}</span>
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-6">
        <div className="relative rounded-2xl bg-[var(--pastel-butter)]/60 p-4 ring-1 ring-[#f2e2b8]">
          <PushPin color="#f0b429" className="absolute -top-2 left-1/2 -translate-x-1/2" />
          <p className="text-center font-cn text-xl leading-none text-[#c2547e]">今天也要加油哦！</p>
          <p className="mt-1.5 text-center text-[10px] font-bold text-[#8a6a1f]">Hôm nay cũng cố lên nhé!</p>
        </div>
        <p className="mt-3 flex items-center justify-center gap-2 text-[10px] font-extrabold text-[#b58fa0]">
          <span>723+ từ vựng</span>
          <StarDoodle className="h-3 w-3" color="#f5b73f" />
          <span>4 giáo trình</span>
          <HeartDoodle className="h-3 w-3" color="#f2b8cb" />
          <span>100% miễn phí</span>
        </p>
      </div>
    </aside>
  )
}

/* ============================================================
   Trang chính
   ============================================================ */

export default function Auth({ initialMode = 'login' }: { initialMode?: Mode }) {
  const { toast } = useToast()
  const [mode, setMode] = useState<Mode>(initialMode)

  const tabs: { id: Mode; label: string }[] = [
    { id: 'login', label: 'Đăng nhập' },
    { id: 'register', label: 'Đăng ký' },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-[#fff6e9] text-[#5d4a57]">
      <main className="relative flex-1 pb-16 pt-20 sm:pt-24">
        <div aria-hidden="true" className="dot-grid absolute inset-0" />

        <div className="relative mx-auto w-full max-w-4xl px-4 sm:px-6">
          <p className="mb-4 pl-14 lg:pl-0">
            <a
              href="#/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8d7484] transition-colors hover:text-[#e8737f]"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m15 18-6-6 6-6" />
              </svg>
              Về trang chủ
            </a>
          </p>

          <Reveal>
            <div className="grid items-stretch gap-5 lg:grid-cols-[1fr_1.15fr]">
              <BrandPanel mode={mode} />

              <section className="paper-scrap relative rounded-3xl p-6 sm:p-8">
                <WashiTape color="var(--pastel-sky)" pattern="grid" rotate={4} className="-top-3 right-8 h-6 w-20" />
                <PushPin color="#7fae8f" className="absolute left-8 top-4 scale-75" />

                {/* tab chuyển chế độ */}
                <div className="mx-auto grid w-full max-w-xs grid-cols-2 gap-1 rounded-2xl bg-[var(--cream)] p-1 ring-1 ring-[#ead9cd]" role="tablist" aria-label="Chọn chế độ">
                  {tabs.map((t) => {
                    const active = mode === t.id
                    return (
                      <button
                        key={t.id}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => setMode(t.id)}
                        className={`rounded-xl px-3 py-2 text-xs font-extrabold transition-all duration-200 ${
                          active
                            ? 'bg-[#4f3d4a] text-white shadow-[0_4px_0_0_#3a2d36]'
                            : 'text-[#8d7484] hover:text-[#4f3d4a]'
                        }`}
                      >
                        {t.label}
                      </button>
                    )
                  })}
                </div>

                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={mode}
                    initial={{ opacity: 0, x: mode === 'login' ? -16 : 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: mode === 'login' ? 16 : -16 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {mode === 'login' ? <LoginForm toast={toast} /> : <RegisterForm toast={toast} />}
                  </motion.div>
                </AnimatePresence>
              </section>
            </div>
          </Reveal>
        </div>
      </main>

      <Footer />
    </div>
  )
}
