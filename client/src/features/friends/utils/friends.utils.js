// المعرّف يُشتق من الاسم على الخادم، فقد يحوي حروفاً عربية وشرطات: نتحقق بمرونة
export const cleanHandle = (raw) => String(raw || "").trim().replace(/^@+/, "").replace(/^.*\/u\//, "");

export function validateHandle(raw, myHandle) {
  const h = cleanHandle(raw);
  if (!h) return "اكتب معرّف صديقك أولاً.";
  if (/\s/.test(h)) return "المعرّف لا يحتوي مسافات.";
  if (h.length < 2 || h.length > 40) return "المعرّف بين حرفين و40 حرفاً.";
  if (myHandle && h.toLowerCase() === String(myHandle).toLowerCase()) return "لا يمكنك إضافة نفسك.";
  return null;
}

// رسائل الخادم قد تصل برموز مختلفة، فنترجم المعروف ونقع على رسالة الخادم عند الجهل
const BY_CODE = {
  USER_NOT_FOUND: "لا يوجد متعلم بهذا المعرّف، تأكد من كتابته.",
  NOT_FOUND: "لا يوجد متعلم بهذا المعرّف، تأكد من كتابته.",
  ALREADY_FRIENDS: "هذا صديقك بالفعل.",
  ALREADY_SENT: "أرسلت له طلباً من قبل، بانتظار قبوله.",
  REQUEST_EXISTS: "أرسلت له طلباً من قبل، بانتظار قبوله.",
  DUPLICATE: "الطلب موجود بالفعل.",
  SELF: "لا يمكنك إضافة نفسك.",
  SELF_REQUEST: "لا يمكنك إضافة نفسك.",
};

export function addFriendError(err) {
  if (!err) return "تعذّر إرسال الطلب.";
  const known = BY_CODE[err.code];
  if (known) return known;
  if (err.status === 404) return BY_CODE.USER_NOT_FOUND;
  if (err.status === 409) return BY_CODE.DUPLICATE;
  return err.message || "تعذّر إرسال الطلب.";
}

// الخادم قد يغفل حقولاً، فنملأ الناقص بدل أن تنهار الواجهة
export const safeList = (v) => (Array.isArray(v) ? v.filter(Boolean) : []);

export const personName = (p) => p?.name || p?.handle || "متعلم";

export const shareLink = (handle) =>
  `${typeof location === "undefined" ? "" : location.origin}/u/${encodeURIComponent(handle || "")}`;
