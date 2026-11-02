'use client'

import { motion } from 'framer-motion'
import Footer from './footer'
import { PushPin, Reveal, SquiggleDoodle, WashiTape } from './decor'

export default function CtaFooter() {
  return (
    <>
      {/* ================= CTA ================= */}
      <section id="cta" className="relative overflow-hidden py-20 sm:py-24">
        <div aria-hidden="true" className="dot-grid absolute inset-0" />

        {/* sticker hai bên */}
        <span aria-hidden="true" className="floaty absolute left-[8%] top-16 hidden rotate-[-10deg] rounded-xl bg-[var(--pastel-sky)] px-3 py-1.5 font-cn text-lg text-[#46688f] shadow-md lg:block">
          开始
        </span>
        <span aria-hidden="true" className="floaty-slow absolute right-[8%] top-24 hidden rotate-[8deg] rounded-xl bg-[var(--pastel-butter)] px-3 py-1.5 font-cn text-lg text-[#8a6a1f] shadow-md lg:block">
          坚持
        </span>

        <Reveal className="relative mx-auto max-w-2xl px-4">
          <motion.div
            whileHover={{ rotate: 0, y: -6 }}
            className="paper-scrap relative -rotate-1 rounded-2xl px-6 py-10 text-center sm:px-12"
          >
            <PushPin color="#e8737f" className="absolute -top-2.5 left-8" />
            <PushPin color="#f0b429" className="absolute -top-2.5 right-8" />
            <WashiTape color="var(--pastel-lilac)" pattern="grid" rotate={-5} className="-top-3 left-1/2 h-6 w-24 -translate-x-1/2" />

            <h2 className="font-display text-3xl font-bold leading-snug text-[#4f3d4a] sm:text-4xl">
              Sẵn sàng viết <span className="text-[#e8737f]">trang đầu tiên</span>?
            </h2>
            <SquiggleDoodle className="mx-auto mt-2 h-3 w-40" color="#f2b8cb" />
            <p className="mx-auto mt-3 max-w-sm text-sm font-medium text-[#8d7484] sm:text-base">
              Chọn lộ trình phù hợp — phần còn lại, để từng trang sổ kể chuyện tiến bộ của bạn.
            </p>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <motion.a
                href="#/register"
                whileHover={{ y: -3, rotate: -1 }}
                whileTap={{ scale: 0.97 }}
                className="rounded-full bg-[#e8737f] px-7 py-3 text-sm font-bold text-white shadow-[0_5px_0_0_#d1708f] sm:text-base"
              >
                Bắt đầu ngay hôm nay
              </motion.a>
              <a
                href="#hsk"
                className="rounded-full px-5 py-3 text-sm font-bold text-[#8d7484] underline decoration-[#e5c3cf] decoration-wavy underline-offset-4 transition-colors hover:text-[#e8737f] sm:text-base"
              >
                Xem lại lộ trình
              </a>
            </div>
          </motion.div>
        </Reveal>
      </section>

      {/* ================= Footer ================= */}
      <Footer />
    </>
  )
}
