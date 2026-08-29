import { describe, it, expect } from "vitest";
import * as league from "../league.service.js";
import User from "../../users/user.model.js";
import Progress from "../../progress/progress.model.js";
import { weekKey } from "../../../shared/utils/week.js";

async function makeUsers(n, tier, xpOf = (i) => (n - i) * 10) {
  const users = [];
  for (let i = 0; i < n; i++) {
    const u = await User.create({ name: `م${i}`, email: `u${i}-${tier}@example.com`, password: "pass1234", tier });
    await Progress.create({ user: u._id, weeklyXp: xpOf(i), weekKey: weekKey() });
    users.push(u);
  }
  return users;
}

describe("league.service standings", () => {
  it("should rank users of the same tier by weekly xp and mark me", async () => {
    const users = await makeUsers(3, 2);
    const s = await league.standings(users[2]._id);
    expect(s.tierName).toBe("فضة");
    expect(s.rows.map((r) => r.name)).toEqual(["م0", "م1", "م2"]);
    expect(s.myRank).toBe(3);
    expect(s.active).toBe(false);
    expect(s.rows.some((r) => r.email)).toBe(false);
  });
});

describe("league.service rollover", () => {
  it("should promote the top 7 and relegate the bottom 5 in a full group, then reset weekly xp", async () => {
    const users = await makeUsers(14, 1);
    // التدوير يجري فجر الاثنين: الأسبوع السابق هو أسبوع "الأمس"
    const monday = new Date(); monday.setDate(monday.getDate() + ((8 - (monday.getDay() || 7)) % 7 || 7)); monday.setHours(0, 5, 0, 0);
    await Progress.updateMany({}, { $set: { weekKey: weekKey(new Date(monday.getTime() - 864e5)) } });
    const out = await league.rollover(monday);
    expect(out.moved).toBe(12);
    const top = await User.findById(users[0]._id).lean();
    const bottom = await User.findById(users[13]._id).lean();
    const mid = await User.findById(users[8]._id).lean();
    expect(top.tier).toBe(2);
    expect(bottom.tier).toBe(0);
    expect(mid.tier).toBe(1);
    const p = await Progress.findOne({ user: users[0]._id }).lean();
    expect(p.weeklyXp).toBe(0);
    expect(p.lastLeague).toMatchObject({ outcome: "up", rank: 1, tier: 1 });
  });

  it("should not move anyone in a small group", async () => {
    await makeUsers(5, 3);
    const lastWeek = weekKey(new Date(Date.now() - 7 * 864e5));
    await Progress.updateMany({}, { $set: { weekKey: lastWeek } });
    const out = await league.rollover();
    expect(out.moved).toBe(0);
    expect((await User.find({ tier: 3 }).countDocuments())).toBe(5);
  });
});
