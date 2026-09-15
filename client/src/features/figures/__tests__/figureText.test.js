import { describe, it, expect } from "vitest";
import { related, contemporaries, nextOf, agoLabel, periodLabel, groupByPeriod, nameKey } from "../utils/figureText";

const list = [
  { figureId: "ibrahim", name: "إبراهيم عليه السلام", tier: "prophet", born: "~-2000", died: "~-1800" },
  { figureId: "hammurabi", name: "حمورابي", tier: "1", born: "~-1810", died: "~-1750" },
  { figureId: "thales", name: "طاليس الملطي", tier: "1", born: "~-624", died: "~-546" },
  { figureId: "cyrus", name: "كورش الكبير", tier: "1", born: "~-600", died: "-530" },
  { figureId: "laozi", name: "لاو تسي", tier: "1", born: "~-600", died: "" },
  { figureId: "newton", name: "نيوتن", tier: "1", born: "1643", died: "1727" },
];

describe("figureText", () => {
  it("should take the first word as the name key, or two words when the first is short", () => {
    expect(nameKey("كورش الكبير")).toBe("كورش");
    expect(nameKey("لاو تسي")).toBe("لاو تسي");
  });

  it("should find figures mentioned in the story, most mentioned first, ignoring kunyas", () => {
    const me = { figureId: "darius", quick: "ورث داريوس ما فتحه كورش.", story: [{ h: "", p: "وكان كورش قد سبقه، وقال طاليس شيئاً، وأبو طاليس لا يُحسب." }] };
    const rel = related(me, list);
    expect(rel.map((f) => f.figureId)).toEqual(["cyrus", "thales"]);
  });

  it("should not match a name inside another word", () => {
    const me = { figureId: "x", quick: "كورشية ليست كورش", story: [] };
    expect(related(me, list).map((f) => f.figureId)).toEqual(["cyrus"]);
  });

  it("should list contemporaries by overlapping life spans, assuming seventy years when death is unknown", () => {
    const peers = contemporaries(list[3], list);
    expect(peers.map((f) => f.figureId)).toEqual(["thales", "laozi"]);
  });

  it("should give the next figure in list order and null at the end", () => {
    expect(nextOf(list[0], list).figureId).toBe("hammurabi");
    expect(nextOf(list[5], list)).toBeNull();
  });

  it("should say how long ago in round fifties", () => {
    const y = new Date().getFullYear();
    expect(agoLabel({ born: "~-624" })).toBe(`عاش قبل نحو ${(Math.round((y + 624) / 50) * 50).toLocaleString("en-US")} سنة`);
    expect(agoLabel({ born: "" })).toBe("");
  });

  it("should label periods by millennium before 1000 BC, by century after, and prophets together", () => {
    expect(periodLabel(list[0])).toBe("الأنبياء");
    expect(periodLabel(list[1])).toBe("الألفية الثانية قبل الميلاد");
    expect(periodLabel(list[2])).toBe("القرن السابع قبل الميلاد");
    expect(periodLabel(list[5])).toBe("القرن السابع عشر الميلادي");
  });

  it("should group consecutive figures of the same period", () => {
    const g = groupByPeriod(list);
    expect(g.map((x) => [x.label, x.items.length])).toEqual([
      ["الأنبياء", 1], ["الألفية الثانية قبل الميلاد", 1], ["القرن السابع قبل الميلاد", 1], ["القرن السادس قبل الميلاد", 2], ["القرن السابع عشر الميلادي", 1],
    ]);
  });
});
