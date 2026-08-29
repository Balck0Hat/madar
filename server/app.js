import express from "express";
import helmet from "helmet";
import cors from "cors";
import mongoSanitize from "express-mongo-sanitize";
import cookieParser from "cookie-parser";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { env } from "./shared/config/env.js";
import { rateLimiter } from "./shared/middleware/rateLimiter.js";
import { errorHandler, notFoundHandler } from "./shared/middleware/errorHandler.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API = "/api/v1";

// يكتشف features/*/*.routes.js تلقائياً ويسجّلها تحت /api/v1/<prefix>
async function mountFeatures(app) {
  const root = path.join(__dirname, "features");
  for (const feature of fs.readdirSync(root)) {
    const dir = path.join(root, feature);
    const file = fs.readdirSync(dir).find((f) => f.endsWith(".routes.js"));
    if (!file) continue;
    const mod = await import(pathToFileURL(path.join(dir, file)).href);
    app.use(API + (mod.prefix || `/${feature}`), mod.default);
  }
}

// يقدّم واجهة React المبنية (SPA) إن وُجدت
function mountClient(app) {
  if (!env.clientDist) return;
  const dist = path.resolve(__dirname, env.clientDist);
  if (!fs.existsSync(path.join(dist, "index.html"))) return;
  app.use(express.static(dist, { index: false, maxAge: "1h" }));
  app.get(/^(?!\/api\/).*/, (req, res) => res.sendFile(path.join(dist, "index.html")));
}

export async function createApp() {
  const app = express();
  app.set("trust proxy", 1);
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({ origin: env.allowedOrigins.length ? env.allowedOrigins : false, credentials: true }));
  app.use(express.json({ limit: "10kb" }));
  app.use(mongoSanitize());
  app.use(cookieParser());
  app.use(API, rateLimiter);

  app.get(`${API}/health`, (req, res) => res.json({ success: true, data: { status: "ok", env: env.nodeEnv } }));
  await mountFeatures(app);
  app.use(API, notFoundHandler);
  mountClient(app);
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
