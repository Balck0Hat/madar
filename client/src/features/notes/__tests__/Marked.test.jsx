import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Marked from "../components/Marked";
import { paragraphs } from "../../../shared/utils/prose";

const LONG =
  "الجملة الأولى تقول شيئاً واضحاً عن الموضوع وتضع القارئ في الصورة بلا مقدمات طويلة أو حشو زائد لا لزوم له هنا. " +
  "والجملة الثانية تضيف تفصيلاً آخر يبني على ما سبق ويوسّع الفكرة قليلاً حتى تكتمل صورتها في ذهن القارئ. " +
  "أما الجملة الثالثة فتقلب الاتجاه وتعرض الاعتراض الذي يوجَّه إلى ما قيل قبلها، وهو اعتراض وجيه يستحق النظر. " +
  "والنتيجة أن الفكرة تبقى صالحة في حدودها ولا تصلح خارجها، وهذا هو الدرس الذي نخرج به من هذه البطاقة كلها. " +
  "ويبقى بعد ذلك سؤال مفتوح لم يُحسم بعد، وهو أقرب إلى حدود معرفتنا اليوم منه إلى نقص في البحث أو في أدواته المتاحة.";

const note = (text, id = "n1") => ({ id, text, color: "gold", note: "" });

// نصّ الشاشة: الفقرات عناصر كتلة، فالفاصل بينها في التخطيط لا في textContent
const visible = (container) => {
  const ps = [...container.querySelectorAll("p")];
  return (ps.length ? ps.map((p) => p.textContent).join(" ") : container.textContent).replace(/\s+/g, " ").trim();
};
const flat = (s) => s.replace(/\s+/g, " ").trim();

describe("Marked", () => {
  it("should render the text split into paragraphs", () => {
    const { container } = render(<Marked text={LONG} notes={[]} />);
    expect(container.querySelectorAll("p")).toHaveLength(paragraphs(LONG).length);
    expect(visible(container)).toBe(flat(LONG));
  });

  it("should show a highlight that lies inside one paragraph", () => {
    render(<Marked text={LONG} notes={[note("اعتراض وجيه يستحق النظر")]} />);
    expect(screen.getAllByRole("button").length).toBeGreaterThan(0);
    expect(document.querySelector("mark").textContent).toContain("اعتراض وجيه");
  });

  // لو قُسّم النصّ أولاً ثم بُحث عن كل تظليل داخل فقرة، لاختفى كل تظليل
  // يعبر الحدّ: البحث عن اقتباسه يفشل في الفقرتين معاً، فيضيع من الشاشة.
  it("should keep a highlight that crosses a paragraph break", () => {
    const paras = paragraphs(LONG);
    expect(paras.length).toBeGreaterThan(1);
    const tailOfFirst = paras[0].split(" ").slice(-4).join(" ");
    const headOfSecond = paras[1].split(" ").slice(0, 4).join(" ");
    const spanning = `${tailOfFirst} ${headOfSecond}`;

    const { container } = render(<Marked text={LONG} notes={[note(spanning)]} />);
    const marks = [...container.querySelectorAll("mark")];
    expect(marks.length).toBeGreaterThan(0);
    const marked = marks.map((m) => m.textContent).join(" ").replace(/\s+/g, " ");
    expect(marked).toContain(tailOfFirst.split(" ").pop());
    expect(marked).toContain(headOfSecond.split(" ")[0]);
    // ولا يضيع شيء من المتن
    expect(visible(container)).toBe(flat(LONG));
  });

  it("should leave short text unwrapped, as before the split", () => {
    const short = "جملة قصيرة. وأخرى قصيرة.";
    const { container } = render(<Marked text={short} notes={[]} />);
    expect(container.querySelectorAll("p")).toHaveLength(0);
    expect(container.textContent).toBe(short);
  });
});
