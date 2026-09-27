import { Clock3, BookOpen, Landmark, Users, BarChart3, ScrollText, Link2, Signpost } from "lucide-react";

// مشهد العالم: لوحة منطقية 1600×1100، القلعة في المركز وثماني جزر حولها كما في الرسم المرجعي.
// لكل جزيرة مرساة (x,y)، وحجم، وجهة تُوضع فيها رقاقات قواعدها (يمين/يسار/أسفل/أعلى)، وأيقونة بنائها.
export const SCENE = { w: 1900, h: 1300, cx: 950, cy: 650 };

export const ISLANDS = {
  verbs: { x: 500, y: 240, r: 150, side: "left", icon: BookOpen },
  tenses: { x: 950, y: 200, r: 150, side: "right", icon: Clock3 },
  nouns: { x: 1420, y: 240, r: 150, side: "right", icon: Landmark },
  sentences: { x: 450, y: 650, r: 140, side: "left", icon: ScrollText },
  modifiers: { x: 1470, y: 650, r: 140, side: "right", icon: BarChart3 },
  clauses: { x: 560, y: 1050, r: 140, side: "left", icon: Link2 },
  pronouns: { x: 950, y: 1080, r: 140, side: "bottom", icon: Users },
  connectors: { x: 1370, y: 1050, r: 140, side: "right", icon: Signpost },
};

// مستويات التفصيل حسب التقريب (مثل خرائط الطرق): بعيد = الجزر فقط، ثم المجموعات، ثم القواعد
export const LOD = { groups: 0.5, chips: 0.62 };

export const CHIP = { h: 30, gap: 6, w: 178, col: 186 };

// مواضع رقاقات جزيرة: أعمدة إلى جانبها المحدد، كل مجموعة تحت عنوانها الصغير
export function chipPositions(island, groups) {
  const a = ISLANDS[island];
  const rows = groups.flatMap((g) => [{ kind: "group", id: g.id, title: g.title }, ...g.topics.map((t) => ({ kind: "topic", ...t }))]);
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

export const CLOUDS = [[80, 90, 1.2], [1650, 70, 1], [140, 880, 1.4], [1700, 860, 1.1], [760, 1230, 1.3], [1250, 1200, 0.9], [700, 470, 0.7], [1200, 440, 0.6]];
