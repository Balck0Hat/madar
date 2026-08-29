import mongoose from "mongoose";

// وصول كسول إلى النماذج المسجّلة، للخدمات المشتركة والمهام المجدولة
// (الميزات لا تستورد بعضها؛ النماذج تُسجَّل عند تحميل المسارات في app.js)
const lazy = (name) => () => {
  const m = mongoose.models[name];
  if (!m) throw new Error(`Model ${name} is not registered yet`);
  return m;
};

// حقل Map يعود كـ Map من وثيقة عادية وككائن من .lean(): يوحّدهما
export const plainMap = (m) => (m instanceof Map ? Object.fromEntries(m) : m || {});

export const models = {
  User: lazy("User"),
  Progress: lazy("Progress"),
  Unit: lazy("Unit"),
  QuestionStat: lazy("QuestionStat"),
  Review: lazy("Review"),
  Certificate: lazy("Certificate"),
  PushSubscription: lazy("PushSubscription"),
};
