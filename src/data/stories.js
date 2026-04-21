// Using Pixabay/Pexels free videos via direct CDN — no CORS, no embed restrictions
// All videos are free to use (Creative Commons / Pexels license)

export const GENRES = [
  { id: 'adventure', label: 'مغامرة',    emoji: '⚔️', color: 'text-ember-400 bg-ember-400/10 border-ember-400/30' },
  { id: 'mystery',   label: 'غموض',      emoji: '🔍', color: 'text-mist-300 bg-mist-300/10 border-mist-300/30' },
  { id: 'scifi',     label: 'خيال علمي', emoji: '🚀', color: 'text-blue-400 bg-blue-400/10 border-blue-400/30' },
  { id: 'horror',    label: 'رعب',       emoji: '👁️', color: 'text-red-400 bg-red-400/10 border-red-400/30' },
]

// Free MP4 videos — from Mixkit (free stock footage, no auth needed)
const V = {
  forest:   'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4',
  mountain: 'https://assets.mixkit.co/videos/preview/mixkit-mountain-top-in-the-clouds-4070-large.mp4',
  cave:     'https://assets.mixkit.co/videos/preview/mixkit-stalactites-in-a-cave-1090-large.mp4',
  city:     'https://assets.mixkit.co/videos/preview/mixkit-city-traffic-from-above-56-large.mp4',
  space:    'https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-1610-large.mp4',
  ocean:    'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-the-ocean-4910-large.mp4',
  desert:   'https://assets.mixkit.co/videos/preview/mixkit-sand-dunes-in-the-desert-4863-large.mp4',
  rain:     'https://assets.mixkit.co/videos/preview/mixkit-rain-falling-on-the-surface-of-a-lake-18312-large.mp4',
  sunrise:  'https://assets.mixkit.co/videos/preview/mixkit-sunrise-over-the-mountains-4133-large.mp4',
  ruins:    'https://assets.mixkit.co/videos/preview/mixkit-ruins-of-an-ancient-building-4072-large.mp4',
}

export const STORIES = [
  {
    id: 'story-1',
    title: 'المدينة المنسية',
    description: 'اكتشفت خريطة قديمة تقود لمدينة اختفت منذ قرون — هل ستجرؤ على الرحلة؟',
    genre: 'adventure',
    cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80',
    totalChapters: 6, plays: 2847, rating: 4.8,
    startChapterId: 'c1',
    chapters: {
      c1: {
        id: 'c1', title: 'الخريطة',
        description: 'وجدت خريطة غريبة في منزل جدك القديم...',
        videoUrl: V.ruins,
        videoThumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80',
        choicePrompt: 'الخريطة تشير لاتجاهين — أيهما ستختار؟',
        choiceAt: 8, endingType: null,
        choices: [
          { id: 'c1a', text: 'اتبع الطريق عبر الغابة الكثيفة', icon: '🌲', nextChapterId: 'c2a', consequence: 'طريق أطول لكن أكثر أماناً' },
          { id: 'c1b', text: 'اختر الطريق عبر الجبال الشاهقة',  icon: '⛰️', nextChapterId: 'c2b', consequence: 'أسرع لكن خطير' },
        ],
      },
      c2a: {
        id: 'c2a', title: 'الغابة',
        description: 'دخلت الغابة وبدأت تسمع أصواتاً غريبة...',
        videoUrl: V.forest,
        videoThumbnail: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80',
        choicePrompt: 'رأيت نوراً بين الأشجار...',
        choiceAt: 8, endingType: null,
        choices: [
          { id: 'c2a1', text: 'اقترب من النور',    icon: '💡', nextChapterId: 'c3a', consequence: 'قد تجد مساعدة' },
          { id: 'c2a2', text: 'ابتعد وأكمل طريقك', icon: '🚶', nextChapterId: 'c3b', consequence: 'الأمان أهم' },
        ],
      },
      c2b: {
        id: 'c2b', title: 'الجبال',
        description: 'صعدت الجبال والعاصفة تقترب...',
        videoUrl: V.mountain,
        videoThumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
        choicePrompt: 'العاصفة اشتدت — قرار سريع!',
        choiceAt: 8, endingType: null,
        choices: [
          { id: 'c2b1', text: 'احتمِ في الكهف القريب', icon: '🕳️', nextChapterId: 'c3c', consequence: 'ريح في أمان' },
          { id: 'c2b2', text: 'أكمل رغم العاصفة',      icon: '⚡', nextChapterId: 'c3d', consequence: 'شجاعة أو تهور؟' },
        ],
      },
      c3a: {
        id: 'c3a', title: 'الرفيق الغامض',
        description: 'وجدت شخصاً غريباً يعرف طريق المدينة...',
        videoUrl: V.city,
        videoThumbnail: 'https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=800&q=80',
        choicePrompt: 'هل تثق بهذا الغريب؟',
        choiceAt: 8, endingType: null,
        choices: [
          { id: 'c3a1', text: 'ثق به واتبعه',    icon: '🤝', nextChapterId: 'end-good',    consequence: '' },
          { id: 'c3a2', text: 'ارفض وكمّل وحدك', icon: '🗺️', nextChapterId: 'end-neutral', consequence: '' },
        ],
      },
      c3b: {
        id: 'c3b', title: 'الطريق الوحيد',
        description: 'المدينة محاطة بسور ضخم...',
        videoUrl: V.desert,
        videoThumbnail: 'https://images.unsplash.com/photo-1480497490787-505ec076689f?w=800&q=80',
        choicePrompt: 'باب السور مغلق — ماذا تفعل؟',
        choiceAt: 8, endingType: null,
        choices: [
          { id: 'c3b1', text: 'دوّر على مدخل سري', icon: '🔑', nextChapterId: 'end-good',    consequence: '' },
          { id: 'c3b2', text: 'اطرق الباب بشجاعة', icon: '🚪', nextChapterId: 'end-neutral', consequence: '' },
        ],
      },
      c3c: {
        id: 'c3c', title: 'أسرار الكهف',
        description: 'الكهف مليء بنقوش قديمة...',
        videoUrl: V.cave,
        videoThumbnail: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80',
        choicePrompt: 'النقوش تكشف سر المدينة — الثمن كبير!',
        choiceAt: 8, endingType: null,
        choices: [
          { id: 'c3c1', text: 'اقبل الشرط', icon: '📜', nextChapterId: 'end-epic', consequence: 'نهاية أسطورية!' },
          { id: 'c3c2', text: 'ارفض وارحل', icon: '🚶', nextChapterId: 'end-bad',  consequence: '' },
        ],
      },
      c3d: {
        id: 'c3d', title: 'في قلب العاصفة',
        description: 'وصلت المدينة لكن جسدك منهك...',
        videoUrl: V.rain,
        videoThumbnail: 'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=800&q=80',
        choicePrompt: 'باب المدينة مفتوح...',
        choiceAt: 8, endingType: null,
        choices: [
          { id: 'c3d1', text: 'ادخل بلا تردد',   icon: '⚔️', nextChapterId: 'end-epic', consequence: '' },
          { id: 'c3d2', text: 'توقف وراقب أولاً', icon: '👁️', nextChapterId: 'end-good', consequence: '' },
        ],
      },
      'end-good':    { id: 'end-good',    title: 'نهاية سعيدة ✨',       description: 'وجدت المدينة وحللت لغزها!',                  videoUrl: V.sunrise, videoThumbnail: '', choicePrompt: null, choiceAt: null, choices: [], endingType: 'good',    points: 150 },
      'end-neutral': { id: 'end-neutral', title: 'نهاية متوسطة 🌤️',     description: 'أكملت الرحلة لكن المدينة احتفظت بأسرارها.', videoUrl: V.ocean,   videoThumbnail: '', choicePrompt: null, choiceAt: null, choices: [], endingType: 'neutral', points: 80  },
      'end-bad':     { id: 'end-bad',     title: 'نهاية محزنة 🌑',       description: 'الخوف أوقفك عن أعظم اكتشاف.',               videoUrl: V.rain,    videoThumbnail: '', choicePrompt: null, choiceAt: null, choices: [], endingType: 'bad',     points: 30  },
      'end-epic':    { id: 'end-epic',    title: 'النهاية الأسطورية 🏆', description: 'أصبحت حارس المدينة المنسية!',                  videoUrl: V.ruins,   videoThumbnail: '', choicePrompt: null, choiceAt: null, choices: [], endingType: 'epic',    points: 300 },
    },
  },

  {
    id: 'story-2',
    title: 'الغرفة 404',
    description: 'استيقظت في فندق غريب — لا تتذكر كيف وصلت، ولا كيف ستخرج.',
    genre: 'mystery',
    cover: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=800&q=80',
    totalChapters: 5, plays: 1923, rating: 4.6,
    startChapterId: 'm1',
    chapters: {
      m1: {
        id: 'm1', title: 'الصحوة',
        description: 'مكان غريب، رائحة عجيبة، باب مقفل...',
        videoUrl: V.rain,
        videoThumbnail: 'https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?w=800&q=80',
        choicePrompt: 'وجدت مفتاحاً تحت الوسادة...',
        choiceAt: 8, endingType: null,
        choices: [
          { id: 'm1a', text: 'استخدم المفتاح على الباب', icon: '🚪', nextChapterId: 'm2a', consequence: '' },
          { id: 'm1b', text: 'افحص الغرفة أولاً',         icon: '🔦', nextChapterId: 'm2b', consequence: 'معلومات مفيدة' },
        ],
      },
      m2a: {
        id: 'm2a', title: 'الممر',
        description: 'ممر طويل — وصوت خطوات خلفك...',
        videoUrl: V.city,
        videoThumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
        choicePrompt: 'الخطوات تقترب — ماذا تفعل؟',
        choiceAt: 8, endingType: null,
        choices: [
          { id: 'm2a1', text: 'اركض بأقصى سرعة',      icon: '🏃', nextChapterId: 'mend-escape', consequence: '' },
          { id: 'm2a2', text: 'استدر واواجه ما خلفك', icon: '👊', nextChapterId: 'mend-truth',  consequence: '' },
        ],
      },
      m2b: {
        id: 'm2b', title: 'الأدلة',
        description: 'وجهك في كل صورة على الحائط!',
        videoUrl: V.cave,
        videoThumbnail: 'https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=800&q=80',
        choicePrompt: 'الصور تكشف شيئاً مروعاً...',
        choiceAt: 8, endingType: null,
        choices: [
          { id: 'm2b1', text: 'خذ الصور واهرب',    icon: '📸', nextChapterId: 'mend-truth',   consequence: '' },
          { id: 'm2b2', text: 'ابق وافهم ما يحدث', icon: '🧩', nextChapterId: 'mend-mystery', consequence: 'النهاية الكاملة' },
        ],
      },
      'mend-escape':  { id: 'mend-escape',  title: 'الهروب 🌅',      description: 'هربت — لكن هل خرجت فعلاً؟',     videoUrl: V.sunrise, videoThumbnail: '', choicePrompt: null, choiceAt: null, choices: [], endingType: 'neutral', points: 70  },
      'mend-truth':   { id: 'mend-truth',   title: 'الحقيقة 🔮',     description: 'الفندق كان داخلك أنت!',          videoUrl: V.ocean,   videoThumbnail: '', choicePrompt: null, choiceAt: null, choices: [], endingType: 'good',    points: 200 },
      'mend-mystery': { id: 'mend-mystery', title: 'اللغز الكامل 🏆', description: 'معرفتك ستغير العالم.',           videoUrl: V.space,   videoThumbnail: '', choicePrompt: null, choiceAt: null, choices: [], endingType: 'epic',    points: 350 },
    },
  },

  {
    id: 'story-3',
    title: 'آخر إنسان',
    description: 'عام 2157 — الأرض هجرها البشر، لكن أنت بقيت. لماذا؟',
    genre: 'scifi',
    cover: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&q=80',
    totalChapters: 5, plays: 3241, rating: 4.9,
    startChapterId: 'sf1',
    chapters: {
      sf1: {
        id: 'sf1', title: 'الصحراء الرقمية',
        description: 'وحدك في مدينة صامتة — والشبكة تبث رسالة...',
        videoUrl: V.space,
        videoThumbnail: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&q=80',
        choicePrompt: '"ابحث عن المحطة 7"',
        choiceAt: 8, endingType: null,
        choices: [
          { id: 'sf1a', text: 'اتجه للمحطة فوراً',        icon: '📡', nextChapterId: 'sf2a', consequence: '' },
          { id: 'sf1b', text: 'ابحث عن أسلحة ومؤن أولاً', icon: '🎒', nextChapterId: 'sf2b', consequence: 'تحضير أفضل' },
        ],
      },
      sf2a: {
        id: 'sf2a', title: 'المحطة 7',
        description: 'ذكاء اصطناعي لا يزال حياً يريد مساعدتك...',
        videoUrl: V.city,
        videoThumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80',
        choicePrompt: 'يريد مساعدتك — لكن بثمن...',
        choiceAt: 8, endingType: null,
        choices: [
          { id: 'sf2a1', text: 'اقبل العرض',        icon: '🤖', nextChapterId: 'sfend-ai',    consequence: '' },
          { id: 'sf2a2', text: 'ارفض وأوقف تشغيله', icon: '⚡', nextChapterId: 'sfend-alone', consequence: '' },
        ],
      },
      sf2b: {
        id: 'sf2b', title: 'المخبأ',
        description: 'طفلة نائمة في كبسولة تجميد...',
        videoUrl: V.cave,
        videoThumbnail: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80',
        choicePrompt: 'ماذا تفعل؟',
        choiceAt: 8, endingType: null,
        choices: [
          { id: 'sf2b1', text: 'أيقظها',             icon: '👧', nextChapterId: 'sfend-hope', consequence: 'النهاية الأجمل' },
          { id: 'sf2b2', text: 'اتركها وأكمل مهمتك', icon: '🚀', nextChapterId: 'sfend-ai',   consequence: '' },
        ],
      },
      'sfend-ai':    { id: 'sfend-ai',    title: 'الاندماج 🤖',        description: 'أصبحت إنساناً من نوع جديد.',     videoUrl: V.space,   videoThumbnail: '', choicePrompt: null, choiceAt: null, choices: [], endingType: 'good', points: 180 },
      'sfend-alone': { id: 'sfend-alone', title: 'الوحدة الأبدية 🌑',  description: 'وحيد في كون صامت.',             videoUrl: V.desert,  videoThumbnail: '', choicePrompt: null, choiceAt: null, choices: [], endingType: 'bad',  points: 40  },
      'sfend-hope':  { id: 'sfend-hope',  title: 'البداية الجديدة 🌅', description: 'أنت والطفلة — بذرة إنسانية جديدة.', videoUrl: V.sunrise, videoThumbnail: '', choicePrompt: null, choiceAt: null, choices: [], endingType: 'epic', points: 400 },
    },
  },
]

export const ENDING_CONFIG = {
  epic:    { label: 'نهاية أسطورية', emoji: '🏆', color: 'text-gold-400',  bg: 'bg-gold-500/10  border-gold-500/30' },
  good:    { label: 'نهاية سعيدة',   emoji: '✨', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30' },
  neutral: { label: 'نهاية متوسطة',  emoji: '🌤️', color: 'text-mist-300',  bg: 'bg-mist-300/10  border-mist-300/30' },
  bad:     { label: 'نهاية محزنة',   emoji: '🌑', color: 'text-red-400',   bg: 'bg-red-500/10   border-red-500/30'  },
}
