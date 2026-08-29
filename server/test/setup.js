process.env.NODE_ENV = "test";
process.env.JWT_ACCESS_SECRET ||= "test-access-secret-test-access-secret-0000";
process.env.JWT_REFRESH_SECRET ||= "test-refresh-secret-test-refresh-secret-00";
// قاعدة اختبار خاصة بكل عملية: تشغيل متوازٍ لا يمسح بيانات تشغيل آخر
process.env.MONGO_URI_TEST ||= `mongodb://127.0.0.1:27017/madar_test_${process.pid}`;
process.env.CLIENT_DIST = "";

import mongoose from "mongoose";
import { beforeAll, afterEach, afterAll } from "vitest";
import { connectDb, disconnectDb } from "../shared/database/connect.js";

beforeAll(async () => { await connectDb(); });

// كل اختبار مستقل: تُفرَّغ المجموعات بعد كل اختبار
afterEach(async () => {
  const collections = await mongoose.connection.db.collections();
  await Promise.all(collections.map((c) => c.deleteMany({})));
});

afterAll(async () => { await disconnectDb(); });
