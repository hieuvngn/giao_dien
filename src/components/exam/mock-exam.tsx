'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { EXAM_PARTS, fmtClock, getPaper, gradePaper, isAnswered } from '@/data/exams'
import type { ExamPaper } from '@/data/exams'
import { AudioBar, ChoiceRow, OrderQuestion } from './shared'

/* ============================================================
   Chế độ THI THỬ — phòng thi mô phỏng toàn màn hình
   Route: #/exam/mock/<paperId>
   - Trang hướng dẫn (đọc quy định → vào phòng thi)
   - Làm bài trong khung fixed phủ toàn màn hình + đồng hồ đếm ngược
   - Thẻ trả lời câu hỏi (đánh dấu ⭐, xem tiến độ), nộp bài, kết quả
   ============================================================ */

const FALLBACK = getPaper('hsk-1')!

type Phase = 'intro' | 'exam' | 'result'

export default function MockExam({ paperId }: { paperId?: string }) {
  const paper: ExamPaper = getPaper(paperId) ?? FALLBACK
  const total = paper.questions.length

  const [phase, setPhase] = useState<Phase>('intro')
  const [agreed, setAgreed] = useState(false)
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, unknown>>({})
  const [drafts, setDrafts] = useState<Record<string, string[]>>({})
  const [flags, setFlags] = useState<string[]>([])
  const [secondsLeft, setSecondsLeft] = useState(paper.minutes * 60)
  const leftRef = useRef(paper.minutes * 60) // nguồn chuẩn của đồng hồ cho interval
  const [showSubmit, setShowSubmit] = useState(false)
  const [showExit, setShowExit] = useState(false)
  const [showPalette, setShowPalette] = useState(false)

  const q = paper.questions[idx]
  const graded = gradePaper(paper, answers)
  const answeredCount = paper.questions.filter((qq) => isAnswered(qq, answers[qq.id])).length
  const urgent = secondsLeft <= 300 && secondsLeft > 0

  /* ---------- khoá cuộn nền khi phòng thi mở ---------- */
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  /* ---------- đồng hồ đếm ngược (hết giờ → tự nộp bài) ---------- */
  useEffect(() => {
    if (phase !== 'exam') return
    const t = setInterval(() => {
      const next = Math.max(0, leftRef.current - 1)
      leftRef.current = next
      setSecondsLeft(next)
      if (next === 0) setPhase('result')
    }, 1000)
    return () => clearInterval(t)
  }, [phase])

  /* Esc trong lúc thi → hiện hộp thoại rời phòng thi */
  useEffect(() => {
    if (phase !== 'exam') return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowExit(true)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [phase])

  /* ---------- vào / thoát phòng thi ---------- */
  const enterExam = () => {
    setPhase('exam')
    try {
      void document.documentElement.requestFullscreen?.().catch(() => undefined)
    } catch {
      /* trình duyệt không hỗ trợ — vẫn thi trong khung phủ toàn màn hình */
    }
  }

  const leaveRoom = () => {
    try {
      if (document.fullscreenElement) void document.exitFullscreen?.().catch(() => undefined)
    } catch {
      /* bỏ qua */
    }
    window.location.hash = '#/exam'
  }

  const restartExam = () => {
    setIdx(0)
    setAnswers({})
    setDrafts({})
    setFlags([])
    leftRef.current = paper.minutes * 60
    setSecondsLeft(paper.minutes * 60)
    setShowSubmit(false)
    setShowExit(false)
    setShowPalette(false)
    setAgreed(false)
    setPhase('exam')
  }

  /* ---------- thao tác trả lời ---------- */
  const pickChoice = (label: string) => {
    if (q.kind !== 'choice') return
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
    if (q.kind !== 'order') return
    const next = [...(drafts[q.id] ?? []), t]
    setDrafts((d) => ({ ...d, [q.id]: next }))
    commitOrder(q.id, next, q.tokens)
  }

  const removeToken = (i: number) => {
    if (q.kind !== 'order') return
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

  const toggleFlag = (id: string) =>
    setFlags((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]))

  /* phạm vi câu của từng phần (dùng cho tab phần thi) */
  const partRanges = paper.parts.map((p) => {
    const first = paper.questions.findIndex((qq) => qq.part === p.key)
    const count = paper.questions.filter((qq) => qq.part === p.key).length
    return { part: p, first, count }
  })

  /* ============================================================
     THẺ TRẢ LỜI (palette) — dùng cho cột phải & bottom-sheet mobile
     ============================================================ */

  const paletteGrid = (
    <div className="grid grid-cols-5 gap-1.5">
      {paper.questions.map((qq, i) => {
        const done = isAnswered(qq, answers[qq.id])
        const flagged = flags.includes(qq.id)
        const cur = i === idx
        return (
          <button
            key={qq.id}
            type="button"
            onClick={() => {
              setIdx(i)
              setShowPalette(false)
            }}
            aria-label={`Câu ${i + 1}${done ? ' — đã trả lời' : ' — chưa trả lời'}`}
            className={`relative grid h-9 place-items-center rounded-lg text-xs font-extrabold transition-all hover:-translate-y-0.5 ${
              done ? 'bg-[#4f3d4a] text-white' : 'bg-white text-[#8d7484] ring-1 ring-[#ddd2c2]'
            } ${cur ? 'ring-2 ring-[#d2495f] ring-offset-1' : ''}`}
          >
            {i + 1}
            {flagged && (
              <span className="absolute -right-1 -top-1 text-[9px]" aria-label="Đã đánh dấu">
                ⭐
              </span>
            )}
          </button>
        )
      })}
    </div>
  )

  const paletteLegend = (
    <div className="mt-3 space-y-1 border-t border-dashed border-[#ddd2c2] pt-2.5 text-[10px] font-bold text-[#8d7484]">
      <p>
        <span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-[#4f3d4a] align-middle" aria-hidden="true" /> Đã trả lời ·{' '}
        <span className="mx-1 inline-block h-2.5 w-2.5 rounded-sm bg-white ring-1 ring-[#ddd2c2] align-middle" aria-hidden="true" /> Chưa trả lời · ⭐ Đánh dấu
      </p>
    </div>
  )

  /* ============================================================
     1) TRANG HƯỚNG DẪN VÀO PHÒNG THI
     ============================================================ */

  if (phase === 'intro') {
    return (
      <div className="fixed inset-0 z-[90] overflow-y-auto bg-[#5d4a57]/40 backdrop-blur-sm">
        <div className="flex min-h-full items-center justify-center px-4 py-10">
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-2xl rounded-3xl border border-[#e5decd] bg-white shadow-2xl"
          >
            {/* đầu trang phong bì thi */}
            <div className="rounded-t-3xl border-b-2 border-dashed border-[#e5decd] bg-[#faf8f2] px-6 py-5 sm:px-8">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--pastel-pink)] font-cn text-lg text-[#8a4a63]" aria-hidden="true">
                    汉
                  </span>
                  <div>
                    <p className="font-display text-sm font-bold leading-none text-[#4f3d4a]">Nhật ký Hán ngữ</p>
                    <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#b58fa0]">Phòng thi mô phỏng</p>
                  </div>
                </div>
                <a href="#/exam" className="rounded-xl bg-white px-3 py-1.5 text-xs font-extrabold text-[#8d7484] ring-1 ring-[#e5decd] transition-all hover:text-[#4f3d4a]">
                  ← Chọn đề khác
                </a>
              </div>
            </div>

            <div className="px-6 py-6 sm:px-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-lg bg-[#4f3d4a] px-3 py-1 font-display text-sm font-extrabold text-white">{paper.code}</span>
                <span className="font-cn text-lg text-[#b58fa0]">{paper.cn}</span>
                <span className="ml-auto rounded-full bg-[#fdeaea] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#d2495f]">
                  Thi thử · có tính giờ
                </span>
              </div>
              <h1 className="mt-3 font-display text-2xl font-bold leading-snug text-[#4f3d4a] sm:text-3xl">{paper.title}</h1>

              {/* thông tin bài thi */}
              <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {[
                  { k: 'Thí sinh', v: '🐼 Học viên', sub: 'Nhật ký Hán ngữ' },
                  { k: 'Số câu', v: `${total}`, sub: `${paper.parts.length} phần thi` },
                  { k: 'Thời gian', v: `${paper.minutes}′`, sub: 'Đếm ngược tự nộp' },
                  { k: 'Thang điểm', v: '100', sub: 'Chấm khi nộp bài' },
                ].map((x) => (
                  <div key={x.k} className="rounded-2xl bg-[#faf8f2] px-3 py-3 ring-1 ring-[#eee7d8]">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#b58fa0]">{x.k}</p>
                    <p className="mt-0.5 font-display text-lg font-extrabold leading-none text-[#4f3d4a]">{x.v}</p>
                    <p className="mt-1 text-[10px] font-semibold text-[#8d7484]">{x.sub}</p>
                  </div>
                ))}
              </div>

              {/* cấu trúc đề */}
              <div className="mt-4 flex flex-wrap gap-2">
                {paper.parts.map((p) => {
                  const count = paper.questions.filter((qq) => qq.part === p.key).length
                  return (
                    <span key={p.key} className="rounded-xl bg-[var(--cream)] px-3 py-1.5 text-xs font-extrabold text-[#6f5a68] ring-1 ring-[#ead9cd]">
                      {p.cn} · {p.vi} <span className="ml-1 text-[10px] text-[#b58fa0]">{count} câu</span>
                    </span>
                  )
                })}
              </div>

              {/* quy định thi */}
              <div className="mt-5 rounded-2xl bg-[#faf8f2] px-4 py-4 ring-1 ring-[#eee7d8]">
                <p className="text-xs font-extrabold uppercase tracking-wider text-[#b58fa0]">Lưu ý trước khi vào phòng thi</p>
                <ol className="mt-2 space-y-1.5 text-xs font-semibold leading-relaxed text-[#5d4a57]">
                  <li className="flex gap-2"><b className="text-[#d2495f]">1.</b> Bài thi diễn ra trong chế độ <b>toàn màn hình</b> để giữ tập trung như phòng thi thật.</li>
                  <li className="flex gap-2"><b className="text-[#d2495f]">2.</b> Đồng hồ đếm ngược ở góc phải trên — <b>hết giờ hệ thống tự nộp bài</b>.</li>
                  <li className="flex gap-2"><b className="text-[#d2495f]">3.</b> Có thể <b>⭐ đánh dấu</b> câu nghi ngờ để quay lại; câu bỏ trống tính 0 điểm.</li>
                  <li className="flex gap-2"><b className="text-[#d2495f]">4.</b> Trong lúc thi <b>không hiển thị đáp án</b> — kết quả chỉ chấm sau khi nộp bài.</li>
                </ol>
              </div>

              {/* đồng ý & vào thi */}
              <label className="mt-5 flex cursor-pointer items-start gap-2.5 rounded-2xl px-1 py-1">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-[#d2495f]"
                />
                <span className="text-xs font-bold text-[#5d4a57]">
                  Tôi đã đọc và cam kết tuân thủ quy định phòng thi.
                </span>
              </label>

              <button
                type="button"
                disabled={!agreed}
                onClick={enterExam}
                className="mt-4 w-full rounded-2xl bg-[#4f3d4a] px-4 py-3.5 font-display text-base font-extrabold text-white shadow-[0_4px_0_0_#3a2d36] transition-all enabled:hover:-translate-y-0.5 enabled:active:translate-y-0.5 enabled:active:shadow-none disabled:cursor-not-allowed disabled:opacity-40"
              >
                🖥️ Vào phòng thi
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  /* ============================================================
     3) TRANG KẾT QUẢ
     ============================================================ */

  if (phase === 'result') {
    const ranOut = secondsLeft === 0
    return (
      <div className="fixed inset-0 z-[90] overflow-y-auto bg-[#f4f1e8]">
        <div className="flex min-h-full items-center justify-center px-4 py-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-2xl rounded-3xl border border-[#e5decd] bg-white p-6 shadow-2xl sm:p-8"
          >
            <div className="text-center">
              <span className="text-5xl" aria-hidden="true">{graded.percent >= 80 ? '🏆' : graded.percent >= 50 ? '😊' : '💪'}</span>
              <h1 className="mt-2 font-display text-2xl font-bold text-[#4f3d4a] sm:text-3xl">Bài thi đã được nộp</h1>
              <p className="mt-1 text-xs font-bold text-[#b58fa0]">
                {paper.code} · {paper.title}
                {ranOut && <span className="ml-1.5 rounded-full bg-[#fdeaea] px-2 py-0.5 text-[10px] font-extrabold text-[#d2495f]">⏰ Hết giờ — tự nộp bài</span>}
              </p>

              {/* điểm số */}
              <div className="mx-auto mt-5 grid h-36 w-36 place-items-center rounded-full bg-[#faf8f2] ring-8 ring-[var(--pastel-butter)]/50">
                <div>
                  <p className="font-display text-4xl font-extrabold leading-none text-[#d2495f]">{graded.percent}</p>
                  <p className="mt-1 text-[10px] font-extrabold uppercase tracking-wider text-[#b58fa0]">/ 100 điểm</p>
                </div>
              </div>
              <p className="mt-3 text-sm font-bold text-[#5d4a57]">
                {graded.percent >= 90 ? 'Xuất sắc! 真棒 🎉' : graded.percent >= 75 ? 'Giỏi lắm! 继续加油 ✨' : graded.percent >= 50 ? 'Khá ổn — cùng xem lại nhé 📖' : 'Đừng lo, luyện thêm rồi thi lại nhé 加油!'}
              </p>
            </div>

            {/* thống kê */}
            <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {[
                { k: 'Đúng', v: graded.correct, cls: 'bg-[var(--pastel-mint)]/45 text-[#3f6b50]' },
                { k: 'Sai', v: graded.wrong, cls: 'bg-[var(--pastel-pink)]/40 text-[#c2547e]' },
                { k: 'Bỏ trống', v: graded.blank, cls: 'bg-[var(--pastel-butter)]/55 text-[#8a6a1f]' },
                { k: ranOut ? 'Trạng thái' : 'Còn lại', v: ranOut ? 'Hết giờ' : fmtClock(secondsLeft), cls: 'bg-[var(--pastel-sky)]/35 text-[#46688f]' },
              ].map((x) => (
                <div key={x.k} className={`rounded-2xl px-3 py-3 text-center ${x.cls}`}>
                  <p className="font-display text-xl font-extrabold leading-none">{x.v}</p>
                  <p className="mt-1 text-[10px] font-extrabold uppercase tracking-wider">{x.k}</p>
                </div>
              ))}
            </div>

            {/* theo từng phần */}
            <div className="mt-5 space-y-2.5">
              <p className="text-xs font-extrabold uppercase tracking-wider text-[#b58fa0]">Kết quả theo phần thi</p>
              {Object.entries(graded.byPart)
                .filter(([, s]) => s.total > 0)
                .map(([key, s]) => {
                  const pct = s.total ? Math.round((s.correct / s.total) * 100) : 0
                  const p = EXAM_PARTS[key as keyof typeof EXAM_PARTS]
                  return (
                    <div key={key} className="rounded-2xl bg-[#faf8f2] px-4 py-3 ring-1 ring-[#eee7d8]">
                      <div className="flex items-center justify-between text-xs font-extrabold text-[#5d4a57]">
                        <span>{p.cn} · {p.vi}</span>
                        <span className="tabular-nums">{s.correct}/{s.total} câu</span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white ring-1 ring-[#e5decd]">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                          className="h-full rounded-full bg-[#8fbf7f]"
                        />
                      </div>
                    </div>
                  )
                })}
            </div>

            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={restartExam}
                className="rounded-2xl bg-white px-4 py-3 text-sm font-extrabold text-[#6f5a68] ring-1 ring-[#e5decd] transition-all hover:-translate-y-0.5 hover:text-[#4f3d4a]"
              >
                🔁 Thi lại từ đầu
              </button>
              <button
                type="button"
                onClick={leaveRoom}
                className="rounded-2xl bg-[#4f3d4a] px-4 py-3 text-sm font-extrabold text-white shadow-[0_4px_0_0_#3a2d36] transition-all hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none"
              >
                Thoát phòng thi →
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  /* ============================================================
     2) PHÒNG THI — toàn màn hình
     ============================================================ */

  return (
    <div className="fixed inset-0 z-[90] flex flex-col overflow-y-auto bg-[#f4f1e8]">
      {/* ---------- thanh trên ---------- */}
      <header className="sticky top-0 z-20 shrink-0 border-b border-[#e5decd] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-3 sm:px-5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--pastel-pink)] font-cn text-sm text-[#8a4a63]" aria-hidden="true">
            汉
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-bold leading-none text-[#4f3d4a]">
              Bài thi thử {paper.code} <span className="ml-1 font-cn text-[#b58fa0]">{paper.cn}</span>
            </p>
            <p className="mt-0.5 hidden text-[10px] font-bold uppercase tracking-wider text-[#b58fa0] sm:block">
              Phòng thi mô phỏng · {total} câu · {paper.minutes} phút
            </p>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* đồng hồ đếm ngược */}
            <span
              aria-live="polite"
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-mono text-sm font-bold tabular-nums ring-1 transition-colors ${
                urgent ? 'animate-pulse bg-[#d2495f] text-white ring-[#d2495f]' : 'bg-[#faf8f2] text-[#4f3d4a] ring-[#e5decd]'
              }`}
              title="Thời gian còn lại"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                <circle cx="12" cy="13" r="8" />
                <path d="M12 9v4l2.5 2.5M9 2h6" />
              </svg>
              {fmtClock(secondsLeft)}
            </span>

            {/* nút toàn màn hình */}
            <button
              type="button"
              onClick={() => {
                try {
                  if (document.fullscreenElement) void document.exitFullscreen?.().catch(() => undefined)
                  else void document.documentElement.requestFullscreen?.().catch(() => undefined)
                } catch {
                  /* bỏ qua */
                }
              }}
              aria-label="Bật/tắt chế độ toàn màn hình"
              title="Bật/tắt toàn màn hình"
              className="grid h-9 w-9 place-items-center rounded-xl bg-[#faf8f2] text-[#8d7484] ring-1 ring-[#e5decd] transition-colors hover:text-[#4f3d4a]"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
              </svg>
            </button>

            {/* nộp bài (desktop) */}
            <button
              type="button"
              onClick={() => setShowSubmit(true)}
              className="hidden rounded-xl bg-[#d2495f] px-4 py-2 text-xs font-extrabold text-white shadow-[0_3px_0_0_#a53a4c] transition-all hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none sm:block"
            >
              Nộp bài
            </button>

            {/* thoát */}
            <button
              type="button"
              onClick={() => setShowExit(true)}
              aria-label="Rời phòng thi"
              title="Rời phòng thi"
              className="grid h-9 w-9 place-items-center rounded-xl bg-[#faf8f2] text-[#8d7484] ring-1 ring-[#e5decd] transition-colors hover:bg-[#fdeaea] hover:text-[#d2495f]"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* tab phần thi */}
        <div className="border-t border-[#f0ebe0]">
          <div className="mx-auto flex max-w-6xl gap-1.5 overflow-x-auto px-3 py-1.5 sm:px-5">
            {partRanges.map(({ part, first, count }) => (
              <button
                key={part.key}
                type="button"
                onClick={() => setIdx(first < 0 ? 0 : first)}
                className={`shrink-0 rounded-lg px-3 py-1 text-[11px] font-extrabold transition-colors ${
                  q.part === part.key
                    ? 'bg-[#4f3d4a] text-white'
                    : 'bg-[#faf8f2] text-[#8d7484] ring-1 ring-[#eee7d8] hover:text-[#4f3d4a]'
                }`}
              >
                {part.cn} {part.vi} <span className="opacity-70">({count} câu)</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ---------- thân bài ---------- */}
      <div className="mx-auto w-full max-w-6xl flex-1 px-3 py-4 sm:px-5 sm:py-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_290px]">
          {/* giấy đề */}
          <motion.div
            key={q.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl border border-[#e5decd] bg-white p-4 shadow-sm sm:p-6"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-[#4f3d4a] px-2.5 py-1 font-display text-xs font-extrabold text-white">
                Câu {idx + 1}/{total}
              </span>
              <span className="rounded-lg bg-[#faf8f2] px-2.5 py-1 text-xs font-extrabold text-[#6f5a68] ring-1 ring-[#eee7d8]">
                {EXAM_PARTS[q.part].cn} · {EXAM_PARTS[q.part].vi}
              </span>
              <button
                type="button"
                onClick={() => toggleFlag(q.id)}
                aria-pressed={flags.includes(q.id)}
                className={`ml-auto flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-extrabold transition-all ${
                  flags.includes(q.id)
                    ? 'bg-[#fff3d6] text-[#8a6a1f] ring-1 ring-[#f0d9a0]'
                    : 'bg-[#faf8f2] text-[#8d7484] ring-1 ring-[#eee7d8] hover:text-[#8a6a1f]'
                }`}
              >
                ⭐ {flags.includes(q.id) ? 'Đã đánh dấu' : 'Đánh dấu câu'}
              </button>
            </div>

            <p className="mt-4 text-sm font-bold text-[#5d4a57]">{q.prompt}</p>

            {q.kind === 'choice' && q.audioText && (
              <div className="mt-3">
                <AudioBar text={q.audioText} dark />
              </div>
            )}

            {q.cn && (
              <div className="mt-4 rounded-2xl bg-[#faf8f2] px-4 py-4 ring-1 ring-[#eee7d8]">
                <p className="font-cn text-2xl leading-relaxed text-[#3f5c74] sm:text-[1.7rem]">{q.cn}</p>
                {'pinyin' in q && q.pinyin && <p className="mt-1.5 text-xs font-semibold italic text-[#b58fa0]">{q.pinyin}</p>}
              </div>
            )}

            <div className="mt-4">
              {q.kind === 'choice' ? (
                <div className="space-y-2.5">
                  {q.options.map((opt) => (
                    <ChoiceRow
                      key={opt.label}
                      q={q}
                      opt={opt}
                      selected={answers[q.id] === opt.label}
                      revealed={false}
                      onPick={() => pickChoice(opt.label)}
                    />
                  ))}
                </div>
              ) : (
                <OrderQuestion
                  q={q}
                  draft={drafts[q.id] ?? []}
                  revealed={false}
                  onPlace={placeToken}
                  onRemove={removeToken}
                  onClear={clearOrder}
                />
              )}
            </div>

            <p className="mt-4 text-center text-[11px] font-semibold text-[#b58fa0]">
              Chế độ thi thử — đáp án sẽ được chấm sau khi nộp bài
            </p>
          </motion.div>

          {/* thẻ trả lời (desktop) */}
          <aside className="hidden lg:block">
            <div className="sticky top-[124px] space-y-3">
              <div className="rounded-2xl border border-[#e5decd] bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="font-display text-sm font-bold text-[#4f3d4a]">Thẻ trả lời</p>
                  <span className="rounded-full bg-[#faf8f2] px-2.5 py-0.5 text-[10px] font-extrabold tabular-nums text-[#6f5a68] ring-1 ring-[#eee7d8]">
                    {answeredCount}/{total}
                  </span>
                </div>
                <div className="mt-3">{paletteGrid}</div>
                {paletteLegend}
              </div>

              <div className="rounded-2xl border border-[#e5decd] bg-white p-4 shadow-sm">
                <button
                  type="button"
                  onClick={() => setShowSubmit(true)}
                  className="w-full rounded-xl bg-[#d2495f] px-4 py-2.5 text-sm font-extrabold text-white shadow-[0_3px_0_0_#a53a4c] transition-all hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none"
                >
                  📤 Nộp bài thi
                </button>
                <p className="mt-2 text-center text-[10px] font-semibold text-[#b58fa0]">
                  {total - answeredCount > 0 ? `⚠️ Còn ${total - answeredCount} câu chưa trả lời` : '✅ Bạn đã trả lời hết các câu'}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* ---------- thanh dưới (mobile) ---------- */}
      <div className="sticky bottom-0 z-20 shrink-0 border-t border-[#e5decd] bg-white/95 px-3 py-2.5 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIdx((i) => Math.max(0, i - 1))}
            disabled={idx === 0}
            className="rounded-xl bg-[#faf8f2] px-3.5 py-2.5 text-xs font-extrabold text-[#6f5a68] ring-1 ring-[#eee7d8] transition-all disabled:opacity-40"
          >
            ← Trước
          </button>
          <button
            type="button"
            onClick={() => setShowPalette(true)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#faf8f2] px-3 py-2.5 text-xs font-extrabold text-[#6f5a68] ring-1 ring-[#eee7d8]"
          >
            📋 Thẻ câu hỏi
            <span className="rounded-full bg-[#4f3d4a] px-2 py-0.5 text-[10px] font-extrabold tabular-nums text-white">
              {answeredCount}/{total}
            </span>
          </button>
          {idx < total - 1 ? (
            <button
              type="button"
              onClick={() => setIdx((i) => Math.min(total - 1, i + 1))}
              className="rounded-xl bg-[#4f3d4a] px-3.5 py-2.5 text-xs font-extrabold text-white shadow-[0_3px_0_0_#3a2d36] transition-all active:translate-y-0.5 active:shadow-none"
            >
              Sau →
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowSubmit(true)}
              className="rounded-xl bg-[#d2495f] px-3.5 py-2.5 text-xs font-extrabold text-white shadow-[0_3px_0_0_#a53a4c] transition-all active:translate-y-0.5 active:shadow-none"
            >
              Nộp bài
            </button>
          )}
        </div>
      </div>

      {/* ---------- bottom sheet thẻ câu hỏi (mobile) ---------- */}
      {showPalette && (
        <div className="fixed inset-0 z-30 lg:hidden" role="dialog" aria-label="Thẻ câu hỏi">
          <button type="button" aria-label="Đóng" onClick={() => setShowPalette(false)} className="absolute inset-0 bg-[#5d4a57]/40" />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-white p-5 pb-7 shadow-2xl"
          >
            <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-[#e5decd]" aria-hidden="true" />
            <div className="flex items-center justify-between">
              <p className="font-display text-base font-bold text-[#4f3d4a]">Thẻ trả lời</p>
              <span className="rounded-full bg-[#faf8f2] px-2.5 py-0.5 text-[10px] font-extrabold tabular-nums text-[#6f5a68] ring-1 ring-[#eee7d8]">
                {answeredCount}/{total} câu
              </span>
            </div>
            <div className="mt-3">{paletteGrid}</div>
            {paletteLegend}
            <button
              type="button"
              onClick={() => {
                setShowPalette(false)
                setShowSubmit(true)
              }}
              className="mt-4 w-full rounded-2xl bg-[#d2495f] px-4 py-3 text-sm font-extrabold text-white shadow-[0_3px_0_0_#a53a4c] transition-all active:translate-y-0.5 active:shadow-none"
            >
              📤 Nộp bài thi
            </button>
          </motion.div>
        </div>
      )}

      {/* ---------- hộp thoại nộp bài ---------- */}
      {showSubmit && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-[#5d4a57]/45 px-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Xác nhận nộp bài">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-md rounded-3xl border border-[#e5decd] bg-white p-6 shadow-2xl"
          >
            <h2 className="font-display text-xl font-bold text-[#4f3d4a]">Nộp bài thi?</h2>
            <p className="mt-1 text-xs font-semibold text-[#8d7484]">Bài làm sẽ được chấm ngay và không thể chỉnh sửa.</p>

            <div className="mt-4 space-y-1.5 text-xs font-bold text-[#5d4a57]">
              <p className="flex items-center justify-between rounded-xl bg-[#faf8f2] px-3.5 py-2.5 ring-1 ring-[#eee7d8]">
                <span>✅ Đã trả lời</span>
                <span className="tabular-nums">{answeredCount}/{total} câu</span>
              </p>
              <p className="flex items-center justify-between rounded-xl bg-[#faf8f2] px-3.5 py-2.5 ring-1 ring-[#eee7d8]">
                <span>⬜ Chưa trả lời</span>
                <span className="tabular-nums">{total - answeredCount} câu</span>
              </p>
              <p className="flex items-center justify-between rounded-xl bg-[#faf8f2] px-3.5 py-2.5 ring-1 ring-[#eee7d8]">
                <span>⭐ Đã đánh dấu</span>
                <span className="tabular-nums">{flags.length} câu</span>
              </p>
              <p className="flex items-center justify-between rounded-xl bg-[#faf8f2] px-3.5 py-2.5 ring-1 ring-[#eee7d8]">
                <span>⏰ Thời gian còn lại</span>
                <span className="font-mono tabular-nums">{fmtClock(secondsLeft)}</span>
              </p>
            </div>

            {total - answeredCount > 0 && (
              <p className="mt-3 rounded-xl bg-[#fdeaea] px-3.5 py-2.5 text-[11px] font-bold text-[#c2547e]">
                ⚠️ Bạn còn {total - answeredCount} câu bỏ trống — các câu này sẽ tính 0 điểm.
              </p>
            )}

            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setShowSubmit(false)}
                className="rounded-2xl bg-[#faf8f2] px-4 py-3 text-sm font-extrabold text-[#6f5a68] ring-1 ring-[#e5decd] transition-all hover:-translate-y-0.5"
              >
                ← Làm bài tiếp
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSubmit(false)
                  setPhase('result')
                }}
                className="rounded-2xl bg-[#d2495f] px-4 py-3 text-sm font-extrabold text-white shadow-[0_3px_0_0_#a53a4c] transition-all hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none"
              >
                📤 Nộp bài
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ---------- hộp thoại rời phòng thi ---------- */}
      {showExit && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-[#5d4a57]/45 px-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Xác nhận rời phòng thi">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-md rounded-3xl border border-[#e5decd] bg-white p-6 shadow-2xl"
          >
            <h2 className="font-display text-xl font-bold text-[#4f3d4a]">Rời phòng thi?</h2>
            <p className="mt-1 text-xs font-semibold text-[#8d7484]">
              Bài làm đang trong quá trình thi — tiến trình sẽ <b>không được lưu</b> nếu bạn rời đi bây giờ.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setShowExit(false)}
                className="rounded-2xl bg-[#4f3d4a] px-4 py-3 text-sm font-extrabold text-white shadow-[0_3px_0_0_#3a2d36] transition-all hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none"
              >
                Ở lại làm bài
              </button>
              <button
                type="button"
                onClick={leaveRoom}
                className="rounded-2xl bg-white px-4 py-3 text-sm font-extrabold text-[#c2547e] ring-1 ring-[#f0c0c8] transition-all hover:-translate-y-0.5 hover:bg-[#fdeaea]"
              >
                Vẫn rời đi
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
