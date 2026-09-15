import { describe, it, expect } from "vitest";
import { nameKey, mentionCount } from "../mentions.js";

// الحالات نفسها في اختبار العميل (shared/utils/__tests__/mentions.test.js هناك)
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
});
