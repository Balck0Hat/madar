import cron from "node-cron";
import { env } from "../config/env.js";
import { dayKey } from "../utils/game.js";
import { models } from "../utils/models.js";

// المهام المجدولة: تذكير صباحي بالمراجعة، تذكير مسائي بالسلسلة، وتدوير الدوري كل اثنين
export function startScheduler({ push, reviews, progress, league }) {
  if (env.isTest) return [];
  const jobs = [];

  jobs.push(cron.schedule("0 8 * * *", async () => {
    try {
      const users = await reviews.usersWithDue();
      const allowed = await optedIn(users);
      let sent = 0;
      for (const u of allowed) sent += await push.sendToUser(u, { title: "مراجعة الصباح", body: "3 دقائق تثبّت ما تعلمته أمس.", url: "/?screen=review", tag: "review" });
      console.log(`[jobs] morning review: ${sent} pushes`);
    } catch (err) { console.error("[jobs] morning review failed", err); }
  }));

  jobs.push(cron.schedule("0 20 * * *", async () => {
    try {
      const users = await progress.usersAtRiskOfStreak(dayKey());
      const allowed = await optedIn(users);
      let sent = 0;
      for (const u of allowed) sent += await push.sendToUser(u, { title: "سلسلتك في خطر", body: "وحدة واحدة قبل منتصف الليل تحفظ سلسلتك.", url: "/", tag: "streak" });
      console.log(`[jobs] streak reminder: ${sent} pushes`);
    } catch (err) { console.error("[jobs] streak reminder failed", err); }
  }));

  jobs.push(cron.schedule("5 0 * * 1", async () => {
    try { console.log("[jobs] league rollover", await league.rollover()); }
    catch (err) { console.error("[jobs] league rollover failed", err); }
  }));

  console.log(`[jobs] scheduler started (${jobs.length} jobs, TZ=${process.env.TZ || "system"})`);
  return jobs;
}

async function optedIn(userIds) {
  if (!userIds.length) return [];
  const users = await models.User().find({ _id: { $in: userIds }, "settings.reminders": true }).select("_id").lean();
  return users.map((u) => u._id);
}
