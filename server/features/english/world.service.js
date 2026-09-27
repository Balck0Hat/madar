import Practice from "./practice.model.js";
import Placement from "./placement.model.js";
import { PLACEMENT } from "../../shared/data/english/index.js";
import { LESSONS, lessonByTag } from "../../shared/data/english/tracks/index.js";
import { ISLANDS, BOSS_ITEMS, islandById } from "../../shared/data/english/tracks/world.js";
import { TAGS, TAG_EN } from "../../shared/data/english/tags.js";
import { models } from "../../shared/utils/models.js";
import { notFound, AppError } from "../../shared/utils/AppError.js";
import { stripQuestion } from "./tracks.logic.js";
import { computeWorld, dailyQuest, playerNode, pickBossItems } from "./world.logic.js";
import { attemptView } from "./tracks.service.js";

// عالم القواعد: حالة الجزر والعقد للمستخدم من تمارينه (درس، نقطة ضعف، زعيم) واختبار مستواه،
// ومهمة اليوم، وموضع اللاعب، ودبابيس الأصدقاء.

// أفضل نسبة لكل موضوع: من تمارين الدروس ونقاط الضعف، ومن اختبار المستوى (80٪ فأكثر في سؤالين فأكثر)
async function masteryOf(userId) {
  const [attempts, placement] = await Promise.all([
    Practice.find({ user: userId, kind: { $in: ["lesson", "weak", "boss"] }, finishedAt: { $ne: null } }).select("kind refId score").lean(),
    Placement.findOne({ user: userId, stage: "done", result: { $ne: null } }).sort("-finishedAt").select("result.skills.all result.skills.weak").lean(),
  ]);
  const mastery = {}, boss = {};
  for (const a of attempts) {
    const pct = a.score?.pct ?? 0;
    if (a.kind === "boss") boss[a.refId] = Math.max(boss[a.refId] ?? 0, pct);
    else mastery[a.refId] = Math.max(mastery[a.refId] ?? 0, pct);
  }
  for (const s of placement?.result?.skills?.all || []) if (s.n >= 2 && s.rate >= 80 && (mastery[s.key] ?? 0) < s.rate) mastery[s.key] = s.rate;
  return { mastery, boss, weak: (placement?.result?.skills?.weak || []).map((w) => w.key) };
}

// دبابيس الأصدقاء: أين يقف كل صديق (آخر موضوع تدرّب عليه)
async function friendPins(userId) {
  const links = await models.Friendship().find({ status: "accepted", $or: [{ from: userId }, { to: userId }] }).select("from to").lean();
  const ids = links.map((l) => (String(l.from) === String(userId) ? l.to : l.from));
  if (!ids.length) return [];
  const [users, last] = await Promise.all([
    models.User().find({ _id: { $in: ids } }).select("name").lean(),
    Practice.aggregate([{ $match: { user: { $in: ids }, kind: { $in: ["lesson", "weak"] }, finishedAt: { $ne: null } } }, { $sort: { finishedAt: -1 } }, { $group: { _id: "$user", tag: { $first: "$refId" } } }]),
  ]);
  const byUser = new Map(last.map((l) => [String(l._id), l.tag]));
  return users.filter((u) => byUser.has(String(u._id))).map((u) => ({ name: u.name, tag: byUser.get(String(u._id)) }));
}

export async function getWorld(userId) {
  const { mastery, boss, weak } = await masteryOf(userId);
  const world = computeWorld(mastery, boss);
  const lessons = new Map(LESSONS.map((l) => [l.tag, l]));
  for (const isl of world.islands) for (const n of isl.nodes) {
    const l = lessons.get(n.tag);
    Object.assign(n, { title: TAGS[n.tag]?.label || n.tag, en: TAG_EN[n.tag] || "", level: l?.level || null, minutes: l?.minutes || null, topics: (l?.explain || []).map((e) => e.h), tip: TAGS[n.tag]?.tip || "" });
  }
  return { ...world, quest: dailyQuest(world, weak), player: playerNode(world), friends: await friendPins(userId).catch(() => []), bossItems: BOSS_ITEMS };
}

// امتحان الزعيم: 15 سؤالاً من مواضيع الجزيرة (البنك والدروس)، يُفضَّل ما لم يُرَ
export async function startBoss(userId, islandId) {
  const isl = islandById(islandId);
  if (!isl) throw notFound("الجزيرة غير موجودة", "ISLAND_NOT_FOUND");
  const { mastery, boss } = await masteryOf(userId);
  const state = computeWorld(mastery, boss).islands.find((i) => i.id === islandId);
  if (state.boss.status === "locked") throw new AppError("أتقن كل مواضيع الجزيرة أولاً", 400, "BOSS_LOCKED");
  const pool = [...PLACEMENT.grammar, ...isl.nodes.flatMap((t) => (lessonByTag(t)?.qs || []).map((q, i) => ({ ...q, id: `lesson:${t}#${i}`, tag: t })))];
  const seen = new Set((await Practice.find({ user: userId, kind: { $in: ["weak", "boss"] } }).select("itemIds").lean()).flatMap((a) => a.itemIds));
  const items = pickBossItems(pool, isl.nodes, BOSS_ITEMS, seen);
  await Practice.updateMany({ user: userId, kind: "boss", refId: islandId, finishedAt: null }, { $set: { finishedAt: new Date() } });
  const a = await Practice.create({ user: userId, kind: "boss", track: "general", refId: islandId, itemIds: items.map((i) => i.id) });
  return { attempt: attemptView(a), items: items.map((i) => ({ ...stripQuestion(i), id: i.id })), label: `زعيم ${isl.title}` };
}

export const islands = () => ISLANDS;
