import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// إطفاء الحدّ العام قرار راحة أثناء التصفّح. لو أسقط معه حدَّ الدخول
// لصار الموقع مفتوحاً لتخمين كلمات السرّ على الحسابات القائمة، بلا أن
// يقصد ذلك أحد. هذه الحراسة تثبّت استقلال المفتاحين.
const loadEnv = async () => {
  vi.resetModules();
  return (await import("../env.js")).env;
};

const KEYS = ["RATE_LIMIT_ENABLED", "RATE_LIMIT_AUTH_ENABLED", "RATE_LIMIT_MAX", "RATE_LIMIT_AUTH_MAX"];
let saved;

beforeEach(() => { saved = Object.fromEntries(KEYS.map((k) => [k, process.env[k]])); });
afterEach(() => {
  for (const k of KEYS) { if (saved[k] === undefined) delete process.env[k]; else process.env[k] = saved[k]; }
});

describe("rate limit switches", () => {
  it("should keep the login limit on when the general limit is switched off", async () => {
    process.env.RATE_LIMIT_ENABLED = "false";
    delete process.env.RATE_LIMIT_AUTH_ENABLED;
    const env = await loadEnv();
    expect(env.rateLimit.enabled).toBe(false);
    expect(env.rateLimit.authEnabled).toBe(true);
  });

  it("should protect login by default when the flag is absent", async () => {
    // dotenv يعيد ملء المتغيّر من ملف .env عند كل استيراد، فالافتراض
    // يُتحقَّق من الاشتقاق نفسه: نشرة بلا إعداد يجب أن تكون محميّة.
    const src = await import("node:fs").then((fs) => fs.readFileSync(new URL("../env.js", import.meta.url), "utf8"));
    expect(src).toMatch(/authEnabled:\s*process\.env\.RATE_LIMIT_AUTH_ENABLED !== "false"/);
  });

  it("should let the login limit be switched off only by its own flag", async () => {
    process.env.RATE_LIMIT_AUTH_ENABLED = "false";
    const env = await loadEnv();
    expect(env.rateLimit.authEnabled).toBe(false);
  });

  it("should count only failed attempts, so a real user is never locked out", async () => {
    const src = await import("node:fs").then((fs) => fs.readFileSync(new URL("../../middleware/rateLimiter.js", import.meta.url), "utf8"));
    expect(src).toContain("skipSuccessfulRequests: true");
    // المفتاحان مقروءان من إعدادين مختلفين لا من واحد
    expect(src).toContain("env.rateLimit.enabled");
    expect(src).toContain("env.rateLimit.authEnabled");
  });
});
