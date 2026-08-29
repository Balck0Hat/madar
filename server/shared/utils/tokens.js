import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { env } from "../config/env.js";

// رمز الوصول يحمل الدور ليُفحص دون قراءة قاعدة البيانات في كل طلب
export const signAccess = (user) =>
  jwt.sign({ sub: String(user._id || user), role: user.role || "user", type: "access" }, env.jwtAccessSecret, { expiresIn: env.accessTtl });

export const signRefresh = (userId, jti) =>
  jwt.sign({ sub: String(userId), jti, type: "refresh" }, env.jwtRefreshSecret, { expiresIn: `${env.refreshTtlDays}d` });

export const verifyAccess = (token) => jwt.verify(token, env.jwtAccessSecret);
export const verifyRefresh = (token) => jwt.verify(token, env.jwtRefreshSecret);

export const newJti = () => crypto.randomBytes(24).toString("hex");
export const randomCode = (n = 5) => crypto.randomBytes(8).toString("base64url").replace(/[^A-Z0-9]/gi, "").toUpperCase().padEnd(n, "X").slice(0, n);

// رموز التحديث تُخزَّن مجزَّأة فقط
export const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

export const refreshExpiry = () => new Date(Date.now() + env.refreshTtlDays * 864e5);
