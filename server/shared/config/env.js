import dotenv from "dotenv";

dotenv.config();

const required = (key) => {
  const v = process.env[key];
  if (!v) throw new Error(`Missing required env var: ${key}`);
  return v;
};
const list = (v) => (v || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);

const isTest = process.env.NODE_ENV === "test";

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  isProd: process.env.NODE_ENV === "production",
  isTest,
  port: Number(process.env.PORT || 3105),
  appUrl: (process.env.APP_URL || `http://localhost:${process.env.PORT || 3105}`).replace(/\/$/, ""),
  mongoUri: isTest ? required("MONGO_URI_TEST") : required("MONGO_URI"),
  jwtAccessSecret: required("JWT_ACCESS_SECRET"),
  jwtRefreshSecret: required("JWT_REFRESH_SECRET"),
  accessTtl: process.env.ACCESS_TTL || "15m",
  refreshTtlDays: Number(process.env.REFRESH_TTL_DAYS || 7),
  allowedOrigins: (process.env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean),
  cookieSecure: process.env.COOKIE_SECURE === "true",
  clientDist: process.env.CLIENT_DIST || "",
  adminEmails: list(process.env.ADMIN_EMAILS),
  vapid: { publicKey: process.env.VAPID_PUBLIC_KEY || "", privateKey: process.env.VAPID_PRIVATE_KEY || "", subject: process.env.VAPID_SUBJECT || "mailto:admin@example.com" },
  anthropicKey: process.env.ANTHROPIC_API_KEY || "",
  aiModel: process.env.AI_MODEL || "claude-opus-5",
  google: { clientId: process.env.GOOGLE_CLIENT_ID || "", clientSecret: process.env.GOOGLE_CLIENT_SECRET || "" },
  // التسجيل مغلق ما لم يُفتح صراحةً: الافتراض الآمن أن الباب مقفل
  registrationOpen: process.env.REGISTRATION_OPEN === "true",
  // حدّ الطلبات مطفأ ما لم يُشغَّل صراحةً. يبقى موصولاً بالمسارات
  // ليعود بمتغيّر واحد حين يُفتح الموقع للناس.
  rateLimit: {
    enabled: process.env.RATE_LIMIT_ENABLED === "true",
    max: Number(process.env.RATE_LIMIT_MAX || 1000),
    authMax: Number(process.env.RATE_LIMIT_AUTH_MAX || 50),
  },
};

env.pushEnabled = Boolean(env.vapid.publicKey && env.vapid.privateKey);
env.googleEnabled = Boolean(env.google.clientId && env.google.clientSecret);

if (env.jwtAccessSecret.length < 32 || env.jwtRefreshSecret.length < 32) {
  throw new Error("JWT secrets must be at least 32 characters");
}
