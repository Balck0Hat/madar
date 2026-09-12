import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Decorated, { ordinalItems, emphasizeQuotes } from "../Decorated";

// أرقام الشارات زينة (aria-hidden) لا نصّاً؛ تُستبعد قبل المقارنة بالأصل
const flat = (el) => {
  const clone = el.cloneNode(true);
  clone.querySelectorAll("[aria-hidden]").forEach((n) => n.remove());
  return clone.textContent.replace(/\s+/g, " ").trim();
};

describe("quotes", () => {
  it("should raise a «…» run of sensible length and keep the text intact", () => {
    const text = "قال أينشتاين: «المادة تخبر الزمكان كيف ينحني، والزمكان يخبر المادة كيف تتحرك». وهذا جوهر النظرية.";
    const { container } = render(<Decorated text={text} />);
    expect(container.querySelector(".madar-q")).not.toBeNull();
    expect(flat(container)).toBe(text);
  });

  it("should leave a short quoted title alone — it is a name, not a saying", () => {
    expect(emphasizeQuotes("لوحة «نافورة» لدوشامب.")).toBe("لوحة «نافورة» لدوشامب.");
  });
});

describe("ordinal steps", () => {
  const text = "ثلاثة أسئلة لكل رقم. أولاً: نسبة من ماذا؟ فالمئة بلا أساس فارغة. ثانياً: أي متوسط؟ فالثري يرفعه. ثالثاً: ما العدد المطلق؟";

  it("should split a paragraph at أولاً/ثانياً/ثالثاً into lead and items", () => {
    const list = ordinalItems(text);
    expect(list.lead).toBe("ثلاثة أسئلة لكل رقم.");
    expect(list.items).toHaveLength(3);
    expect(list.items[1].startsWith("ثانياً")).toBe(true);
  });

  it("should render numbered rows and lose no text", () => {
    const { container } = render(<Decorated text={text} />);
    expect(container.querySelectorAll("li")).toHaveLength(3);
    expect(flat(container)).toBe(text);
  });

  it("should not treat a single ordinal as a list", () => {
    expect(ordinalItems("أولاً، هذا ليس تعداداً بل بداية.")).toBeNull();
  });

  it("should not fire on an ordinal inside a sentence", () => {
    expect(ordinalItems("كان ذلك أولاً ثم صار ثانياً في الترتيب.")).toBeNull();
  });
});
