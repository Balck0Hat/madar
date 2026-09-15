import { describe, it, expect } from "vitest";
import { nameKey, mentionCount, mentionedIn } from "../mentions";

// الحالات نفسها في اختبار الخادم (server/shared/utils/__tests__/mentions.test.js)
describe("mentions", () => {
  it("should key a name by its first word, or two words when the first is short", () => {
    expect(nameKey("كورش الكبير")).toBe("كورش");
    expect(nameKey("لاو تسي")).toBe("لاو تسي");
    expect(nameKey("")).toBe("");
  });

  it("should count whole-word mentions with attached prefixes and skip kunyas", () => {
    expect(mentionCount("قال كورش، وكان لكورش جيش، وكورشية ليست اسماً.", "كورش الكبير")).toBe(2);
    expect(mentionCount("روى أبو موسى الأشعري عن موسى.", "موسى عليه السلام")).toBe(1);
    expect(mentionCount("لا ذكر هنا.", "طاليس الملطي")).toBe(0);
  });

  it("should rank mentioned figures by count and drop the figure itself", () => {
    const list = [{ figureId: "a", name: "كورش الكبير" }, { figureId: "b", name: "طاليس الملطي" }, { figureId: "c", name: "داريوس الأول" }];
    const out = mentionedIn("ذكر طاليس كورش مرتين: كورش. وداريوس نفسه.", list, "c");
    expect(out.map((x) => [x.figure.figureId, x.count])).toEqual([["a", 2], ["b", 1]]);
  });
});
