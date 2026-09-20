import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { COUNTRIES, TITLE_FAMILIES, SYSTEMS } from "../politics/index.js";

const words = (s) => String(s || "").trim().split(/\s+/).filter(Boolean).length;
const TYPES = new Set(SYSTEMS.map((s) => s.name));
const REGIONS = new Set(["الخليج واليمن", "الشام والعراق", "وادي النيل والقرن الإفريقي", "المغرب العربي"]);
const HEADINGS = ["كيف نشأت", "كيف تُحكم", "الناس والاقتصاد", "ما يميّزها"];
// الوصف للآلية لا للحكم عليها: هذه الكلمات أحكام
const JUDGMENTS = /سلطوي|استبداد|مستبد|دكتاتوري|قمعي|فاسد|طاغية|ديمقراطية حقيقية|ديمقراطية زائفة/;

describe("politics content", () => {
  it("should define every country with the full schema and a known government type", () => {
    expect(COUNTRIES.length).toBeGreaterThanOrEqual(22);
    const bad = [];
    for (const c of COUNTRIES) {
      const g = c.government || {};
      const missing = ["countryId", "name", "officialName", "englishName", "flag", "region", "continent", "capital", "population", "area", "independence", "currency", "asOf", "why", "quick"].filter((k) => !c[k]);
      if (missing.length) bad.push(`${c.countryId}: ينقصه ${missing.join(",")}`);
      if (!/^[a-z0-9-]{2,40}$/.test(c.countryId)) bad.push(`${c.countryId}: معرّف`);
      if (!TYPES.has(g.type)) bad.push(`${c.countryId}: نوع حكم غير معروف «${g.type}»`);
      if (!REGIONS.has(c.region)) bad.push(`${c.countryId}: إقليم «${c.region}»`);
      if (!g.headOfState?.name || !g.headOfState?.title) bad.push(`${c.countryId}: رأس الدولة`);
      if (g.headOfGovernment && !(g.headOfGovernment.name && g.headOfGovernment.title)) bad.push(`${c.countryId}: رأس الحكومة`);
      if (!g.how || !g.term || !g.legislature) bad.push(`${c.countryId}: آلية الحكم ناقصة`);
      if (!(Math.abs(c.geo?.lat) <= 90 && Math.abs(c.geo?.lon) <= 180)) bad.push(`${c.countryId}: إحداثيات`);
      if (!(c.check?.opts?.length >= 2 && c.check.opts[c.check.a] !== undefined)) bad.push(`${c.countryId}: السؤال`);
    }
    expect(bad).toEqual([]);
    expect(new Set(COUNTRIES.map((c) => c.countryId)).size).toBe(COUNTRIES.length);
  });

  it("should keep every country text within its length and on the four fixed headings", () => {
    const bad = [];
    for (const c of COUNTRIES) {
      if (words(c.quick) < 90 || words(c.quick) > 190) bad.push(`${c.countryId}: الملخص ${words(c.quick)}`);
      if (JSON.stringify((c.story || []).map((s) => s.h)) !== JSON.stringify(HEADINGS)) bad.push(`${c.countryId}: العناوين`);
      for (const s of c.story || []) if (words(s.p) < 70 || words(s.p) > 160) bad.push(`${c.countryId}/${s.h}: ${words(s.p)}`);
    }
    expect(bad).toEqual([]);
  });

  it("should describe mechanisms without judgment words", () => {
    const bad = [];
    for (const c of COUNTRIES) {
      const text = [c.why, c.quick, ...(c.story || []).map((s) => s.p), c.government?.how, c.government?.note].join(" ");
      const m = text.match(JUDGMENTS);
      if (m) bad.push(`${c.countryId}: «${m[0]}»`);
    }
    expect(bad).toEqual([]);
  });

  it("should define every title with its origin, duties, rank, today and holders, uniquely", () => {
    const all = TITLE_FAMILIES.flatMap((f) => f.titles.map((t) => ({ ...t, familyId: f.familyId })));
    expect(TITLE_FAMILIES.length).toBe(8);
    expect(all.length).toBeGreaterThanOrEqual(80);
    const bad = [];
    for (const t of all) {
      const missing = ["titleId", "name", "original", "meaning", "origin", "duties", "rank", "today"].filter((k) => !t[k]);
      if (missing.length) bad.push(`${t.titleId}: ينقصه ${missing.join(",")}`);
      if (!(t.holders?.length >= 2)) bad.push(`${t.titleId}: من حمله`);
      const n = words([t.meaning, t.origin, t.duties, t.rank, t.today].join(" "));
      if (n < 60 || n > 160) bad.push(`${t.titleId}: ${n} كلمة`);
    }
    expect(bad).toEqual([]);
    expect(new Set(all.map((t) => t.titleId)).size).toBe(all.length);
  });

  it("should keep every politics data file within 150 lines", () => {
    const root = path.join(path.dirname(new URL(import.meta.url).pathname), "..", "politics");
    const long = [];
    for (const dir of ["countries", "titles"]) for (const f of fs.readdirSync(path.join(root, dir))) {
      const n = fs.readFileSync(path.join(root, dir, f), "utf8").split("\n").length;
      if (n > 150) long.push(`${dir}/${f}: ${n}`);
    }
    expect(long).toEqual([]);
  });
});
