// يزرع الوحدات المكتوبة في قاعدة البيانات (لا يستبدل وحدة موجودة): node scripts/seed.js
import { connectDb, disconnectDb } from "../shared/database/connect.js";
import { seedUnits } from "../features/content/content.service.js";
import { SEED_UNITS } from "../shared/data/seed/index.js";

async function main() {
  await connectDb();
  await seedUnits(SEED_UNITS);
  console.log(`[seed] ${SEED_UNITS.length} units ensured: ${SEED_UNITS.map((u) => u.unitId).join(", ")}`);
  await disconnectDb();
}

main().catch((err) => {
  console.error("[seed] failed", err);
  process.exit(1);
});
