'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Footer from '../landing/footer'
import { PushPin, WashiTape } from '../landing/decor'
import { EXAM_PARTS, fmtClock, getPaper, gradePaper, isAnswered, isCorrect } from '@/data/exams'
import type { ExamPaper, ExamQuestion } from '@/data/exams'
import { AudioBar, ChoiceRow, OrderQuestion } from './shared'

/* ============================================================
   Chế độ LUYỆN TẬP — làm thong thả, giải thích ngay từng câu
   Route: #/exam/practice/<paperId>
   ============================================================ */

/* ---------- Thẻ câu hỏi ---------- */

function QuestionCard({
  q,
  n,
  total,
  answer,
  draft,
  onPickChoice,
  onPlaceToken,
  onRemoveToken,
  onClearOrder,
}: {
  q: ExamQuestion
  n: number
  total: number
  answer: unknown
  draft: string[]
  onPickChoice: (label: string) => void
  onPlaceToken: (t: string) => void
  onRemoveToken: (i: number) => void
  onClearOrder: () => void
}) {
  const revealed = isAnswered(q, answer)
  const correct = revealed && isCorrect(q, answer)

  return (
    <motion.div
      key={q.id}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="paper-scrap relative rounded-3xl p-5 sm:p-7"
    >
      <WashiTape color="var(--pastel-sky)" pattern="dots" rotate={-4} className="-top-2.5 right-8 h-5 w-14" />

      {/* đầu câu hỏi */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-lg bg-[#4f3d4a] px-2.5 py-1 font-display text-xs font-extrabold text-white">
          Câu {n}/{total}
        </span>
        <span className="rounded-lg bg-[var(--pastel-butter)] px-2.5 py-1 text-xs font-extrabold text-[#8a6a1f]">
          {EXAM_PARTS[q.part].cn} · {EXAM_PARTS[q.part].vi}
        </span>
        {q.part === 'listen' && (
          <span className="rounded-lg bg-[var(--pastel-sky)]/40 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#46688f]">
            🔊 Nghe thoải mái
          </span>
        )}
      </div>

      {/* đề bài */}
      <p className="mt-4 text-sm font-bold text-[#5d4a57]">{q.prompt}</p>

      {/* audio cho câu nghe */}
      {q.kind === 'choice' && q.audioText && (
        <div className="mt-3">
          <AudioBar text={q.audioText} />
        </div>
      )}

      {/* nội dung chữ Hán (đọc hiểu) */}
      {q.cn && (
        <div className="mt-4 rounded-2xl bg-[var(--cream)]/70 px-4 py-4 ring-1 ring-[#ead9cd]">
          <p className="font-cn text-2xl leading-relaxed text-[#3f5c74] sm:text-[1.7rem]">{q.cn}</p>
          {'pinyin' in q && q.pinyin && <p className="mt-1.5 text-xs font-semibold italic text-[#b58fa0]">{q.pinyin}</p>}
        </div>
      )}

      {/* phần trả lời */}
      <div className="mt-4">
        {q.kind === 'choice' ? (
          <div className="space-y-2.5">
            {q.options.map((opt) => (
              <ChoiceRow
                key={opt.label}
                q={q}
                opt={opt}
                selected={answer === opt.label}
                revealed={revealed}
                onPick={() => onPickChoice(opt.label)}
              />
            ))}
          </div>
        ) : (
          <OrderQuestion
            q={q}
            draft={draft}
            revealed={revealed}
            onPlace={onPlaceToken}
            onRemove={onRemoveToken}
            onClear={onClearOrder}
          />
        )}
      </div>

      {/* giải thích */}
      {revealed && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`mt-4 rounded-2xl px-4 py-3.5 ring-1 ${
            correct ? 'bg-[var(--pastel-mint)]/30 ring-[#a9cdb6]' : 'bg-[var(--pastel-pink-soft)] ring-[#f0c0c8]'
          }`}
        >
          <p className={`text-sm font-extrabold ${correct ? 'text-[#3f6b50]' : 'text-[#c2547e]'}`}>
            {correct ? '✅ Chính xác!' : '❌ Chưa đúng rồi…'}
          </p>
          {!correct && q.kind === 'choice' && (
            <p className="mt-1 text-xs font-bold text-[#5d4a57]">
              Đáp án đúng: <span className="font-cn text-base text-[#3f5c74]">{q.options.find((o) => o.label === q.answer)?.cn}</span>
            </p>
          )}
          {!correct && q.kind === 'order' && (
            <p className="mt-1 text-xs font-bold text-[#5d4a57]">
              Câu đúng: <span className="font-cn text-base text-[#3f5c74]">{q.answer.join('')}</span>
            </p>
          )}
          <p className="mt-1.5 text-xs font-semibold leading-relaxed text-[#6f5a68]">{q.explain}</p>
        </motion.div>
      )}

      <PushPin color="#f0b429" className="absolute -left-2 top-6 hidden scale-75 sm:block" />
    </motion.div>
  )
}

/* ============================================================
   Trang chính
   ============================================================ */

/* fallback an toàn nếu paperId không tồn tại */
const EXAM_PAPERS_FALLBACK = getPaper('hsk-1')!

export default function Practice({ paperId }: { paperId?: string }) {
  const paper: ExamPaper = getPaper(paperId) ?? EXAM_PAPERS_FALLBACK
  const total = paper.questions.length

  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, unknown>>({})
  const [drafts, setDrafts] = useState<Record<string, string[]>>({})
  const [elapsed, setElapsed] = useState(0)
  const [finished, setFinished] = useState(false)

  /* đồng hồ đếm lên */
  useEffect(() => {
    if (finished) return
    const t = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => clearInterval(t)
  }, [finished])

  const q = paper.questions[idx]
  const answeredCount = paper.questions.filter((qq) => isAnswered(qq, answers[qq.id])).length
  const graded = gradePaper(paper, answers)
  const allDone = answeredCount === total

  const restart = () => {
    setIdx(0)
    setAnswers({})
    setDrafts({})
    setElapsed(0)
    setFinished(false)
  }

  /* --- thao tác trả lời --- */
  const pickChoice = (label: string) => {
    if (q.kind !== 'choice') return
    if (isAnswered(q, answers[q.id])) return
    setAnswers((a) => ({ ...a, [q.id]: label }))
  }

  const commitOrder = (qid: string, arr: string[], tokens: string[]) => {
    if (arr.length === tokens.length) {
      setAnswers((a) => ({ ...a, [qid]: arr }))
    } else {
      setAnswers((a) => {
        if (!(qid in a)) return a
        const next = { ...a }
        delete next[qid]
        return next
      })
    }
  }

  const placeToken = (t: string) => {
    if (q.kind !== 'order' || isAnswered(q, answers[q.id])) return
    const next = [...(drafts[q.id] ?? []), t]
    setDrafts((d) => ({ ...d, [q.id]: next }))
    commitOrder(q.id, next, q.tokens)
  }

  const removeToken = (i: number) => {
    if (q.kind !== 'order' || isAnswered(q, answers[q.id])) return
    const next = (drafts[q.id] ?? []).filter((_, j) => j !== i)
    setDrafts((d) => ({ ...d, [q.id]: next }))
    commitOrder(q.id, next, q.tokens)
  }

  const clearOrder = () => {
    if (q.kind !== 'order') return
    setDrafts((d) => ({ ...d, [q.id]: [] }))
    setAnswers((a) => {
      const next = { ...a }
      delete next[q.id]
      return next
    })
  }

  /* ================= Màn hình kết quả ================= */
  if (finished) {
    const wrongList = paper.questions.filter((qq) => isAnswered(qq, answers[qq.id]) && !isCorrect(qq, answers[qq.id]))
    return (
      <div className="flex min-h-screen flex-col bg-[#fff6e9] text-[#5d4a57]">
        <main className="relative flex-1 pb-16 pt-20 sm:pt-24">
          <div aria-hidden="true" className="dot-grid absolute inset-0" />
          <div className="relative mx-auto max-w-2xl px-4 sm:px-6">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="paper-scrap relative rounded-3xl p-6 text-center sm:p-8">
              <WashiTape color="var(--pastel-mint)" pattern="stripes" rotate={-4} className="-top-3 left-1/2 h-6 w-20 -translate-x-1/2" />
              <span className="text-5xl" aria-hidden="true">{graded.percent >= 80 ? '🎉' : graded.percent >= 50 ? '😊' : '💪'}</span>
              <h1 className="mt-2 font-display text-2xl font-bold text-[#4f3d4a] sm:text-3xl">
                Hoàn thành {paper.code}!
              </h1>
              <p className="mt-1 text-sm font-semibold text-[#8d7484]">Chế độ luyện tập · thời gian làm bài: {fmtClock(elapsed)}</p>

              <div className="mt-5 grid grid-cols-3 gap-3">
                {[
                  { label: 'Đúng', value: graded.correct, cls: 'bg-[var(--pastel-mint)]/50 text-[#3f6b50]' },
                  { label: 'Sai', value: graded.wrong, cls: 'bg-[var(--pastel-pink)]/40 text-[#c2547e]' },
                  { label: 'Bỏ trống', value: graded.blank, cls: 'bg-[var(--pastel-butter)]/60 text-[#8a6a1f]' },
                ].map((s) => (
                  <div key={s.label} className={`rounded-2xl px-3 py-4 ${s.cls}`}>
                    <p className="font-display text-3xl font-extrabold">{s.value}</p>
                    <p className="mt-0.5 text-[11px] font-extrabold uppercase tracking-wider">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-2xl bg-[var(--cream)]/70 px-4 py-3 ring-1 ring-[#ead9cd]">
                <p className="text-sm font-bold text-[#5d4a57]">
                  Điểm của bạn: <span className="font-display text-2xl font-extrabold text-[#e8737f]">{graded.percent}</span>/100
                </p>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white ring-1 ring-[#ead9cd]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${graded.percent}%` }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full rounded-full bg-gradient-to-r from-[#e8737f] to-[#f5b73f]"
                  />
                </div>
              </div>

              {wrongList.length > 0 && (
                <div className="mt-5 text-left">
                  <p className="text-xs font-extrabold uppercase tracking-wider text-[#b58fa0]">Các câu nên xem lại</p>
                  <ul className="mt-2 space-y-2">
                    {wrongList.map((qq, i) => (
                      <li key={qq.id} className="rounded-xl bg-white/80 px-3.5 py-2.5 ring-1 ring-[#ead9cd]">
                        <span className="text-[11px] font-extrabold text-[#c2547e]">Câu {paper.questions.indexOf(qq) + 1}</span>
                        <p className="font-cn text-lg text-[#3f5c74]">{qq.cn ?? qq.prompt}</p>
                        <p className="mt-0.5 text-xs font-semibold text-[#8d7484]">{qq.explain}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-6 grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={restart}
                  className="rounded-2xl bg-[var(--pastel-mint)] px-4 py-3 text-sm font-extrabold text-[#3f6b50] ring-1 ring-[#a9cdb6] transition-all hover:-translate-y-0.5"
                >
                  🔁 Làm lại đề này
                </button>
                <a
                  href="#/exam"
                  className="rounded-2xl bg-[#4f3d4a] px-4 py-3 text-sm font-extrabold text-white shadow-[0_4px_0_0_#3a2d36] transition-all hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none"
                >
                  ← Về kho đề thi
                </a>
              </div>
            </motion.div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  /* ================= Màn hình làm bài ================= */
  return (
    <div className="flex min-h-screen flex-col bg-[#fff6e9] text-[#5d4a57]">
      <main className="relative flex-1 pb-16 pt-20 sm:pt-24">
        <div aria-hidden="true" className="dot-grid absolute inset-0" />

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
          {/* ===== Header đề ===== */}
          <header className="paper-scrap relative rounded-3xl px-5 py-5 sm:px-7">
            <WashiTape color="var(--pastel-mint)" pattern="dots" rotate={-5} className="-top-3 left-10 h-6 w-16" />
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="#/exam"
                className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--cream)] text-[#8d7484] ring-1 ring-[#ead9cd] transition-all hover:-translate-y-0.5 hover:text-[#4f3d4a]"
                aria-label="Về kho đề thi"
              >
                ←
              </a>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-lg bg-[var(--pastel-pink)] px-2 py-0.5 font-display text-xs font-extrabold text-[#8a4a63]">
                    {paper.code}
                  </span>
                  <h1 className="font-display text-base font-bold leading-snug text-[#4f3d4a] sm:text-lg">{paper.title}</h1>
                </div>
                <p className="mt-0.5 text-[11px] font-bold text-[#b58fa0]">
                  Chế độ luyện tập · giải thích ngay · {total} câu
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-xl bg-[var(--cream)] px-3 py-1.5 text-xs font-extrabold tabular-nums text-[#6f5a68] ring-1 ring-[#ead9cd]" title="Thời gian đã làm">
                  ⏱ {fmtClock(elapsed)}
                </span>
                <button
                  type="button"
                  onClick={restart}
                  className="rounded-xl bg-[var(--cream)] px-3 py-1.5 text-xs font-extrabold text-[#6f5a68] ring-1 ring-[#ead9cd] transition-all hover:-translate-y-0.5 hover:text-[#4f3d4a]"
                >
                  ↺ Làm lại
                </button>
              </div>
            </div>

            {/* thanh tiến độ */}
            <div className="mt-3 flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-white ring-1 ring-[#ead9cd]">
                <motion.div
                  className="h-full rounded-full bg-[#8fbf7f]"
                  animate={{ width: `${(answeredCount / total) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <span className="text-[11px] font-extrabold text-[#8d7484]">{answeredCount}/{total} câu</span>
            </div>
          </header>

          {/* ===== Thân bài ===== */}
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_270px]">
            {/* cột câu hỏi */}
            <div>
              <QuestionCard
                q={q}
                n={idx + 1}
                total={total}
                answer={answers[q.id]}
                draft={drafts[q.id] ?? []}
                onPickChoice={pickChoice}
                onPlaceToken={placeToken}
                onRemoveToken={removeToken}
                onClearOrder={clearOrder}
              />

              {/* điều hướng dưới */}
              <div className="mt-4 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setIdx((i) => Math.max(0, i - 1))}
                  disabled={idx === 0}
                  className="rounded-2xl bg-[var(--cream)] px-4 py-2.5 text-sm font-extrabold text-[#6f5a68] ring-1 ring-[#ead9cd] transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
                >
                  ← Câu trước
                </button>
                {idx < total - 1 ? (
                  <button
                    type="button"
                    onClick={() => setIdx((i) => Math.min(total - 1, i + 1))}
                    className="rounded-2xl bg-[#4f3d4a] px-5 py-2.5 text-sm font-extrabold text-white shadow-[0_4px_0_0_#3a2d36] transition-all hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none"
                  >
                    Câu sau →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setFinished(true)}
                    className="rounded-2xl bg-[#d2495f] px-5 py-2.5 text-sm font-extrabold text-white shadow-[0_4px_0_0_#a53a4c] transition-all hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none"
                  >
                    🏁 Xem kết quả
                  </button>
                )}
              </div>
            </div>

            {/* cột phải: bản đồ câu hỏi */}
            <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
              <div className="paper-scrap rounded-3xl p-4">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#b58fa0]">Bản đồ câu hỏi</p>
                <div className="mt-2.5 grid grid-cols-6 gap-1.5">
                  {paper.questions.map((qq, i) => {
                    const ok = isAnswered(qq, answers[qq.id]) && isCorrect(qq, answers[qq.id])
                    const bad = isAnswered(qq, answers[qq.id]) && !isCorrect(qq, answers[qq.id])
                    const cur = i === idx
                    return (
                      <button
                        key={qq.id}
                        type="button"
                        onClick={() => setIdx(i)}
                        aria-label={`Câu ${i + 1}`}
                        className={`grid h-9 place-items-center rounded-lg text-xs font-extrabold transition-all hover:-translate-y-0.5 ${
                          ok
                            ? 'bg-[var(--pastel-mint)] text-[#3f6b50] ring-1 ring-[#a9cdb6]'
                            : bad
                              ? 'bg-[var(--pastel-pink)] text-[#c2547e] ring-1 ring-[#f0c0c8]'
                              : 'bg-white text-[#8d7484] ring-1 ring-[#ead9cd]'
                        } ${cur ? 'ring-2 ring-[#4f3d4a] ring-offset-1' : ''}`}
                      >
                        {i + 1}
                      </button>
                    )
                  })}
                </div>
                <div className="mt-3 space-y-1 border-t border-dashed border-[#ead9cd] pt-2.5 text-[10px] font-bold text-[#8d7484]">
                  <p><span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-[var(--pastel-mint)] align-middle" aria-hidden="true" /> Đúng · <span className="mx-1 inline-block h-2.5 w-2.5 rounded-sm bg-[var(--pastel-pink)] align-middle" aria-hidden="true" /> Sai · <span className="mx-1 inline-block h-2.5 w-2.5 rounded-sm bg-white ring-1 ring-[#ead9cd] align-middle" aria-hidden="true" /> Chưa làm</p>
                  <p className="pt-1">✅ Đúng {graded.correct} · ❌ Sai {graded.wrong}</p>
                </div>
              </div>

              <div className="paper-scrap rounded-3xl p-4">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#b58fa0]">Nội dung đề</p>
                <ul className="mt-2 space-y-2">
                  {paper.parts.map((p) => {
                    const qs = paper.questions.filter((qq) => qq.part === p.key)
                    return (
                      <li key={p.key} className="rounded-xl bg-[var(--cream)]/70 px-3 py-2 ring-1 ring-[#ead9cd]">
                        <p className="text-xs font-extrabold text-[#4f3d4a]">
                          {p.cn} · {p.vi} <span className="ml-1 text-[10px] font-bold text-[#b58fa0]">({qs.length} câu)</span>
                        </p>
                        <p className="mt-0.5 text-[10px] font-semibold leading-snug text-[#8d7484]">{p.hint}</p>
                      </li>
                    )
                  })}
                </ul>
                {allDone && (
                  <button
                    type="button"
                    onClick={() => setFinished(true)}
                    className="mt-3 w-full rounded-2xl bg-[#d2495f] px-4 py-2.5 text-sm font-extrabold text-white shadow-[0_4px_0_0_#a53a4c] transition-all hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none"
                  >
                    🏁 Kết thúc &amp; xem kết quả
                  </button>
                )}
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
