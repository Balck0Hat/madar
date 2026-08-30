import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { CSS } from "../global";
import { BP, T, R } from "../../constants/theme";

const SRC = join(dirname(fileURLToPath(import.meta.url)), "../../..");

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return name === "__tests__" ? [] : walk(full);
    return /\.(js|jsx)$/.test(name) ? [full] : [];
  });

// المتغيّرات المعرَّفة داخل كتلة سمة واحدة
const declaredIn = (selector) => {
  const start = CSS.indexOf(selector);
  const block = CSS.slice(start, CSS.indexOf("}", start));
  return new Set([...block.matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1]));
};

const dark = declaredIn(':root, [data-theme="dark"]');
const light = declaredIn('[data-theme="light"]');

// كل متغيّر تستعمله الشيفرة فعلاً
const used = new Set();
for (const file of walk(SRC)) {
  for (const m of readFileSync(file, "utf8").matchAll(/var\((--[a-z0-9-]+)/g)) used.add(m[1]);
}

// الوضعان الفاتح والداكن: متغيّر معرَّف في أحدهما دون الآخر يُنتج شاشة
// نصفها بلا لون، ولا يظهر إلا لمن بدّل السمة ثم فتح تلك الشاشة بعينها.
describe("theme variables", () => {
  it("should define the same variables in light and dark", () => {
    expect([...dark].filter((v) => !light.has(v))).toEqual([]);
    expect([...light].filter((v) => !dark.has(v))).toEqual([]);
  });

  it("should define every variable the code actually uses", () => {
    // --font-scale يضبطه PrefsContext على الجذر لا في ورقة الأنماط
    const runtime = new Set(["--font-scale"]);
    const missing = [...used].filter((v) => !runtime.has(v) && !dark.has(v));
    expect(missing).toEqual([]);
  });

  it("should carry no colour that stays fixed while its surface flips", () => {
    // نصّ بلون ثابت فوق سطح يتبدّل مع السمة ينقلب إلى غامق على غامق.
    // النمط المعتمد للأسطح الذهبية هو color: var(--bg).
    const offenders = [];
    // المكوّنات وحدها: ألوان هوية المجالات في data/ ثابتة عمداً في الوضعين
    for (const file of walk(SRC).filter((f) => f.endsWith(".jsx"))) {
      const src = readFileSync(file, "utf8");
      if (/\/(ShareCard|Certificate|CardArt|UnitPrintView)\.jsx$/.test(file)) continue; // تُصدَّر صوراً أو تُطبع
      for (const m of src.matchAll(/color:\s*[^,;\n]*"#[0-9a-fA-F]{3,8}"/g)) offenders.push(`${file.split("/src/")[1]} → ${m[0]}`);
    }
    expect(offenders).toEqual([]);
  });

  it("should render the named breakpoints as real pixel values", () => {
    // المقاييس تُركَّب وقت التشغيل، فلا تظهر نصاً في الحزمة: نتحقق من الناتج
    expect(CSS).toContain(`max-width:${BP.phone}px`);
    expect(CSS).toContain(`min-width:${BP.desk}px`);
    expect(CSS).toContain(`max-width:${BP.appMax}px`);
    expect(CSS).not.toContain("${");
    expect(CSS).not.toContain("undefinedpx");
  });

  it("should keep the scales ordered and free of duplicate steps", () => {
    for (const scale of [T, R]) {
      const v = Object.values(scale);
      expect(new Set(v).size).toBe(v.length);
      expect([...v].sort((a, b) => a - b)).toEqual(v);
    }
  });
});
