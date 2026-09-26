import { C } from "../../../shared/constants/theme";

// هندسة الجزيرة: العقد على مسار متعرّج من الأعلى إلى الأسفل، نسبةً إلى عرض الجزيرة وارتفاعها.
export const ROW = 15; // ارتفاع صفّ العقدة (٪ من viewBox 100)
export const TOP = 16, BOTTOM = 24;
export const islandHeight = (n) => TOP + n * ROW + BOTTOM;
export const nodePos = (i, n) => ({ x: n === 1 ? 50 : i % 2 ? 66 : 34, y: TOP + i * ROW + ROW / 2 });
export const bossPos = (n) => ({ x: 50, y: TOP + n * ROW + 10 });

// لون الجزيرة من نغمتها (رموز السمة فقط)
export const toneColor = (tone) => ({ green: C.green, gold: C.gold, red: C.red, ink: C.text, muted: C.muted }[tone] || C.gold);

// مسار منحنٍ بين عقدتين (لرسم الخط كأن قلماً يخطه)
export const curve = (a, b) => { const my = (a.y + b.y) / 2; return `M ${a.x} ${a.y} C ${a.x} ${my}, ${b.x} ${my}, ${b.x} ${b.y}`; };

// جسم الجزيرة: شكل غير منتظم قليلاً (لا مستطيل) مع «سُمك» أسفله للعمق
export const islandBody = (h) => `M 6 14 C 14 4, 40 2, 56 5 S 96 6, 95 22 L 96 ${h - 16} C 90 ${h - 4}, 60 ${h - 2}, 44 ${h - 5} S 6 ${h - 6}, 5 ${h - 22} Z`;

// ساعة الجهاز → سماء: ليل، فجر/غروب، نهار
export const skyOf = (hour) => (hour >= 20 || hour < 5 ? "night" : hour < 8 || hour >= 17 ? "dusk" : "day");
