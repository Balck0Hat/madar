// مسارات عامة بلا تسجيل + إشارات من رابط الدخول الخارجي
export function readRoute() {
  const path = window.location.pathname;
  const params = new URLSearchParams(window.location.search);
  const pub = path.match(/^\/u\/([^/]+)\/?$/);
  const ver = path.match(/^\/verify\/([^/]+)\/?$/);
  return {
    publicHandle: pub ? decodeURIComponent(pub[1]) : null,
    verifyCode: ver ? decodeURIComponent(ver[1]).toUpperCase() : null,
    isNew: params.get("new") === "1",
    authFailed: params.get("auth") === "failed",
    screen: params.get("screen"),
  };
}

// ينظّف الرابط بعد قراءة الإشارات حتى لا تتكرر عند التحديث
export function cleanUrl() {
  if (window.location.search) window.history.replaceState(null, "", window.location.pathname);
}

export const goHome = () => { window.location.assign("/"); };
