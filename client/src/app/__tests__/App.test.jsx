import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import App from "../App";
import { ApiError } from "../../shared/utils/api";
import { learningUnit } from "../../test/fixtures/learning";

// خادم وهمي في الذاكرة بدل HTTP: يُحاكي القواعد الأساسية للخادم الحقيقي
const db = { user: null, state: null };
const emptyState = () => ({ progress: {}, attempts: {}, xp: 0, weeklyXp: 0, badges: [], studied: [], frozenDays: [], freezes: 0, streak: 0, lastLeague: null });
const settings = { minutes: 30, fav: "human", arabicNums: false, reminders: true };
const mkUser = (name, email) => ({ id: "u1", name, email, handle: `${name}-ab12`, role: "user", tier: 0, settings: { ...settings } });

vi.mock("../../features/auth/services/auth.service", () => ({
  providers: vi.fn(async () => ({ google: false })),
  googleUrl: () => "/api/v1/auth/google",
  me: vi.fn(async () => { if (!db.user) throw new ApiError("no session", 401, "UNAUTHORIZED"); return db.user; }),
  register: vi.fn(async ({ name, email }) => { db.user = mkUser(name, email); db.state = emptyState(); return db.user; }),
  login: vi.fn(async ({ email }) => { if (email !== "sara@example.com") throw new ApiError("البريد أو كلمة المرور غير صحيحة", 401, "BAD_CREDENTIALS"); db.user = mkUser("سارة", email); db.state = emptyState(); return db.user; }),
  logout: vi.fn(async () => { db.user = null; }),
  updateMe: vi.fn(async (f) => { db.user = { ...db.user, settings: { ...db.user.settings, ...f } }; return db.user; }),
}));

vi.mock("../../features/content/services/content.service", () => ({
  listAuthoredIds: vi.fn(async () => ["center-1"]),
  getUnit: vi.fn(async (id) => { if (id !== "center-1") throw new ApiError("الوحدة غير متاحة", 404, "UNIT_NOT_FOUND"); return learningUnit; }),
  getQuiz: vi.fn(async () => ({ unitId: "center-1", title: learningUnit.title, questions: learningUnit.questions })),
  getSummaries: vi.fn(async () => []),
}));

// محاولة الاختبار تعيش على الخادم: الأسئلة تُسحب مرة واحدة وتُستأنف كما هي.
// السؤال المفتوح يأتي بعلامة self لأن بيئة الاختبار بلا مفتاح ذكاء اصطناعي، فيُقيّمه المتعلم نفسه.
vi.mock("../../features/quiz/services/quizAttempt.service", () => ({
  startAttempt: vi.fn(async () => ({
    unitId: "center-1",
    questions: learningUnit.questions.map((q) => (q.t === "open" ? { ...q, self: true, keywords: ["الاسترجاع", "التثبيت"] } : q)),
    answers: [],
  })),
  saveAnswer: vi.fn(async () => ({ answered: 1 })),
}));

vi.mock("../../features/review/services/review.service", () => ({ getDue: vi.fn(async () => ({ items: [], totalDue: 0 })), answerReview: vi.fn() }));
vi.mock("../../features/challenge/services/challenge.service", () => ({
  getChallenge: vi.fn(async () => ({ question: null, answeredToday: true, correctToday: false, streak: 0, totalAnswered: 0 })),
  answerChallenge: vi.fn(),
}));
vi.mock("../../features/exam/services/exam.service", () => ({ getStatus: vi.fn(async () => ({ eligible: false, certificate: null })), startExam: vi.fn(), submitExam: vi.fn(), verifyCertificate: vi.fn() }));

vi.mock("../../features/progress/services/progress.service", () => ({
  getState: vi.fn(async () => db.state),
  saveResume: vi.fn(async () => ({})),
  getStats: vi.fn(async () => ({ weeks: [], byDomain: [] })),
  finishUnit: vi.fn(async (unitId, { answers, correct, total, sim }) => {
    let graded = null;
    if (answers) { graded = answers.map((a) => { const q = learningUnit.questions.find((x) => x.qid === a.qid); return { qid: a.qid, ok: q.t === "open" ? String(a.answer).length >= 8 : q.t === "fill" ? q.a.includes(String(a.answer).toLowerCase()) : a.answer === q.a }; }); correct = graded.filter((g) => g.ok).length; total = graded.length; }
    const passed = correct / total >= 0.7, fresh = !db.state.progress[unitId], perfect = correct === total;
    const gain = passed && fresh ? 80 + (perfect ? 30 : 0) : 0;
    if (passed) db.state = { ...db.state, progress: { ...db.state.progress, [unitId]: { score: correct, total, perfect, sim } }, xp: db.state.xp + gain, weeklyXp: db.state.weeklyXp + gain, badges: ["first"], streak: 1 };
    const result = { unitId, correct, total, passed, gain, breakdown: gain ? [["إكمال الدرس", 50], ["اجتياز الاختبار", 30]] : [], newBadges: fresh && passed ? ["first"] : [], newThreads: [], sim, fresh, xpBefore: db.state.xp - gain, graded };
    return { state: db.state, result };
  }),
}));

beforeEach(() => {
  db.user = null; db.state = null;
  // الجولة التعريفية تُعرض مرة واحدة؛ اختبارات التدفق تخصّ متعلّماً رآها
  try { localStorage.setItem("madar.tour.v1", "done"); } catch (err) { /* التخزين محجوب */ }
});

async function registerToMap() {
  render(<App />);
  fireEvent.click(await screen.findByText("ابدأ الرحلة"));
  fireEvent.change(screen.getByLabelText("الاسم"), { target: { value: "سارة" } });
  fireEvent.change(screen.getByLabelText("البريد الإلكتروني"), { target: { value: "sara@example.com" } });
  fireEvent.change(screen.getByLabelText("كلمة المرور"), { target: { value: "pass1234" } });
  fireEvent.click(screen.getByText("أنشئ الحساب"));
  fireEvent.click(await screen.findByText("التالي"));
  fireEvent.click(screen.getByText("افتح الخريطة"));
  await screen.findByText("ابدأ الوحدة");
}

describe("App flow", () => {
  it("should show the landing screen when there is no session", async () => {
    render(<App />);
    expect(await screen.findByText("ابدأ الرحلة")).toBeInTheDocument();
  });

  it("should show the server error on a wrong login", async () => {
    render(<App />);
    fireEvent.click(await screen.findByText("لديّ حساب"));
    fireEvent.change(screen.getByLabelText("البريد الإلكتروني"), { target: { value: "x@example.com" } });
    fireEvent.change(screen.getByLabelText("كلمة المرور"), { target: { value: "pass1234" } });
    fireEvent.click(screen.getByText("ادخل"));
    expect(await screen.findByRole("alert")).toHaveTextContent("البريد أو كلمة المرور غير صحيحة");
  });

  it("should register, onboard, load the API lesson, pass the quiz and show the graded result", async () => {
    await registerToMap();
    fireEvent.click(screen.getByText("ابدأ الوحدة"));
    await screen.findByText(/ابدأ الاختبار|التالي/);
    for (let i = 0; i < 9; i++) fireEvent.click(await screen.findByText("التالي"));
    fireEvent.click(screen.getByText(/ابدأ الاختبار/));
    fireEvent.click(await screen.findByText("إبنغهاوس")); fireEvent.click(screen.getByText("تحقق")); fireEvent.click(screen.getByText("التالي"));
    fireEvent.click(screen.getByText("خطأ")); fireEvent.click(screen.getByText("تحقق")); fireEvent.click(screen.getByText("التالي"));
    fireEvent.click(screen.getByText("حين توشك أن تنسى")); fireEvent.click(screen.getByText("تحقق")); fireEvent.click(screen.getByText("التالي"));
    fireEvent.change(screen.getByPlaceholderText("اكتب إجابتك"), { target: { value: "نقاط الخبرة" } });
    fireEvent.click(screen.getByText("تحقق")); fireEvent.click(screen.getByText("التالي"));
    fireEvent.change(screen.getByPlaceholderText("جملة واحدة تكفي"), { target: { value: "لأن الاسترجاع يثبت المعلومة أكثر" } });
    fireEvent.click(screen.getByText("تحقق"));
    // السؤال المفتوح يكشف الإجابة النموذجية ويطلب حكم المتعلم على نفسه بدل درجة آلية
    expect(screen.getByText("الإجابة النموذجية")).toBeInTheDocument();
    expect(screen.getByText("النقاط التي كنا نبحث عنها")).toBeInTheDocument();
    fireEvent.click(screen.getByText("فهمتها"));
    fireEvent.click(screen.getByText("النتيجة"));
    await waitFor(() => expect(screen.getByText("علامة كاملة")).toBeInTheDocument());
    expect(screen.getByText("+110")).toBeInTheDocument();
  });

  it("should show the first-run tour to a new learner only once", async () => {
    try { localStorage.removeItem("madar.tour.v1"); } catch (err) { /* التخزين محجوب */ }
    db.user = mkUser("سارة", "sara@example.com"); db.state = emptyState();
    render(<App />);
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("تخطّي الجولة"));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    cleanup();
    render(<App />);
    await screen.findByText("ابدأ الوحدة");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("should resume the session, open the library and log out", async () => {
    db.user = mkUser("سارة", "sara@example.com"); db.state = emptyState();
    render(<App />);
    await screen.findByText("ابدأ الوحدة");
    fireEvent.click(screen.getAllByRole("button", { name: "أنا" })[0]);
    fireEvent.click(await screen.findByText("مكتبتي"));
    expect(await screen.findByText("المكتبة فارغة")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("عودة"));
    fireEvent.click(await screen.findByText("تسجيل الخروج"));
    expect(await screen.findByText("ابدأ الرحلة")).toBeInTheDocument();
  });
});
