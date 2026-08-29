import { env } from "../config/env.js";

export const ACCESS_COOKIE = "madar_access";
export const REFRESH_COOKIE = "madar_refresh";

const base = { httpOnly: true, secure: env.cookieSecure, sameSite: "strict", path: "/" };

export function setAuthCookies(res, { access, refresh }) {
  res.cookie(ACCESS_COOKIE, access, { ...base, maxAge: 15 * 60 * 1000 });
  res.cookie(REFRESH_COOKIE, refresh, { ...base, maxAge: env.refreshTtlDays * 864e5 });
}

export function clearAuthCookies(res) {
  res.clearCookie(ACCESS_COOKIE, base);
  res.clearCookie(REFRESH_COOKIE, base);
}
