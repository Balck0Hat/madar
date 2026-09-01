import { describe, it, expect } from "vitest";
import { paragraphs } from "../../../../client/src/shared/utils/prose.js";
import { SEED_UNITS } from "../seed/index.js";

const norm = (s) => s.trim().replace(/\s+/g, " ");
const words = (s) => (s.trim() ? s.trim().split(/\s+/).length : 0);
const cards = SEED_UNITS.flatMap((u) => (u.cards || []).map((c) => c.p));

// متن الدرس كان يصل فقرةً واحدة: 2985 بطاقة، متوسطها 107 كلمات، وليس في
// واحدة منها فاصل سطر. الواجهة تقسّمها عند حدود الجمل لتُقرأ.
//
// التقسيم عرضٌ لا تحرير، وهذه هي الضمانة: لو غيّر حرفاً واحداً في بطاقة
// واحدة لكان تحريراً لمادة دُقّقت على ثلاث جولات، ولا يجوز أن يفعله كود عرض.
// الاختبار هنا لا في الواجهة لأن المنهج يُحمَّل باستيراد ديناميكي لا يمرّ بـvite.
describe("paragraph splitting across the whole curriculum", () => {
  it("should have real cards to check", () => {
    expect(cards.length).toBeGreaterThan(2900);
  });

  it("should preserve the text of every card exactly", () => {
    const changed = cards.filter((p) => norm(paragraphs(p).join(" ")) !== norm(p));
    expect(changed).toEqual([]);
  });

  it("should leave no orphan paragraph", () => {
    const orphans = cards.flatMap((p) => {
      const ps = paragraphs(p);
      return ps.length > 1 ? ps.filter((x) => words(x) < 20) : [];
    });
    expect(orphans).toEqual([]);
  });

  it("should break the cards that actually need breaking", () => {
    const split = cards.filter((p) => paragraphs(p).length > 1).length;
    // البطاقات دون 83 كلمة تبقى كتلة واحدة عمداً
    expect(split / cards.length).toBeGreaterThan(0.6);
  });

  it("should keep paragraphs within a readable span", () => {
    const sizes = cards.flatMap(paragraphs).map(words);
    const median = sizes.sort((a, b) => a - b)[Math.floor(sizes.length / 2)];
    expect(median).toBeGreaterThan(35);
    expect(median).toBeLessThan(75);
  });
});
