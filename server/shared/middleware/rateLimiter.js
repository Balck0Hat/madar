import rateLimit from "express-rate-limit";
import { env } from "../config/env.js";

const message = { success: false, error: { message: "طلبات كثيرة، حاول لاحقاً", code: "RATE_LIMITED" } };
const common = { windowMs: 15 * 60 * 1000, standardHeaders: true, legacyHeaders: false, message, skip: () => env.isTest };

export const rateLimiter = rateLimit({ ...common, limit: 100 });
export const authLimiter = rateLimit({ ...common, limit: 5, skipSuccessfulRequests: true });
