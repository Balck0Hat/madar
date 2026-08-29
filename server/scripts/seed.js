// يزرع الوحدات المكتوبة في قاعدة البيانات: node scripts/seed.js [--force]
// بلا --force لا يستبدل وحدة موجودة (تعديلات المشرف محفوظة)؛ مع --force يستبدلها بنسخة الملفات
import { connectDb, disconnectDb } from "../shared/database/connect.js";
import { seedUnits } from "../features/content/content.service.js";
import { SEED_UNITS } from "../shared/data/seed/index.js";

async function main() {
  const force = process.argv.includes("--force");
  await connectDb();
  await seedUnits(SEED_UNITS, { force });
  console.log(`[seed] ${SEED_UNITS.length} units ${force ? "replaced" : "ensured"}`);
  await disconnectDb();
}

main().catch((err) => {
  console.error("[seed] failed", err);
  process.exit(1);
});
