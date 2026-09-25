import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import PlacementScreen from "../components/PlacementScreen";

const item = (id, q) => ({ id, q, opts: ["go", "goes", "going", "went"] });
let state;
vi.mock("../services/english.service", () => ({
  getPlacement: vi.fn(async () => ({ session: state.session, history: state.history })),
  startPlacement: vi.fn(async () => { state.session = { id: "aaaaaaaaaaaaaaaaaaaaaaaa", stage: "grammar", item: item("g1", "She ___ to school."), n: 1, of: 20 }; return state.session; }),
  answerPlacement: vi.fn(async (id, itemId, choice) => {
    if (itemId === "g1") return { correct: choice === 1, a: 1, why: "المضارع البسيط.", next: { id, stage: "reading", part: { id: "r1", title: "A notice", text: "The pool opens at nine.", n: 1, of: 1, qs: [{ q: "When does it open?", opts: ["eight", "nine", "ten", "noon"] }] } } };
    return { correct: choice === 1, a: 1, why: "في النصّ: at nine.", next: { id, stage: "writing", writing: { id: "w-b1", prompt: "Write about your weekend.", minutes: 10, words: 80 } } };
  }),
  submitWriting: vi.fn(async (id) => ({ id, stage: "done", writing: { status: "pending" }, result: { level: "B1", label: "متوسط", ielts: "4 إلى 5", toefl: "42 إلى 71", parts: { grammar: "B1", reading: "B1", listening: "B1", writing: null }, recommendation: { track: "general-plus", text: "أنت في B1." } } })),
  skipWriting: vi.fn(),
}));

beforeEach(() => { state = { session: null, history: [] }; vi.clearAllMocks(); });

describe("PlacementScreen", () => {
  it("should walk from the intro through a grammar item, a reading passage, and writing to the result", async () => {
    render(<PlacementScreen onBack={() => {}} onGo={() => {}} />);
    fireEvent.click(await screen.findByRole("button", { name: "ابدأ" }));
    expect(await screen.findByText("She ___ to school.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /goes/ }));
    expect(await screen.findByText("المضارع البسيط.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "التالي" }));
    expect(await screen.findByText("A notice")).toBeInTheDocument();
    expect(screen.getByText("The pool opens at nine.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /nine/ }));
    expect(await screen.findByText("في النصّ: at nine.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "المقطع التالي" }));
    expect(await screen.findByText("Write about your weekend.")).toBeInTheDocument();
    const send = screen.getByRole("button", { name: "أرسل للتصحيح" });
    expect(send).toBeDisabled(); // أقل من 20 كلمة
    fireEvent.change(screen.getByLabelText("نصّ الكتابة"), { target: { value: Array(25).fill("word").join(" ") } });
    fireEvent.click(screen.getByRole("button", { name: "أرسل للتصحيح" }));
    expect(await screen.findByText(/آيلتس نحو 4 إلى 5/)).toBeInTheDocument();
    expect(screen.getByText("متوسط")).toBeInTheDocument();
    expect(screen.getByText("جارٍ التصحيح")).toBeInTheDocument();
  });

  it("should resume an existing session instead of showing the intro", async () => {
    state.session = { id: "aaaaaaaaaaaaaaaaaaaaaaaa", stage: "grammar", item: item("g7", "They ___ tired."), n: 7, of: 20 };
    render(<PlacementScreen onBack={() => {}} />);
    expect(await screen.findByText("They ___ tired.")).toBeInTheDocument();
    expect(screen.getByText(/7 من 20/)).toBeInTheDocument();
  });
});
