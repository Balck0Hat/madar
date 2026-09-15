import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import CheckIn from "../CheckIn";

const mcq = { qid: "q1", t: "mcq", q: "كم عدد عظام الإنسان البالغ؟", opts: ["206", "270", "600"], a: 0, why: "الرضيع يولد بنحو 270 قطعة تلتحم." };
const tf = { qid: "q2", t: "tf", q: "يضخ القلب نحو 5 لترات كل دقيقة.", a: true, why: "نحو خمسة لترات في الدقيقة." };

// اختياريّ بالكامل: مطويّ حتى يُطلب، ولا يعترض القراءة
describe("CheckIn", () => {
  it("should render nothing when the card has no matching question", () => {
    const { container } = render(<CheckIn question={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("should start collapsed and show only a one-line invitation", () => {
    render(<CheckIn question={mcq} />);
    expect(screen.getByText(/سؤال سريع/)).toBeInTheDocument();
    expect(screen.queryByText(mcq.q)).not.toBeInTheDocument();
  });

  it("should reveal the question and its options on tap", () => {
    render(<CheckIn question={mcq} />);
    fireEvent.click(screen.getByText(/سؤال سريع/));
    expect(screen.getByText(mcq.q)).toBeInTheDocument();
    expect(screen.getByText("206")).toBeInTheDocument();
  });

  it("should confirm a correct pick and explain why", () => {
    render(<CheckIn question={mcq} />);
    fireEvent.click(screen.getByText(/سؤال سريع/));
    fireEvent.click(screen.getByText("206"));
    expect(screen.getByRole("status")).toHaveTextContent(mcq.why);
    expect(screen.getByText("206").closest("button")).toHaveAttribute("aria-pressed", "true");
  });

  it("should mark a wrong pick and still show the right one", () => {
    render(<CheckIn question={mcq} />);
    fireEvent.click(screen.getByText(/سؤال سريع/));
    fireEvent.click(screen.getByText("600"));
    expect(screen.getByText("600").closest("button").className).toContain("madar-shake");
    expect(screen.getByRole("status")).toHaveTextContent(mcq.why);
  });

  it("should lock after the first pick", () => {
    render(<CheckIn question={mcq} />);
    fireEvent.click(screen.getByText(/سؤال سريع/));
    fireEvent.click(screen.getByText("600"));
    fireEvent.click(screen.getByText("206"));
    expect(screen.getByText("600").closest("button")).toHaveAttribute("aria-pressed", "true");
  });

  it("should offer صح/خطأ for a true-false question", () => {
    render(<CheckIn question={tf} />);
    fireEvent.click(screen.getByText(/سؤال سريع/));
    fireEvent.click(screen.getByText("صح"));
    expect(screen.getByRole("status")).toHaveTextContent(tf.why);
  });
});
