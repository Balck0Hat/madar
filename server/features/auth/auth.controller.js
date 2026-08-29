import { asyncHandler } from "../../shared/middleware/asyncHandler.js";
import { setAuthCookies, clearAuthCookies, REFRESH_COOKIE } from "../../shared/utils/cookies.js";
import * as authService from "./auth.service.js";

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
