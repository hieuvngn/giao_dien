import type { RoadmapGroup, RoadmapLevel } from './types'
import { BOYA_LEVELS } from './boya'
import { HANYU_LEVELS } from './hanyu'
import { HSK_LEVELS } from './hsk'
import { YCT_LEVELS } from './yct'

export * from './types'

/** Toàn bộ cấp độ, xếp theo thứ tự trình bày trên trang chủ */
export const ROADMAP_LEVELS: RoadmapLevel[] = [
  ...HSK_LEVELS,
  ...YCT_LEVELS,
  ...BOYA_LEVELS,
  ...HANYU_LEVELS,
]

export const ROADMAP_BY_GROUP: Record<RoadmapGroup, RoadmapLevel[]> = {
  hsk: HSK_LEVELS,
  yct: YCT_LEVELS,
  boya: BOYA_LEVELS,
  hanyu: HANYU_LEVELS,
}

export function findRoadmapLevel(slug?: string): RoadmapLevel | undefined {
  if (!slug) return undefined
  return ROADMAP_LEVELS.find((l) => l.slug === slug)
}

/** Cấp độ trước / sau trong danh sách chung (để điều hướng) */
export function neighborLevels(slug: string): { prev?: RoadmapLevel; next?: RoadmapLevel } {
  const i = ROADMAP_LEVELS.findIndex((l) => l.slug === slug)
  if (i < 0) return {}
  return {
    prev: i > 0 ? ROADMAP_LEVELS[i - 1] : undefined,
    next: i < ROADMAP_LEVELS.length - 1 ? ROADMAP_LEVELS[i + 1] : undefined,
  }
}
