import { describe, it, expect } from "vitest";
import { paragraphs, paragraphRanges } from "../prose";

const norm = (s) => s.trim().replace(/\s+/g, " ");

const LONG =
  "الجملة الأولى تقول شيئاً واضحاً عن الموضوع وتضع القارئ في الصورة بلا مقدمات طويلة أو حشو زائد لا لزوم له هنا. " +
  "والجملة الثانية تضيف تفصيلاً آخر يبني على ما سبق ويوسّع الفكرة قليلاً حتى تكتمل صورتها في ذهن القارئ. " +
  "أما الجملة الثالثة فتقلب الاتجاه وتعرض الاعتراض الذي يوجَّه إلى ما قيل قبلها، وهو اعتراض وجيه يستحق النظر. " +
  "والنتيجة أن الفكرة تبقى صالحة في حدودها ولا تصلح خارجها، وهذا هو الدرس الذي نخرج به من هذه البطاقة كلها. " +
  "ويبقى بعد ذلك سؤال مفتوح لم يُحسم بعد، وهو أقرب إلى حدود معرفتنا اليوم منه إلى نقص في البحث أو في أدواته المتاحة.";

describe("splitting a card into paragraphs", () => {
  it("should never lose or change a single word", () => {
    expect(norm(paragraphs(LONG).join(" "))).toBe(norm(LONG));
  });

  it("should break a long card into more than one paragraph", () => {
    expect(paragraphs(LONG).length).toBeGreaterThan(1);
  });

  it("should leave a short card whole", () => {
    const short = "جملة قصيرة واحدة. وجملة ثانية قصيرة أيضاً.";
    expect(paragraphs(short)).toEqual([short]);
  });

  it("should be deterministic", () => {
    expect(paragraphs(LONG)).toEqual(paragraphs(LONG));
  });

  it("should not split a decimal number", () => {
    const text = `${LONG} وبلغت النسبة 1.5 في المئة عند القياس الأخير.`;
    expect(paragraphs(text).some((p) => p.trim().startsWith("5 في المئة"))).toBe(false);
  });

  it("should prefer breaking where the argument turns", () => {
    // «أما» و«والنتيجة» منعطفان: الفقرة الجديدة تبدأ عندهما لا في منتصف حجّة
    const starts = paragraphs(LONG).slice(1).map((p) => p.split(" ")[0]);
    expect(starts.every((w) => ["أما", "والنتيجة", "لكن", "ثم"].includes(w))).toBe(true);
  });

  it("should report ranges that index into the original text", () => {
    for (const r of paragraphRanges(LONG)) expect(LONG.slice(r.start, r.end).trim()).toBeTruthy();
  });

  it("should handle empty and whitespace input", () => {
    expect(paragraphs("")).toEqual([]);
    expect(paragraphs("   ")).toEqual([]);
    expect(paragraphs(null)).toEqual([]);
  });
});
