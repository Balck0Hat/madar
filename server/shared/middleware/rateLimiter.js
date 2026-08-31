import rateLimit from "express-rate-limit";
import { env } from "../config/env.js";

const message = { success: false, error: { message: "طلبات كثيرة، حاول لاحقاً", code: "RATE_LIMITED" } };
const common = { windowMs: 15 * 60 * 1000, standardHeaders: true, legacyHeaders: false, message };

// الحدّ العام: يُطفأ بالطلب، ويُتخطّى دائماً في الاختبارات
export const rateLimiter = rateLimit({
  ...common,
  limit: env.rateLimit.max,
  skip: () => env.isTest || !env.rateLimit.enabled,
});

// حدّ الدخول: مفتاحه مستقلّ فلا يسقط مع الحدّ العام.
// skipSuccessfulRequests يعني أن العدّاد يحصي المحاولات الفاشلة وحدها،
// فمن يعرف كلمته لا يُحجب مهما دخل، ومن يخمّن يُحجب بعد خمسين محاولة.
export const authLimiter = rateLimit({
  ...common,
  limit: env.rateLimit.authMax,
  skipSuccessfulRequests: true,
  skip: () => env.isTest || !env.rateLimit.authEnabled,
});
