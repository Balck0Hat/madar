import { describe, it, expect } from "vitest";
import { headingShape, statTiles } from "../utils/cardShape";

describe("heading shape", () => {
  it("should split a term:gloss heading into a definition", () => {
    expect(headingShape("القلب: مضخة بحجم قبضتك")).toEqual({ kind: "definition", term: "القلب", gloss: "مضخة بحجم قبضتك" });
  });

  it("should not call a long clause before the colon a term", () => {
    expect(headingShape("الهند سنة الاستقلال والتقسيم الكبير: ماذا حدث").kind).toBe("plain");
  });

  it("should recognise a question by its mark or its opening word", () => {
    expect(headingShape("لماذا انتفاخان لا واحد").kind).toBe("question");
    expect(headingShape("ما العاطفة؟").kind).toBe("question");
  });

  it("should leave an ordinary heading plain", () => {
    expect(headingShape("الهيكل والعضلات").kind).toBe("plain");
    expect(headingShape("").kind).toBe("plain");
  });
});

describe("stat tiles", () => {
  const card = { h: "الهيكل والعضلات", p: "عظام البالغ 206 عظمة، أما الرضيع فيولد بنحو 270 قطعة يلتحم بعضها. تُحرّك الهيكلَ نحو 600 عضلة." };

  it("should lift number and following word verbatim", () => {
    expect(statTiles(card)).toEqual([{ v: "206", l: "عظمة" }, { v: "270", l: "قطعة" }, { v: "600", l: "عضلة" }]);
  });

  it("should show nothing under three numbers — two is not a moment", () => {
    expect(statTiles({ p: "يدقّ 70 مرة ويضخ 5 لترات." })).toEqual([]);
  });

  it("should not treat years as statistics", () => {
    expect(statTiles({ p: "عام 1885 قاس، وعام 1913 كتب، وعام 1950 نُشر، ثم 40 دراسة." })).toEqual([]);
  });

  it("should skip a number followed only by a particle", () => {
    expect(statTiles({ p: "نحو 30 من الناس، و40 في المئة، و50 إلى 60 شخصاً، و70 عاماً، و80 دولة." }).map((t) => t.v)).toEqual(["60", "70", "80"]);
  });

  it("should keep percent and scale words on the value", () => {
    const t = statTiles({ p: "تمتص المحيطات 90% الحرارة، وتحوي 86 مليار خلية، وتنتج 100 ألف نبضة يومياً." });
    expect(t.map((x) => x.v)).toEqual(["90٪", "86 مليار", "100 ألف"]);
  });

  it("should cap at three tiles", () => {
    expect(statTiles({ p: "1.4 كيلوغرام، 86 مليار خلية، 100 متر، 200 كم، 300 غرام." })).toHaveLength(3);
  });
});
