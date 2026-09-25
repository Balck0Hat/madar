import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import PlacementScreen from "../components/PlacementScreen";

const item = (id, q) => ({ id, q, opts: ["go", "goes", "going", "went"] });
const timer = () => ({ startedAt: new Date().toISOString(), budget: 600, now: Date.now() });
const part = { id: "r1", title: "A notice", text: "The pool opens at nine.", n: 1, of: 1, from: 0, qs: [
  { k: "detail", q: "When does it open?", opts: ["eight", "nine", "ten", "noon"] },
  { k: "gap", type: "gap", q: "The pool opens at ___." },
] };
const result = { level: "B1", label: "متوسط", confidence: "medium", range: ["B1", "B2"], ielts: "4 إلى 5", toefl: "42 إلى 71", parts: { grammar: "B1", reading: "B1", listening: "B1", writing: null },
  skills: { all: [{ key: "perfect", label: "الأزمنة التامة", n: 3, ok: 1, rate: 33 }], weak: [{ key: "perfect", label: "الأزمنة التامة" }], strong: [] }, kinds: [{ key: "gap", label: "إكمال الفراغ", n: 1, ok: 0, rate: 0 }],
  plan: [{ week: 1, title: "علاج نقاط الضعف", items: ["الأزمنة التامة: have done مقابل did."] }, { week: 2, title: "تثبيت", items: ["أعد اختبار المستوى."] }],
  recommendation: { track: "general-plus", text: "أنت في B1." } };
let state;
vi.mock("../services/english.service", () => ({
  getPlacement: vi.fn(async () => ({ session: state.session, history: state.history })),
  startPlacement: vi.fn(async () => { state.session = { id: "aaaaaaaaaaaaaaaaaaaaaaaa", stage: "grammar", item: item("g1", "She ___ to school."), n: 1, min: 12, max: 24, timer: timer() }; return state.session; }),
  answerPlacement: vi.fn(async (id, itemId, choice) => {
    if (itemId === "g1") return { correct: choice === 1, a: 1, why: "المضارع البسيط.", next: { id, stage: "reading", part, timer: timer() } };
    if (itemId === "r1#0") return { correct: choice === 1, a: 1, why: "في النصّ: at nine.", next: { id, stage: "reading", part, timer: timer() } };
    return { correct: choice === "nine", a: "nine", why: "الكلمة في النصّ: nine.", next: { id, stage: "writing", writing: { id: "w-b1", prompt: "Write about your weekend.", minutes: 10, words: 80 } } };
  }),
  timeoutPlacement: vi.fn(),
  submitWriting: vi.fn(async (id) => ({ id, stage: "done", writing: { status: "pending" }, result })),
  skipWriting: vi.fn(),
}));

beforeEach(() => { state = { session: null, history: [] }; vi.clearAllMocks(); });

describe("PlacementScreen", () => {
  it("should walk from the intro through grammar, a reading passage with a gap question, and writing to the report", async () => {
    render(<PlacementScreen onBack={() => {}} onGo={() => {}} />);
    fireEvent.click(await screen.findByRole("button", { name: "ابدأ" }));
    expect(await screen.findByText("She ___ to school.")).toBeInTheDocument();
    expect(screen.getByRole("timer")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /goes/ }));
    expect(await screen.findByText("المضارع البسيط.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "التالي" }));
    expect(await screen.findByText("A notice")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /nine/ }));
    expect(await screen.findByText("في النصّ: at nine.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "السؤال التالي" }));
    expect(await screen.findByText("The pool opens at ___.")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("إجابة الفراغ"), { target: { value: "Nine" } });
    fireEvent.click(screen.getByRole("button", { name: "تحقق" }));
    expect(await screen.findByText("الكلمة في النصّ: nine.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "المقطع التالي" }));
    expect(await screen.findByText("Write about your weekend.")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("نصّ الكتابة"), { target: { value: Array(25).fill("word").join(" ") } });
    fireEvent.click(screen.getByRole("button", { name: "أرسل للتصحيح" }));
    expect(await screen.findByText("B1–B2")).toBeInTheDocument(); // مدى لأن الثقة متوسطة
    expect(screen.getByText(/ثقة متوسطة/)).toBeInTheDocument();
    expect(screen.getByText("الأزمنة التامة")).toBeInTheDocument();
    expect(screen.getByText("خطة الأسبوعين القادمين")).toBeInTheDocument();
    expect(screen.getByText("جارٍ التصحيح")).toBeInTheDocument();
  });

  it("should resume an existing session instead of showing the intro", async () => {
    state.session = { id: "aaaaaaaaaaaaaaaaaaaaaaaa", stage: "grammar", item: item("g7", "They ___ tired."), n: 7, min: 12, max: 24, timer: timer() };
    render(<PlacementScreen onBack={() => {}} />);
    expect(await screen.findByText("They ___ tired.")).toBeInTheDocument();
    expect(screen.getByText(/السؤال 7/)).toBeInTheDocument();
  });
});
