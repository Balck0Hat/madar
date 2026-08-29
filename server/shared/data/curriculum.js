// ثوابت المنهج المستخدمة في حساب النقاط (مرآة لما في الواجهة)
export const DOMAIN_IDS = ["human", "earth", "history", "society", "life", "arts", "religion", "tech", "matter", "tools"];
export const CENTER_COUNT = 3;
export const RINGS = 3;
export const UNITS_PER_RING = 8;

export const XP_LESSON = [50, 100, 200];
export const XP_QUIZ = [30, 60, 120];
export const XP_THREAD = 150;
export const PASS_RATIO = 0.7;

export const THREADS = [
  ["human-1-3", "tech-1-7"], ["history-1-7", "tech-1-6"], ["earth-1-5", "life-1-5"],
  ["society-1-2", "tools-1-2"], ["matter-1-7", "earth-1-1"], ["arts-1-3", "history-1-4"],
  ["religion-1-6", "arts-1-2"], ["life-1-7", "human-1-1"], ["center-1", "tools-1-8"],
];

export const BADGES = [
  { id: "first", test: (s) => s.units >= 1 },
  { id: "three", test: (s) => s.units >= 3 },
  { id: "perfect", test: (s) => s.perfects >= 1 },
  { id: "thread", test: (s) => s.threads >= 1 },
  { id: "center", test: (s) => s.centerDone },
  { id: "explorer", test: (s) => s.domainsTouched >= 3 },
  { id: "sector", test: (s) => s.sectors >= 1 },
  { id: "ten", test: (s) => s.units >= 10 },
];
