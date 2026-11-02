'use client'

import { useEffect, useState } from 'react'
import { WashiTape } from './decor'

/* Sidebar dọc: các button nhảy tới từng phần lộ trình + vào ứng dụng */

type Item = { href: string; char: string; label: string; kind: 'top' | 'anchor' | 'route' }

const ITEMS: Item[] = [
  { href: '#top', char: '顶', label: 'Đầu trang', kind: 'top' },
  { href: '#hsk', char: '考', label: 'HSK 3.0', kind: 'anchor' },
  { href: '#yct', char: '童', label: 'YCT', kind: 'anchor' },
  { href: '#boya', char: '博', label: 'Boya', kind: 'anchor' },
  { href: '#hanyu', char: '教', label: 'Hán ngữ', kind: 'anchor' },
  { href: '#/shadowing', char: '听', label: 'Shadowing', kind: 'route' },
  { href: '#/create-file', char: '写', label: 'Tạo vở', kind: 'route' },
]

/* Theo dõi section đang hiển thị để tô sáng button */
function useActiveSection() {
  const [active, setActive] = useState('top')

  useEffect(() => {
    const ids = ['hsk', 'yct', 'boya', 'hanyu']

    const compute = () => {
      if (window.scrollY < 180) {
        setActive('top')
        return
      }
      // Section được coi là "đang xem" khi mép trên của nó vượt qua 1/3 viewport
      const line = window.innerHeight * 0.35
      let current = 'top'
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= line) current = id
      }
      setActive(current)
    }

    compute()
    window.addEventListener('scroll', compute, { passive: true })
    window.addEventListener('resize', compute)

    return () => {
      window.removeEventListener('scroll', compute)
      window.removeEventListener('resize', compute)
    }
  }, [])

  return active
}

function isActiveItem(item: Item, active: string): boolean {
  if (item.kind === 'top') return active === 'top'
  if (item.kind === 'anchor') return active === item.href.slice(1)
  return false
}

/* ================= Sidebar dọc (desktop) ================= */

export default function SideDock() {
  const active = useActiveSection()

  return (
    <nav aria-label="Danh mục lộ trình" className="fixed left-1.5 top-1/2 z-40 hidden -translate-y-1/2 xl:block">
      <div className="paper-scrap relative flex flex-col items-center gap-1 rounded-2xl px-1.5 py-3">
        <WashiTape color="var(--pastel-sky)" pattern="dots" rotate={-8} className="-top-2 left-1/2 h-4 w-10 -translate-x-1/2" />

        {ITEMS.map((item, i) => (
          <span key={item.href} className="contents">
            {i === 5 ? (
              <span aria-hidden="true" className="my-1 h-px w-7 rounded-full bg-[#e8d5c6]" />
            ) : null}
            <a
              href={item.href}
              title={item.label}
              aria-label={item.label}
              aria-current={isActiveItem(item, active) ? 'true' : undefined}
              className={`flex h-11 w-11 flex-col items-center justify-center gap-0.5 rounded-xl transition-all duration-200 ${
                isActiveItem(item, active)
                  ? 'bg-[var(--pastel-pink)] text-[#8a4a63] shadow-sm'
                  : 'text-[#8d7484] hover:-translate-y-0.5 hover:bg-[var(--pastel-butter)]/70 hover:text-[#4f3d4a]'
              }`}
            >
              <span className="font-cn text-base leading-none">{item.char}</span>
              <span className="text-[8px] font-bold leading-none tracking-wide">{item.label}</span>
            </a>
          </span>
        ))}
      </div>
    </nav>
  )
}

/* ================= Thanh chip ngang (mobile / tablet) ================= */

export function MobileChipBar() {
  const active = useActiveSection()

  return (
    <nav aria-label="Danh mục lộ trình" className="sticky top-[70px] z-40 xl:hidden">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="paper-scrap custom-scroll flex items-center gap-1 overflow-x-auto rounded-2xl px-2 py-2">
          {ITEMS.map((item, i) => (
            <span key={item.href} className="flex items-center">
              {i === 5 ? <span aria-hidden="true" className="mx-1 h-6 w-px shrink-0 bg-[#e8d5c6]" /> : null}
              <a
                href={item.href}
                aria-label={item.label}
                className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                  isActiveItem(item, active)
                    ? 'bg-[var(--pastel-pink)] text-[#8a4a63] shadow-sm'
                    : 'text-[#8d7484] hover:bg-[var(--pastel-butter)]/60 hover:text-[#4f3d4a]'
                }`}
              >
                <span className="font-cn text-sm leading-none">{item.char}</span>
                {item.label}
              </a>
            </span>
          ))}
        </div>
      </div>
    </nav>
  )
}
