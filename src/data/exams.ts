/* ============================================================
   Dữ liệu đề thi & luyện tập
   - EXAM_PAPERS: 6 đề mẫu (HSK 1–4 · YCT 1–2) theo format thi thật
   - Kho câu hỏi demo bám sát từ vựng/ ngữ pháp đã học trên trang
   Loại câu hỏi:
   - choice: chọn 1 trong A/B/C
   - order : sắp xếp các từ thành câu hoàn chỉnh
   ============================================================ */

export type ExamPartKey = 'listen' | 'read' | 'write'

export type ExamPart = {
  key: ExamPartKey
  cn: string
  vi: string
  hint: string
}

export const EXAM_PARTS: Record<ExamPartKey, ExamPart> = {
  listen: { key: 'listen', cn: '听力', vi: 'Nghe', hint: 'Bấm loa để nghe, chọn đáp án đúng' },
  read: { key: 'read', cn: '阅读', vi: 'Đọc hiểu', hint: 'Đọc câu và chọn đáp án đúng' },
  write: { key: 'write', cn: '书写', vi: 'Viết', hint: 'Sắp xếp các từ thành câu hoàn chỉnh' },
}

export type ExamOption = { label: 'A' | 'B' | 'C'; cn?: string; vi: string }

export type QChoice = {
  id: string
  kind: 'choice'
  part: ExamPartKey
  prompt: string // đề bài (tiếng Việt)
  cn?: string // nội dung chữ Hán (câu đọc hiểu)
  pinyin?: string
  audioText?: string // nội dung audio (câu nghe)
  options: ExamOption[]
  answer: 'A' | 'B' | 'C'
  explain: string
}

export type QOrder = {
  id: string
  kind: 'order'
  part: ExamPartKey
  prompt: string
  cn?: string
  pinyin?: string
  tokens: string[] // các từ cho sẵn
  answer: string[] // thứ tự đúng
  explain: string
}

export type ExamQuestion = QChoice | QOrder

export type PaperTone = 'pink' | 'butter' | 'mint' | 'sky' | 'lilac' | 'peach'

export type ExamPaper = {
  id: string
  code: string // "HSK 1"
  cn: string // "一级"
  title: string
  levelSlug?: string // liên kết lộ trình tương ứng
  minutes: number // thời gian làm bài (phút)
  tone: PaperTone
  attempts: string // lượt làm (demo)
  badge?: string
  parts: ExamPart[]
  questions: ExamQuestion[]
}

/* ---------- Kho câu hỏi — trình độ dễ (HSK 1 · YCT) ---------- */

const EASY_LISTEN: QChoice[] = [
  {
    id: 'e-l1',
    kind: 'choice',
    part: 'listen',
    prompt: 'Bạn nghe được câu chào nào?',
    audioText: '你好',
    options: [
      { label: 'A', cn: '再见', vi: 'Tạm biệt' },
      { label: 'B', cn: '你好', vi: 'Xin chào' },
      { label: 'C', cn: '谢谢', vi: 'Cảm ơn' },
    ],
    answer: 'B',
    explain: '「你好」 = Xin chào — câu chào thông dụng nhất khi gặp ai đó.',
  },
  {
    id: 'e-l2',
    kind: 'choice',
    part: 'listen',
    prompt: 'Người nói đang bày tỏ điều gì?',
    audioText: '谢谢',
    options: [
      { label: 'A', cn: '不客气', vi: 'Không có gì' },
      { label: 'B', cn: '对不起', vi: 'Xin lỗi' },
      { label: 'C', cn: '谢谢', vi: 'Cảm ơn' },
    ],
    answer: 'C',
    explain: '「谢谢」 = Cảm ơn. Khi được cảm ơn, đáp lại bằng 「不客气」.',
  },
  {
    id: 'e-l3',
    kind: 'choice',
    part: 'listen',
    prompt: 'Người nói là người nước nào?',
    audioText: '我是越南人。',
    options: [
      { label: 'A', cn: '中国', vi: 'Trung Quốc' },
      { label: 'B', cn: '越南', vi: 'Việt Nam' },
      { label: 'C', cn: '泰国', vi: 'Thái Lan' },
    ],
    answer: 'B',
    explain: '「我是越南人」 = Tôi là người Việt Nam. 「越南人」 = người Việt.',
  },
]

const EASY_READ: QChoice[] = [
  {
    id: 'f-r1',
    kind: 'choice',
    part: 'read',
    prompt: 'Chọn từ đúng điền vào chỗ trống:',
    cn: '我___学生。',
    pinyin: 'wǒ ___ xuésheng.',
    options: [
      { label: 'A', cn: '很', vi: 'rất' },
      { label: 'B', cn: '是', vi: 'là' },
      { label: 'C', cn: '有', vi: 'có' },
    ],
    answer: 'B',
    explain: 'Danh từ + 是 + danh từ: 「我是学生」 = Tôi là học sinh. 「很」 chỉ đứng trước tính từ.',
  },
  {
    id: 'f-r2',
    kind: 'choice',
    part: 'read',
    prompt: 'Chọn từ đúng điền vào chỗ trống:',
    cn: '他___中国人。',
    pinyin: 'tā ___ Zhōngguórén.',
    options: [
      { label: 'A', cn: '叫', vi: 'tên là' },
      { label: 'B', cn: '是', vi: 'là' },
      { label: 'C', cn: '去', vi: 'đi' },
    ],
    answer: 'B',
    explain: '「他是中国人」 = Anh ấy là người Trung Quốc.',
  },
  {
    id: 'f-r3',
    kind: 'choice',
    part: 'read',
    prompt: 'Chọn câu trả lời phù hợp cho câu hỏi:',
    cn: 'A: 你叫什么名字？',
    pinyin: 'Nǐ jiào shénme míngzi?',
    options: [
      { label: 'A', cn: '我叫小明。', vi: 'Tôi tên là Tiểu Minh.' },
      { label: 'B', cn: '我很好。', vi: 'Tôi khoẻ.' },
      { label: 'C', cn: '再见！', vi: 'Tạm biệt!' },
    ],
    answer: 'A',
    explain: '「你叫什么名字?」 → 「我叫…」 (Tôi tên là…). Đừng nhầm với câu hỏi thăm sức khoẻ.',
  },
  {
    id: 'f-r4',
    kind: 'choice',
    part: 'read',
    prompt: 'Câu trên nói về điều gì của mẹ?',
    cn: '妈妈是医生。',
    pinyin: 'Māma shì yīshēng.',
    options: [
      { label: 'A', cn: '职业', vi: 'Nghề nghiệp' },
      { label: 'B', cn: '爱好', vi: 'Sở thích' },
      { label: 'C', cn: '住处', vi: 'Nơi ở' },
    ],
    answer: 'A',
    explain: '「医生」 = bác sĩ → câu nói về nghề nghiệp của mẹ.',
  },
]

const EASY_WRITE: QOrder[] = [
  {
    id: 'e-w1',
    kind: 'order',
    part: 'write',
    prompt: 'Sắp xếp các từ thành câu hoàn chỉnh:',
    tokens: ['我', '是', '越南人'],
    answer: ['我', '是', '越南人'],
    explain: '「我是越南人」 = Tôi là người Việt Nam.',
  },
  {
    id: 'e-w2',
    kind: 'order',
    part: 'write',
    prompt: 'Sắp xếp các từ thành câu chào hỏi hoàn chỉnh:',
    tokens: ['你', '好', '吗'],
    answer: ['你', '好', '吗'],
    explain: '「你好吗」 = Bạn có khoẻ không? — câu hỏi thăm quen thuộc.',
  },
]

/* ---------- Kho câu hỏi — trình độ trung bình (HSK 3–4) ---------- */

const MID_LISTEN: QChoice[] = [
  {
    id: 'e-l4',
    kind: 'choice',
    part: 'listen',
    prompt: 'Họ sẽ cùng làm gì vào ngày mai?',
    audioText: '今天没时间，我们明天去看电影吧。',
    options: [
      { label: 'A', cn: '看电影', vi: 'Đi xem phim' },
      { label: 'B', cn: '买衣服', vi: 'Mua quần áo' },
      { label: 'C', cn: '打篮球', vi: 'Chơi bóng rổ' },
    ],
    answer: 'A',
    explain: '「明天去看电影」 = ngày mai đi xem phim. 「今天没时间」 chỉ nói hôm nay bận.',
  },
  {
    id: 'e-l5',
    kind: 'choice',
    part: 'listen',
    prompt: 'Quả táo này giá bao nhiêu?',
    audioText: '这个苹果五块钱，那个八块。',
    options: [
      { label: 'A', cn: '五块钱', vi: '5 tệ' },
      { label: 'B', cn: '八块钱', vi: '8 tệ' },
      { label: 'C', cn: '十块钱', vi: '10 tệ' },
    ],
    answer: 'A',
    explain: '「这个苹果五块钱」 = quả táo này 5 tệ; 「那个八块」 là quả kia, đừng nhầm!',
  },
]

const MID_READ: QChoice[] = [
  {
    id: 'f-r5',
    kind: 'choice',
    part: 'read',
    prompt: 'Chọn liên từ đúng điền vào chỗ trống:',
    cn: '因为下雨了，___我没有去公园。',
    pinyin: 'Yīnwèi xià yǔ le, ___ wǒ méiyǒu qù gōngyuán.',
    options: [
      { label: 'A', cn: '所以', vi: 'nên' },
      { label: 'B', cn: '但是', vi: 'nhưng' },
      { label: 'C', cn: '然后', vi: 'sau đó' },
    ],
    answer: 'A',
    explain: 'Cặp liên từ 「因为…所以…」: Vì trời mưa nên tôi không đi công viên.',
  },
  {
    id: 'f-r6',
    kind: 'choice',
    part: 'read',
    prompt: 'Quyển sách đang ở đâu?',
    cn: '他把书放在桌子上了。',
    pinyin: 'Tā bǎ shū fàng zài zhuōzi shang le.',
    options: [
      { label: 'A', cn: '桌子上', vi: 'Trên bàn' },
      { label: 'B', cn: '书包里', vi: 'Trong cặp' },
      { label: 'C', cn: '椅子上', vi: 'Trên ghế' },
    ],
    answer: 'A',
    explain: '「放在桌子上」 = để ở trên bàn. Cấu trúc: 把 + vật + 放在 + nơi.',
  },
  {
    id: 'f-r7',
    kind: 'choice',
    part: 'read',
    prompt: 'Chọn câu trả lời phù hợp khi được khen:',
    cn: 'A: 你的汉语说得真好！',
    pinyin: 'Nǐ de Hànyǔ shuō de zhēn hǎo!',
    options: [
      { label: 'A', cn: '哪里哪里。', vi: 'Chỗ nào đâu.' },
      { label: 'B', cn: '我不知道。', vi: 'Tôi không biết.' },
      { label: 'C', cn: '你说吧。', vi: 'Bạn cứ nói.' },
    ],
    answer: 'A',
    explain: 'Khi được khen, người Trung Quốc hay đáp khiêm tốn 「哪里哪里」 (Chỗ nào đâu).',
  },
]

const MID_WRITE: QOrder[] = [
  {
    id: 'e-w3',
    kind: 'order',
    part: 'write',
    prompt: 'Sắp xếp các từ thành câu hoàn chỉnh:',
    tokens: ['我们', '一起', '去', '图书馆'],
    answer: ['我们', '一起', '去', '图书馆'],
    explain: '「我们一起去图书馆」 = Chúng ta cùng đi thư viện.',
  },
  {
    id: 'e-w4',
    kind: 'order',
    part: 'write',
    prompt: 'Sắp xếp các từ thành câu hoàn chỉnh:',
    tokens: ['天气', '越来越', '冷', '了'],
    answer: ['天气', '越来越', '冷', '了'],
    explain: '「天气越来越冷了」 = Trời ngày càng lạnh. Cấu trúc: 越来越 + tính từ.',
  },
]

/* ---------- Danh sách đề ---------- */

export const EXAM_PAPERS: ExamPaper[] = [
  {
    id: 'hsk-1',
    code: 'HSK 1',
    cn: '一级',
    title: 'Đề mẫu HSK 1 — Từ vựng nền tảng',
    levelSlug: 'hsk-1',
    minutes: 10,
    tone: 'pink',
    attempts: '2,4k lượt làm',
    badge: 'Phổ biến nhất',
    parts: [EXAM_PARTS.listen, EXAM_PARTS.read],
    questions: [...EASY_LISTEN, ...EASY_READ],
  },
  {
    id: 'hsk-2',
    code: 'HSK 2',
    cn: '二级',
    title: 'Đề mẫu HSK 2 — Câu đơn hàng ngày',
    levelSlug: 'hsk-2',
    minutes: 12,
    tone: 'butter',
    attempts: '1,8k lượt làm',
    parts: [EXAM_PARTS.listen, EXAM_PARTS.read, EXAM_PARTS.write],
    questions: [...EASY_LISTEN, ...EASY_READ, ...EASY_WRITE],
  },
  {
    id: 'hsk-3',
    code: 'HSK 3',
    cn: '三级',
    title: 'Đề mẫu HSK 3 — Giao tiếp trung cấp',
    levelSlug: 'hsk-3',
    minutes: 15,
    tone: 'mint',
    attempts: '1,1k lượt làm',
    parts: [EXAM_PARTS.listen, EXAM_PARTS.read, EXAM_PARTS.write],
    questions: [...MID_LISTEN, ...MID_READ, ...MID_WRITE],
  },
  {
    id: 'hsk-4',
    code: 'HSK 4',
    cn: '四级',
    title: 'Đề mẫu HSK 4 — Trình độ trung cao',
    levelSlug: 'hsk-4',
    minutes: 15,
    tone: 'sky',
    attempts: '760 lượt làm',
    parts: [EXAM_PARTS.listen, EXAM_PARTS.read, EXAM_PARTS.write],
    questions: [...MID_LISTEN, ...MID_READ, ...MID_WRITE],
  },
  {
    id: 'yct-1',
    code: 'YCT 1',
    cn: '一级',
    title: 'Đề mẫu YCT 1 — Thiếu nhi nhập môn',
    levelSlug: 'yct-1',
    minutes: 10,
    tone: 'lilac',
    attempts: '980 lượt làm',
    parts: [EXAM_PARTS.listen, EXAM_PARTS.read],
    questions: [...EASY_LISTEN, ...EASY_READ],
  },
  {
    id: 'yct-2',
    code: 'YCT 2',
    cn: '二级',
    title: 'Đề mẫu YCT 2 — Tiếng Trung thiếu nhi',
    levelSlug: 'yct-2',
    minutes: 12,
    tone: 'peach',
    attempts: '540 lượt làm',
    parts: [EXAM_PARTS.listen, EXAM_PARTS.read],
    questions: [...EASY_LISTEN, ...EASY_READ],
  },
]

export function getPaper(id?: string): ExamPaper | undefined {
  if (!id) return undefined
  return EXAM_PAPERS.find((p) => p.id === id)
}

/* ---------- Helper chấm điểm (dùng chung practice & mock) ---------- */

/** Câu đã được trả lời xong chưa */
export function isAnswered(q: ExamQuestion, a: unknown): boolean {
  if (q.kind === 'choice') return typeof a === 'string' && a.length > 0
  return Array.isArray(a) && a.length === q.tokens.length
}

/** Đáp án có đúng không */
export function isCorrect(q: ExamQuestion, a: unknown): boolean {
  if (!isAnswered(q, a)) return false
  if (q.kind === 'choice') return a === q.answer
  return (a as string[]).join('') === q.answer.join('')
}

/** Đếm đúng / sai / bỏ trống của cả đề */
export function gradePaper(paper: ExamPaper, answers: Record<string, unknown>) {
  let correct = 0
  let wrong = 0
  let blank = 0
  const byPart: Record<ExamPartKey, { total: number; correct: number }> = {
    listen: { total: 0, correct: 0 },
    read: { total: 0, correct: 0 },
    write: { total: 0, correct: 0 },
  }
  for (const q of paper.questions) {
    byPart[q.part].total += 1
    if (isAnswered(q, answers[q.id])) {
      if (isCorrect(q, answers[q.id])) {
        correct += 1
        byPart[q.part].correct += 1
      } else {
        wrong += 1
      }
    } else {
      blank += 1
    }
  }
  const total = paper.questions.length
  return { correct, wrong, blank, total, byPart, percent: total ? Math.round((correct / total) * 100) : 0 }
}

/** mm:ss */
export function fmtClock(sec: number): string {
  const s = Math.max(0, Math.floor(sec))
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`
}
