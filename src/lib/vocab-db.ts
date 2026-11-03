/* ============================================================
   KHO TỪ VỰNG DÙNG CHUNG — tra cứu nhanh cho vở tập viết
   Tổng hợp từ toàn bộ lộ trình (HSK · YCT · Boya · Hán ngữ)
   + các bộ mẫu của vở tập viết. Loại trùng theo chữ Hán.
   ============================================================ */

import { ROADMAP_LEVELS } from '@/data/roadmap'
import type { RoadmapGroup } from '@/data/roadmap/types'
import { VOCAB_PRESETS } from '@/lib/data'

export type DbWord = {
  cn: string
  pinyin: string
  vi: string
  pos?: string
  levelCode: string // "HSK 1"
  levelSlug: string
  group: RoadmapGroup
  lessonN: number
  lessonTopic: string
}

/* ---------- chuẩn hoá chuỗi tìm kiếm (không dấu, bỏ khoảng trắng) ---------- */

export function toBase(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
}

export function squash(s: string): string {
  return toBase(s).replace(/[\s'’-]/g, '')
}

/* ---------- dựng database ---------- */

function buildDb(): DbWord[] {
  const seen = new Set<string>()
  const out: DbWord[] = []
  for (const level of ROADMAP_LEVELS) {
    for (const lesson of level.vocab) {
      for (const w of lesson.words) {
        if (seen.has(w.cn)) continue
        seen.add(w.cn)
        out.push({
          cn: w.cn,
          pinyin: w.pinyin,
          vi: w.vi,
          pos: w.pos,
          levelCode: level.code,
          levelSlug: level.slug,
          group: level.group,
          lessonN: lesson.n,
          lessonTopic: lesson.topic,
        })
      }
    }
  }
  // từ của các bộ mẫu chưa có trong lộ trình (vd "Mẫu chữ hán")
  for (const preset of VOCAB_PRESETS) {
    for (const w of preset.words) {
      if (seen.has(w.w)) continue
      seen.add(w.w)
      out.push({
        cn: w.w,
        pinyin: '',
        vi: w.vi,
        levelCode: 'Mẫu',
        levelSlug: '',
        group: 'hsk',
        lessonN: 0,
        lessonTopic: preset.name,
      })
    }
  }
  return out
}

export const VOCAB_DB: DbWord[] = buildDb()

/** Tra nghĩa tiếng Việt theo chữ Hán (dùng cho bảng thông tin) */
export const MEANING_MAP: ReadonlyMap<string, string> = new Map(VOCAB_DB.map((w) => [w.cn, w.vi]))

/* ---------- tìm kiếm ---------- */

export type VocabSearch = {
  q?: string
  group?: RoadmapGroup | 'all'
  levelSlug?: string // 'all' hoặc slug cụ thể
}

export function searchVocab({ q = '', group = 'all', levelSlug = 'all' }: VocabSearch = {}): DbWord[] {
  const needleCn = q.trim()
  const needleLoose = squash(q)
  return VOCAB_DB.filter((w) => {
    if (group !== 'all' && w.group !== group) return false
    if (levelSlug !== 'all' && w.levelSlug !== levelSlug) return false
    if (!needleCn) return true
    if (w.cn.includes(needleCn)) return true
    if (needleLoose && (squash(w.pinyin).includes(needleLoose) || squash(w.vi).includes(needleLoose))) return true
    return false
  })
}

/** Xếp kết quả: từ khớp chữ Hán đứng trước, rồi theo số chữ tăng dần */
export function rankVocab(list: DbWord[], q: string): DbWord[] {
  const needle = q.trim()
  if (!needle) return list
  return [...list].sort((a, b) => {
    const aExact = a.cn === needle ? 0 : a.cn.startsWith(needle) ? 1 : 2
    const bExact = b.cn === needle ? 0 : b.cn.startsWith(needle) ? 1 : 2
    if (aExact !== bExact) return aExact - bExact
    return [...a.cn].length - [...b.cn].length
  })
}
