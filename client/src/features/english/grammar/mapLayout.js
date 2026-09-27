import { HUE } from "../../../shared/constants/theme";

// تخطيط الخريطة الذهنية: المركز في الوسط، أربعة فروع يميناً وأربعة يساراً، وكل فرع
// شجرة مرتّبة: المجموعات في عمود، والموضوعات في عمود أبعد، صفّاً صفّاً بلا تراكب.
// الإحداثيات نسبةً إلى المركز (0,0)؛ الموجب يميناً وأسفل.
export const ROW = 50; // ارتفاع صفّ الموضوع
export const X = { branch: 250, group: 470, topic: 700 }; // بُعد كل عمق عن المركز
const GAP_GROUP = 12, GAP_BRANCH = 40;

export const hueOf = (hue) => HUE[hue] || HUE.slate;

export function layout(branches) {
  const nodes = [{ id: "root", kind: "center", x: 0, y: 0, title: "قواعد الإنجليزية", en: "English Grammar" }];
  const edges = [];
  const sides = [branches.filter((_, i) => i % 2 === 0), branches.filter((_, i) => i % 2 === 1)];
  let maxHalf = 0;
  sides.forEach((list, si) => {
    const dir = si === 0 ? 1 : -1;
    const heightOf = (b) => b.groups.reduce((h, g) => h + g.topics.length * ROW, 0) + (b.groups.length - 1) * GAP_GROUP;
    const total = list.reduce((h, b) => h + heightOf(b), 0) + (list.length - 1) * GAP_BRANCH;
    let y = -total / 2;
    for (const b of list) {
      const hue = hueOf(b.hue);
      const gStart = y;
      const groupYs = [];
      for (const g of b.groups) {
        const topicYs = [];
        for (const t of g.topics) {
          const ty = y + ROW / 2;
          nodes.push({ ...t, kind: "topic", x: dir * X.topic, y: ty, hue, branch: b.id, group: g.id, side: dir });
          topicYs.push(ty); y += ROW;
        }
        const gy = topicYs.reduce((a, c) => a + c, 0) / topicYs.length;
        nodes.push({ id: g.id, kind: "group", title: g.title, en: g.en, x: dir * X.group, y: gy, hue, branch: b.id, side: dir, count: g.topics.length });
        for (const t of g.topics) edges.push({ from: g.id, to: t.id, hue });
        groupYs.push(gy); y += GAP_GROUP;
      }
      y -= GAP_GROUP;
      const by = groupYs.reduce((a, c) => a + c, 0) / groupYs.length;
      nodes.push({ id: b.id, kind: "branch", title: b.title, en: b.en, x: dir * X.branch, y: by, hue, side: dir, count: b.groups.reduce((n, g) => n + g.topics.length, 0) });
      for (const g of b.groups) edges.push({ from: b.id, to: g.id, hue });
      edges.push({ from: "root", to: b.id, hue });
      maxHalf = Math.max(maxHalf, Math.abs(gStart), Math.abs(y));
      y += GAP_BRANCH;
    }
  });
  const half = maxHalf + ROW;
  return { nodes, edges, width: (X.topic + 190) * 2, height: half * 2, byId: new Map(nodes.map((n) => [n.id, n])) };
}

// منحنى أفقي بين عقدتين
export const link = (a, b) => { const mx = (a.x + b.x) / 2; return `M ${a.x} ${a.y} C ${mx} ${a.y}, ${mx} ${b.y}, ${b.x} ${b.y}`; };
