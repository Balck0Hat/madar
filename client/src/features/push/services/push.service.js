import { get, post } from "../../../shared/utils/api";

export const supported = () => typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

export const getKey = () => get("/push/key");

const toUint8 = (base64) => {
  const padded = (base64 + "=".repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
};

// يطلب الإذن ويسجّل الجهاز على الخادم
export async function enableReminders() {
  if (!supported()) throw new Error("المتصفح لا يدعم الإشعارات");
  const { publicKey } = await getKey();
  if (!publicKey) throw new Error("التذكيرات غير مفعّلة على الخادم");
  const permission = await Notification.requestPermission();
  if (permission !== "granted") throw new Error("لم يُمنح إذن الإشعارات");
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: toUint8(publicKey) });
  await post("/push/subscribe", sub.toJSON());
  return true;
}

export async function disableReminders() {
  if (!supported()) return;
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (sub) { await post("/push/unsubscribe", { endpoint: sub.endpoint }); await sub.unsubscribe(); }
}

export const sendTest = () => post("/push/test");
