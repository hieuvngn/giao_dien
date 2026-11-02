'use client'

import { useEffect, useState } from 'react'

/* ============================================================
   StrokeChar — vẽ chữ Hán theo THỨ TỰ NÉT thật (dữ liệu
   hanzi-writer-data: 9.500+ ký tự, mỗi nét là 1 đường SVG).
   Các nét tô màu đỏ theo đúng trình tự + số thứ tự nét.
   Không có dữ liệu (mạng chậm / ký tự hiếm) → fallback chữ đỏ.
   ============================================================ */

type CharData = { strokes: string[]; medians: number[][][] }

const cache = new Map<string, Promise<CharData | null>>()

/* Dữ liệu tĩnh trong public/hanzi-data (đồng bộ từ package hanzi-writer-data,
   xem scripts/sync-hanzi-data.sh) — fetch theo từng ký tự + cache trọn đời. */
function loadChar(ch: string): Promise<CharData | null> {
  let p = cache.get(ch)
  if (!p) {
    p = fetch(`/hanzi-data/${encodeURIComponent(ch)}.json`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: unknown) => {
        const c = d as CharData | null
        return c && Array.isArray(c.strokes) ? c : null
      })
      .catch(() => null)
    cache.set(ch, p)
  }
  return p
}

/* hệ toạ độ dữ liệu: 1024×1024, y hướng lên → đổi sang SVG bằng y' = 900 - y */
const flip = (y: number) => 900 - y

export default function StrokeChar({
  ch,
  size, // % chiều rộng ô (cqw) — bỏ trống để lấp đầy phần tử cha
  numbered = true,
}: {
  ch: string
  size?: number
  numbered?: boolean
}) {
  const [entry, setEntry] = useState<{ ch: string; data: CharData | null } | null>(null)

  useEffect(() => {
    let alive = true
    loadChar(ch).then((d) => {
      if (alive) setEntry({ ch, data: d })
    })
    return () => {
      alive = false
    }
  }, [ch])

  /* dữ liệu đúng ký tự hiện tại (tránh sai lệch khi đổi ch trước khi tải xong) */
  const data = entry && entry.ch === ch ? entry.data : null

  const boxStyle = size ? { width: `${size}cqw`, aspectRatio: '1' } : { width: '100%', height: '100%' }

  /* chưa tải / không có dữ liệu → chữ đỏ bình thường */
  if (!data) {
    return (
      <span
        className="font-cn grid place-items-center leading-none text-[#d2495f]"
        style={{ ...boxStyle, fontSize: size ? `${size * 0.82}cqw` : 'inherit' }}
        aria-label={ch}
      >
        {ch}
      </span>
    )
  }

  /* chữ nhiều nét → số nhỏ lại cho đỡ chồng chéo */
  const n = data.strokes.length
  const r = n > 12 ? 44 : n > 9 ? 52 : 58
  const fs = n > 12 ? 52 : n > 9 ? 62 : 74
  return (
    <svg viewBox="-90 -90 1204 1204" className="block" style={boxStyle} role="img" aria-label={`Thứ tự nét của ${ch}`}>
      <g transform="scale(1, -1) translate(0, -900)">
        {data.strokes.map((d, i) => (
          <path key={i} d={d} fill="#d2495f" opacity={0.9} />
        ))}
      </g>
      {numbered &&
        data.medians.map((pts, i) => {
          if (!pts?.length) return null
          const [x, y] = pts[0]
          return (
            <g key={`n${i}`}>
              <circle cx={x} cy={flip(y)} r={r} fill="#fffdf6" stroke="#c2547e" strokeWidth={16} opacity={0.96} />
              <text
                x={x}
                y={flip(y) + r * 0.38}
                textAnchor="middle"
                fontSize={fs}
                fontWeight="800"
                fill="#8a3a4c"
                fontFamily="Quicksand, sans-serif"
              >
                {i + 1}
              </text>
            </g>
          )
        })}
    </svg>
  )
}
