/* ============================================================
   DỮ LIỆU DÙNG CHUNG — Shadowing · Tạo vở tập viết
   ============================================================ */

import { pinyin } from 'pinyin-pro'

export type SubLine = {
  t: number // giây bắt đầu
  cn: string
  py: string
  vi: string
}

export type ShadowVideo = {
  id: string
  title: string
  cn: string
  level: 'HSK 1' | 'HSK 2' | 'HSK 3' | 'HSK 4' | 'HSK 5'
  views: string
  hue: string // màu pastel chủ đạo của thumbnail
  hueSoft: string
  src: string
  desc: string
  lines: SubLine[]
}

const SAMPLE_VIDEOS = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
]

export const VIDEOS: ShadowVideo[] = [
  {
    id: 'bai1-nihao',
    title: 'Bài 1 · Chào hỏi',
    cn: '你好',
    level: 'HSK 1',
    views: '8.2k',
    hue: '#ffc9d8',
    hueSoft: '#ffe3ec',
    src: SAMPLE_VIDEOS[0],
    desc: 'Bài đầu tiên — những câu chào cơ bản nhất để bắt đầu mọi cuộc trò chuyện.',
    lines: [
      { t: 0, cn: '你好！', py: 'Nǐ hǎo!', vi: 'Xin chào!' },
      { t: 6, cn: '你好！你叫什么名字？', py: 'Nǐ hǎo! Nǐ jiào shénme míngzi?', vi: 'Xin chào! Bạn tên là gì?' },
      { t: 13, cn: '我叫小明。你呢？', py: 'Wǒ jiào Xiǎomíng. Nǐ ne?', vi: 'Mình là Tiểu Minh. Còn bạn?' },
      { t: 20, cn: '我叫安娜。很高兴认识你！', py: 'Wǒ jiào Ānnà. Hěn gāoxìng rènshi nǐ!', vi: 'Mình là Anna. Rất vui được gặp bạn!' },
      { t: 28, cn: '我也很高兴认识你！', py: 'Wǒ yě hěn gāoxìng rènshi nǐ!', vi: 'Mình cũng rất vui được gặp bạn!' },
      { t: 36, cn: '你是越南人吗？', py: 'Nǐ shì Yuènán rén ma?', vi: 'Bạn là người Việt Nam à?' },
      { t: 43, cn: '对，我是越南人。你呢？', py: 'Duì, wǒ shì Yuènán rén. Nǐ ne?', vi: 'Đúng, mình là người Việt. Còn bạn?' },
      { t: 51, cn: '我是中国人。', py: 'Wǒ shì Zhōngguó rén.', vi: 'Mình là người Trung Quốc.' },
      { t: 58, cn: '再见，小明！', py: 'Zàijiàn, Xiǎomíng!', vi: 'Tạm biệt, Tiểu Minh!' },
      { t: 64, cn: '再见！明天见！', py: 'Zàijiàn! Míngtiān jiàn!', vi: 'Tạm biệt! Hẹn gặp lại mai!' },
    ],
  },
  {
    id: 'bai2-xiexie',
    title: 'Bài 2 · Cảm ơn & xin lỗi',
    cn: '谢谢',
    level: 'HSK 1',
    views: '7.5k',
    hue: '#fff0b3',
    hueSoft: '#fff8dc',
    src: SAMPLE_VIDEOS[1],
    desc: 'Lịch sự mỗi ngày — cảm ơn, xin lỗi và đáp lại đúng cách người Trung Quốc hay dùng.',
    lines: [
      { t: 0, cn: '谢谢你！', py: 'Xièxie nǐ!', vi: 'Cảm ơn bạn!' },
      { t: 6, cn: '不客气。', py: 'Bú kèqi.', vi: 'Không có gì.' },
      { t: 11, cn: '谢谢你帮我。', py: 'Xièxie nǐ bāng wǒ.', vi: 'Cảm ơn bạn đã giúp mình.' },
      { t: 18, cn: '小事一桩。', py: 'Xiǎoshì yī zhuāng.', vi: 'Chuyện nhỏ mà.' },
      { t: 24, cn: '对不起！', py: 'Duìbuqǐ!', vi: 'Xin lỗi!' },
      { t: 29, cn: '没关系。', py: 'Méi guānxi.', vi: 'Không sao.' },
      { t: 35, cn: '真对不起，我来晚了。', py: 'Zhēn duìbuqǐ, wǒ lái wǎn le.', vi: 'Thật xin lỗi, mình đến muộn.' },
      { t: 44, cn: '没关系，我也刚到。', py: 'Méi guānxi, wǒ yě gāng dào.', vi: 'Không sao, mình cũng vừa đến.' },
      { t: 52, cn: '那我们进去吧！', py: 'Nà wǒmen jìnqù ba!', vi: 'Vậy chúng ta vào thôi!' },
      { t: 60, cn: '好的！', py: 'Hǎo de!', vi: 'Được!' },
    ],
  },
  {
    id: 'bai3-jiaren',
    title: 'Bài 3 · Gia đình tôi',
    cn: '我的家',
    level: 'HSK 2',
    views: '6.9k',
    hue: '#c9ecd7',
    hueSoft: '#e6f7ee',
    src: SAMPLE_VIDEOS[0],
    desc: 'Giới thiệu gia đình, nghề nghiệp và hỏi – đáp về tuổi của các thành viên.',
    lines: [
      { t: 0, cn: '这是我的家。', py: 'Zhè shì wǒ de jiā.', vi: 'Đây là gia đình mình.' },
      { t: 7, cn: '这是你爸爸吗？', py: 'Zhè shì nǐ bàba ma?', vi: 'Đây là bố bạn à?' },
      { t: 13, cn: '对，我爸爸是医生。', py: 'Duì, wǒ bàba shì yīshēng.', vi: 'Đúng, bố mình là bác sĩ.' },
      { t: 21, cn: '你妈妈做什么工作？', py: 'Nǐ māma zuò shénme gōngzuò?', vi: 'Mẹ bạn làm nghề gì?' },
      { t: 28, cn: '我妈妈是老师。', py: 'Wǒ māma shì lǎoshī.', vi: 'Mẹ mình là giáo viên.' },
      { t: 35, cn: '你有兄弟姐妹吗？', py: 'Nǐ yǒu xiōngdì jiěmèi ma?', vi: 'Bạn có anh chị em không?' },
      { t: 43, cn: '我有一个妹妹。', py: 'Wǒ yǒu yīgè mèimei.', vi: 'Mình có một em gái.' },
      { t: 50, cn: '她几岁了？', py: 'Tā jǐ suì le?', vi: 'Em bé bao nhiêu tuổi rồi?' },
      { t: 56, cn: '她今年五岁。', py: 'Tā jīnnián wǔ suì.', vi: 'Năm nay em bé năm tuổi.' },
      { t: 63, cn: '她真可爱！', py: 'Tā zhēn kě\'ài!', vi: 'Em bé đáng yêu thật!' },
      { t: 70, cn: '谢谢！她也喜欢你。', py: 'Xièxie! Tā yě xǐhuan nǐ.', vi: 'Cảm ơn! Em ấy cũng thích bạn.' },
    ],
  },
  {
    id: 'bai4-diancai',
    title: 'Bài 4 · Gọi món ăn',
    cn: '点菜',
    level: 'HSK 3',
    views: '5.8k',
    hue: '#ffdcbf',
    hueSoft: '#ffeedd',
    src: SAMPLE_VIDEOS[1],
    desc: 'Tình huống nhà hàng trọn vẹn: gọi món, gọi nước, khen ngon và thanh toán.',
    lines: [
      { t: 0, cn: '服务员，点菜！', py: 'Fúwùyuán, diǎn cài!', vi: 'Em nhân viên ơi, gọi món!' },
      { t: 6, cn: '好的，您要吃什么？', py: 'Hǎo de, nín yào chī shénme?', vi: 'Vâng, anh chị muốn ăn gì ạ?' },
      { t: 14, cn: '一个宫保鸡丁和一碗米饭。', py: 'Yīgè gōngbǎo jīdīng hé yī wǎn mǐfàn.', vi: 'Một gà Kung Bao và một bát cơm.' },
      { t: 25, cn: '要喝什么饮料？', py: 'Yào hē shénme yǐnliào?', vi: 'Uống nước gì ạ?' },
      { t: 31, cn: '一杯绿茶。', py: 'Yī bēi lǜchá.', vi: 'Một cốc trà xanh.' },
      { t: 37, cn: '好的，请稍等。', py: 'Hǎo de, qǐng shāo děng.', vi: 'Vâng, xin chờ một chút.' },
      { t: 45, cn: '菜来了，请慢用！', py: 'Cài lái le, qǐng màn yòng!', vi: 'Món đây, mời dùng ngon miệng!' },
      { t: 54, cn: '谢谢。这个菜真好吃！', py: 'Xièxie. Zhège cài zhēn hǎochī!', vi: 'Cảm ơn. Món này ngon thật!' },
      { t: 63, cn: '先生，还要别的吗？', py: 'Xiānsheng, hái yào biéde ma?', vi: 'Anh còn cần gì nữa không ạ?' },
      { t: 71, cn: '不用了，买单！', py: 'Bùyòng le, mǎidān!', vi: 'Không cần nữa, tính tiền!' },
      { t: 77, cn: '一共六十八块。', py: 'Yīgòng liùshíbā kuài.', vi: 'Tổng cộng 68 tệ.' },
      { t: 84, cn: '给您，谢谢！', py: 'Gěi nín, xièxie!', vi: 'Của anh, cảm ơn!' },
    ],
  },
  {
    id: 'bai5-lvyou',
    title: 'Bài 5 · Đi du lịch',
    cn: '去旅行',
    level: 'HSK 4',
    views: '5.1k',
    hue: '#cbe6f7',
    hueSoft: '#e6f3fc',
    src: SAMPLE_VIDEOS[0],
    desc: 'Kế hoạch chuyến đi: phương tiện, thời gian, thắng cảnh và đặt vé khách sạn.',
    lines: [
      { t: 0, cn: '这个假期你去哪儿？', py: 'Zhège jiàqī nǐ qù nǎr?', vi: 'Kỳ nghỉ này bạn đi đâu?' },
      { t: 8, cn: '我打算去西安旅行。', py: "Wǒ dǎsuàn qù Xī'ān lǚxíng.", vi: 'Mình định đi du lịch Tây An.' },
      { t: 17, cn: '真的吗？怎么去？', py: 'Zhēn de ma? Zěnme qù?', vi: 'Thật à? Đi bằng gì?' },
      { t: 23, cn: '坐高铁去，又快又方便。', py: 'Zuò gāotiě qù, yòu kuài yòu fāngbiàn.', vi: 'Đi tàu cao tốc, vừa nhanh vừa tiện.' },
      { t: 35, cn: '打算玩几天？', py: 'Dǎsuàn wán jǐ tiān?', vi: 'Định chơi mấy ngày?' },
      { t: 42, cn: '四天三夜。', py: 'Sì tiān sān yè.', vi: 'Bốn ngày ba đêm.' },
      { t: 49, cn: '那边的名胜古迹多吗？', py: 'Nàbiān de míngshèng gǔjì duō ma?', vi: 'Ở đó nhiều thắng cảnh cổ không?' },
      { t: 59, cn: '很多，比如兵马俑。', py: 'Hěn duō, bǐrú bīngmǎyǒng.', vi: 'Nhiều lắm, ví dụ như Đội quân đất nung.' },
      { t: 69, cn: '我也想去看一看。', py: 'Wǒ yě xiǎng qù kàn yi kàn.', vi: 'Mình cũng muốn đi xem.' },
      { t: 77, cn: '那我们一起去吧！', py: 'Nà wǒmen yīqǐ qù ba!', vi: 'Vậy mình cùng đi nhé!' },
      { t: 85, cn: '好主意！', py: 'Hǎo zhǔyi!', vi: 'Ý kiến hay!' },
      { t: 90, cn: '我们先订机票和酒店。', py: 'Wǒmen xiān dìng jīpiào hé jiǔdiàn.', vi: 'Mình đặt vé máy bay và khách sạn trước đã.' },
    ],
  },
  {
    id: 'bai6-mianshi',
    title: 'Bài 6 · Phỏng vấn xin việc',
    cn: '面试',
    level: 'HSK 5',
    views: '4.6k',
    hue: '#e3d9f9',
    hueSoft: '#f2edfc',
    src: SAMPLE_VIDEOS[1],
    desc: 'Từ vựng văn phòng: giới thiệu bản thân, ưu điểm, kỳ vọng lương trong phỏng vấn.',
    lines: [
      { t: 0, cn: '请先做个自我介绍吧。', py: 'Qǐng xiān zuò gè zìwǒ jièshào ba.', vi: 'Mời bạn giới thiệu bản thân trước.' },
      { t: 10, cn: '好的。我叫林芳，毕业于河内大学。', py: 'Hǎo de. Wǒ jiào Lín Fāng, bìyè yú Hénèi dàxué.', vi: 'Được ạ. Mình tên Lâm Phương, tốt nghiệp ĐH Hà Nội.' },
      { t: 26, cn: '你为什么选择我们公司？', py: 'Nǐ wèishénme xuǎnzé wǒmen gōngsī?', vi: 'Vì sao bạn chọn công ty chúng tôi?' },
      { t: 36, cn: '贵公司在行业里很有影响力。', py: 'Guì gōngsī zài hángyè lǐ hěn yǒu yǐngxiǎnglì.', vi: 'Quý công ty rất có uy tín trong ngành.' },
      { t: 49, cn: '你有什么优势？', py: 'Nǐ yǒu shénme yōushì?', vi: 'Bạn có ưu điểm gì?' },
      { t: 57, cn: '我会流利的汉语和英语。', py: 'Wǒ huì liúlì de Hànyǔ hé Yīngyǔ.', vi: 'Mình nói tiếng Trung và tiếng Anh lưu loát.' },
      { t: 67, cn: '还会做数据分析。', py: 'Hái huì zuò shùjù fēnxī.', vi: 'Ngoài ra còn biết phân tích dữ liệu.' },
      { t: 76, cn: '你期望的工资是多少？', py: 'Nǐ qīwàng de gōngzī shì duōshǎo?', vi: 'Bạn mong muốn lương bao nhiêu?' },
      { t: 85, cn: '希望在一千五左右。', py: 'Xīwàng zài yīqiān wǔ zuǒyòu.', vi: 'Mong khoảng 1500.' },
      { t: 93, cn: '什么时候能上班？', py: 'Shénme shíhou néng shàngbān?', vi: 'Bao giờ bạn có thể đi làm?' },
      { t: 100, cn: '下个月一号就可以。', py: 'Xiàgè yuè yī hào jiù kěyǐ.', vi: 'Ngày mùng 1 tháng sau là được.' },
      { t: 108, cn: '好的，有消息会通知你。', py: 'Hǎo de, yǒu xiāoxi huì tōngzhī nǐ.', vi: 'Được, có tin chúng tôi sẽ báo bạn.' },
      { t: 117, cn: '谢谢，期待您的好消息！', py: 'Xièxie, qīdài nín de hǎo xiāoxi!', vi: 'Cảm ơn, mong tin vui từ anh chị!' },
    ],
  },
]

export function videoDuration(v: ShadowVideo) {
  return v.lines[v.lines.length - 1].t + 8
}

export function fmtTime(s: number) {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

/* ================= Bộ từ vựng mẫu cho vở tập viết ================= */

export type VocabPreset = {
  id: string
  name: string
  words: { w: string; vi: string }[]
}

export const VOCAB_PRESETS: VocabPreset[] = [
  {
    id: 'hsk1-chao',
    name: 'HSK 1 · Chào hỏi',
    words: [
      { w: '你好', vi: 'xin chào' },
      { w: '谢谢', vi: 'cảm ơn' },
      { w: '再见', vi: 'tạm biệt' },
      { w: '老师', vi: 'giáo viên' },
      { w: '学生', vi: 'học sinh' },
    ],
  },
  {
    id: 'yct1-dongvat',
    name: 'YCT 1 · Động vật',
    words: [
      { w: '小猫', vi: 'mèo con' },
      { w: '小狗', vi: 'chó con' },
      { w: '小鸟', vi: 'chim' },
      { w: '大鱼', vi: 'cá to' },
      { w: '马', vi: 'ngựa' },
    ],
  },
  {
    id: 'giadinh',
    name: 'Chủ đề · Gia đình',
    words: [
      { w: '爸爸', vi: 'bố' },
      { w: '妈妈', vi: 'mẹ' },
      { w: '哥哥', vi: 'anh trai' },
      { w: '姐姐', vi: 'chị gái' },
      { w: '妹妹', vi: 'em gái' },
      { w: '弟弟', vi: 'em trai' },
    ],
  },
  {
    id: 'truonghoc',
    name: 'Chủ đề · Trường học',
    words: [
      { w: '学校', vi: 'trường học' },
      { w: '写字', vi: 'viết chữ' },
      { w: '上课', vi: 'lên lớp' },
      { w: '同学', vi: 'bạn cùng lớp' },
      { w: '作业', vi: 'bài tập về nhà' },
    ],
  },
  {
    id: 'hanzi-mau',
    name: 'Mẫu chữ hán · Nét cơ bản',
    words: [
      { w: '一', vi: 'một' },
      { w: '二', vi: 'hai' },
      { w: '三', vi: 'ba' },
      { w: '四', vi: 'bốn' },
      { w: '五', vi: 'năm' },
      { w: '六', vi: 'sáu' },
      { w: '七', vi: 'bảy' },
      { w: '八', vi: 'tám' },
      { w: '九', vi: 'chín' },
      { w: '十', vi: 'mười' },
      { w: '人', vi: 'người' },
      { w: '口', vi: 'miệng' },
      { w: '大', vi: 'to' },
      { w: '小', vi: 'nhỏ' },
      { w: '上', vi: 'trên' },
      { w: '下', vi: 'dưới' },
      { w: '日', vi: 'mặt trời · ngày' },
      { w: '月', vi: 'mặt trăng · tháng' },
      { w: '水', vi: 'nước' },
      { w: '火', vi: 'lửa' },
    ],
  },
]

/** Các mẫu đoạn văn cho chế độ "Văn bản liên tục" */
export const PARAGRAPH_SAMPLES: { id: string; name: string; text: string }[] = [
  {
    id: 'gioi-thieu',
    name: 'Giới thiệu bản thân',
    text: '你好！我叫小明，今年二十岁，是越南的学生。我学习汉语两年了，很喜欢写汉字。每天我练习写一页，汉语进步得很快。',
  },
  {
    id: 'ngay-cua-toi',
    name: 'Ngày của tôi',
    text: '我每天早上七点起床，七点半吃早饭。八点我去学校上课。中午我和同学一起吃饭。下午我复习汉语，练习写汉字。晚上我看书，十点睡觉。',
  },
  {
    id: 'di-cho',
    name: 'Đi chợ với mẹ',
    text: '今天天气很好，我和妈妈一起去市场买水果。苹果很甜，香蕉也很新鲜。我们买了三斤苹果、两把香蕉，一共花了三十块钱。回家以后，我帮妈妈洗水果，真开心！',
  },
]

export const PARAGRAPH_SAMPLE = PARAGRAPH_SAMPLES[0].text

/* pinyin qua thư viện pinyin-pro (fallback an toàn) */
export function charPinyin(ch: string): string {
  try {
    return pinyin(ch, { toneType: 'symbol', type: 'string', nonZh: 'consecutive' })
  } catch {
    return ''
  }
}

export function wordPinyin(w: string): string {
  try {
    return pinyin(w, { toneType: 'symbol', type: 'string', nonZh: 'consecutive' })
  } catch {
    return ''
  }
}
