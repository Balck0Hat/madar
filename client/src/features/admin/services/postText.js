import { ApiError } from "../../../shared/utils/api";

// ملف مئة وحدة يتجاوز الميغابايت، وحدّ الخادم لأجسام application/json عشرة كيلوبايت.
// لذلك يُرسل الاستيراد نصاً (text/plain) ويفكّه الخادم بحدّ أوسع.
export async function postText(path, payload) {
  let res;
  try {
    res = await fetch(`/api/v1${path}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new ApiError("تعذّر الاتصال بالخادم، تحقق من الشبكة", 0, "NETWORK");
  }
  const body = await res.json().catch(() => null);
  if (!body) throw new ApiError("استجابة غير مفهومة من الخادم", res.status, "BAD_RESPONSE");
  if (!res.ok || body.success === false) {
    const e = body.error || {};
    throw new ApiError(e.message || "حدث خطأ", res.status, e.code || "ERROR", e.details);
  }
  return body.data;
}
