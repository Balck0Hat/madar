import { describe, it, expect, beforeEach } from "vitest";
import * as content from "../content.service.js";
import Progress from "../../progress/progress.model.js";
import User from "../../users/user.model.js";
import { seedUnits } from "../../exam/__tests__/exam.fixtures.js";
import { uid } from "../../../shared/utils/units.js";

beforeEach(seedUnits);

const learner = async (email, unlockedRings = 0) => {
  const user = await User.create({ name: "ليان", email, password: "pass1234" });
  const done = [];
  for (let ring = 0; ring < unlockedRings; ring++) for (let i = 0; i < 8; i++) done.push(uid("human", ring, i));
  if (done.length) await Progress.create({ user: user._id, progress: new Map(done.map((id) => [id, { score: 10, total: 10 }])) });
  return user;
};

// أربع وعشرون وحدة في نداء واحد بدل أربعة وعشرين نداءً
describe("domain content for download", () => {
  it("should return the whole of ring one for a learner who just started", async () => {
    const user = await learner("a@example.com");
    const out = await content.getDomainForPrint("human", user._id);
    expect(out.rings.map((r) => r.ring)).toEqual([0]);
    expect(out.units).toBe(8);
    expect(out.lockedRings).toBe(2);
  });

  it("should open the next ring once the previous one is finished", async () => {
    const user = await learner("b@example.com", 1);
    const out = await content.getDomainForPrint("human", user._id);
    expect(out.rings.map((r) => r.ring)).toEqual([0, 1]);
    expect(out.units).toBe(16);
    expect(out.lockedRings).toBe(1);
  });

  it("should give the whole domain to a learner who finished it", async () => {
    const user = await learner("c@example.com", 2);
    const out = await content.getDomainForPrint("human", user._id);
    expect(out.units).toBe(24);
    expect(out.lockedRings).toBe(0);
  });

  // القفل ترتيب تعليمي، ولا يصحّ أن يلتفّ عليه زرّ تنزيل ما لا تفتحه الواجهة
  it("should never include a ring the learner cannot open", async () => {
    const user = await learner("d@example.com");
    const out = await content.getDomainForPrint("human", user._id);
    const ids = out.rings.flatMap((r) => r.units.map((u) => u.unitId));
    expect(ids.every((id) => id.split("-")[1] === "1")).toBe(true);
  });

  // الأسئلة أكثر من نصف حجم الوحدة، ولا تُطبع، وفيها بنك الامتحان المحجوز
  it("should carry no question bank and no database ids", async () => {
    const user = await learner("e@example.com", 2);
    const out = await content.getDomainForPrint("human", user._id);
    const units = out.rings.flatMap((r) => r.units);
    expect(units.every((u) => u.questions === undefined)).toBe(true);
    expect(units.every((u) => u._id === undefined)).toBe(true);
    expect(JSON.stringify(out)).not.toContain("examOnly");
  });

  it("should carry the prose, the lists and the summary that the file prints", async () => {
    const user = await learner("f@example.com");
    const out = await content.getDomainForPrint("human", user._id);
    const units = out.rings.flatMap((r) => r.units);
    expect(units.every((u) => u.title && u.cards?.length && u.summary?.length)).toBe(true);
    const cards = units.flatMap((u) => u.cards);
    expect(cards.some((c) => c.points?.length)).toBe(true);
    expect(cards.some((c) => c.after)).toBe(true);
  });

  it("should order the units within a ring", async () => {
    const user = await learner("g@example.com");
    const ids = (await content.getDomainForPrint("human", user._id)).rings[0].units.map((u) => u.unitId);
    expect(ids).toEqual([...ids].sort());
  });

  it("should refuse an unknown domain rather than return an empty file", async () => {
    const user = await learner("h@example.com");
    await expect(content.getDomainForPrint("nope", user._id)).rejects.toMatchObject({ code: "NO_UNITS" });
  });
});
