import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import CardMode from "../components/CardMode";

const pages = Array.from({ length: 16 }, (_, i) => ({ h: `بطاقة ${i + 1}`, p: "نصّ" }));
const info = { color: "#F2B544", title: "وحدة" };
const at = (page) =>
  render(<CardMode page={page} pages={pages} content={{}} info={info} unitId="center-1" quizCount={10}
    onNext={() => {}} onPrev={() => {}} onBack={() => {}} onStartQuiz={() => {}} />);

// الموضع كان في aria-label وحده: القارئ يقلب دون أن يعرف كم بقي
describe("CardMode progress", () => {
  it("should show the position visibly, not only to assistive tech", () => {
    at(3);
    expect(screen.getByText("4/16")).toBeInTheDocument();
  });

  it("should fill the bar in proportion to the page reached", () => {
    const { container } = at(7);
    expect(container.querySelector(".madar-bar").style.width).toBe("50%");
  });

  it("should show a full bar on the last page, where the quiz begins", () => {
    const { container } = at(15);
    expect(container.querySelector(".madar-bar").style.width).toBe("100%");
    expect(screen.getByText(/ابدأ الاختبار/)).toBeInTheDocument();
  });
});
