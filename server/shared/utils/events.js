import { EventEmitter } from "node:events";

// ناقل أحداث داخلي: الميزات تتواصل عبره بدل أن تستورد بعضها
// unit.passed { userId, unitId } · xp.grant { userId, amount, reason } · review.answered { userId, unitId, correct }
export const bus = new EventEmitter();
bus.setMaxListeners(30);

// معالج آمن: خطأ في مستمع لا يُسقط الطلب الذي أطلق الحدث
export const on = (event, handler) =>
  bus.on(event, (payload) => {
    Promise.resolve(handler(payload)).catch((err) => console.error(`[events] ${event} handler failed`, err));
  });
