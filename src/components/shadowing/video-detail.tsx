'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import Footer from '../landing/footer'
import { HeartDoodle, PushPin, SquiggleDoodle, WashiTape } from '../landing/decor'
import { VIDEOS, videoDuration, fmtTime, type SubLine } from '@/lib/data'

const SPEEDS = [0.5, 0.75, 1, 1.25]

const LEVEL_COLOR: Record<string, string> = {
  'HSK 1': 'var(--pastel-pink)',
  'HSK 2': 'var(--pastel-butter)',
  'HSK 3': 'var(--pastel-mint)',
  'HSK 4': 'var(--pastel-sky)',
  'HSK 5': 'var(--pastel-lilac)',
}

export default function VideoDetail({ id }: { id?: string }) {
  const video = useMemo(() => VIDEOS.find((v) => v.id === id) ?? VIDEOS[0], [id])
  /* key theo id → đổi bài là toàn bộ trạng thái player tự reset */
  return <PlayerView key={video.id} video={video} />
}

function PlayerView({ video }: { video: (typeof VIDEOS)[number] }) {
  const dur = videoDuration(video)
  const idx = VIDEOS.findIndex((v) => v.id === video.id)
  const prev = VIDEOS[(idx - 1 + VIDEOS.length) % VIDEOS.length]
  const next = VIDEOS[(idx + 1) % VIDEOS.length]

  /* ---------------- player state ---------------- */
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const simRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const modeRef = useRef<'auto' | 'real' | 'sim'>('auto')
  const rateRef = useRef(1)
  const loopRef = useRef(false)
  const boundsRef = useRef({ start: 0, end: dur })

  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(0)
  const [rate, setRate] = useState(1)
  const [loopLine, setLoopLine] = useState(false)
  const [showPinyin, setShowPinyin] = useState(true)
  const [showVi, setShowVi] = useState(true)
  const [simMode, setSimMode] = useState(false)
  const [liked, setLiked] = useState(false)

  useEffect(() => {
    rateRef.current = rate
  }, [rate])

  useEffect(() => {
    loopRef.current = loopLine
  }, [loopLine])

  const stopSim = useCallback(() => {
    if (simRef.current) {
      clearInterval(simRef.current)
      simRef.current = null
    }
  }, [])

  const startSim = useCallback(() => {
    if (simRef.current) return
    modeRef.current = 'sim'
    setSimMode(true)
    simRef.current = setInterval(() => {
      setTime((t) => {
        const nt = t + 0.2 * rateRef.current
        if (nt >= dur) {
          stopSim()
          setPlaying(false)
          return 0
        }
        if (loopRef.current && nt >= boundsRef.current.end - 0.05) {
          return boundsRef.current.start
        }
        return nt
      })
    }, 200)
  }, [dur, stopSim])

  const isReal = () => videoRef.current && videoRef.current.readyState >= 2

  const togglePlay = useCallback(() => {
    if (playing) {
      stopSim()
      videoRef.current?.pause()
      setPlaying(false)
      return
    }
    if (modeRef.current !== 'sim' && isReal()) {
      modeRef.current = 'real'
      videoRef.current!.playbackRate = rateRef.current
      videoRef.current!.play().catch(() => startSim())
      setPlaying(true)
    } else {
      startSim()
      setPlaying(true)
    }
  }, [playing, startSim, stopSim])

  const seek = useCallback(
    (t: number) => {
      const nt = Math.min(Math.max(t, 0), dur)
      setTime(nt)
      if (modeRef.current === 'real' && videoRef.current) videoRef.current.currentTime = nt
    },
    [dur],
  )

  /* dừng mô phỏng khi rời trang */
  useEffect(() => stopSim, [stopSim])

  /* đổi rate với video thật */
  useEffect(() => {
    if (videoRef.current && modeRef.current === 'real') videoRef.current.playbackRate = rate
  }, [rate])

  /* ---------------- phụ đề ---------------- */
  const lines: SubLine[] = video.lines
  const activeLine = (() => {
    let a = lines[0]
    for (const l of lines) if (time >= l.t) a = l
    return a
  })()
  const activeIdx = lines.indexOf(activeLine)
  const nextLineT = activeIdx + 1 < lines.length ? lines[activeIdx + 1].t : dur

  /* đồng bộ biên giới câu hiện tại cho vòng lặp */
  useEffect(() => {
    boundsRef.current = { start: activeLine.t, end: nextLineT }
  }, [activeLine, nextLineT])

  const listRef = useRef<HTMLDivElement | null>(null)
  const lineRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const c = listRef.current
    const el = lineRefs.current[activeIdx]
    if (c && el) {
      const target = el.offsetTop - c.clientHeight / 2 + el.clientHeight / 2
      c.scrollTo({ top: Math.max(target, 0), behavior: 'smooth' })
    }
  }, [activeIdx])

  /* ---------------- render ---------------- */
  const progress = Math.min(time / dur, 1) * 100

  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-[#fff6e9] text-[#5d4a57]">

      <main className="relative flex-1 pt-24 sm:pt-28">
        <div aria-hidden="true" className="dot-grid absolute inset-0" />

        <div className="relative mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          {/* quay lại + chuyển bài */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-4">
            <a href="#/shadowing" className="rounded-full px-3 py-1.5 text-sm font-bold text-[#8d7484] transition-colors hover:text-[#e8737f]">
              ← Tất cả video
            </a>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#b58fa0]">
              <a href={`#/shadowing/${prev.id}`} className="paper-scrap rounded-full px-3 py-1.5 hover:-translate-y-0.5 transition-transform">← {prev.cn}</a>
              <a href={`#/shadowing/${next.id}`} className="paper-scrap rounded-full px-3 py-1.5 hover:-translate-y-0.5 transition-transform">{next.cn} →</a>
            </div>
          </div>

          <div className="mt-5 grid items-start gap-7 lg:grid-cols-[1.05fr_0.95fr]">
            {/* ================= CỘT TRÁI: VIDEO + CHỨC NĂNG ================= */}
            <div className="flex flex-col gap-5">
              {/* khung video */}
              <motion.div
                initial={{ opacity: 0, y: 26 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="paper-scrap relative rounded-2xl p-3"
              >
                <WashiTape color={LEVEL_COLOR[video.level]} pattern="dots" rotate={-5} className="-top-3 left-1/2 z-10 h-6 w-24 -translate-x-1/2" />
                <PushPin color="#e8737f" className="absolute -top-1.5 right-4 z-10" />

                <div
                  className="relative aspect-video overflow-hidden rounded-xl ring-1 ring-black/5"
                  style={{ background: `linear-gradient(135deg, ${video.hueSoft}, ${video.hue})` }}
                >
                  <video
                    ref={videoRef}
                    src={video.src}
                    preload="metadata"
                    playsInline
                    className="h-full w-full object-cover"
                    onTimeUpdate={(e) => {
                      if (modeRef.current === 'sim') return
                      const nt = e.currentTarget.currentTime
                      /* hết bài (hết phụ đề) → dừng và về đầu */
                      if (nt >= dur) {
                        e.currentTarget.pause()
                        e.currentTarget.currentTime = 0
                        setPlaying(false)
                        setTime(0)
                        return
                      }
                      if (loopRef.current && nt >= boundsRef.current.end - 0.05) {
                        e.currentTarget.currentTime = boundsRef.current.start
                        setTime(boundsRef.current.start)
                      } else {
                        setTime(nt)
                      }
                    }}
                    onPlay={() => setPlaying(true)}
                    onPause={() => setPlaying(false)}
                    onEnded={() => {
                      setPlaying(false)
                      setTime(0)
                    }}
                  />

                  {/* overlay chữ Hán khi chưa phát */}
                  {!playing && (
                    <button
                      onClick={togglePlay}
                      aria-label="Phát video"
                      className="group absolute inset-0 grid place-items-center bg-[#4f3d4a]/10"
                    >
                      <span className="font-cn absolute right-4 top-2 select-none text-6xl opacity-30 transition-transform group-hover:scale-105">
                        {video.cn}
                      </span>
                      <span className="grid h-16 w-16 place-items-center rounded-full bg-white/90 shadow-lg transition-transform duration-300 group-hover:scale-110">
                        <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7 fill-[#e8737f]" aria-hidden="true">
                          <path d="M8 5.5v13l11-6.5-11-6.5z" />
                        </svg>
                      </span>
                    </button>
                  )}

                  {simMode && (
                    <span className="absolute left-3 top-3 rounded-full bg-[#4f3d4a]/75 px-3 py-1 text-[11px] font-bold text-white">
                      模拟模式 · chế độ mô phỏng phụ đề
                    </span>
                  )}
                </div>
              </motion.div>

              {/* thanh tiến trình + nút chức năng */}
              <motion.div
                initial={{ opacity: 0, y: 26 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="paper-scrap rounded-2xl p-4 sm:p-5"
              >
                {/* progress */}
                <div
                  role="slider"
                  aria-label="Vị trí phát"
                  aria-valuemin={0}
                  aria-valuemax={Math.round(dur)}
                  aria-valuenow={Math.round(time)}
                  tabIndex={0}
                  onClick={(e) => {
                    const r = e.currentTarget.getBoundingClientRect()
                    seek(((e.clientX - r.left) / r.width) * dur)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowRight') seek(time + 3)
                    if (e.key === 'ArrowLeft') seek(time - 3)
                  }}
                  className="group relative h-3 cursor-pointer rounded-full bg-[var(--pastel-pink-soft)] ring-1 ring-[#f0d5dd]"
                >
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#f2b8cb] to-[#e8737f]"
                    style={{ width: `${progress}%` }}
                  />
                  <div
                    className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-[#e8737f] bg-white shadow-sm transition-transform group-hover:scale-110"
                    style={{ left: `${progress}%` }}
                  />
                </div>
                <div className="mt-1.5 flex justify-between text-[11px] font-bold text-[#b58fa0]">
                  <span>{fmtTime(time)}</span>
                  <span>{fmtTime(dur)}</span>
                </div>

                {/* nút chức năng */}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    onClick={togglePlay}
                    className="rounded-full bg-[#e8737f] px-5 py-2.5 text-sm font-bold text-white shadow-[0_4px_0_0_#d1708f] transition-all hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none"
                  >
                    {playing ? '⏸ Tạm dừng' : '▶ Phát'}
                  </button>

                  <button
                    onClick={() => setRate(SPEEDS[(SPEEDS.indexOf(rate) + 1) % SPEEDS.length])}
                    className="paper-scrap rounded-full px-4 py-2.5 text-sm font-bold text-[#6f5a68] transition-transform hover:-translate-y-0.5"
                    aria-label="Đổi tốc độ phát"
                  >
                    ⏩ ×{rate}
                  </button>

                  <button
                    onClick={() => setLoopLine(!loopLine)}
                    aria-pressed={loopLine}
                    className={`rounded-full px-4 py-2.5 text-sm font-bold transition-all ${
                      loopLine
                        ? 'bg-[var(--pastel-mint)] text-[#3f6b50] shadow-[0_3px_0_0_#9fceae]'
                        : 'paper-scrap text-[#6f5a68] hover:-translate-y-0.5'
                    }`}
                  >
                    ↻ Lặp câu
                  </button>

                  <button
                    onClick={() => setShowPinyin(!showPinyin)}
                    aria-pressed={showPinyin}
                    className={`rounded-full px-4 py-2.5 text-sm font-bold transition-all ${
                      showPinyin
                        ? 'bg-[var(--pastel-butter)] text-[#8a6a1f] shadow-[0_3px_0_0_#d9c07a]'
                        : 'paper-scrap text-[#6f5a68] hover:-translate-y-0.5'
                    }`}
                  >
                    文 Pinyin
                  </button>

                  <button
                    onClick={() => setShowVi(!showVi)}
                    aria-pressed={showVi}
                    className={`rounded-full px-4 py-2.5 text-sm font-bold transition-all ${
                      showVi
                        ? 'bg-[var(--pastel-sky)] text-[#46688f] shadow-[0_3px_0_0_#9cc2de]'
                        : 'paper-scrap text-[#6f5a68] hover:-translate-y-0.5'
                    }`}
                  >
                    意 Nghĩa
                  </button>

                  <button
                    onClick={() => seek(0)}
                    className="paper-scrap ml-auto rounded-full px-4 py-2.5 text-sm font-bold text-[#6f5a68] transition-transform hover:-translate-y-0.5"
                  >
                    ⟲ Từ đầu
                  </button>
                </div>

                {/* câu đang phát */}
                <div className="mt-4 rounded-xl bg-[var(--cream)] px-4 py-3 ring-1 ring-[#f0e2d4]">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#b58fa0]">
                    Đang phát · câu {activeIdx + 1}/{lines.length}
                  </p>
                  <p className="font-cn mt-1 text-xl text-[#4f3d4a]">{activeLine.cn}</p>
                  {showPinyin && <p className="text-sm font-semibold text-[#e88aa6]">{activeLine.py}</p>}
                  {showVi && <p className="text-sm font-medium text-[#8d7484]">{activeLine.vi}</p>}
                </div>
              </motion.div>

              {/* thông tin bài */}
              <motion.div
                initial={{ opacity: 0, y: 26 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
                className="paper-scrap relative rounded-2xl p-5"
              >
                <PushPin color="#f0b429" className="absolute -top-2 left-6" />
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="rounded-full px-3 py-0.5 text-xs font-bold text-[#6f5a68]"
                    style={{ backgroundColor: LEVEL_COLOR[video.level] }}
                  >
                    {video.level}
                  </span>
                  <span className="text-xs font-semibold text-[#b58fa0]">✎ {lines.length} câu · ♥ {video.views} lượt học</span>
                </div>
                <h1 className="font-display mt-2 text-2xl font-bold text-[#4f3d4a]">
                  {video.title} <span className="font-cn text-[#e88aa6]">{video.cn}</span>
                </h1>
                <p className="mt-1.5 text-sm font-medium leading-relaxed text-[#8d7484]">{video.desc}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => setLiked(!liked)}
                    className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
                      liked ? 'bg-[var(--pastel-pink)] text-[#a04a63] shadow-[0_3px_0_0_#e3aab9]' : 'paper-scrap text-[#6f5a68] hover:-translate-y-0.5'
                    }`}
                  >
                    <HeartDoodle className="mr-1 inline h-3.5 w-3.5" /> {liked ? 'Đã lưu bài' : 'Lưu bài học'}
                  </button>
                  <SquiggleDoodle className="ml-1 h-3 w-20 self-center" color="#f2b8cb" />
                </div>
              </motion.div>
            </div>

            {/* ================= CỘT PHẢI: PHỤ ĐỀ ================= */}
            <motion.div
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="paper-scrap relative rounded-2xl p-4 sm:p-5 lg:sticky lg:top-24"
            >
              <WashiTape color="var(--pastel-lilac)" pattern="grid" rotate={4} className="-top-3 right-8 z-10 h-6 w-20" />

              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-[#4f3d4a]">
                  Phụ đề <span className="font-cn text-[#e88aa6]">字幕</span>
                </h2>
                <span className="text-[11px] font-bold text-[#b58fa0]">bấm vào câu để nhảy tới</span>
              </div>

              <div ref={listRef} className="custom-scroll relative max-h-[560px] space-y-2 overflow-y-auto pr-1.5">
                {lines.map((l, i) => {
                  const active = i === activeIdx
                  const done = i < activeIdx
                  return (
                    <div
                      key={i}
                      ref={(el) => {
                        lineRefs.current[i] = el
                      }}
                    >
                      <button
                        onClick={() => seek(l.t)}
                        className={`w-full rounded-xl px-3.5 py-3 text-left transition-all duration-300 ${
                          active
                            ? 'rotate-0 bg-[var(--pastel-pink-soft)] shadow-[0_6px_14px_-8px_rgba(93,74,87,0.4)] ring-1 ring-[#f3c2d1]'
                            : 'hover:-translate-y-0.5 hover:bg-[var(--cream)]'
                        }`}
                      >
                        <div className="flex items-baseline gap-2">
                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              active
                                ? 'bg-[#e8737f] text-white'
                                : done
                                  ? 'bg-[var(--pastel-mint)] text-[#3f6b50]'
                                  : 'bg-[var(--cream)] text-[#b58fa0] ring-1 ring-[#ead9cd]'
                            }`}
                          >
                            {fmtTime(l.t)}
                          </span>
                          <span className={`font-cn text-lg leading-snug ${active ? 'text-[#4f3d4a]' : done ? 'text-[#8d7484]' : 'text-[#6f5a68]'}`}>
                            {l.cn}
                          </span>
                        </div>
                        {showPinyin && (
                          <p className={`mt-0.5 pl-1 text-xs font-semibold ${active ? 'text-[#e8737f]' : 'text-[#c9a2b3]'}`}>{l.py}</p>
                        )}
                        {showVi && <p className="mt-0.5 pl-1 text-xs font-medium text-[#8d7484]">{l.vi}</p>}
                      </button>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
