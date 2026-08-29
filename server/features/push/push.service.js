import webpush from "web-push";
import PushSubscription from "./subscription.model.js";
import { env } from "../../shared/config/env.js";

if (env.pushEnabled) webpush.setVapidDetails(env.vapid.subject, env.vapid.publicKey, env.vapid.privateKey);

export const publicKey = () => (env.pushEnabled ? env.vapid.publicKey : null);

export async function subscribe(userId, sub, userAgent) {
  await PushSubscription.updateOne(
    { endpoint: sub.endpoint },
    { $set: { user: userId, keys: sub.keys, userAgent } },
    { upsert: true },
  );
}

export async function unsubscribe(userId, endpoint) {
  await PushSubscription.deleteOne({ user: userId, ...(endpoint ? { endpoint } : {}) });
}

export const hasSubscription = (userId) => PushSubscription.exists({ user: userId }).then(Boolean);

// يرسل إلى كل أجهزة المستخدم ويحذف الاشتراكات الميتة (410/404)
export async function sendToUser(userId, payload) {
  if (!env.pushEnabled) return 0;
  const subs = await PushSubscription.find({ user: userId }).lean();
  let sent = 0;
  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: s.keys }, JSON.stringify(payload), { TTL: 6 * 3600 });
        sent++;
      } catch (err) {
        if (err.statusCode === 404 || err.statusCode === 410) await PushSubscription.deleteOne({ _id: s._id });
        else console.error("[push] send failed", err.statusCode || err.message);
      }
    }),
  );
  return sent;
}
