import { asyncHandler } from "../../shared/middleware/asyncHandler.js";
import { setAuthCookies, clearAuthCookies, REFRESH_COOKIE } from "../../shared/utils/cookies.js";
import { env } from "../../shared/config/env.js";
import { badRequest } from "../../shared/utils/AppError.js";
import * as authService from "./auth.service.js";
import * as google from "./google.service.js";

const STATE_COOKIE = "madar_oauth_state";

export const providers = (req, res) => res.json({ success: true, data: { google: env.googleEnabled, registrationOpen: env.registrationOpen } });

export const register = asyncHandler(async (req, res) => {
  const { user, tokens } = await authService.register(req.body);
  setAuthCookies(res, tokens);
  res.status(201).json({ success: true, data: { user } });
});

export const login = asyncHandler(async (req, res) => {
  const { user, tokens } = await authService.login(req.body);
  setAuthCookies(res, tokens);
  res.json({ success: true, data: { user } });
});

export const refresh = asyncHandler(async (req, res) => {
  try {
    const { user, tokens } = await authService.refresh(req.cookies?.[REFRESH_COOKIE]);
    setAuthCookies(res, tokens);
    res.json({ success: true, data: { user } });
  } catch (err) {
    clearAuthCookies(res);
    throw err;
  }
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.cookies?.[REFRESH_COOKIE]);
  clearAuthCookies(res);
  res.status(204).end();
});

// ── Google OAuth ──
export const googleStart = (req, res) => {
  if (!env.googleEnabled) throw badRequest("دخول Google غير مفعّل", "GOOGLE_DISABLED");
  const state = google.newState();
  res.cookie(STATE_COOKIE, state, { httpOnly: true, secure: env.cookieSecure, sameSite: "lax", maxAge: 10 * 60 * 1000, path: "/" });
  res.redirect(google.authorizeUrl(state));
};

export const googleCallback = asyncHandler(async (req, res) => {
  const { code, state, error } = req.query;
  const expected = req.cookies?.[STATE_COOKIE];
  res.clearCookie(STATE_COOKIE, { path: "/" });
  if (error || !code || !state || state !== expected) return res.redirect(`${env.appUrl}/?auth=failed`);
  const profile = await google.fetchProfile(String(code));
  const { tokens, isNew } = await authService.loginWithProvider("google", profile);
  setAuthCookies(res, tokens);
  res.redirect(`${env.appUrl}/${isNew ? "?new=1" : ""}`);
});
