'use client'

import HskRoadmap from './hsk-roadmap'
import YctSection from './yct-section'
import BoyaSection from './boya-section'
import HanyuSection from './hanyu-section'
import Footer from './footer'
import { Reveal, WashiTape } from './decor'

/* Trang chủ: chỉ gồm các phần trình bày lộ trình học.
   Header + sidebar do AppShell (src/components/shell) đảm nhiệm. */

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-[#fff6e9] text-[#5d4a57]">
      <main className="flex-1 pt-16 sm:pt-20">
        {/* đầu trang gọn thay cho banner cũ */}
        <section id="top" className="relative overflow-hidden pt-6 sm:pt-8">
          <div aria-hidden="true" className="dot-grid absolute inset-0" />
          <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal className="flex flex-col items-center gap-3 pb-2 text-center">
              <span className="relative inline-block px-5 py-1.5">
                <span
                  aria-hidden="true"
                  className="absolute inset-0 -rotate-2 rounded-md bg-[var(--pastel-butter)] opacity-90"
                />
                <WashiTape color="var(--pastel-mint)" pattern="dots" rotate={7} className="-top-2.5 -right-7 h-4 w-10" />
                <span className="relative text-xs font-bold uppercase tracking-[0.18em] text-[#7a5c68]">
                  ✎ Nhật ký Hán ngữ
                </span>
              </span>
              <h1 className="font-display text-2xl font-bold leading-snug text-[#4f3d4a] sm:text-3xl">
                Bốn lộ trình học tiếng Trung — chọn một chặng và bắt đầu
              </h1>
              <p className="max-w-xl text-sm font-medium text-[#8d7484] sm:text-base">
                Bấm vào từng cấp độ bên dưới để xem danh sách bài học{' '}
                <strong className="text-[#6f5a68]">từ vựng</strong> và{' '}
                <strong className="text-[#6f5a68]">ngữ pháp</strong> của lộ trình đó.
              </p>
            </Reveal>
          </div>
        </section>

        <HskRoadmap />
        <YctSection />
        <BoyaSection />
        <HanyuSection />
      </main>

      <Footer />
    </div>
  )
}
