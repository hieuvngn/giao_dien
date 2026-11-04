'use client'

import { useEffect, useRef, useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { EXAM_PAPERS } from '@/data/exams'
import type { PaperTone } from '@/data/exams'
import { Badge, EmptyState, RowBtn, Switch, TableShell, type BadgeTone } from './admin-ui'

/* ============================================================
   Quản trị · Video AI & Đề thi
   - VideosSection: hàng đợi xử lý phụ đề / Whisper Large v3 Turbo
   - ExamsSection: quản lý kho đề (dữ liệu thật từ EXAM_PAPERS)
   ============================================================ */

/* ================= Video AI ================= */

type VideoStatus = 'completed' | 'processing' | 'failed'
type VideoSource = 'youtube' | 'bilibili'

type AdminVideo = {
  id: string
  title: string
  url: string
  source: VideoSource
  level: string
  duration: string
  words: number
  status: VideoStatus
  date: string
}

const INITIAL_VIDEOS: AdminVideo[] = [
  { id: 'v1', title: 'Giao tiếp hàng ngày: Cùng đi ăn nhé!', url: 'https://youtube.com/watch?v=chi-fan', source: 'youtube', level: 'HSK 2', duration: '12:36', words: 86, status: 'completed', date: 'Hôm nay' },
  { id: 'v2', title: 'Vlog Trung Quốc: Một ngày ở Bắc Kinh', url: 'https://bilibili.com/video/bj-day', source: 'bilibili', level: 'HSK 3', duration: '18:02', words: 142, status: 'completed', date: 'Hôm qua' },
  { id: 'v3', title: 'Ngữ pháp 如果……的话 qua ví dụ thực tế', url: 'https://youtube.com/watch?v=ruguo', source: 'youtube', level: 'HSK 2', duration: '08:45', words: 54, status: 'completed', date: '01/11' },
  { id: 'v4', title: 'Bài hát thiếu nhi 两只老虎', url: 'https://youtube.com/watch?v=lao-hu', source: 'youtube', level: 'YCT 1', duration: '03:12', words: 28, status: 'processing', date: 'Đang xử lý' },
  { id: 'v5', title: 'Phỏng vấn HSK 5: Du học tại Thượng Hải', url: 'https://bilibili.com/video/sh-interview', source: 'bilibili', level: 'HSK 5', duration: '22:10', words: 210, status: 'failed', date: '31/10' },
]

const STATUS_META: Record<VideoStatus, { label: string; tone: BadgeTone; emoji: string }> = {
  completed: { label: 'Hoàn thành', tone: 'mint', emoji: '✓' },
  processing: { label: 'Đang xử lý', tone: 'sky', emoji: '⏳' },
  failed: { label: 'Lỗi phụ đề', tone: 'red', emoji: '✗' },
}

const SOURCE_META: Record<VideoSource, { label: string; cls: string }> = {
  youtube: { label: 'YouTube', cls: 'bg-[#fbe3e7] text-[#c2435c] ring-[#f3c4d3]' },
  bilibili: { label: 'Bilibili', cls: 'bg-[var(--pastel-sky)] text-[#46688f] ring-[#cfe0ef]' },
}

const detectSource = (url: string): VideoSource => (/bilibili|b23\.tv/i.test(url) ? 'bilibili' : 'youtube')

export function VideosSection() {
  const { toast } = useToast()
  const [videos, setVideos] = useState<AdminVideo[]>(INITIAL_VIDEOS)
  const [url, setUrl] = useState('')
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    const list = timers.current
    return () => list.forEach(clearTimeout)
  }, [])

  const finishProcessing = (id: string) => {
    timers.current.push(
      setTimeout(() => {
        setVideos((prev) =>
          prev.map((v) =>
            v.id === id
              ? { ...v, status: 'completed' as const, words: 40 + Math.floor(Math.random() * 160), date: 'Vừa xong' }
              : v,
          ),
        )
        toast({ title: '🎬 Whisper đã xử lý xong!', description: 'Phụ đề tiếng Trung + bản dịch tiếng Việt đã sẵn sàng.' })
      }, 2600),
    )
  }

  const addVideo = () => {
    const clean = url.trim()
    if (!clean) {
      toast({ title: 'Chưa nhập đường dẫn 🔗', description: 'Dán URL YouTube hoặc Bilibili vào ô bên cạnh.' })
      return
    }
    if (!/youtube\.com|youtu\.be|bilibili\.com|b23\.tv/i.test(clean)) {
      toast({ title: 'Đường dẫn chưa hợp lệ 🙈', description: 'Chỉ hỗ trợ YouTube và Bilibili ở thời điểm này.' })
      return
    }
    const id = `v${Date.now()}`
    setVideos((prev) => [
      { id, title: `Video mới từ ${detectSource(clean) === 'bilibili' ? 'Bilibili' : 'YouTube'}`, url: clean, source: detectSource(clean), level: 'Tự nhận diện', duration: '—:—', words: 0, status: 'processing', date: 'Đang xử lý' },
      ...prev,
    ])
    setUrl('')
    toast({ title: 'Đã đưa vào hàng đợi ⏳', description: 'Whisper Large v3 Turbo đang nhận diện & dịch phụ đề…' })
    finishProcessing(id)
  }

  const reprocess = (v: AdminVideo) => {
    setVideos((prev) => prev.map((x) => (x.id === v.id ? { ...x, status: 'processing' as const, date: 'Đang xử lý' } : x)))
    toast({ title: `Đang xử lý lại “${v.title}” 🔄` })
    finishProcessing(v.id)
  }

  const removeVideo = (v: AdminVideo) => {
    setVideos((prev) => prev.filter((x) => x.id !== v.id))
    toast({ title: `Đã xoá “${v.title}” 🗑️` })
  }

  return (
    <section aria-label="Quản lý Video AI" className="paper-scrap rounded-3xl p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold text-[#4f3d4a]">
            Video AI <span className="ml-1 font-cn text-base text-[#e88aa6]">视频管理</span>
          </h2>
          <p className="mt-0.5 text-xs font-semibold text-[#8d7484]">
            Hàng đợi lấy phụ đề · Whisper Large v3 Turbo · dịch &amp; phân tích từ vựng.
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Badge tone="mint">✓ {videos.filter((v) => v.status === 'completed').length} hoàn thành</Badge>
          <Badge tone="sky">⏳ {videos.filter((v) => v.status === 'processing').length} đang xử lý</Badge>
          <Badge tone="red">✗ {videos.filter((v) => v.status === 'failed').length} lỗi</Badge>
        </div>
      </div>

      {/* thêm video mới */}
      <div className="mt-4 flex flex-wrap gap-2">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addVideo()}
          placeholder="🔗 Dán URL YouTube hoặc Bilibili…"
          className="min-w-56 flex-1 rounded-xl bg-white/70 px-3.5 py-2 text-xs font-semibold text-[#5d4a57] ring-1 ring-[#ead9cd] outline-none transition placeholder:text-[#c9a2b3] focus:ring-[#e8aa96]"
          aria-label="URL video mới"
        />
        <button
          type="button"
          onClick={addVideo}
          className="rounded-xl bg-[#4f3d4a] px-3.5 py-2 text-xs font-extrabold text-white shadow-[0_3px_0_0_#3a2d36] transition-all hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none"
        >
          ⚡ Phân tích với Whisper
        </button>
      </div>

      {/* danh sách video */}
      <ul className="mt-4 space-y-2">
        {videos.length === 0 && <EmptyState emoji="🎬" text="Chưa có video nào trong kho." />}
        {videos.map((v) => (
          <li
            key={v.id}
            className="flex flex-wrap items-center gap-3 rounded-2xl bg-white/55 px-3.5 py-3 ring-1 ring-[#f2e4da] transition hover:bg-white/80"
          >
            <span className={`grid h-10 w-14 shrink-0 place-items-center rounded-xl text-lg ring-1 ${SOURCE_META[v.source].cls}`} aria-hidden="true">
              {v.source === 'youtube' ? '▶' : '📺'}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <span className="truncate text-xs font-extrabold text-[#4f3d4a]">{v.title}</span>
                <span className={`hidden rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide ring-1 sm:inline ${SOURCE_META[v.source].cls}`}>
                  {SOURCE_META[v.source].label}
                </span>
              </span>
              <span className="mt-0.5 block truncate text-[10px] font-semibold text-[#b58fa0]">
                {v.level} · ⏱ {v.duration} · {v.words > 0 ? `${v.words} từ trích xuất` : 'chưa có dữ liệu'} · {v.date}
              </span>
            </span>
            <Badge tone={STATUS_META[v.status].tone}>
              {STATUS_META[v.status].emoji} {STATUS_META[v.status].label}
            </Badge>
            <span className="flex items-center gap-1.5">
              {v.status !== 'completed' && (
                <RowBtn onClick={() => reprocess(v)} title="Xử lý lại">
                  🔄
                </RowBtn>
              )}
              <RowBtn
                onClick={() =>
                  toast({
                    title: 'Mở trình xem video (demo) 🎥',
                    description: 'Bản thật sẽ nhúng trình phát kèm transcript song ngữ và bài tập.',
                  })
                }
                title="Xem chi tiết"
              >
                👁
              </RowBtn>
              <RowBtn onClick={() => removeVideo(v)} title={`Xoá ${v.title}`} danger>
                🗑
              </RowBtn>
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

/* ================= Đề thi ================= */

const EXAM_TONE: Record<PaperTone, BadgeTone> = {
  pink: 'pink',
  butter: 'butter',
  mint: 'mint',
  sky: 'sky',
  lilac: 'lilac',
  peach: 'butter',
}

export function ExamsSection() {
  const { toast } = useToast()
  const [pub, setPub] = useState<Record<string, boolean>>(() => {
    const m: Record<string, boolean> = {}
    EXAM_PAPERS.forEach((p) => (m[p.id] = true))
    return m
  })

  const totalQuestions = EXAM_PAPERS.reduce((n, p) => n + p.questions.length, 0)

  return (
    <section aria-label="Quản lý đề thi" className="paper-scrap rounded-3xl p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold text-[#4f3d4a]">
            Kho đề thi <span className="ml-1 font-cn text-base text-[#e88aa6]">试题管理</span>
          </h2>
          <p className="mt-0.5 text-xs font-semibold text-[#8d7484]">
            {EXAM_PAPERS.length} đề · {totalQuestions} câu hỏi · theo format thi thật HSK / YCT.
          </p>
        </div>
        <button
          type="button"
          onClick={() => toast({ title: 'Trình tạo đề (demo) 📝', description: 'Bản thật sẽ cho phép soạn câu hỏi Nghe / Đọc / Viết và gán đáp án.' })}
          className="rounded-xl bg-[#4f3d4a] px-3.5 py-2 text-xs font-extrabold text-white shadow-[0_3px_0_0_#3a2d36] transition-all hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none"
        >
          ＋ Tạo đề mới
        </button>
      </div>

      <div className="mt-4">
        <TableShell head={['Đề', 'Tên đề', 'Cấu trúc', 'Thời gian', 'Lượt làm', 'Hiển thị', '']}>
          {EXAM_PAPERS.map((p) => (
            <tr key={p.id}>
              <td className="border-b border-dashed border-[#f2e4da] px-3 py-2.5">
                <Badge tone={EXAM_TONE[p.tone]}>{p.code}</Badge>
              </td>
              <td className="border-b border-dashed border-[#f2e4da] px-3 py-2.5">
                <span className="block text-xs font-extrabold text-[#4f3d4a]">
                  {p.title} <span className="ml-1 font-cn text-[#b58fa0]">{p.cn}</span>
                </span>
                {p.badge && (
                  <span className="mt-0.5 inline-block rounded-full bg-[#d2495f] px-2 py-0.5 text-[9px] font-extrabold text-white">
                    {p.badge}
                  </span>
                )}
              </td>
              <td className="border-b border-dashed border-[#f2e4da] px-3 py-2.5 text-[11px] font-semibold text-[#8d7484]">
                {p.parts.map((x) => x.vi).join(' · ')}
              </td>
              <td className="border-b border-dashed border-[#f2e4da] px-3 py-2.5 text-xs font-bold text-[#6f5a68]">{p.minutes} phút</td>
              <td className="border-b border-dashed border-[#f2e4da] px-3 py-2.5 text-[11px] font-bold text-[#c2547e]">{p.attempts}</td>
              <td className="border-b border-dashed border-[#f2e4da] px-3 py-2.5">
                <Switch
                  checked={pub[p.id] ?? true}
                  onChange={(v) => {
                    setPub((m) => ({ ...m, [p.id]: v }))
                    toast({ title: v ? `Đã hiển thị đề ${p.code} 📤` : `Đã ẩn đề ${p.code} 🙈` })
                  }}
                  label={`Hiển thị đề ${p.code}`}
                />
              </td>
              <td className="border-b border-dashed border-[#f2e4da] px-3 py-2.5">
                <div className="flex justify-end gap-1.5">
                  <RowBtn
                    onClick={() => toast({ title: `Xem trước đề ${p.code} 👁`, description: 'Mở chế độ làm thử với quyền admin.' })}
                    title="Xem trước"
                  >
                    👁
                  </RowBtn>
                  <RowBtn
                    onClick={() => toast({ title: `Sửa đề ${p.code} ✏️`, description: 'Trình soạn câu hỏi sẽ mở ở đây.' })}
                    title="Sửa đề"
                  >
                    ✏️
                  </RowBtn>
                </div>
              </td>
            </tr>
          ))}
        </TableShell>
      </div>
    </section>
  )
}
