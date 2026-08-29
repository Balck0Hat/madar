import { models } from "../../shared/utils/models.js";
import { weekKey, weekEnd } from "../../shared/utils/week.js";

export const TIERS = ["خشب", "برونز", "فضة", "ذهب", "ياقوت", "زمرد", "ماس", "مدار", "نجم", "شمس"];
export const PROMOTE = 7;
export const RELEGATE = 5;
export const MIN_GROUP = 12;
const LIMIT = 30;

// ترتيب دوري المستخدم: كل من في طبقته مرتبين بنقاط الأسبوع
export async function standings(userId) {
  const User = models.User(), Progress = models.Progress();
  const me = await User.findById(userId).select("tier").lean();
  const tier = me?.tier ?? 0;
  const users = await User.find({ tier }).select("name handle").lean();
  const ids = users.map((u) => u._id);
  const progs = await Progress.find({ user: { $in: ids }, weekKey: weekKey() }).select("user weeklyXp").lean();
  const xpBy = new Map(progs.map((p) => [String(p.user), p.weeklyXp]));
  const rows = users
    .map((u) => ({ id: String(u._id), name: u.name, handle: u.handle, xp: xpBy.get(String(u._id)) || 0, me: String(u._id) === String(userId) }))
    .sort((a, b) => b.xp - a.xp || a.name.localeCompare(b.name, "ar"));
  const myRank = rows.findIndex((r) => r.me) + 1;
  const mine = await Progress.findOne({ user: userId }).select("lastLeague").lean();
  return {
    tier, tierName: TIERS[tier], tiers: TIERS, rows: rows.slice(0, LIMIT), total: rows.length, myRank,
    promote: PROMOTE, relegate: RELEGATE, minGroup: MIN_GROUP, active: rows.length >= MIN_GROUP,
    weekEnd: weekEnd(), lastLeague: mine?.lastLeague || null,
  };
}

// نهاية الأسبوع: صعود/هبوط لكل طبقة ثم تصفير نقاط الأسبوع
export async function rollover(now = new Date()) {
  const User = models.User(), Progress = models.Progress();
  const prev = weekKey(new Date(now.getTime() - 864e5));
  const users = await User.find().select("tier").lean();
  const progs = await Progress.find({ weekKey: prev }).select("user weeklyXp").lean();
  const xpBy = new Map(progs.map((p) => [String(p.user), p.weeklyXp]));
  const byTier = new Map();
  users.forEach((u) => { const t = u.tier ?? 0; if (!byTier.has(t)) byTier.set(t, []); byTier.get(t).push({ id: String(u._id), xp: xpBy.get(String(u._id)) || 0 }); });
  const userOps = [], progOps = [];
  for (const [tier, group] of byTier) {
    group.sort((a, b) => b.xp - a.xp);
    group.forEach((u, i) => {
      let outcome = "stay";
      if (group.length >= MIN_GROUP && i < PROMOTE && tier < TIERS.length - 1 && u.xp > 0) outcome = "up";
      else if (group.length >= MIN_GROUP && i >= group.length - RELEGATE && tier > 0) outcome = "down";
      const newTier = tier + (outcome === "up" ? 1 : outcome === "down" ? -1 : 0);
      if (newTier !== tier) userOps.push({ updateOne: { filter: { _id: u.id }, update: { $set: { tier: newTier } } } });
      progOps.push({ updateOne: { filter: { user: u.id }, update: { $set: { lastLeague: { week: prev, outcome, rank: i + 1, tier }, weeklyXp: 0, weekKey: weekKey(now) } } } });
    });
  }
  if (userOps.length) await User.bulkWrite(userOps);
  if (progOps.length) await Progress.bulkWrite(progOps);
  return { tiers: byTier.size, users: users.length, moved: userOps.length };
}
