import { Clock3, BookOpen, Landmark, Users, BarChart3, ScrollText, Link2, Signpost } from "lucide-react";

// مشهد العالم: لوحة منطقية 1600×1100، القلعة في المركز وثماني جزر حولها كما في الرسم المرجعي.
// لكل جزيرة مرساة (x,y)، وحجم، وجهة تُوضع فيها رقاقات قواعدها (يمين/يسار/أسفل/أعلى)، وأيقونة بنائها.
export const SCENE = { w: 1700, h: 1240, cx: 850, cy: 620 };

export const ISLANDS = {
  verbs: { x: 430, y: 290, r: 205, side: "left", icon: BookOpen },
  tenses: { x: 850, y: 215, r: 200, side: "right", icon: Clock3 },
  nouns: { x: 1270, y: 290, r: 205, side: "right", icon: Landmark },
  sentences: { x: 300, y: 690, r: 195, side: "left", icon: ScrollText },
  modifiers: { x: 1400, y: 690, r: 195, side: "right", icon: BarChart3 },
  clauses: { x: 470, y: 1030, r: 195, side: "left", icon: Link2 },
  pronouns: { x: 850, y: 1070, r: 195, side: "bottom", icon: Users },
  connectors: { x: 1230, y: 1030, r: 195, side: "right", icon: Signpost },
};
export const CENTER_R = 235;

// زينة بين الجزر: صخور طافية وضباب وماء، بأصول اللوحة نفسها (اسم الملف، x، y، العرض، الشفافية)
export const DECOR = [
  ["rock-medium", 620, 470, 90, 0.9], ["rock-small", 1080, 440, 60, 0.85], ["rock-large", 1060, 830, 110, 0.9], ["rock-moss", 560, 860, 80, 0.85], ["rock-small", 1250, 500, 55, 0.8],
  ["floating-islands", 40, 470, 190, 0.55], ["floating-islands", 1490, 440, 190, 0.55], ["water-splash", 700, 900, 110, 0.6], ["water-splash", 980, 300, 90, 0.5],
  ["fog", 180, 900, 260, 0.55], ["fog", 1300, 880, 260, 0.5], ["fog", 700, 560, 220, 0.35],
];
export const FRONT_CLOUDS = [["cloud-large", -40, 1080, 360, 0.95], ["cloud-medium", 1380, 1120, 300, 0.95], ["cloud-large", 620, 1160, 320, 0.9], ["cloud-small", 1080, 60, 180, 0.7], ["cloud-medium", 100, 120, 220, 0.8]];

// مستويات التفصيل حسب التقريب (مثل خرائط الطرق): بعيد = الجزر فقط، ثم المجموعات، ثم القواعد
export const LOD = { groups: 0.78, chips: 0.9 };

export const CHIP = { h: 30, gap: 6, w: 178, col: 186 };

// مواضع رقاقات جزيرة: أعمدة إلى جانبها المحدد، كل مجموعة تحت عنوانها الصغير
export function chipPositions(island, groups) {
  const a = ISLANDS[island];
  const rows = groups.flatMap((g) => [{ kind: "group", id: g.id, title: g.title, en: g.en }, ...g.topics.map((t) => ({ kind: "topic", ...t }))]);
  const perCol = a.side === "bottom" ? Math.ceil(rows.length / 3) : Math.ceil(rows.length / 2);
  const cols = Math.ceil(rows.length / perCol);
  return rows.map((row, i) => {
    const c = Math.floor(i / perCol), k = i % perCol;
    const colH = perCol * (CHIP.h + CHIP.gap);
    if (a.side === "bottom") return { ...row, x: a.x - ((cols - 1) * CHIP.col) / 2 + c * CHIP.col, y: a.y + a.r * 0.55 + 24 + k * (CHIP.h + CHIP.gap) };
    const dir = a.side === "right" ? 1 : -1;
    return { ...row, x: a.x + dir * (a.r * 0.9 + 40 + c * CHIP.col), y: a.y - colH / 2 + k * (CHIP.h + CHIP.gap) + CHIP.h / 2 };
  });
}

// جسر منحنٍ من القلعة إلى جزيرة
export const bridge = (isl) => { const a = ISLANDS[isl]; const mx = (SCENE.cx + a.x) / 2, my = (SCENE.cy + a.y) / 2 + 40; return `M ${SCENE.cx} ${SCENE.cy + 60} Q ${mx} ${my} ${a.x} ${a.y + a.r * 0.35}`; };

export const CLOUDS = [[60, 60, 1.1], [1450, 40, 1], [1500, 560, 0.8], [0, 560, 0.7], [640, 40, 0.6]];
