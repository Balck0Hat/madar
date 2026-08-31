import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { CSS } from "../global";
import { BP, T, R, S } from "../../constants/theme";

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = join(HERE, "../../..");
const INDEX_HTML = join(HERE, "../../../../index.html");

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return name === "__tests__" ? [] : walk(full);
    return /\.(js|jsx)$/.test(name) ? [full] : [];
  });

const FILES = walk(SRC);
const JSX = FILES.filter((f) => f.endsWith(".jsx"));

// المتغيّرات المعرَّفة داخل كتلة سمة واحدة
const declaredIn = (selector) => {
  const start = CSS.indexOf(selector);
  const block = CSS.slice(start, CSS.indexOf("}", start));
  return new Set([...block.matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1]));
};

const valuesIn = (selector) => {
  const start = CSS.indexOf(selector);
  const block = CSS.slice(start, CSS.indexOf("}", start));
  return Object.fromEntries([...block.matchAll(/(--[a-z0-9-]+)\s*:\s*(#[0-9A-Fa-f]{6})/g)].map((m) => [m[1], m[2]]));
};

const dark = declaredIn(':root, [data-theme="dark"]');
const light = declaredIn('[data-theme="light"]');

// كل متغيّر تستعمله الشيفرة فعلاً
const used = new Set();
for (const file of FILES) {
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
    for (const file of JSX) {
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
    for (const scale of [T, R, S]) {
      const v = Object.values(scale);
      expect(new Set(v).size).toBe(v.length);
      expect([...v].sort((a, b) => a - b)).toEqual(v);
    }
  });
});

// ---- التباين ----
const lin = (c) => { const x = c / 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; };
const lum = (hex) => { const n = parseInt(hex.slice(1), 16); return 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255); };
const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };

// الوضع الفاتح كان مقلوباً عن الداكن لا مضبوطاً لنفسه: الذهبي على كريمي
// يهبط إلى 3.55 — وهو لون زرّ «ابدأ». الرقم يُثبَّت هنا كي لا يعود.
describe("palette legibility", () => {
  const themes = { dark: valuesIn(':root, [data-theme="dark"]'), light: valuesIn('[data-theme="light"]') };
  const pairs = [
    ["--text", "--bg"], ["--text", "--surface"],
    ["--muted", "--bg"], ["--muted", "--surface"], ["--muted", "--surface2"],
    ["--gold", "--bg"], ["--gold", "--surface"],
    ["--green", "--surface"], ["--red", "--surface"],
    // زرّ أساسي: خلفيته --gold ونصّه var(--bg)
    ["--bg", "--gold"],
    ["--paper-ink", "--paper-bg"], ["--paper-muted", "--paper-bg"],
    ["--paper-muted", "--paper-card"], ["--paper-gold", "--paper-bg"],
  ];
  // شاشة الدرس كانت كريمية في السمتين، فالوضع الداكن يقف عند بابها ومن يقرأ
  // ليلاً تنفتح في وجهه صفحة فاتحة بملء الشاشة. الورق يجب أن يتبع السمة.
  it("should give the reading surface a night mode of its own", () => {
    expect(lum(themes.dark["--paper-bg"])).toBeLessThan(lum(themes.dark["--paper-ink"]));
    expect(lum(themes.light["--paper-bg"])).toBeGreaterThan(lum(themes.light["--paper-ink"]));
    // وألّا تكون ورقة الليل أفتح من خلفية التطبيق التي وُضعت فوقها
    expect(lum(themes.dark["--paper-bg"])).toBeLessThan(lum(themes.light["--paper-bg"]));
  });

  for (const [mode, vars] of Object.entries(themes)) {
    for (const [fg, bg] of pairs) {
      it(`should keep ${fg} readable on ${bg} in ${mode}`, () => {
        expect(ratio(vars[fg], vars[bg])).toBeGreaterThanOrEqual(4.5);
      });
    }
  }
});

// ---- الخطّ ----
// وزن غير محمّل لا يُرسم: ينهار إلى أقرب وجه موجود، فتتلاشى الطبقة التي
// ظنّ التصميم أنه أنشأها. Readex Pro يتوقّف عند 700 ولا وجود لـ800 و900.
describe("font weights", () => {
  const html = readFileSync(INDEX_HTML, "utf8");
  const loaded = new Set(
    [...html.matchAll(/family=([^:&]+):wght@([0-9;]+)/g)].flatMap(([, , w]) => w.split(";").map(Number)),
  );

  it("should request only weights the code uses", () => {
    expect(loaded.has(700)).toBe(true);
    expect(loaded.has(800)).toBe(false);
    expect(loaded.has(900)).toBe(false);
  });

  it("should never set a font weight that was not downloaded", () => {
    const offenders = [];
    for (const file of FILES) {
      const src = readFileSync(file, "utf8");
      for (const m of src.matchAll(/fontWeight:\s*([^,}\n]+)/g)) {
        for (const n of m[1].match(/\b\d{3}\b/g) || []) {
          if (!loaded.has(Number(n))) offenders.push(`${file.split("/src/")[1]} → ${n}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});

// ---- الهاتف ----
describe("mobile shell", () => {
  it("should give back the space viewport-fit=cover takes away", () => {
    // بدون هذا يقع الشريط السفلي تحت خطّ الإيماءة على آيفون
    const html = readFileSync(INDEX_HTML, "utf8");
    expect(html).toContain("viewport-fit=cover");
    expect(CSS).toContain("env(safe-area-inset-bottom");
    expect(CSS).toContain("env(safe-area-inset-top");
    const nav = readFileSync(join(SRC, "shared/components/ui/NavBar.jsx"), "utf8");
    expect(nav).toContain("env(safe-area-inset-bottom");
  });

  it("should colour the browser bar for both schemes", () => {
    const html = readFileSync(INDEX_HTML, "utf8");
    expect(html).toMatch(/theme-color"[^>]*media="\(prefers-color-scheme: dark\)"/);
    expect(html).toMatch(/theme-color"[^>]*media="\(prefers-color-scheme: light\)"/);
    // والاختيار الصريح للسمة لا يمرّ بالوسيط، فيُكتب وقت التشغيل
    const prefs = readFileSync(join(SRC, "shared/context/PrefsContext.jsx"), "utf8");
    expect(prefs).toContain('name", "theme-color"');
  });

  it("should keep every tap target at or above the minimum", () => {
    const offenders = [];
    for (const file of JSX) {
      const src = readFileSync(file, "utf8");
      // التعبير كاملاً لا الرقم الملاصق للاسم: minHeight: small ? 34 : 44 كان يفلت
      for (const m of src.matchAll(/minHeight:\s*([^,}\n]+)/g)) {
        for (const n of m[1].match(/\b\d+\b/g) || []) {
          if (Number(n) > 0 && Number(n) < 44) offenders.push(`${file.split("/src/")[1]} → ${m[0]}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});

// ---- المسافات والظلال ----
describe("spacing and depth", () => {
  it("should take every spacing value from the scale", () => {
    const steps = new Set(Object.values(S));
    const offenders = [];
    const PROP = /\b(?:padding|margin)(?:Top|Bottom|Left|Right|Inline|Block|InlineStart|InlineEnd|BlockStart|BlockEnd)?|gap|rowGap|columnGap/;
    for (const file of JSX) {
      if (/UnitPrintView\.jsx$/.test(file)) continue; // صفحة طباعة بأنماط حرفية
      const src = readFileSync(file, "utf8");
      for (const m of src.matchAll(new RegExp(`(${PROP.source}):\\s*(\\d+)\\b(?!px)`, "g"))) {
        const n = Number(m[2]);
        if (n !== 0 && !steps.has(n)) offenders.push(`${file.split("/src/")[1]} → ${m[0]}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("should leave no raw pixel string in a spacing property", () => {
    // "10px 12px" يفلت من فحص الأرقام أعلاه، وهو الشكل الذي كانت عليه أكثر القيم
    const offenders = [];
    for (const file of JSX) {
      if (/UnitPrintView\.jsx$/.test(file)) continue;
      const src = readFileSync(file, "utf8");
      for (const m of src.matchAll(/\b(?:padding|margin|gap)[A-Za-z]*:\s*[^,}\n]*"[^"]*\dpx/g)) {
        if (m[0].includes("env(")) continue; // منطقة الأمان تُردّ بوحدة CSS لا برقم
        offenders.push(`${file.split("/src/")[1]} → ${m[0]}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("should define three depth levels in both themes", () => {
    for (const level of ["--shadow-1", "--shadow-2", "--shadow-3"]) {
      expect(dark.has(level)).toBe(true);
      expect(light.has(level)).toBe(true);
    }
  });

  it("should carry no fixed black shadow that ignores the theme", () => {
    const offenders = [];
    for (const file of JSX) {
      const src = readFileSync(file, "utf8");
      for (const m of src.matchAll(/boxShadow:\s*"[^"]*rgba\([^"]*"/g)) offenders.push(`${file.split("/src/")[1]} → ${m[0]}`);
    }
    expect(offenders).toEqual([]);
  });
});
