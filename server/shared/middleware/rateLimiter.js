import rateLimit from "express-rate-limit";
import { env } from "../config/env.js";

const message = { success: false, error: { message: "طلبات كثيرة، حاول لاحقاً", code: "RATE_LIMITED" } };
// يُتخطّى في الاختبارات، ويُتخطّى ما لم يُشغَّل الحدّ صراحةً في البيئة
const skip = () => env.isTest || !env.rateLimit.enabled;
const common = { windowMs: 15 * 60 * 1000, standardHeaders: true, legacyHeaders: false, message, skip };

export const rateLimiter = rateLimit({ ...common, limit: env.rateLimit.max });
export const authLimiter = rateLimit({ ...common, limit: env.rateLimit.authMax, skipSuccessfulRequests: true });
