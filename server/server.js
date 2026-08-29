import { env } from "./shared/config/env.js";
import { connectDb, disconnectDb } from "./shared/database/connect.js";
import { createApp } from "./app.js";

async function main() {
  await connectDb();
  const app = await createApp();
  const server = app.listen(env.port, "0.0.0.0", () => {
    console.log(`[madar] ${env.nodeEnv} server on http://0.0.0.0:${env.port}`);
  });
  const shutdown = async (signal) => {
    console.log(`[madar] ${signal} received, shutting down`);
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
