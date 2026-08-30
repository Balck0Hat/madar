// إنشاء حساب يدوياً بينما التسجيل مغلق.
//   node scripts/create-user.js --name "اسمك" --email you@example.com [--password "..."]
// بلا --password تُولَّد كلمة قوية وتُطبع مرة واحدة فقط.
import mongoose from "mongoose";
import crypto from "crypto";
import { env } from "../shared/config/env.js";
import User from "../features/users/user.model.js";

const args = process.argv.slice(2);
const arg = (flag) => {
  const i = args.indexOf(`--${flag}`);
  return i >= 0 ? args[i + 1] : undefined;
};

// حروف وأرقام فقط: تُنسخ بلا لبس ولا هروب في الطرفية، وتستوفي شرط النموذج
const generate = () => {
  const alphabet = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const pick = () => alphabet[crypto.randomInt(alphabet.length)];
  const body = Array.from({ length: 14 }, pick).join("");
  return `${body}a7`; // يضمن وجود حرف ورقم مهما جاءت القرعة
};

const name = arg("name");
const email = (arg("email") || "").trim().toLowerCase();
const password = arg("password") || generate();
const generated = !arg("password");

if (!name || !email) {
  console.error('الاستعمال: node scripts/create-user.js --name "الاسم" --email you@example.com [--password "..."]');
  process.exit(1);
}
if (!/^\S+@\S+\.\S+$/.test(email)) {
  console.error(`بريد غير صالح: ${email}`);
  process.exit(1);
}

await mongoose.connect(env.mongoUri);
try {
  if (await User.exists({ email })) {
    console.error(`البريد مسجّل من قبل: ${email}`);
    process.exit(1);
  }
  const role = env.adminEmails.includes(email) ? "admin" : "user";
  const user = await User.create({ name, email, password, role });
  console.log(`\n✓ أُنشئ الحساب: ${user.name} <${user.email}> — الصلاحية: ${role}`);
  if (generated) console.log(`  كلمة المرور: ${password}\n  (تُطبع مرة واحدة، احفظها الآن)`);
  if (role === "admin") console.log("  هذا البريد في ADMIN_EMAILS فمُنح صلاحية المشرف.");
  console.log("");
} finally {
  await mongoose.disconnect();
}
