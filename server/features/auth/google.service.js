import crypto from "node:crypto";
import { env } from "../../shared/config/env.js";
import { badRequest } from "../../shared/utils/AppError.js";

const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";

export const redirectUri = () => `${env.appUrl}/api/v1/auth/google/callback`;
export const newState = () => crypto.randomBytes(16).toString("hex");

export function authorizeUrl(state) {
  const p = new URLSearchParams({
    client_id: env.google.clientId, redirect_uri: redirectUri(), response_type: "code",
    scope: "openid email profile", state, prompt: "select_account",
  });
  return `${AUTH_URL}?${p}`;
}

// يبادل الرمز بمعلومات المستخدم من Google
export async function fetchProfile(code) {
  const tokenRes = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ code, client_id: env.google.clientId, client_secret: env.google.clientSecret, redirect_uri: redirectUri(), grant_type: "authorization_code" }),
  });
  if (!tokenRes.ok) throw badRequest("فشل تبادل رمز Google", "GOOGLE_TOKEN");
  const { access_token: accessToken } = await tokenRes.json();
  const infoRes = await fetch(USERINFO_URL, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!infoRes.ok) throw badRequest("تعذّر قراءة حساب Google", "GOOGLE_PROFILE");
  const info = await infoRes.json();
  if (!info.email || !info.email_verified) throw badRequest("بريد Google غير مؤكد", "GOOGLE_EMAIL");
  return { email: info.email.toLowerCase(), name: info.name || info.given_name || info.email.split("@")[0] };
}
