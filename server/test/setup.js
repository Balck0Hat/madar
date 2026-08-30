// متغيّرات البيئة كلها في vitest.config.js — لا تُوضع هنا:
// استيرادات ESM تُرفع فوق أي إسناد في جسم الملف، فتُقرأ shared/config/env.js
// من .env قبل أن ينفّذ هذا الملف سطراً واحداً، ويصير الإسناد بلا أثر.
import mongoose from "mongoose";
import { beforeAll, afterEach, afterAll } from "vitest";
import { connectDb, disconnectDb } from "../shared/database/connect.js";

beforeAll(async () => { await connectDb(); });

// كل اختبار مستقل: تُفرَّغ المجموعات بعد كل اختبار
afterEach(async () => {
  const collections = await mongoose.connection.db.collections();
  await Promise.all(collections.map((c) => c.deleteMany({})));
});

// القاعدة خاصة بهذا التشغيل، فتُحذف بعده كي لا تتراكم قواعد ميتة
afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await disconnectDb();
});
