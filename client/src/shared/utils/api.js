// عميل HTTP موحّد: كوكيز httpOnly، تحديث الجلسة تلقائياً مرة واحدة عند 401
const BASE = "/api/v1";

export class ApiError extends Error {
  constructor(message, status, code, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

let refreshing = null;
const refreshSession = () => {
  if (!refreshing) {
    refreshing = fetch(`${BASE}/auth/refresh`, { method: "POST", credentials: "include" })
      .then((r) => r.ok)
      .catch(() => false)
      .finally(() => { refreshing = null; });
  }
  return refreshing;
};

async function parse(res) {
  if (res.status === 204) return null;
  let body;
  try { body = await res.json(); } catch (err) { throw new ApiError("استجابة غير مفهومة من الخادم", res.status, "BAD_RESPONSE"); }
  if (!res.ok || body.success === false) {
    const e = body.error || {};
    throw new ApiError(e.message || "حدث خطأ", res.status, e.code || "ERROR", e.details);
  }
  return body.data;
}

export async function api(path, { method = "GET", body, retry = true } = {}) {
  let res;
  try {
    res = await fetch(BASE + path, {
      method,
      credentials: "include",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    throw new ApiError("تعذّر الاتصال بالخادم، تحقق من الشبكة", 0, "NETWORK");
  }
  if (res.status === 401 && retry && !path.startsWith("/auth/")) {
    const ok = await refreshSession();
    if (ok) return api(path, { method, body, retry: false });
  }
  return parse(res);
}

export const get = (path) => api(path);
export const post = (path, body) => api(path, { method: "POST", body });
export const patch = (path, body) => api(path, { method: "PATCH", body });
export const put = (path, body) => api(path, { method: "PUT", body });
export const del = (path) => api(path, { method: "DELETE" });
