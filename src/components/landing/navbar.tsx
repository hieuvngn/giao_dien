'use client'

import { PushPin, WashiTape } from './decor'

const HOME_LINKS = [
  { href: '#hsk', label: 'HSK 3.0' },
  { href: '#yct', label: 'YCT' },
  { href: '#boya', label: 'Boya Chinese' },
  { href: '#hanyu', label: 'Giáo trình Hán ngữ' },
]

const APP_LINKS = [
  { href: '#/', label: 'Trang chủ', key: 'home' },
  { href: '#/shadowing', label: 'Shadowing', key: 'shadowing' },
  { href: '#/create-file', label: 'Tạo vở tập viết', key: 'create' },
]

export default function Navbar({
  variant = 'home',
  active,
}: {
  variant?: 'home' | 'app'
  active?: string
}) {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto max-w-6xl px-4 pt-3">
        <nav
          aria-label="Điều hướng chính"
          className="paper-scrap relative flex items-center justify-between gap-2 rounded-2xl px-3 py-2.5 sm:px-6"
        >
          {/* washi giữ navbar */}
          <WashiTape
            color="var(--pastel-mint)"
            pattern="dots"
            rotate={-6}
            className="-top-2.5 left-8 h-5 w-16"
          />

          {/* Logo */}
          <a href="#top" className="group flex items-center gap-2.5" aria-label="Nhật ký Hán ngữ – về đầu trang">
            <span className="relative grid h-10 w-10 place-items-center rounded-xl bg-[var(--pastel-pink)] font-cn text-xl text-[#8a4a63] shadow-inner transition-transform duration-300 group-hover:-rotate-6">
              汉
              <PushPin color="#e8737f" className="absolute -top-1.5 -right-1 scale-[0.55]" />
            </span>
            <span className="font-display text-lg font-bold leading-none text-[#4f3d4a]">
              Nhật ký
              <span className="block text-xs font-semibold tracking-[0.22em] text-[#b58fa0] uppercase">Hán ngữ</span>
            </span>
          </a>

          {/* Links */}
          {variant === 'home' ? (
            <ul className="hidden items-center gap-0.5 lg:flex">
              {HOME_LINKS.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="rounded-full px-3 py-2 text-sm font-semibold text-[#6f5a68] transition-colors hover:bg-[var(--pastel-butter)]/60 hover:text-[#4f3d4a]"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="hidden items-center gap-0.5 sm:flex">
              {APP_LINKS.map((l) => (
                <li key={l.key}>
                  <a
                    href={l.href}
                    aria-current={active === l.key ? 'page' : undefined}
                    className={`rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${
                      active === l.key
                        ? 'bg-[var(--pastel-pink)] text-[#8a4a63] shadow-sm'
                        : 'text-[#6f5a68] hover:bg-[var(--pastel-butter)]/60 hover:text-[#4f3d4a]'
                    }`}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          )}

          {/* Công cụ nhanh (chỉ trang chủ) */}
          {variant === 'home' && (
            <div className="hidden items-center gap-1.5 md:flex">
              <a
                href="#/shadowing"
                className="rounded-full bg-[var(--pastel-sky)] px-3.5 py-2 text-xs font-bold text-[#46688f] shadow-sm transition-transform hover:-translate-y-0.5"
              >
                ▶ Shadowing
              </a>
              <a
                href="#/create-file"
                className="rounded-full bg-[var(--pastel-mint)] px-3.5 py-2 text-xs font-bold text-[#3f6b50] shadow-sm transition-transform hover:-translate-y-0.5"
              >
                ✎ Tạo vở
              </a>
            </div>
          )}

          <a
            href={variant === 'home' ? '#hsk' : '#/'}
            className="rounded-full bg-[#e88aa6] px-4 py-2 text-sm font-bold text-white shadow-[0_4px_0_0_#d1708f] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_0_0_#d1708f] active:translate-y-0.5 active:shadow-none sm:px-5"
          >
            {variant === 'home' ? 'Chọn lộ trình ↓' : 'Về trang chủ'}
          </a>
        </nav>
      </div>
    </header>
  )
}
