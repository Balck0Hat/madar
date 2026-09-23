import { describe, it, expect } from "vitest";
import { normalize, words, align } from "../arabic.js";

describe("arabic normalize", () => {
  it("should drop diacritics, stop marks and Uthmani glyphs and unify alef, hamza and taa marbuta", () => {
    expect(normalize("بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ")).toBe("بسم الله الرحمان الرحيم"); // الألف الخنجرية ألف
    expect(normalize("ٱلۡقَيُّومُۚ لَا تَأۡخُذُهُۥ سِنَةࣱ")).toBe("القيوم لا تاخذه سنه");
    expect(normalize("أَإِذَا مِتْنَا وَكُنَّا تُرَابًا")).toBe("ااذا متنا وكنا ترابا");
    expect(words("")).toEqual([]);
  });
});

describe("align", () => {
  const ayah = "قُلْ هُوَ اللَّهُ أَحَدٌ";
  it("should mark heard words ok in order and leave the rest pending", () => {
    const r = align(ayah, "قل هو");
    expect(r.status).toEqual(["ok", "ok", "pending", "pending"]);
    expect(r.cursor).toBe(2);
    expect(r.done).toBe(false);
  });

  it("should mark a skipped word as miss and continue matching after it", () => {
    const r = align(ayah, "قل الله احد");
    expect(r.status).toEqual(["ok", "miss", "ok", "ok"]);
    expect(r.done).toBe(true);
    expect(r.miss).toBe(1);
  });

  it("should forgive a one-letter recognition slip in a long word but not a different word", () => {
    expect(align("الرحمن الرحيم", "الرحمان الرحيم").status).toEqual(["ok", "ok"]);
    expect(align("مالك يوم الدين", "ملك يوم الدين").status[0]).toBe("ok");
    expect(align("لا اله الا هو", "لا الا الا هو").status[1]).toBe("miss"); // «اله» و«الا» كلمتان مختلفتان
    expect(align("اياك نعبد واياك نستعين", "اياك نعبد واياك نستعين").status.every((s) => s === "ok")).toBe(true);
    expect(align("اياك نعبد", "واياك نعبد").status[0]).toBe("miss"); // واو العطف تصنع كلمة أخرى
    expect(align("قل هو الله احد", "قل هي الله احد").status).toEqual(["ok", "miss", "ok", "ok"]);
  });

  it("should ignore extra heard words that are not in the ayah", () => {
    const r = align(ayah, "اعوذ بالله قل هو الله احد");
    expect(r.status.every((s) => s === "ok")).toBe(true);
  });

  it("should handle empty input", () => {
    expect(align(ayah, "")).toMatchObject({ cursor: 0, done: false, ok: 0 });
    expect(align("", "قل")).toMatchObject({ done: false });
  });
});
