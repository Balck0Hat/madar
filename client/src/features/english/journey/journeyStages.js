// رحلة القواعد: الخلفية نظام إحداثيات. المعلم يُحجَّم ويُزاح
// حتى تنطبق أعرض حلقة في قاعدته على منصّته (عرضاً ومركزاً). label موضع اللافتة إن لم تتّسع تحت المنصّة. كل محطة على مركز منصّتها الفارغة في الصورة (بكسلات الصورة الأصلية
// 941×1672، تُحوَّل إلى نسب فتبقى المحاذاة مع أي عرض). w عرض المنصّة، ومنه يُحسب حجم المعلم فوقها.
export const WORLD = { src: "/maps/journey/world.webp", w: 941, h: 1672 };
const at = (x, y, w, extra = {}) => ({ x: x / WORLD.w, y: y / WORLD.h, w: w / WORLD.w, ...extra });

// من الأسفل إلى القمة؛ الترتيب ثابت ويطابق ISLANDS في الخادم
// base: موضع أعرض حلقة في قاعدة المعلم داخل صورته [x, y, عرضها] (مقاسة من الصور)، تُطابَق على المنصّة
export const STAGE_ART = {
  sentence: at(305, 1410, 325, { n: 1, asset: "/maps/journey/sentence.webp", base: [0.478, 0.759, 0.951], label: [305, 1500] }),
  time: at(650, 1095, 300, { n: 2, asset: "/maps/journey/time.webp", base: [0.508, 0.687, 0.853], label: [650, 1180] }),
  verb: at(318, 885, 290, { n: 3, asset: "/maps/journey/verb.webp", base: [0.495, 0.774, 0.932], label: [318, 972] }),
  connect: at(680, 710, 240, { n: 4, asset: "/maps/journey/connect.webp", base: [0.509, 0.693, 0.976], label: [690, 792] }),
  detail: at(393, 527, 245, { n: 5, asset: "/maps/journey/detail.webp", base: [0.484, 0.708, 0.943], label: [393, 606] }),
  natural: at(550, 350, 240, { n: 6, asset: "/maps/journey/natural.webp", base: [0.488, 0.701, 0.974], label: [285, 330] }),
  mastery: at(690, 203, 200, { n: 7, asset: "/maps/journey/mastery.webp", base: [0.487, 0.674, 0.972], scale: 1.1, label: [470, 150] }),
};

// الطريق المرسوم في الصورة بين كل منصّة والتي تليها (بكسلات الصورة)، لإضاءة ما قطعه الطالب منه
export const ROAD_LEGS = [
  [[290, 1410], [395, 1330], [470, 1250], [545, 1170], [655, 1090]],
  [[655, 1090], [548, 1012], [470, 975], [410, 928], [315, 885]],
  [[315, 885], [440, 835], [505, 798], [570, 748], [680, 710]],
  [[680, 710], [590, 650], [520, 610], [468, 572], [395, 525]],
  [[395, 525], [490, 482], [560, 455], [625, 420], [620, 385], [550, 345]],
  [[550, 345], [640, 300], [700, 268], [718, 238], [695, 200]],
];

// منحنى ناعم يمرّ بالنقاط (Catmull-Rom → Bézier)
export function smoothPath(points) {
  if (points.length < 2) return "";
  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const [p0, p1, p2, p3] = [points[i - 1] || points[i], points[i], points[i + 1], points[i + 2] || points[i + 1]];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${c1[0].toFixed(1)} ${c1[1].toFixed(1)}, ${c2[0].toFixed(1)} ${c2[1].toFixed(1)}, ${p2[0]} ${p2[1]}`;
  }
  return d;
}

// الطريق المقطوع: من المنصّة الأولى حتى المحطة الحالية
export const travelledPath = (current) => smoothPath(ROAD_LEGS.slice(0, current).flatMap((leg, i) => (i ? leg.slice(1) : leg)));

// حالة المحطات من بيانات العالم: مكتملة (اجتاز زعيمها)، حالية (أول مفتوحة لم تُجتز)، التالية، ومقفلة
export function buildJourney(world) {
  const main = (world?.islands || []).filter((i) => STAGE_ART[i.id]);
  const firstOpen = main.findIndex((i) => i.open && i.boss.status !== "passed");
  const done = firstOpen < 0 && main.length > 0;
  const current = done ? main.length - 1 : Math.max(0, firstOpen);
  const stages = main.map((isl, i) => ({
    ...isl, art: STAGE_ART[isl.id], index: i,
    status: isl.boss.status === "passed" ? "completed" : i === current ? "current" : i === current + 1 ? "next" : "locked",
    distance: Math.max(0, i - current),
    progress: { done: isl.mastered, total: isl.nodes.length },
  }));
  const total = world?.total || 0;
  return { stages, current, done, pct: total ? Math.round(((world.mastered || 0) / total) * 100) : 0 };
}

// درس «تابع» في المحطة الحالية: مهمة اليوم إن كانت فيها، وإلا أول درس متاح، وإلا الزعيم
export function nextStep(journey, quest) {
  const stage = journey.stages[journey.current];
  if (!stage || journey.done) return null;
  const node = stage.nodes.find((n) => n.tag === quest) || stage.nodes.find((n) => n.status === "available");
  if (node) return { kind: "lesson", stage, node, position: stage.nodes.indexOf(node) + 1 };
  if (stage.boss.status === "available") return { kind: "boss", stage };
  return null;
}
