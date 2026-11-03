/* Kiểu dữ liệu dùng chung cho lộ trình & bài học */

export type WordItem = {
  cn: string
  pinyin: string
  vi: string
  pos?: string // phân loại từ: Danh từ / Động từ / Cụm từ…
  ex?: { cn: string; pinyin: string; vi: string } // câu ví dụ minh hoạ
}

/** Một bài học từ vựng */
export type VocabLesson = {
  n: number
  cn: string // chủ đề bằng chữ Hán
  pinyin?: string
  topic: string // tên bài bằng tiếng Việt
  icon?: string // emoji minh hoạ bài học
  words: WordItem[] // từ mẫu minh hoạ
  more?: number // số từ còn lại trong bài
}

/** Một bài học ngữ pháp */
export type GrammarLesson = {
  n: number
  point: string // tên điểm ngữ pháp (tiếng Việt)
  cn?: string // tên bằng chữ Hán
  structure: string // công thức cấu trúc
  example: WordItem // câu ví dụ
}

export type RoadmapGroup = 'hsk' | 'yct' | 'boya' | 'hanyu'

/** Một cấp độ trong lộ trình */
export type RoadmapLevel = {
  slug: string
  group: RoadmapGroup
  code: string // "HSK 1"
  cn: string // 一级
  vi: string // tên cấp độ tiếng Việt
  tagline: string // mô tả ngắn
  words: string // số từ vựng chuẩn
  stage: string // 初 / 中 / 高 / 童
  stageBg: string // màu badge chặng
  tape: string // màu washi
  vocab: VocabLesson[]
  grammar: GrammarLesson[]
}

export const GROUPS: Record<
  RoadmapGroup,
  { id: RoadmapGroup; name: string; cn: string; anchor: string; tagline: string; tape: string }
> = {
  hsk: {
    id: 'hsk',
    name: 'Lộ trình HSK 3.0',
    cn: '中文水平考试',
    anchor: '#hsk',
    tagline: 'Chuẩn thi quốc tế · 9 cấp độ · 11.092 từ',
    tape: 'var(--pastel-pink)',
  },
  yct: {
    id: 'yct',
    name: 'YCT · Tiếng Trung thiếu nhi',
    cn: '少儿汉语',
    anchor: '#yct',
    tagline: 'Dành cho các bạn nhỏ 8–15 tuổi',
    tape: 'var(--pastel-mint)',
  },
  boya: {
    id: 'boya',
    name: 'Boya Chinese',
    cn: '博雅汉语',
    anchor: '#boya',
    tagline: 'Giáo trình Đại học Bắc Kinh · 4 nấc thang',
    tape: 'var(--pastel-sky)',
  },
  hanyu: {
    id: 'hanyu',
    name: 'Giáo trình Hán ngữ',
    cn: '汉语教程',
    anchor: '#hanyu',
    tagline: 'Sáu quyển kinh điển cho người Việt',
    tape: 'var(--pastel-peach)',
  },
}
