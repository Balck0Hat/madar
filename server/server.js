import { env } from "./shared/config/env.js";
import { connectDb, disconnectDb } from "./shared/database/connect.js";
import { createApp } from "./app.js";
import { startScheduler } from "./shared/jobs/scheduler.js";
import { seedUnits } from "./features/content/content.service.js";
import { SEED_UNITS } from "./shared/data/seed/index.js";

async function main() {
  await connectDb();
  const app = await createApp();
  await seedUnits(SEED_UNITS);
  // المهام المجدولة تُحقن بخدمات الميزات من هنا (لا تستورد الميزات بعضها)
  const [push, reviews, progress, league] = await Promise.all([
    import("./features/push/push.service.js"),
    import("./features/reviews/reviews.service.js"),
    import("./features/progress/progress.service.js"),
    import("./features/league/league.service.js"),
  ]);
  const jobs = startScheduler({ push, reviews, progress, league });
  const server = app.listen(env.port, "0.0.0.0", () => {
    console.log(`[madar] ${env.nodeEnv} server on http://0.0.0.0:${env.port} · ai=${Boolean(env.anthropicKey)} push=${env.pushEnabled} google=${env.googleEnabled}`);
  });
  const shutdown = async (signal) => {
    console.log(`[madar] ${signal} received, shutting down`);
    jobs.forEach((j) => j.stop());
    server.close(async () => { await disconnectDb(); process.exit(0); });
    setTimeout(() => process.exit(1), 8000).unref();
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

main().catch((err) => {
  console.error("[madar] failed to start", err);
  process.exit(1);
});
