'use client'

import { motion } from 'framer-motion'
import Footer from '../landing/footer'
import { PushPin, Reveal, WashiTape } from '../landing/decor'
import { EXAM_PAPERS } from '@/data/exams'
import type { ExamPaper, PaperTone } from '@/data/exams'

/* ============================================================
   Đề thi & Luyện tập — chọn chế độ học
   Route: #/exam
   2 chế độ: Luyện tập (tự do, giải thích ngay) · Thi thử (phòng thi)
   ============================================================ */

const TONE: Record<PaperTone, { chip: string; ring: string; btn: string }> = {
  pink: { chip: 'bg-[var(--pastel-pink)] text-[#8a4a63]', ring: 'ring-[#f3c4d3]', btn: 'bg-[var(--pastel-pink)] text-[#8a4a63]' },
  butter: { chip: 'bg-[var(--pastel-butter)] text-[#8a6a1f]', ring: 'ring-[#f2e2b8]', btn: 'bg-[var(--pastel-butter)] text-[#8a6a1f]' },
  mint: { chip: 'bg-[var(--pastel-mint)] text-[#3f6b50]', ring: 'ring-[#cfe6d6]', btn: 'bg-[var(--pastel-mint)] text-[#3f6b50]' },
  sky: { chip: 'bg-[var(--pastel-sky)] text-[#46688f]', ring: 'ring-[#cfe0ef]', btn: 'bg-[var(--pastel-sky)] text-[#46688f]' },
  lilac: { chip: 'bg-[var(--pastel-lilac)] text-[#6d5a94]', ring: 'ring-[#e2d6f0]', btn: 'bg-[var(--pastel-lilac)] text-[#6d5a94]' },
  peach: { chip: 'bg-[var(--pastel-peach)] text-[#a05a3a]', ring: 'ring-[#f3dcc6]', btn: 'bg-[var(--pastel-peach)] text-[#a05a3a]' },
}

/* ---------- Thẻ một đề trong kho đề ---------- */

function PaperCard({ paper, index }: { paper: ExamPaper; index: number }) {
  const tone = TONE[paper.tone]
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: (index % 3) * 0.07, ease: [0.22, 1, 0.36, 1] }}
      className={`paper-scrap relative flex flex-col rounded-2xl p-4 ring-1 ${tone.ring}`}
    >
      {paper.badge && (
        <span className="absolute -top-2.5 right-4 rounded-full bg-[#d2495f] px-2.5 py-0.5 text-[10px] font-extrabold text-white shadow-sm">
          {paper.badge}
        </span>
      )}

      <div className="flex items-center gap-2">
        <span className={`rounded-lg px-2.5 py-1 font-display text-sm font-extrabold ${tone.chip}`}>{paper.code}</span>
        <span className="font-cn text-base text-[#b58fa0]">{paper.cn}</span>
      </div>

      <h3 className="mt-2 text-sm font-extrabold leading-snug text-[#4f3d4a]">{paper.title}</h3>

      <ul className="mt-2.5 space-y-1 text-[11px] font-bold text-[#8d7484]">
        <li className="flex items-center gap-1.5">
          <span className="grid h-4 w-4 place-items-center rounded-full bg-[var(--cream)] text-[9px]" aria-hidden="true">✓</span>
          {paper.questions.length} câu · {paper.parts.length} phần · {paper.minutes} phút
        </li>
        <li className="flex items-center gap-1.5">
          <span className="grid h-4 w-4 place-items-center rounded-full bg-[var(--cream)] text-[9px]" aria-hidden="true">✓</span>
          {paper.parts.map((p) => p.cn).join(' · ')}
        </li>
        <li className="flex items-center gap-1.5">
          <span className="grid h-4 w-4 place-items-center rounded-full bg-[var(--cream)] text-[9px]" aria-hidden="true">✓</span>
          {paper.attempts}
        </li>
      </ul>

      <div className="mt-3.5 grid grid-cols-2 gap-2 border-t border-dashed border-[#ead9cd] pt-3">
        <a
          href={`#/exam/practice/${paper.id}`}
          className="rounded-xl bg-[var(--pastel-mint)]/60 px-2 py-2 text-center text-xs font-extrabold text-[#3f6b50] ring-1 ring-[#cfe6d6] transition-all hover:-translate-y-0.5 hover:bg-[var(--pastel-mint)]"
        >
          ✏️ Luyện tập
        </a>
        <a
          href={`#/exam/mock/${paper.id}`}
          className="rounded-xl bg-[#4f3d4a] px-2 py-2 text-center text-xs font-extrabold text-white shadow-[0_3px_0_0_#3a2d36] transition-all hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none"
        >
          🎧 Thi thử
        </a>
      </div>
    </motion.div>
  )
}

/* ============================================================
   Trang chính
   ============================================================ */

export default function ExamHub() {
  return (
    <div className="flex min-h-screen flex-col bg-[#fff6e9] text-[#5d4a57]">
      <main className="relative flex-1 pb-16 pt-20 sm:pt-24">
        <div aria-hidden="true" className="dot-grid absolute inset-0" />

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
          {/* ================= Header ================= */}
          <Reveal>
            <header className="paper-scrap relative rounded-3xl px-5 py-6 sm:px-8 sm:py-7">
              <WashiTape color="var(--pastel-lilac)" pattern="dots" rotate={-5} className="-top-3 left-10 h-6 w-20" />
              <PushPin color="#e8737f" className="absolute right-8 top-3 scale-75" />

              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="leading-tight">
                    <span className="relative inline-block px-3 py-0.5">
                      <span aria-hidden="true" className="absolute inset-0 -rotate-1 rounded-md bg-[var(--pastel-butter)] opacity-90" />
                      <span className="relative font-display text-2xl font-bold text-[#4f3d4a] sm:text-3xl">
                        Đề thi &amp; Luyện tập
                      </span>
                      <span className="relative ml-2 hidden font-cn text-2xl text-[#e88aa6] sm:inline" aria-hidden="true">
                        试卷
                      </span>
                    </span>
                  </h1>
                  <p className="mt-2 max-w-lg text-sm font-semibold text-[#8d7484]">
                    Chọn cách rèn luyện phù hợp: học thong thả với giải thích chi tiết, hoặc bước vào phòng thi mô phỏng thật.
                  </p>
                </div>
                <span aria-hidden="true" className="hidden shrink-0 text-5xl sm:block">📝</span>
              </div>
            </header>
          </Reveal>

          {/* ================= 2 chế độ ================= */}
          <section aria-label="Hai chế độ học" className="mt-6 grid gap-4 sm:grid-cols-2">
            {/* --- Luyện tập --- */}
            <Reveal delay={0.05}>
              <div className="paper-scrap relative h-full rounded-3xl p-6 ring-1 ring-[#cfe6d6]">
                <WashiTape color="var(--pastel-mint)" pattern="stripes" rotate={3} className="-top-2.5 right-8 h-5 w-14" />
                <div className="flex items-center justify-between">
                  <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[var(--pastel-mint)] text-3xl shadow-inner" aria-hidden="true">
                    ✏️
                  </span>
                  <span className="rounded-full bg-[var(--cream)] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#3f6b50] ring-1 ring-[#cfe6d6]">
                    Không tính giờ
                  </span>
                </div>
                <h2 className="mt-3 font-display text-xl font-bold text-[#4f3d4a]">
                  Chế độ Luyện tập <span className="ml-1 font-cn text-lg text-[#7fae8f]">练习</span>
                </h2>
                <p className="mt-1 text-xs font-semibold leading-relaxed text-[#8d7484]">
                  Làm chậm – hiểu sâu. Chọn đáp án là biết ngay đúng/sai kèm giải thích, thoải mái nghe lại audio và quay lại bất kỳ câu nào.
                </p>
                <ul className="mt-3 space-y-1.5 text-xs font-bold text-[#5d4a57]">
                  <li className="flex gap-2"><span aria-hidden="true">💡</span> Xem đáp án &amp; giải thích ngay từng câu</li>
                  <li className="flex gap-2"><span aria-hidden="true">🔁</span> Nghe lại audio nhiều lần, không áp lực thời gian</li>
                  <li className="flex gap-2"><span aria-hidden="true">🧭</span> Tự chọn đề, bỏ qua hoặc làm lại tuỳ ý</li>
                </ul>
                <a
                  href="#/exam/practice/hsk-1"
                  className="mt-4 block rounded-2xl bg-[var(--pastel-mint)] px-4 py-2.5 text-center text-sm font-extrabold text-[#3f6b50] ring-1 ring-[#a9cdb6] transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  Bắt đầu luyện tập →
                </a>
              </div>
            </Reveal>

            {/* --- Thi thử --- */}
            <Reveal delay={0.12}>
              <div className="paper-scrap relative h-full rounded-3xl p-6 ring-1 ring-[#f3dcc6]">
                <WashiTape color="var(--pastel-peach)" pattern="dots" rotate={-3} className="-top-2.5 right-8 h-5 w-14" />
                <div className="flex items-center justify-between">
                  <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[var(--pastel-peach)] text-3xl shadow-inner" aria-hidden="true">
                    🎧
                  </span>
                  <span className="rounded-full bg-[#fdeaea] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#d2495f] ring-1 ring-[#f0c0c8]">
                    Bám sát thi thật
                  </span>
                </div>
                <h2 className="mt-3 font-display text-xl font-bold text-[#4f3d4a]">
                  Chế độ Thi thử <span className="ml-1 font-cn text-lg text-[#d2495f]">考试</span>
                </h2>
                <p className="mt-1 text-xs font-semibold leading-relaxed text-[#8d7484]">
                  Phòng thi mô phỏng như thật: làm bài trong khung toàn màn hình, đồng hồ đếm ngược và thẻ trả lời câu hỏi y như thi trên máy.
                </p>
                <ul className="mt-3 space-y-1.5 text-xs font-bold text-[#5d4a57]">
                  <li className="flex gap-2"><span aria-hidden="true">🖥️</span> Giao diện toàn màn hình, không bị làm phiền</li>
                  <li className="flex gap-2"><span aria-hidden="true">⏳</span> Đếm ngược thời gian, hết giờ tự nộp bài</li>
                  <li className="flex gap-2"><span aria-hidden="true">⭐</span> Đánh dấu câu, nộp bài mới chấm điểm</li>
                </ul>
                <a
                  href="#/exam/mock/hsk-1"
                  className="mt-4 block rounded-2xl bg-[#4f3d4a] px-4 py-2.5 text-center text-sm font-extrabold text-white shadow-[0_4px_0_0_#3a2d36] transition-all hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none"
                >
                  Vào phòng thi →
                </a>
              </div>
            </Reveal>
          </section>

          {/* ================= Kho đề ================= */}
          <Reveal delay={0.08}>
            <div className="mt-10 flex items-end justify-between gap-3">
              <h2 className="font-display text-xl font-bold text-[#4f3d4a] sm:text-2xl">
                Kho đề thi <span className="ml-1 font-cn text-xl text-[#e88aa6]">题库</span>
              </h2>
              <p className="hidden text-xs font-bold text-[#b58fa0] sm:block">Chọn một đề để bắt đầu</p>
            </div>
          </Reveal>

          <section aria-label="Danh sách đề thi" className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {EXAM_PAPERS.map((p, i) => (
              <PaperCard key={p.id} paper={p} index={i} />
            ))}
          </section>

          {/* ================= Ghi chú ================= */}
          <Reveal delay={0.1}>
            <div className="mt-8 rounded-2xl bg-[var(--pastel-butter)]/40 px-5 py-4 text-xs font-semibold leading-relaxed text-[#8a6a1f] ring-1 ring-[#f2e2b8]">
              💡 <b>Lưu ý:</b> Đây là các đề demo minh hoạ, câu hỏi bám sát từ vựng &amp; ngữ pháp trong lộ trình của trang. Đề full đúng số câu chuẩn HSK/YCT sẽ sớm được cập nhật.
            </div>
          </Reveal>
        </div>
      </main>

      <Footer />
    </div>
  )
}
