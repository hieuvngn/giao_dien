/* ============================================================
   AI Video Learning — dữ liệu bài học mẫu
   Mô phỏng kết quả pipeline:
   URL → phụ đề (sub gốc / Whisper Large v3 Turbo)
       → dịch tiếng Việt → phân tích từ vựng & ngữ pháp → bài tập
   Dùng cho giao diện demo khi chưa kết nối backend.
   ============================================================ */

export type Vocab = {
  cn: string
  pinyin: string
  vi: string
  pos: string
  hsk: number
}

export type GrammarPoint = {
  pattern: string
  name: string
  desc: string
}

export type BlankExercise = {
  before: string
  answer: string
  after: string
  hint: string
}

export type VideoSentence = {
  cn: string
  pinyin: string
  vi: string
  /** index vào lesson.grammar */
  grammar: number[]
  /** danh sách cn khớp lesson.vocab */
  vocab: string[]
  exercise?: BlankExercise
}

export type VideoLesson = {
  id: string
  title: string
  titleCn: string
  url: string
  platform: 'youtube' | 'bilibili'
  duration: string
  level: string
  emoji: string
  sentences: VideoSentence[]
  vocab: Vocab[]
  grammar: GrammarPoint[]
}

export const VIDEO_LESSONS: VideoLesson[] = [
  {
    id: 'chi-fan',
    title: 'Mời bạn đi ăn cùng nhé!',
    titleCn: '一起吃饭吧',
    url: 'https://www.youtube.com/watch?v=kP9TfR2Lf4A',
    platform: 'youtube',
    duration: '4:32',
    level: 'HSK 1–2',
    emoji: '🍜',
    sentences: [
      {
        cn: '你有时间吗？',
        pinyin: 'nǐ yǒu shíjiān ma?',
        vi: 'Bạn có thời gian không?',
        grammar: [],
        vocab: ['时间'],
        exercise: { before: '你有', answer: '时间', after: '吗？', hint: 'thời gian' },
      },
      {
        cn: '如果你有时间的话，我们一起去吃饭吧。',
        pinyin: 'rúguǒ nǐ yǒu shíjiān de huà, wǒmen yìqǐ qù chīfàn ba.',
        vi: 'Nếu bạn có thời gian thì chúng ta cùng đi ăn nhé.',
        grammar: [0, 1],
        vocab: ['如果', '时间', '一起', '吃饭'],
        exercise: { before: '如果你有时间的话，我们', answer: '一起', after: '去吃饭吧。', hint: 'cùng nhau' },
      },
      {
        cn: '好啊，我很久没有和你一起吃饭了。',
        pinyin: 'hǎo a, wǒ hěn jiǔ méiyǒu hé nǐ yìqǐ chīfàn le.',
        vi: 'Được chứ, lâu rồi tớ chưa ăn cơm cùng cậu.',
        grammar: [1],
        vocab: ['久', '一起', '吃饭'],
        exercise: { before: '好啊，我很', answer: '久', after: '没有和你一起吃饭了。', hint: 'lâu (về thời gian)' },
      },
      {
        cn: '那我们六点在学校门口见吧。',
        pinyin: 'nà wǒmen liù diǎn zài xuéxiào ménkǒu jiàn ba.',
        vi: 'Vậy thì 6 giờ chúng ta gặp nhau ở cổng trường nhé.',
        grammar: [1],
        vocab: ['学校', '门口', '见'],
        exercise: { before: '那我们六点在学校', answer: '门口', after: '见吧。', hint: 'cổng, cửa ra vào' },
      },
    ],
    vocab: [
      { cn: '时间', pinyin: 'shíjiān', vi: 'thời gian', pos: 'danh từ', hsk: 1 },
      { cn: '如果', pinyin: 'rúguǒ', vi: 'nếu như', pos: 'liên từ', hsk: 2 },
      { cn: '一起', pinyin: 'yìqǐ', vi: 'cùng nhau', pos: 'trạng từ', hsk: 1 },
      { cn: '吃饭', pinyin: 'chīfàn', vi: 'ăn cơm, ăn', pos: 'động từ', hsk: 1 },
      { cn: '久', pinyin: 'jiǔ', vi: 'lâu (thời gian)', pos: 'tính từ', hsk: 2 },
      { cn: '门口', pinyin: 'ménkǒu', vi: 'cổng, cửa ra vào', pos: 'danh từ', hsk: 2 },
      { cn: '见', pinyin: 'jiàn', vi: 'gặp', pos: 'động từ', hsk: 1 },
      { cn: '学校', pinyin: 'xuéxiào', vi: 'trường học', pos: 'danh từ', hsk: 1 },
    ],
    grammar: [
      {
        pattern: '如果……的话',
        name: 'Câu giả định “Nếu… thì…”',
        desc: '的话 đặt cuối vế điều kiện để nhấn mạnh, có thể lược bỏ mà nghĩa không đổi.',
      },
      {
        pattern: '吧',
        name: 'Trợ từ đề nghị',
        desc: 'Đứng cuối câu để gợi ý, rủ rê hoặc đề nghị một cách nhẹ nhàng.',
      },
    ],
  },
  {
    id: 'jian-mian',
    title: 'Lần đầu gặp mặt',
    titleCn: '第一次见面',
    url: 'https://www.youtube.com/watch?v=XqZm8nHq1Wc',
    platform: 'youtube',
    duration: '3:15',
    level: 'HSK 1',
    emoji: '👋',
    sentences: [
      {
        cn: '你好！我叫小明。',
        pinyin: 'nǐ hǎo! wǒ jiào Xiǎomíng.',
        vi: 'Xin chào! Tớ tên là Tiểu Minh.',
        grammar: [],
        vocab: ['你好'],
        exercise: { before: '你好！我', answer: '叫', after: '小明。', hint: 'gọi, tên là' },
      },
      {
        cn: '你叫什么名字？',
        pinyin: 'nǐ jiào shénme míngzi?',
        vi: 'Cậu tên là gì nhỉ?',
        grammar: [],
        vocab: ['名字'],
        exercise: { before: '你叫什么', answer: '名字', after: '？', hint: 'tên' },
      },
      {
        cn: '我叫王美丽，很高兴认识你。',
        pinyin: 'wǒ jiào Wáng Měilì, hěn gāoxìng rènshi nǐ.',
        vi: 'Tớ tên Vương Mỹ Lệ, rất vui được làm quen với cậu.',
        grammar: [1],
        vocab: ['高兴', '认识'],
        exercise: { before: '很高兴', answer: '认识', after: '你。', hint: 'biết, làm quen' },
      },
      {
        cn: '你是哪国人？',
        pinyin: 'nǐ shì nǎ guórén?',
        vi: 'Cậu là người nước nào?',
        grammar: [],
        vocab: ['哪'],
        exercise: { before: '你是', answer: '哪', after: '国人？', hint: 'nào' },
      },
      {
        cn: '我是越南人，正在学习汉语。',
        pinyin: 'wǒ shì Yuènán rén, zhèngzài xuéxí Hànyǔ.',
        vi: 'Tớ là người Việt Nam, đang học tiếng Trung.',
        grammar: [0],
        vocab: ['正在', '学习', '汉语'],
        exercise: { before: '我是越南人，正在', answer: '学习', after: '汉语。', hint: 'học' },
      },
    ],
    vocab: [
      { cn: '你好', pinyin: 'nǐ hǎo', vi: 'xin chào', pos: 'thán từ', hsk: 1 },
      { cn: '名字', pinyin: 'míngzi', vi: 'tên', pos: 'danh từ', hsk: 1 },
      { cn: '认识', pinyin: 'rènshi', vi: 'biết, làm quen', pos: 'động từ', hsk: 1 },
      { cn: '高兴', pinyin: 'gāoxìng', vi: 'vui, hạnh phúc', pos: 'tính từ', hsk: 1 },
      { cn: '哪', pinyin: 'nǎ', vi: 'nào, ở đâu', pos: 'đại từ', hsk: 1 },
      { cn: '正在', pinyin: 'zhèngzài', vi: 'đang (làm gì)', pos: 'trạng từ', hsk: 2 },
      { cn: '学习', pinyin: 'xuéxí', vi: 'học', pos: 'động từ', hsk: 1 },
      { cn: '汉语', pinyin: 'Hànyǔ', vi: 'tiếng Trung (Hán ngữ)', pos: 'danh từ', hsk: 1 },
    ],
    grammar: [
      {
        pattern: '正在 + 动词',
        name: 'Diễn tả hành động đang diễn ra',
        desc: '正在 đặt trước động từ để nói một việc đang xảy ra lúc nói: 正在学习 = đang học.',
      },
      {
        pattern: '很高兴认识你',
        name: 'Mẫu câu xã giao khi gặp lần đầu',
        desc: 'Câu chào lịch sự sau khi biết tên người đối diện: “Rất vui được làm quen”.',
      },
    ],
  },
  {
    id: 'chaoshi',
    title: 'Mua sắm ở siêu thị',
    titleCn: '在超市买东西',
    url: 'https://www.bilibili.com/video/BV1GJ411x7h7',
    platform: 'bilibili',
    duration: '5:47',
    level: 'HSK 2',
    emoji: '🛒',
    sentences: [
      {
        cn: '你要买什么东西？',
        pinyin: 'nǐ yào mǎi shénme dōngxi?',
        vi: 'Cậu định mua gì thế?',
        grammar: [],
        vocab: ['买', '东西'],
        exercise: { before: '你要买什么', answer: '东西', after: '？', hint: 'đồ, đồ vật' },
      },
      {
        cn: '我想买一些水果和牛奶。',
        pinyin: 'wǒ xiǎng mǎi yīxiē shuǐguǒ hé niúnǎi.',
        vi: 'Tớ muốn mua một ít trái cây và sữa.',
        grammar: [],
        vocab: ['水果', '牛奶'],
        exercise: { before: '我想买一些', answer: '水果', after: '和牛奶。', hint: 'trái cây' },
      },
      {
        cn: '这个苹果多少钱？',
        pinyin: 'zhège píngguǒ duōshao qián?',
        vi: 'Quả táo này bao nhiêu tiền?',
        grammar: [0],
        vocab: ['苹果'],
        exercise: { before: '这个苹果', answer: '多少钱', after: '？', hint: 'bao nhiêu tiền' },
      },
      {
        cn: '十块钱一斤，很便宜。',
        pinyin: 'shí kuài qián yì jīn, hěn piányi.',
        vi: 'Mười tệ một cân, rẻ lắm.',
        grammar: [],
        vocab: ['便宜'],
        exercise: { before: '十块钱一斤，很', answer: '便宜', after: '。', hint: 'rẻ' },
      },
      {
        cn: '太贵了，可以便宜一点吗？',
        pinyin: 'tài guì le, kěyǐ piányi yìdiǎn ma?',
        vi: 'Đắt quá, giảm bớt một chút được không?',
        grammar: [1, 2],
        vocab: ['贵', '一点', '便宜'],
        exercise: { before: '太', answer: '贵', after: '了，可以便宜一点吗？', hint: 'đắt' },
      },
    ],
    vocab: [
      { cn: '买', pinyin: 'mǎi', vi: 'mua', pos: 'động từ', hsk: 1 },
      { cn: '东西', pinyin: 'dōngxi', vi: 'đồ, đồ vật', pos: 'danh từ', hsk: 1 },
      { cn: '水果', pinyin: 'shuǐguǒ', vi: 'trái cây', pos: 'danh từ', hsk: 2 },
      { cn: '牛奶', pinyin: 'niúnǎi', vi: 'sữa bò', pos: 'danh từ', hsk: 2 },
      { cn: '苹果', pinyin: 'píngguǒ', vi: 'quả táo', pos: 'danh từ', hsk: 2 },
      { cn: '便宜', pinyin: 'piányi', vi: 'rẻ', pos: 'tính từ', hsk: 2 },
      { cn: '贵', pinyin: 'guì', vi: 'đắt', pos: 'tính từ', hsk: 2 },
      { cn: '一点', pinyin: 'yìdiǎn', vi: 'một chút, một ít', pos: 'lượng từ', hsk: 2 },
    ],
    grammar: [
      {
        pattern: '……多少钱？',
        name: 'Cách hỏi giá',
        desc: 'Đặt cuối câu để hỏi giá tiền: 这个苹果多少钱？ = Quả táo này bao nhiêu tiền?',
      },
      {
        pattern: '太……了',
        name: 'Nhấn mạnh mức độ “quá…”',
        desc: '太 + tính từ + 了 diễn tả cảm xúc mạnh: 太贵了！= Đắt quá!',
      },
      {
        pattern: '可以……吗？',
        name: 'Đề nghị lịch sự',
        desc: 'Hỏi xin phép hoặc ngỏ ý một cách lịch sự: 可以便宜一点吗？',
      },
    ],
  },
]
