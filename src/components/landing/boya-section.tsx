'use client'

import { motion } from 'framer-motion'
import { PushPin, SectionHeading, SquiggleDoodle, WashiTape } from './decor'

const BOYA_BOOKS = [
  {
    slug: 'boya-1',
    cn: '起步篇',
    pinyin: 'qǐbù piān',
    vi: 'Sơ cấp',
    vol: 'Tập 1 · 2',
    cover: '#eaf7ee',
    ink: '#3f6b50',
    tape: 'var(--pastel-mint)',
    rotate: -2.4,
  },
  {
    slug: 'boya-2',
    cn: '加速篇',
    pinyin: 'jiāsù piān',
    vi: 'Trung cấp',
    vol: 'Tập 1 · 2',
    cover: '#fff7dd',
    ink: '#8a6a1f',
    tape: 'var(--pastel-butter)',
    rotate: 1.8,
  },
  {
    slug: 'boya-3',
    cn: '冲刺篇',
    pinyin: 'chōngcì piān',
    vi: 'Trung – Cao cấp',
    vol: 'Tập 1 · 2',
    cover: '#fff0e4',
    ink: '#a05c33',
    tape: 'var(--pastel-peach)',
    rotate: -1.8,
  },
  {
    slug: 'boya-4',
    cn: '飞翔篇',
    pinyin: 'fēixiáng piān',
    vi: 'Cao cấp',
    vol: 'Tập 1 · 2',
    cover: '#eef4fd',
    ink: '#46688f',
    tape: 'var(--pastel-sky)',
    rotate: 2.4,
  },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}
const bookVar = {
  hidden: { opacity: 0, y: 44, scale: 0.9 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 120, damping: 14 } },
}

export default function BoyaSection() {
  return (
    <section id="boya" className="relative py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          tag="Giáo trình ĐH Bắc Kinh"
          tagColor="var(--pastel-sky)"
          title="Boya Chinese"
          titleAccent="博雅汉语"
          sub="Bốn nấc thang từ mở lời đến bay xa — từ vựng sống động theo từng chủ đề gần gũi."
        />

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="mt-12 grid grid-cols-2 gap-5 sm:gap-7 lg:grid-cols-4"
        >
          {BOYA_BOOKS.map((b) => (
            <motion.a
              key={b.cn}
              href={`#/roadmap/${b.slug}`}
              variants={bookVar}
              whileHover={{ rotate: 0, y: -12, scale: 1.04, zIndex: 20 }}
              whileTap={{ scale: 0.97 }}
              style={{ rotate: b.rotate }}
              aria-label={`Xem bài học Boya ${b.cn}`}
              className="paper-scrap group relative mx-auto flex w-full max-w-[210px] cursor-pointer flex-col items-center overflow-hidden rounded-xl px-4 pb-5 pt-6"
            >
              {/* băng dính gáy trên */}
              <WashiTape color={b.tape} pattern={b.cn === '加速篇' ? 'grid' : 'stripes'} rotate={-7} className="-top-2 left-1/2 z-10 h-6 w-24 -translate-x-1/2" />

              {/* màu bìa */}
              <div className="relative -mx-4 -mt-1 mb-4 w-[calc(100%+2rem)]">
                <div className="flex h-44 flex-col items-center justify-center gap-2 rounded-b-none rounded-t-md" style={{ backgroundColor: b.cover }}>
                  {/* lỗ gáy xoắn */}
                  <div aria-hidden="true" className="absolute left-1/2 top-2 flex -translate-x-1/2 gap-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <span key={i} className="h-1.5 w-1.5 rounded-full bg-white shadow-inner ring-1 ring-black/5" />
                    ))}
                  </div>
                  <span className="font-cn text-4xl font-normal leading-none" style={{ color: b.ink }}>
                    {b.cn}
                  </span>
                  <span className="text-[11px] font-semibold tracking-wide opacity-80" style={{ color: b.ink }}>
                    {b.pinyin}
                  </span>
                  <SquiggleDoodle className="h-2.5 w-16" color={b.tape} />
                </div>
              </div>

              <h3 className="font-display text-lg font-bold text-[#4f3d4a]">{b.vi}</h3>
              <span className="mt-1 rounded-full bg-[var(--cream)] px-3 py-0.5 text-[11px] font-bold text-[#6f5a68] ring-1 ring-[#ead9cd]">
                {b.vol}
              </span>

              <span className="mt-2 text-[10px] font-bold text-[#c2547e] opacity-0 transition-opacity group-hover:opacity-100">
                Xem bài học ↗
              </span>

              <PushPin color={b.tape === 'var(--pastel-mint)' ? '#6fae87' : b.tape === 'var(--pastel-butter)' ? '#d9a13b' : b.tape === 'var(--pastel-peach)' ? '#e08a4e' : '#6f96c4'} className="absolute right-2.5 top-3 scale-[0.6]" />
            </motion.a>
          ))}
        </motion.div>

        <p className="mt-10 text-center text-sm font-semibold text-[#8d7484]">
          Bấm vào từng cuốn để xem bài học — học xong 4 nấc, từ vựng + ngữ pháp đủ sức bước vào{' '}
          <span className="text-[#e8737f]">HSK 6</span> một cách nhẹ nhàng.
        </p>
      </div>
    </section>
  )
}
