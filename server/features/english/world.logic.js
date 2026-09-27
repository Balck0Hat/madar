import { ISLANDS, MASTERY, BOSS_PASS } from "../../shared/data/english/tracks/world.js";

// منطق عالم القواعد، خالٍ من قاعدة البيانات: حالة كل عقدة وجزيرة، مهمة اليوم، وأسئلة الزعيم.
// mastery: { tag: pct } أفضل نسبة للمستخدم في الموضوع؛ boss: { islandId: pct } أفضل نتيجة زعيم.
export function computeWorld(mastery = {}, boss = {}) {
  let previousPassed = true; // الجزيرة الأولى مفتوحة دائماً
  const islands = ISLANDS.map((isl) => {
    const open = isl.side || previousPassed;
    const prereqs = (tag) => isl.edges.filter(([, to]) => to === tag).map(([from]) => from);
    const nodes = isl.nodes.map((tag) => {
      const pct = mastery[tag] ?? null;
      const mastered = pct !== null && pct >= MASTERY;
      const ready = prereqs(tag).every((p) => (mastery[p] ?? 0) >= MASTERY);
      return { tag, pct, prereqs: prereqs(tag), status: mastered ? "mastered" : open && ready ? "available" : "locked" };
    });
    const allMastered = nodes.every((n) => n.status === "mastered");
    const bossPct = boss[isl.id] ?? null;
    const passed = bossPct !== null && bossPct >= BOSS_PASS;
    const bossStatus = passed ? "passed" : open && allMastered ? "available" : "locked";
    if (!isl.side) previousPassed = passed;
    return { id: isl.id, title: isl.title, en: isl.en || "", level: isl.level, tone: isl.tone, side: Boolean(isl.side), open, nodes, edges: isl.edges, boss: { status: bossStatus, pct: bossPct }, mastered: nodes.filter((n) => n.status === "mastered").length };
  });
  const all = islands.flatMap((i) => i.nodes);
  return { islands, total: all.length, mastered: all.filter((n) => n.status === "mastered").length, bosses: islands.filter((i) => i.boss.status === "passed").length };
}

// مهمة اليوم: أضعف موضوع (من اختبار المستوى) متاح ولم يُتقن، وإلا أول عقدة متاحة في الترتيب
export function dailyQuest(world, weakTags = []) {
  const available = world.islands.flatMap((i) => i.nodes).filter((n) => n.status === "available");
  return available.find((n) => weakTags.includes(n.tag))?.tag || available[0]?.tag || null;
}

// أول عقدة يقف عليها اللاعب: آخر عقدة أتقنها في الترتيب، وإلا أول عقدة متاحة
export function playerNode(world) {
  const ordered = world.islands.filter((i) => !i.side).flatMap((i) => i.nodes);
  const lastMastered = [...ordered].reverse().find((n) => n.status === "mastered");
  return lastMastered?.tag || ordered.find((n) => n.status === "available")?.tag || ordered[0]?.tag || null;
}

// أسئلة الزعيم: n سؤالاً موزّعة على وسوم الجزيرة بالتساوي قدر الإمكان، يُفضَّل ما لم يُرَ
export function pickBossItems(pool, tags, n, seen = new Set(), rnd = Math.random) {
  const shuffle = (l) => l.map((x) => [rnd(), x]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
  const byTag = tags.map((t) => { const items = pool.filter((i) => i.tag === t); return [...shuffle(items.filter((i) => !seen.has(i.id))), ...shuffle(items.filter((i) => seen.has(i.id)))]; });
  const out = [];
  for (let round = 0; out.length < n && byTag.some((l) => l.length); round++) for (const list of byTag) { if (out.length >= n) break; const it = list.shift(); if (it) out.push(it); }
  return shuffle(out);
}
