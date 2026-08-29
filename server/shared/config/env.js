import dotenv from "dotenv";

dotenv.config();

const required = (key) => {
  const v = process.env[key];
  if (!v) throw new Error(`Missing required env var: ${key}`);
  return v;
};

const isTest = process.env.NODE_ENV === "test";

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  isProd: process.env.NODE_ENV === "production",
  isTest,
  port: Number(process.env.PORT || 3105),
  mongoUri: isTest ? required("MONGO_URI_TEST") : required("MONGO_URI"),
  jwtAccessSecret: required("JWT_ACCESS_SECRET"),
  jwtRefreshSecret: required("JWT_REFRESH_SECRET"),
  accessTtl: process.env.ACCESS_TTL || "15m",
  refreshTtlDays: Number(process.env.REFRESH_TTL_DAYS || 7),
  allowedOrigins: (process.env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean),
  cookieSecure: process.env.COOKIE_SECURE === "true",
  clientDist: process.env.CLIENT_DIST || "",
};

if (env.jwtAccessSecret.length < 32 || env.jwtRefreshSecret.length < 32) {
  throw new Error("JWT secrets must be at least 32 characters");
}
