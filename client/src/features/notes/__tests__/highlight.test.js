import { describe, it, expect } from "vitest";
import { splitHighlights } from "../utils/highlight";

const note = (text, over = {}) => ({ id: text, text, color: "gold", ...over });
const TEXT = "الاسترجاع يثبّت المعلومة أكثر من إعادة القراءة، وهذا ما تقوله التجارب.";

describe("splitHighlights", () => {
  it("should return the text untouched when there are no notes", () => {
    expect(splitHighlights(TEXT)).toEqual([{ key: "t0", text: TEXT }]);
  });

  it("should wrap a matched quote and keep the surrounding text", () => {
    const parts = splitHighlights(TEXT, [note("يثبّت المعلومة")]);
    expect(parts.map((p) => p.text).join("")).toBe(TEXT);
    expect(parts.filter((p) => p.note)).toHaveLength(1);
    expect(parts.find((p) => p.note).text).toBe("يثبّت المعلومة");
  });

  it("should tolerate different whitespace between the quote's words", () => {
    const parts = splitHighlights(TEXT, [note("يثبّت    المعلومة")]);
    expect(parts.find((p) => p.note)?.text).toBe("يثبّت المعلومة");
  });

  it("should skip a quote that no longer exists in the card", () => {
    const parts = splitHighlights(TEXT, [note("جملة حُذفت بعد تحرير البطاقة")]);
    expect(parts).toEqual([{ key: "t0", text: TEXT }]);
  });

  it("should keep the first of two overlapping highlights", () => {
    const parts = splitHighlights(TEXT, [note("يثبّت المعلومة"), note("المعلومة أكثر")]);
    expect(parts.filter((p) => p.note)).toHaveLength(1);
    expect(parts.map((p) => p.text).join("")).toBe(TEXT);
  });

  it("should order several highlights by their position in the text", () => {
    const parts = splitHighlights(TEXT, [note("التجارب"), note("الاسترجاع")]);
    expect(parts.filter((p) => p.note).map((p) => p.text)).toEqual(["الاسترجاع", "التجارب"]);
    expect(parts.map((p) => p.text).join("")).toBe(TEXT);
  });

  it("should never break on empty or non-string input", () => {
    expect(splitHighlights("", [note("أي شيء")])).toEqual([]);
    expect(splitHighlights(null)).toEqual([]);
    expect(splitHighlights(TEXT, [{ id: "x", text: "" }])).toEqual([{ key: "t0", text: TEXT }]);
  });
});
