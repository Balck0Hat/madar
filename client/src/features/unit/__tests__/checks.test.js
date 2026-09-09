import { describe, it, expect } from "vitest";
import { mapChecks, tokens } from "../utils/checks";

const cards = [
  { h: "الهيكل والعضلات", p: "عظام البالغ 206 عظمة، أما الرضيع فيولد بنحو 270 قطعة يلتحم بعضها مع النمو. تُحرّك الهيكلَ نحو 600 عضلة." },
  { h: "القلب: مضخة بحجم قبضتك", p: "قلبك عضلة بحجم قبضة يدك، يدقّ نحو 70 مرة في الدقيقة، ويضخ في كل دقيقة نحو 5 لترات من الدم." },
  { h: "الرئتان: تبادل الغازات", p: "في الرئتين تنتقل الغازات عبر الحويصلات الهوائية، فيدخل الأكسجين ويخرج ثاني أكسيد الكربون." },
];
const bones = { qid: "q1", t: "mcq", q: "كم عدد عظام الإنسان البالغ؟", opts: ["206", "270", "600", "100"], a: 0, why: "الرضيع يولد بنحو 270 قطعة تلتحم مع النمو." };
const heart = { qid: "q2", t: "tf", q: "يضخ القلب نحو 5 لترات من الدم كل دقيقة.", a: true, why: "قلبك يدقّ نحو 70 مرة في الدقيقة." };
const open = { qid: "q3", t: "open", q: "اشرح كيف تتبادل الرئتان الغازات مع الدم عبر الحويصلات الهوائية." };
const vague = { qid: "q4", t: "tf", q: "الجسم مدينة.", a: true };

// السؤال يُعرض تحت البطاقة التي يجيب عنها، وإلا فلا يُعرض
describe("mapping questions to cards", () => {
  it("should put each question under the card that answers it", () => {
    const map = mapChecks(cards, [bones, heart]);
    expect(map[0]?.qid).toBe("q1");
    expect(map[1]?.qid).toBe("q2");
    expect(map[2]).toBeNull();
  });

  it("should ignore open questions — they have no answer to check against", () => {
    expect(mapChecks(cards, [open]).every((q) => q === null)).toBe(true);
  });

  it("should show nothing rather than guess when the overlap is too thin", () => {
    expect(mapChecks(cards, [vague]).every((q) => q === null)).toBe(true);
  });

  it("should give a card at most one question, the best-matching one", () => {
    const weaker = { qid: "q5", t: "tf", q: "عظام البالغ 206 عظمة.", a: true };
    const map = mapChecks(cards, [weaker, bones]);
    expect(map.filter((q) => q?.qid === "q1" || q?.qid === "q5")).toHaveLength(1);
    expect(map[0].qid).toBe("q1");
  });

  it("should strip diacritics and prefixes so «العظام» meets «عظام»", () => {
    expect(tokens("والعِظامُ")).toEqual(["عظام"]);
    expect(tokens("بالقلبِ")).toEqual(["قلب"]);
  });

  it("should handle an empty bank and an empty deck", () => {
    expect(mapChecks(cards, [])).toEqual([null, null, null]);
    expect(mapChecks([], [bones])).toEqual([]);
  });
});
