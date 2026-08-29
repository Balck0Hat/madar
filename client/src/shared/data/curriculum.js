// ثوابت المنهج: المدارات والنقاط والمركز والخيوط والأوسمة والدوري
export const RING_NAMES = ["المدار الأول", "المدار الثاني", "المدار الثالث"];
export const RING_MIN = [40, 60, 90];
export const XP_LESSON = [50, 100, 200];
export const XP_QUIZ = [30, 60, 120];
export const XP_THREAD = 150;

export const CENTER = [
  "كيف يتعلم دماغك، وكيف يعمل مدار",
  "كيف تقرأ كتاباً أو مقالاً وتحتفظ بما فيه",
  "كيف تفكر بوضوح: الحجة والدليل والرأي",
];

// إجمالي وحدات المدار الأول: 3 في المركز + 10 مجالات × 8
export const RING1_TOTAL = 3 + 80;

// خيوط المعرفة: أزواج من الوحدات في مجالين مختلفين
export const THREADS = [
  ["human-1-3", "tech-1-7"], ["history-1-7", "tech-1-6"], ["earth-1-5", "life-1-5"],
  ["society-1-2", "tools-1-2"], ["matter-1-7", "earth-1-1"], ["arts-1-3", "history-1-4"],
  ["religion-1-6", "arts-1-2"], ["life-1-7", "human-1-1"], ["center-1", "tools-1-8"],
];

export const BADGES = [
  { id: "first", name: "الخطوة الأولى", desc: "أكملت أول وحدة", test: (s) => s.units >= 1 },
  { id: "three", name: "على الطريق", desc: "ثلاث وحدات", test: (s) => s.units >= 3 },
  { id: "perfect", name: "علامة كاملة", desc: "كل الأسئلة صحيحة من أول محاولة", test: (s) => s.perfects >= 1 },
  { id: "thread", name: "أول خيط", desc: "ربطت مجالين ببعضهما", test: (s) => s.threads >= 1 },
  { id: "center", name: "من المركز", desc: "أنهيت وحدات المركز الثلاث", test: (s) => s.centerDone },
  { id: "explorer", name: "مستكشف", desc: "وحدات في ثلاثة مجالات مختلفة", test: (s) => s.domainsTouched >= 3 },
  { id: "sector", name: "قطاع مكتمل", desc: "ثماني وحدات في مجال واحد", test: (s) => s.sectors >= 1 },
  { id: "ten", name: "عشرة", desc: "عشر وحدات مكتملة", test: (s) => s.units >= 10 },
];

export const LEAGUE = [
  ["ليان", 1240], ["أحمد", 1105], ["مريم", 980], ["يوسف", 915], ["نور", 870], ["عمر", 640], ["سلمى", 610],
  ["كرم", 540], ["هبة", 470], ["زيد", 390], ["رنا", 300], ["طارق", 210], ["دانا", 120], ["باسل", 60],
];

export const LEAGUE_TIERS = ["خشب", "برونز", "فضة", "ذهب", "ياقوت", "زمرد", "ماس", "مدار", "نجم", "شمس"];
