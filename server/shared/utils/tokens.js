import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { env } from "../config/env.js";

export const signAccess = (userId) => jwt.sign({ sub: String(userId), type: "access" }, env.jwtAccessSecret, { expiresIn: env.accessTtl });

export const signRefresh = (userId, jti) =>
  jwt.sign({ sub: String(userId), jti, type: "refresh" }, env.jwtRefreshSecret, { expiresIn: `${env.refreshTtlDays}d` });

export const verifyAccess = (token) => jwt.verify(token, env.jwtAccessSecret);
export const verifyRefresh = (token) => jwt.verify(token, env.jwtRefreshSecret);

export const newJti = () => crypto.randomBytes(24).toString("hex");

// رموز التحديث تُخزَّن مجزَّأة فقط
export const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

export const refreshExpiry = () => new Date(Date.now() + env.refreshTtlDays * 864e5);
