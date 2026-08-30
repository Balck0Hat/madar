import { defineConfig } from "vitest/config";

// متغيّرات البيئة تُضبط هنا لا في test/setup.js: استيرادات ESM تُرفع فوق أي إسناد
// في جسم الملف، فـ env.js كان يُقرأ من .env قبل أن ينفّذ setup.js سطراً واحداً.
const testEnv = {
  NODE_ENV: "test",
  CLIENT_DIST: "",
  REGISTRATION_OPEN: "true",
  JWT_ACCESS_SECRET: "test-access-secret-test-access-secret-0000",
  JWT_REFRESH_SECRET: "test-refresh-secret-test-refresh-secret-00",
  // قاعدة خاصة بكل تشغيل: وكلاء متوازون كانوا يمسحون بيانات بعضهم
  MONGO_URI_TEST: process.env.MONGO_URI_TEST_OVERRIDE || `mongodb://127.0.0.1:27017/madar_test_${process.pid}_${Date.now().toString(36)}`,
};

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    env: testEnv,
    setupFiles: ["./test/setup.js"],
    fileParallelism: false,
    hookTimeout: 20000,
    testTimeout: 20000,
  },
});
