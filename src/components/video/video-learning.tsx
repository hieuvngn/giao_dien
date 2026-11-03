'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Footer from '../landing/footer'
import { PandaSticker, PushPin, Reveal, StarDoodle, WashiTape } from '../landing/decor'
import { useToast } from '@/hooks/use-toast'
import { VIDEO_LESSONS } from '@/data/video-lessons'
import type { BlankExercise, GrammarPoint, VideoLesson, Vocab } from '@/data/video-lessons'

/* ============================================================
   AI Video Learning — Học tiếng Trung qua video
   Route: #/video
   Luồng: 1) Nhập URL YouTube/Bilibili
          2) Lấy phụ đề (sub gốc) hoặc Whisper Large v3 Turbo nhận diện
          3) AI dịch phụ đề sang tiếng Việt
          4) Phân tích từ vựng & ngữ pháp (kèm cấp độ HSK)
          5) Tạo bài tập điền từ từ nội dung video
   ------------------------------------------------------------
   Phiên bản demo: pipeline được mô phỏng phía client, kết quả
   lấy từ VIDEO_LESSONS (kể cả khi dán link bất kỳ).
   ============================================================ */

const URL_RE = /(?:youtube\.com|youtu\.be|bilibili\.com|b23\.tv)/i

const PIPELINE = [
  { icon: '📥', label: 'Tải thông tin video', sub: 'Đọc tiêu đề, thời lượng từ YouTube / Bilibili' },
  { icon: '🎙️', label: 'Lấy phụ đề · Whisper Large v3 Turbo', sub: 'Ưu tiên phụ đề gốc — không có thì AI tự nghe và chép lời thoại' },
  { icon: '🌏', label: 'AI dịch phụ đề sang tiếng Việt', sub: 'Dịch theo ngữ cảnh hội thoại, giữ nguyên giọng văn' },
  { icon: '🔍', label: 'Phân tích từ vựng & ngữ pháp', sub: 'Trích xuất điểm ngữ pháp, gán cấp độ HSK cho từng từ' },
  { icon: '✏️', label: 'Tạo bài tập điền từ', sub: 'Sinh câu hỏi ôn luyện ngay từ nội dung video' },
]

const FLOW = ['Dán link video', 'Phụ đề · Whisper', 'Dịch tiếng Việt', 'Từ vựng & ngữ pháp', 'Bài tập']

const BARS = [45, 70, 55, 85, 60, 95, 50, 75, 65, 90, 40, 70, 55, 80]

const HSK_COLORS: Record<number, string> = {
  1: 'bg-[var(--pastel-mint)] text-[#3f6b50] ring-[#cfe6d6]',
  2: 'bg-[var(--pastel-sky)] text-[#46688f] ring-[#cfe0ef]',
  3: 'bg-[var(--pastel-butter)] text-[#8a6a1f] ring-[#f2e2b8]',
  4: 'bg-[var(--pastel-peach)] text-[#a05a3a] ring-[#f3dcc6]',
  5: 'bg-[var(--pastel-lilac)] text-[#6d5a94] ring-[#e2d6f0]',
  6: 'bg-[var(--pastel-pink)] text-[#8a4a63] ring-[#f3c4d3]',
}

type ExState = { value: string; status: 'idle' | 'correct' | 'wrong' }

/* ---------- helpers ---------- */

function detectPlatform(u: string): 'youtube' | 'bilibili' {
  return /bilibili\.com|b23\.tv/i.test(u) ? 'bilibili' : 'youtube'
}

function extractYouTubeId(u: string): string | null {
  const m = u.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/)
  return m ? m[1] : null
}

function extractBvid(u: string): string | null {
  const m = u.match(/bilibili\.com\/video\/(BV\w+)/i)
  return m ? m[1] : null
}

function normCn(s: string): string {
  return s.trim().toLowerCase().replace(/[\s，。！？、·．.,!?;；:："'()（）]/g, '')
}

function logFor(step: number, lesson: VideoLesson): string {
  const exCount = lesson.sentences.filter((s) => s.exercise).length
  switch (step) {
    case 0:
      return `Đang kết nối ${detectPlatform(lesson.url) === 'bilibili' ? 'Bilibili' : 'YouTube'} và đọc thông tin video…`
    case 1:
      return `Whisper Large v3 Turbo: nhận diện ${lesson.sentences.length} câu tiếng Trung…`
    case 2:
      return `Đang dịch ${lesson.sentences.length} câu sang tiếng Việt…`
    case 3:
      return `Đã trích xuất ${lesson.vocab.length} từ vựng · ${lesson.grammar.length} điểm ngữ pháp`
    case 4:
      return `Đã sinh ${exCount} câu hỏi điền từ`
    default:
      return ''
  }
}

/* ---------- phần tử nhỏ dùng chung ---------- */

function HskBadge({ level }: { level: number }) {
  return (
    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-extrabold ring-1 ${HSK_COLORS[level] ?? 'bg-[var(--cream)] text-[#8d7484] ring-[#ead9cd]'}`}>
      HSK {level}
    </span>
  )
}

function Row({ label, icon, children }: { label: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 border-b border-dashed border-[#ead9cd] px-3.5 py-3 last:border-b-0">
      <span className="w-16 shrink-0 pt-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#b58fa0]">
        <span aria-hidden="true" className="mr-1">{icon}</span>
        {label}
      </span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}

/* Ô điền từ dùng chung (trong bảng phân tích + phần bài tập) */

function BlankInput({
  ex,
  state,
  onChange,
  onCheck,
}: {
  ex: BlankExercise
  state: ExState
  onChange: (v: string) => void
  onCheck: () => void
}) {
  const ring =
    state.status === 'correct'
      ? 'ring-2 ring-[#a9cdb6] bg-[var(--pastel-mint)]/60'
      : state.status === 'wrong'
        ? 'ring-2 ring-[#e7a1ad] bg-[var(--pastel-pink-soft)]'
        : 'ring-1 ring-[#e3cbb9] bg-white focus:ring-2 focus:ring-[#e8a2b4]'
  return (
    <div>
      <p className="flex flex-wrap items-center gap-x-1 gap-y-2 font-cn text-lg leading-loose text-[#4f3d4a]">
        <span>{ex.before}</span>
        <input
          type="text"
          value={state.value}
          disabled={state.status === 'correct'}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onCheck()
          }}
          placeholder="?"
          aria-label="Điền từ còn thiếu"
          className={`h-9 rounded-xl px-2 text-center font-cn text-lg text-[#4f3d4a] outline-none transition disabled:opacity-90 ${ring}`}
          style={{ width: `${Math.max(ex.answer.length + 3, 5)}ch` }}
        />
        <span>{ex.after}</span>
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2.5">
        {state.status !== 'correct' && (
          <button
            type="button"
            onClick={onCheck}
            className="rounded-xl bg-[#4f3d4a] px-3.5 py-1.5 text-xs font-extrabold text-white shadow-[0_3px_0_0_#3a2d36] transition-all hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none"
          >
            Kiểm tra
          </button>
        )}
        {state.status === 'correct' && (
          <p className="text-xs font-extrabold text-[#3f6b50]">
            ✅ Chính xác! <span className="font-cn">{ex.answer}</span> = {ex.hint}.
          </p>
        )}
        {state.status === 'wrong' && (
          <p className="text-xs font-extrabold text-[#c2547e]">
            ❌ Chưa đúng — đáp án: <span className="font-cn">{ex.answer}</span> ({ex.hint}). Thử lại nhé!
          </p>
        )}
        {state.status === 'idle' && <p className="text-[11px] font-semibold text-[#b58fa0]">Gợi ý: {ex.hint}</p>}
      </div>
    </div>
  )
}

/* ---------- Player (poster hoặc nhúng thật) ---------- */

function PlayerCard({ lesson, isDemo }: { lesson: VideoLesson; isDemo: boolean }) {
  const { toast } = useToast()
  const ytId = extractYouTubeId(lesson.url)
  const bvid = !ytId ? extractBvid(lesson.url) : null
  const embed = !isDemo && (ytId || bvid)
  const platform = detectPlatform(lesson.url)

  return (
    <section aria-label="Video" className="paper-scrap relative rounded-3xl p-4 sm:p-5">
      <WashiTape color="var(--pastel-butter)" pattern="grid" rotate={-3} className="-top-2.5 left-12 h-5 w-16" />
      {embed ? (
        <iframe
          src={
            ytId
              ? `https://www.youtube-nocookie.com/embed/${ytId}`
              : `https://player.bilibili.com/player.html?bvid=${bvid}&autoplay=0`
          }
          title={lesson.title}
          loading="lazy"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          className="aspect-video w-full rounded-2xl ring-1 ring-[#ead9cd]"
        />
      ) : (
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--pastel-pink)] via-[var(--pastel-peach)] to-[var(--pastel-butter)] ring-1 ring-[#f3c4d3]">
          <span aria-hidden="true" className="absolute inset-0 grid place-items-center px-4 text-center">
            <span className="font-cn text-4xl font-bold text-white/95 drop-shadow-sm sm:text-6xl">{lesson.titleCn}</span>
          </span>
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-extrabold text-[#4f3d4a]">
            {platform === 'bilibili' ? '▶ Bilibili' : '▶ YouTube'}
          </span>
          <span className="absolute bottom-3 right-3 rounded-full bg-[#4f3d4a]/80 px-2.5 py-1 text-[10px] font-extrabold text-white">
            {lesson.duration}
          </span>
          <button
            type="button"
            onClick={() =>
              toast({
                title: '🎬 Demo giao diện',
                description: 'Bản thật sẽ phát video trực tiếp ngay tại đây.',
              })
            }
            aria-label="Phát video"
            className="absolute inset-0 grid place-items-center"
          >
            <span className="grid h-16 w-16 place-items-center rounded-full bg-white/90 text-2xl text-[#e8737f] shadow-lg transition-transform duration-200 hover:scale-110">
              ▶
            </span>
          </button>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <h3 className="text-base font-extrabold text-[#4f3d4a]">
          <span aria-hidden="true">{lesson.emoji}</span> {lesson.title}
        </h3>
        <span className="font-cn text-sm text-[#b58fa0]" aria-hidden="true">{lesson.titleCn}</span>
        <span className="rounded-full bg-[var(--pastel-sky)]/70 px-2.5 py-0.5 text-[10px] font-extrabold text-[#46688f] ring-1 ring-[#cfe0ef]">
          {lesson.level}
        </span>
        <span className="rounded-full bg-[var(--cream)] px-2.5 py-0.5 text-[10px] font-extrabold text-[#8d7484] ring-1 ring-[#ead9cd]">
          ⏱ {lesson.duration}
        </span>
        <a
          href={lesson.url}
          target="_blank"
          rel="noreferrer"
          className="ml-auto text-xs font-extrabold text-[#e8737f] transition-colors hover:text-[#c2547e]"
        >
          Mở video gốc ↗
        </a>
      </div>
    </section>
  )
}

/* ---------- Danh sách phụ đề song ngữ ---------- */

function TranscriptList({
  lesson,
  selected,
  showPinyin,
  onTogglePinyin,
  onPick,
}: {
  lesson: VideoLesson
  selected: number
  showPinyin: boolean
  onTogglePinyin: () => void
  onPick: (i: number) => void
}) {
  return (
    <section aria-label="Phụ đề song ngữ" className="paper-scrap h-fit rounded-3xl p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-base font-bold text-[#4f3d4a]">
          Phụ đề song ngữ <span className="ml-1 font-cn text-sm text-[#e88aa6]" aria-hidden="true">对话字幕</span>
        </h2>
        <button
          type="button"
          onClick={onTogglePinyin}
          className={`rounded-full px-3 py-1 text-[11px] font-extrabold ring-1 transition-colors ${
            showPinyin
              ? 'bg-[var(--pastel-sky)]/70 text-[#46688f] ring-[#cfe0ef]'
              : 'bg-white/70 text-[#8d7484] ring-[#ead9cd]'
          }`}
        >
          {showPinyin ? '🔤 Có pinyin' : '🙈 Ẩn pinyin'}
        </button>
      </div>
      <p className="mt-1 text-[11px] font-semibold text-[#b58fa0]">Bấm vào một câu để xem phân tích chi tiết →</p>

      <ol className="mt-3 space-y-2">
        {lesson.sentences.map((s, i) => {
          const active = selected === i
          return (
            <li key={s.cn}>
              <button
                type="button"
                onClick={() => onPick(i)}
                aria-current={active ? 'true' : undefined}
                className={`flex w-full items-start gap-2.5 rounded-2xl p-3 text-left ring-1 transition-all ${
                  active
                    ? 'bg-[var(--pastel-pink-soft)] shadow-sm ring-[#f3c4d3]'
                    : 'bg-white/60 ring-[#ead9cd] hover:-translate-y-0.5 hover:ring-[#e8a2b4]'
                }`}
              >
                <span
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-extrabold ${
                    active ? 'bg-[#e8737f] text-white' : 'bg-[var(--cream)] text-[#8d7484]'
                  }`}
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="font-cn text-base leading-snug text-[#4f3d4a]">{s.cn}</span>
                  {showPinyin && (
                    <span className="mt-0.5 block text-[11px] font-semibold italic text-[#b58fa0]">{s.pinyin}</span>
                  )}
                  <span className="mt-0.5 block text-xs font-bold text-[#6f5a68]">{s.vi}</span>
                </span>
                {s.exercise && (
                  <span
                    title="Câu này có bài tập điền từ"
                    className="shrink-0 rounded-full bg-[var(--pastel-butter)] px-2 py-0.5 font-cn text-[11px] font-bold text-[#8a6a1f] ring-1 ring-[#f2e2b8]"
                  >
                    练
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

/* ---------- Bảng phân tích câu (Dịch nghĩa / Ngữ pháp / Từ vựng / HSK / Bài tập) ---------- */

function AnalysisCard({
  lesson,
  index,
  answers,
  onAnswer,
  onCheck,
  onPlay,
}: {
  lesson: VideoLesson
  index: number
  answers: Record<number, ExState>
  onAnswer: (i: number, v: string) => void
  onCheck: (i: number) => void
  onPlay: () => void
}) {
  const s = lesson.sentences[index]
  const sv: Vocab[] = s.vocab
    .map((cn) => lesson.vocab.find((v) => v.cn === cn))
    .filter((v): v is Vocab => Boolean(v))
  const sGr: GrammarPoint[] = s.grammar
    .map((gi) => lesson.grammar[gi])
    .filter((g): g is GrammarPoint => Boolean(g))
  const byLevel = sv
    .reduce<{ level: number; count: number }[]>((acc, v) => {
      const found = acc.find((x) => x.level === v.hsk)
      if (found) found.count += 1
      else acc.push({ level: v.hsk, count: 1 })
      return acc
    }, [])
    .sort((a, b) => a.level - b.level)

  return (
    <section aria-label="Phân tích câu" className="paper-scrap relative rounded-3xl p-4 sm:p-5">
      <WashiTape color="var(--pastel-lilac)" pattern="dots" rotate={4} className="-top-2.5 right-10 h-5 w-14" />
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display text-base font-bold text-[#4f3d4a]">
          Phân tích câu đã chọn <span className="ml-1 font-cn text-sm text-[#e88aa6]" aria-hidden="true">句子分析</span>
        </h2>
        <span className="rounded-full bg-[var(--pastel-pink)] px-2.5 py-0.5 text-[10px] font-extrabold text-[#8a4a63]">
          Câu {index + 1}/{lesson.sentences.length}
        </span>
      </div>

      {/* câu gốc */}
      <div className="mt-3 rounded-2xl bg-white/70 p-3.5 ring-1 ring-[#ead9cd]">
        <div className="flex items-start justify-between gap-2">
          <p className="font-cn text-xl leading-snug text-[#4f3d4a]">{s.cn}</p>
          <button
            type="button"
            onClick={onPlay}
            aria-label="Nghe lại câu này"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--pastel-sky)] text-sm text-[#46688f] transition-transform hover:scale-110"
          >
            🔊
          </button>
        </div>
        <p className="mt-1 text-[11px] font-semibold italic text-[#b58fa0]">{s.pinyin}</p>
      </div>

      {/* bảng Nội dung → Kết quả */}
      <div className="mt-3 overflow-hidden rounded-2xl bg-white/60 ring-1 ring-[#ead9cd]">
        <Row label="Dịch nghĩa" icon="🌏">
          <p className="text-sm font-bold leading-relaxed text-[#5d4a57]">{s.vi}</p>
        </Row>

        <Row label="Ngữ pháp" icon="🧩">
          {sGr.length === 0 ? (
            <p className="text-xs font-semibold text-[#b58fa0]">Câu này không có điểm ngữ pháp mới.</p>
          ) : (
            <ul className="space-y-2.5">
              {sGr.map((g) => (
                <li key={g.pattern}>
                  <span className="font-cn rounded-lg bg-[var(--pastel-lilac)] px-2 py-0.5 text-sm font-bold text-[#6d5a94]">
                    {g.pattern}
                  </span>
                  <p className="mt-1 text-xs font-bold text-[#4f3d4a]">{g.name}</p>
                  <p className="text-[11px] font-semibold leading-relaxed text-[#8d7484]">{g.desc}</p>
                </li>
              ))}
            </ul>
          )}
        </Row>

        <Row label="Từ vựng" icon="📖">
          {sv.length === 0 ? (
            <p className="text-xs font-semibold text-[#b58fa0]">Chưa trích xuất được từ vựng cho câu này.</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {sv.map((v) => (
                <li
                  key={v.cn}
                  className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 rounded-xl bg-[var(--cream)] px-2.5 py-1.5 ring-1 ring-[#ead9cd]"
                >
                  <span className="font-cn text-sm font-bold text-[#4f3d4a]">{v.cn}</span>
                  <span className="text-[10px] font-semibold italic text-[#b58fa0]">{v.pinyin}</span>
                  <span className="text-[11px] font-bold text-[#6f5a68]">{v.vi}</span>
                  <HskBadge level={v.hsk} />
                </li>
              ))}
            </ul>
          )}
        </Row>

        <Row label="HSK" icon="🎯">
          {byLevel.length === 0 ? (
            <p className="text-xs font-semibold text-[#b58fa0]">—</p>
          ) : (
            <div className="flex flex-wrap items-center gap-1.5">
              {byLevel.map((b) => (
                <span
                  key={b.level}
                  className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ring-1 ${HSK_COLORS[b.level] ?? 'bg-[var(--cream)] text-[#8d7484] ring-[#ead9cd]'}`}
                >
                  HSK {b.level} × {b.count}
                </span>
              ))}
              <span className="text-[11px] font-semibold text-[#b58fa0]">— phân loại cấp độ từ vựng của câu</span>
            </div>
          )}
        </Row>

        <Row label="Bài tập" icon="✏️">
          {s.exercise ? (
            <BlankInput
              ex={s.exercise}
              state={answers[index] ?? { value: '', status: 'idle' }}
              onChange={(v) => onAnswer(index, v)}
              onCheck={() => onCheck(index)}
            />
          ) : (
            <p className="text-xs font-semibold text-[#b58fa0]">Câu này chưa có bài tập — chọn câu khác để luyện tiếp nhé.</p>
          )}
        </Row>
      </div>
    </section>
  )
}

/* ---------- Kho từ vựng ---------- */

function VocabSection({ lesson, onJump }: { lesson: VideoLesson; onJump: (i: number) => void }) {
  const { toast } = useToast()
  return (
    <Reveal>
      <section aria-label="Từ vựng trong video" className="paper-scrap relative rounded-3xl p-5 sm:p-6">
        <PushPin color="#7fae8f" className="absolute right-8 top-3 scale-75" />
        <header className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-lg font-bold text-[#4f3d4a]">
            Từ vựng trong video <span className="ml-1 font-cn text-base text-[#e88aa6]" aria-hidden="true">生词表</span>
          </h2>
          <span className="rounded-full bg-[var(--cream)] px-3 py-1 text-[11px] font-extrabold text-[#8d7484] ring-1 ring-[#ead9cd]">
            {lesson.vocab.length} từ · bấm ➕ để thêm vào bộ thẻ
          </span>
        </header>

        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {lesson.vocab.map((v) => {
            const idx = lesson.sentences.findIndex((s) => s.vocab.includes(v.cn))
            return (
              <li
                key={v.cn}
                className="rounded-2xl bg-white/70 p-3.5 ring-1 ring-[#ead9cd] transition-all hover:-translate-y-0.5 hover:shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-cn text-xl font-bold text-[#4f3d4a]">{v.cn}</span>
                  <HskBadge level={v.hsk} />
                </div>
                <p className="mt-0.5 text-[11px] font-semibold italic text-[#b58fa0]">
                  {v.pinyin} · {v.pos}
                </p>
                <p className="text-sm font-bold text-[#6f5a68]">{v.vi}</p>
                <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-dashed border-[#ead9cd] pt-2">
                  {idx >= 0 ? (
                    <button
                      type="button"
                      onClick={() => onJump(idx)}
                      className="text-[11px] font-extrabold text-[#46688f] transition-colors hover:text-[#e8737f]"
                    >
                      ↩ Xuất hiện ở câu {idx + 1}
                    </button>
                  ) : (
                    <span />
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      toast({
                        title: '🃏 Đã thêm vào Bộ thẻ của tôi',
                        description: `${v.cn} (${v.pinyin}) — ${v.vi}`,
                      })
                    }
                    className="rounded-full bg-[var(--pastel-mint)]/70 px-2.5 py-1 text-[11px] font-extrabold text-[#3f6b50] ring-1 ring-[#cfe6d6] transition-all hover:-translate-y-0.5 hover:bg-[var(--pastel-mint)]"
                  >
                    ➕ Thẻ
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      </section>
    </Reveal>
  )
}

/* ---------- Bài tập tổng hợp ---------- */

function ExerciseSection({
  lesson,
  answers,
  doneCount,
  onAnswer,
  onCheck,
  onJump,
}: {
  lesson: VideoLesson
  answers: Record<number, ExState>
  doneCount: number
  onAnswer: (i: number, v: string) => void
  onCheck: (i: number) => void
  onJump: (i: number) => void
}) {
  const rows = lesson.sentences
    .map((s, i) => ({ s, i }))
    .filter(({ s }) => Boolean(s.exercise))
  const all = rows.length

  return (
    <Reveal>
      <section aria-label="Bài tập từ video" className="paper-scrap relative rounded-3xl p-5 sm:p-6">
        <WashiTape color="var(--pastel-peach)" pattern="stripes" rotate={2} className="-top-2.5 left-10 h-5 w-16" />
        <StarDoodle className="absolute right-10 top-4 h-6 w-6" />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-lg font-bold text-[#4f3d4a]">
            Bài tập từ video <span className="ml-1 font-cn text-base text-[#e88aa6]" aria-hidden="true">练一练</span>
          </h2>
          <div className="flex flex-wrap items-center gap-2 text-xs font-extrabold">
            <span
              className={`rounded-full px-3 py-1 ring-1 ${
                all > 0 && doneCount === all
                  ? 'bg-[var(--pastel-mint)] text-[#3f6b50] ring-[#cfe6d6]'
                  : 'bg-[var(--cream)] text-[#8d7484] ring-[#ead9cd]'
              }`}
            >
              ✅ {doneCount}/{all} câu đúng
            </span>
            {all > 0 && doneCount === all && (
              <span className="rounded-full bg-[var(--pastel-butter)] px-3 py-1 text-[#8a6a1f] ring-1 ring-[#f2e2b8]">
                🎊 Hoàn thành xuất sắc!
              </span>
            )}
          </div>
        </div>

        <ol className="mt-4 space-y-3">
          {rows.map(({ s, i }, n) => (
            <li key={s.cn} className="rounded-2xl bg-white/70 p-4 ring-1 ring-[#ead9cd]">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#b58fa0]">
                  Câu {n + 1} · điền từ còn thiếu
                </span>
                <button
                  type="button"
                  onClick={() => onJump(i)}
                  className="text-[11px] font-extrabold text-[#e8737f] transition-colors hover:text-[#c2547e]"
                >
                  Xem câu gốc ↗
                </button>
              </div>
              {s.exercise && (
                <div className="mt-2">
                  <BlankInput
                    ex={s.exercise}
                    state={answers[i] ?? { value: '', status: 'idle' }}
                    onChange={(v) => onAnswer(i, v)}
                    onCheck={() => onCheck(i)}
                  />
                </div>
              )}
            </li>
          ))}
        </ol>
      </section>
    </Reveal>
  )
}

/* ============================================================
   Trang chính
   ============================================================ */

export default function VideoLearning() {
  const { toast } = useToast()
  const [url, setUrl] = useState('')
  const [urlErr, setUrlErr] = useState('')
  const [stage, setStage] = useState<'input' | 'processing' | 'done'>('input')
  const [step, setStep] = useState(0)
  const [lesson, setLesson] = useState<VideoLesson | null>(null)
  const [isDemo, setIsDemo] = useState(false)
  const [usedDemo, setUsedDemo] = useState(false)
  const [selected, setSelected] = useState(0)
  const [showPinyin, setShowPinyin] = useState(true)
  const [answers, setAnswers] = useState<Record<number, ExState>>({})
  const celebratedRef = useRef(false)

  /* pipeline mô phỏng: mỗi bước ~1 giây */
  useEffect(() => {
    if (stage !== 'processing') return
    const t = window.setTimeout(
      () => {
        if (step >= PIPELINE.length) setStage('done')
        else setStep((s) => s + 1)
      },
      step >= PIPELINE.length ? 500 : 950,
    )
    return () => window.clearTimeout(t)
  }, [stage, step])

  /* thông báo khi phân tích xong */
  useEffect(() => {
    if (stage === 'done') {
      toast({
        title: '🎉 Phân tích video hoàn tất!',
        description: 'Phụ đề, dịch nghĩa, từ vựng, ngữ pháp và bài tập đã sẵn sàng.',
      })
    }
  }, [stage, toast])

  const exIdxs = useMemo(
    () => (lesson ? lesson.sentences.map((s, i) => (s.exercise ? i : -1)).filter((i) => i >= 0) : []),
    [lesson],
  )
  const doneCount = exIdxs.filter((i) => answers[i]?.status === 'correct').length
  const allDone = exIdxs.length > 0 && doneCount === exIdxs.length

  /* ăn mừng khi làm đúng hết */
  useEffect(() => {
    if (allDone && !celebratedRef.current) {
      celebratedRef.current = true
      toast({
        title: '🎊 Xuất sắc!',
        description: `Bạn đã hoàn thành tất cả ${exIdxs.length} bài tập của video này.`,
      })
    }
    if (!allDone) celebratedRef.current = false
  }, [allDone, exIdxs.length, toast])

  const handleSubmit = () => {
    const u = url.trim()
    if (!u) {
      setUrlErr('Hãy dán đường link video vào ô bên trên trước nhé!')
      return
    }
    if (!URL_RE.test(u)) {
      setUrlErr('Hiện hỗ trợ link YouTube (youtube.com / youtu.be) hoặc Bilibili (bilibili.com / b23.tv).')
      return
    }
    setUrlErr('')
    const found = VIDEO_LESSONS.find((l) => l.url === u)
    setLesson(found ?? { ...VIDEO_LESSONS[0], url: u })
    setIsDemo(Boolean(found))
    setUsedDemo(!found)
    setSelected(0)
    setAnswers({})
    celebratedRef.current = false
    setStep(0)
    setStage('processing')
  }

  const pickSentence = (i: number) => {
    setSelected(i)
    if (window.innerWidth < 1024) {
      window.setTimeout(() => {
        document.getElementById('video-analysis')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 80)
    }
  }

  const setAnswer = (i: number, patch: Partial<ExState>) => {
    setAnswers((prev) => ({
      ...prev,
      [i]: { value: '', status: 'idle', ...prev[i], ...patch },
    }))
  }

  const checkAnswer = (i: number) => {
    const ex = lesson?.sentences[i]?.exercise
    if (!ex) return
    const val = answers[i]?.value ?? ''
    const ok = normCn(val) === normCn(ex.answer)
    setAnswer(i, { status: ok ? 'correct' : 'wrong' })
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#fff6e9] text-[#5d4a57]">
      <main className="relative flex-1 pb-16 pt-20 sm:pt-24">
        <div aria-hidden="true" className="dot-grid absolute inset-0" />

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
          {/* ================= Header ================= */}
          <Reveal>
            <header className="paper-scrap relative rounded-3xl px-5 py-6 sm:px-8 sm:py-7">
              <WashiTape color="var(--pastel-sky)" pattern="grid" rotate={-5} className="-top-3 left-10 h-6 w-20" />
              <PushPin color="#e8737f" className="absolute right-8 top-3 scale-75" />

              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="leading-tight">
                    <span className="relative inline-block px-3 py-0.5">
                      <span aria-hidden="true" className="absolute inset-0 -rotate-1 rounded-md bg-[var(--pastel-sky)] opacity-90" />
                      <span className="relative font-display text-2xl font-bold text-[#4f3d4a] sm:text-3xl">
                        AI Video Learning
                      </span>
                      <span className="relative ml-2 hidden font-cn text-2xl text-[#e88aa6] sm:inline" aria-hidden="true">
                        看视频学中文
                      </span>
                    </span>
                  </h1>
                  <p className="mt-2 max-w-xl text-sm font-semibold leading-relaxed text-[#8d7484]">
                    Dán link YouTube / Bilibili — AI lấy phụ đề (hoặc dùng Whisper Large v3 Turbo tự nhận diện),
                    dịch sang tiếng Việt, phân tích từ vựng &amp; ngữ pháp rồi tạo bài tập ngay từ nội dung video.
                  </p>
                  <ul className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] font-extrabold text-[#6f5a68]">
                    {FLOW.map((f, i) => (
                      <li key={f} className="flex items-center gap-1.5">
                        {i > 0 && (
                          <span aria-hidden="true" className="text-[#c9a2b3]">→</span>
                        )}
                        <span className="rounded-full bg-[var(--cream)] px-2.5 py-1 ring-1 ring-[#ead9cd]">
                          {i + 1}. {f}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <span aria-hidden="true" className="hidden shrink-0 text-5xl sm:block">🎬</span>
              </div>
            </header>
          </Reveal>

          {/* ================= Form nhập link ================= */}
          <Reveal delay={0.05}>
            <section aria-label="Nhập link video" className="paper-scrap relative mt-6 rounded-3xl p-5 sm:p-6">
              <WashiTape color="var(--pastel-pink)" pattern="dots" rotate={3} className="-top-2.5 right-8 h-5 w-14" />
              <PandaSticker className="absolute -right-2 -top-4 hidden h-14 w-14 sm:block" />

              <label htmlFor="video-url" className="text-sm font-extrabold text-[#4f3d4a]">
                🔗 Link video (YouTube hoặc Bilibili)
              </label>
              <form
                className="mt-2 flex flex-col gap-2 sm:flex-row"
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSubmit()
                }}
              >
                <input
                  id="video-url"
                  type="text"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value)
                    if (urlErr) setUrlErr('')
                  }}
                  placeholder="https://www.youtube.com/watch?v=…"
                  autoComplete="off"
                  spellCheck={false}
                  aria-invalid={Boolean(urlErr)}
                  className={`h-11 flex-1 rounded-2xl bg-white px-4 text-sm font-semibold text-[#4f3d4a] shadow-inner outline-none transition placeholder:text-[#c9a2b3] ${
                    urlErr ? 'ring-2 ring-[#e7a1ad]' : 'ring-1 ring-[#ead9cd] focus:ring-2 focus:ring-[#e8a2b4]'
                  }`}
                />
                <button
                  type="submit"
                  disabled={stage === 'processing'}
                  className="h-11 shrink-0 rounded-2xl bg-[#4f3d4a] px-5 text-sm font-extrabold text-white shadow-[0_4px_0_0_#3a2d36] transition-all hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none disabled:cursor-not-allowed disabled:opacity-60 sm:w-44"
                >
                  {stage === 'processing' ? '⏳ Đang xử lý…' : '✨ Phân tích video'}
                </button>
              </form>
              {urlErr && <p className="mt-2 text-xs font-bold text-[#c2547e]">⚠️ {urlErr}</p>}

              <div className="mt-4 border-t border-dashed border-[#ead9cd] pt-3">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#b58fa0]">
                  Hoặc thử ngay với video mẫu:
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {VIDEO_LESSONS.map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => {
                        setUrl(l.url)
                        setUrlErr('')
                      }}
                      className="flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1.5 text-xs font-bold text-[#6f5a68] ring-1 ring-[#ead9cd] transition-all hover:-translate-y-0.5 hover:bg-[var(--pastel-butter)]/60 hover:text-[#4f3d4a]"
                    >
                      <span aria-hidden="true">{l.emoji}</span>
                      {l.title}
                      <span className="hidden font-cn text-[10px] text-[#b58fa0] sm:inline" aria-hidden="true">{l.titleCn}</span>
                    </button>
                  ))}
                </div>
              </div>

              <p className="mt-3 text-[11px] font-semibold text-[#b58fa0]">
                💡 Video không có phụ đề? Whisper Large v3 Turbo sẽ tự nghe và chép lại lời thoại tiếng Trung.
              </p>
            </section>
          </Reveal>

          {/* ================= Pipeline đang xử lý ================= */}
          <AnimatePresence>
            {stage === 'processing' && lesson && (
              <motion.section
                key="pipeline"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                aria-label="Đang phân tích video"
                className="paper-scrap relative mt-6 rounded-3xl p-5 sm:p-6"
              >
                <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-[#b58fa0]">
                  <span>AI Video Learning · Whisper Large v3 Turbo</span>
                  <span>{Math.min(Math.round((step / PIPELINE.length) * 100), 100)}%</span>
                </div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[var(--cream)]">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-[#e88aa6] via-[#e8737f] to-[#c2547e]"
                    animate={{ width: `${(step / PIPELINE.length) * 100}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>

                <ol className="mt-4 space-y-2.5">
                  {PIPELINE.map((p, i) => {
                    const done = i < step
                    const active = i === step && stage === 'processing'
                    return (
                      <li
                        key={p.label}
                        className={`flex items-start gap-3 rounded-2xl px-3 py-2.5 transition-colors ${
                          active ? 'bg-[var(--pastel-butter)]/50 ring-1 ring-[#f2e2b8]' : ''
                        }`}
                      >
                        <span
                          className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-lg ${
                            done ? 'bg-[var(--pastel-mint)]' : active ? 'bg-white shadow-sm' : 'bg-[var(--cream)] opacity-60'
                          }`}
                          aria-hidden="true"
                        >
                          {done ? '✅' : p.icon}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className={`block text-sm font-extrabold ${done || active ? 'text-[#4f3d4a]' : 'text-[#b58fa0]'}`}>
                            {p.label}
                          </span>
                          <span className="block text-[11px] font-semibold text-[#8d7484]">{p.sub}</span>
                          {active && (
                            <span className="mt-1 flex items-center gap-2 text-[11px] font-bold text-[#c2547e]">
                              <span
                                className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-[#e8737f] border-t-transparent"
                                aria-hidden="true"
                              />
                              {logFor(i, lesson)}
                            </span>
                          )}
                        </span>
                        {!done && !active && (
                          <span aria-hidden="true" className="text-lg text-[#d8c3cf]">○</span>
                        )}
                        {done && <span aria-hidden="true" className="text-lg font-bold text-[#3f6b50]">✓</span>}
                        {active && <span aria-hidden="true" className="animate-pulse text-lg text-[#e8737f]">●</span>}
                      </li>
                    )
                  })}
                </ol>

                <div className="mt-4 flex items-center justify-between gap-3 border-t border-dashed border-[#ead9cd] pt-3">
                  <span className="flex h-8 items-center gap-1" aria-hidden="true">
                    {BARS.map((h, i) => (
                      <span
                        key={i}
                        className="w-1.5 animate-pulse rounded-full bg-[#e8737f]/50"
                        style={{ height: `${h}%`, animationDelay: `${i * 120}ms` }}
                      />
                    ))}
                  </span>
                  <button
                    type="button"
                    onClick={() => setStage('input')}
                    className="rounded-xl px-3 py-1.5 text-xs font-bold text-[#8d7484] transition-colors hover:bg-[var(--cream)] hover:text-[#c2547e]"
                  >
                    Huỷ
                  </button>
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* ================= Kết quả ================= */}
          {stage === 'done' && lesson && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mt-6 space-y-6"
            >
              {/* banner tổng kết */}
              <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-[var(--pastel-mint)]/50 px-4 py-3 text-xs font-bold text-[#3f6b50] ring-1 ring-[#cfe6d6]">
                <span aria-hidden="true">✅</span>
                Phân tích hoàn tất: {lesson.sentences.length} câu · {lesson.vocab.length} từ vựng ·{' '}
                {lesson.grammar.length} điểm ngữ pháp · {exIdxs.length} bài tập
                {isDemo && (
                  <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-[10px] font-extrabold text-[#46688f] ring-1 ring-[#cfe0ef]">
                    🎬 Video mẫu
                  </span>
                )}
                {usedDemo && (
                  <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-[10px] font-extrabold text-[#8a6a1f] ring-1 ring-[#f2e2b8]">
                    Dữ liệu mẫu (demo)
                  </span>
                )}
              </div>

              <PlayerCard lesson={lesson} isDemo={isDemo} />

              <div className="grid gap-4 lg:grid-cols-5">
                <div className="lg:col-span-2">
                  <TranscriptList
                    lesson={lesson}
                    selected={selected}
                    showPinyin={showPinyin}
                    onTogglePinyin={() => setShowPinyin((v) => !v)}
                    onPick={pickSentence}
                  />
                </div>
                <div id="video-analysis" className="lg:col-span-3">
                  <div className="lg:sticky lg:top-24">
                    <AnalysisCard
                      lesson={lesson}
                      index={selected}
                      answers={answers}
                      onAnswer={(i, v) => setAnswer(i, { value: v, status: 'idle' })}
                      onCheck={checkAnswer}
                      onPlay={() =>
                        toast({
                          title: '🔊 Demo: nghe lại câu này',
                          description: lesson.sentences[selected].cn,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <VocabSection lesson={lesson} onJump={pickSentence} />

              <ExerciseSection
                lesson={lesson}
                answers={answers}
                doneCount={doneCount}
                onAnswer={(i, v) => setAnswer(i, { value: v, status: 'idle' })}
                onCheck={checkAnswer}
                onJump={pickSentence}
              />
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
