import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import App from "../App";
import { ApiError } from "../../shared/utils/api";

// خادم وهمي في الذاكرة بدل HTTP: يُحاكي القواعد الأساسية للخادم الحقيقي
const db = { user: null, state: null };
const emptyState = () => ({ progress: {}, attempts: {}, xp: 0, weeklyXp: 0, badges: [], studied: [], streak: 0 });
const settings = { minutes: 30, fav: "human", arabicNums: false };

vi.mock("../../features/auth/services/auth.service", () => ({
  me: vi.fn(async () => { if (!db.user) throw new ApiError("no session", 401, "UNAUTHORIZED"); return db.user; }),
  register: vi.fn(async ({ name, email }) => { db.user = { id: "u1", name, email, settings: { ...settings } }; db.state = emptyState(); return db.user; }),
  login: vi.fn(async ({ email }) => { if (email !== "sara@example.com") throw new ApiError("البريد أو كلمة المرور غير صحيحة", 401, "BAD_CREDENTIALS"); db.user = { id: "u1", name: "سارة", email, settings: { ...settings } }; db.state = emptyState(); return db.user; }),
  logout: vi.fn(async () => { db.user = null; }),
  updateMe: vi.fn(async (f) => { db.user = { ...db.user, settings: { ...db.user.settings, ...f } }; return db.user; }),
}));

vi.mock("../../features/progress/services/progress.service", () => ({
  getState: vi.fn(async () => db.state),
  finishUnit: vi.fn(async (unitId, { correct, total, sim }) => {
    const passed = correct / total >= 0.7, fresh = !db.state.progress[unitId], perfect = correct === total;
    const gain = passed && fresh ? 80 + (perfect ? 30 : 0) : 0;
    if (passed) db.state = { ...db.state, progress: { ...db.state.progress, [unitId]: { score: correct, total, perfect, sim } }, xp: db.state.xp + gain, weeklyXp: db.state.weeklyXp + gain, badges: ["first"], streak: 1 };
    const result = { unitId, correct, total, passed, gain, breakdown: gain ? [["إكمال الدرس", 50], ["اجتياز الاختبار", 30]] : [], newBadges: fresh && passed ? ["first"] : [], newThreads: [], sim, fresh, xpBefore: db.state.xp - gain };
    return { state: db.state, result };
  }),
}));

beforeEach(() => { db.user = null; db.state = null; });

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

  it("should validate the register form on the client before calling the API", async () => {
    render(<App />);
    fireEvent.click(await screen.findByText("ابدأ الرحلة"));
    fireEvent.change(screen.getByLabelText("كلمة المرور"), { target: { value: "short" } });
    fireEvent.click(screen.getByText("أنشئ الحساب"));
    expect(await screen.findByText("الاسم مطلوب")).toBeInTheDocument();
    expect(screen.getByText("8 أحرف على الأقل، فيها حرف ورقم")).toBeInTheDocument();
  });

  it("should show the server error on a wrong login", async () => {
    render(<App />);
    fireEvent.click(await screen.findByText("لديّ حساب"));
    fireEvent.change(screen.getByLabelText("البريد الإلكتروني"), { target: { value: "x@example.com" } });
    fireEvent.change(screen.getByLabelText("كلمة المرور"), { target: { value: "pass1234" } });
    fireEvent.click(screen.getByText("ادخل"));
    expect(await screen.findByRole("alert")).toHaveTextContent("البريد أو كلمة المرور غير صحيحة");
  });

  it("should register, onboard and land on the map with the first center unit", async () => {
    await registerToMap();
    expect(screen.getByText("كيف يتعلم دماغك، وكيف يعمل مدار")).toBeInTheDocument();
  });

  it("should complete the center-1 lesson and quiz and show the server result", async () => {
    await registerToMap();
    fireEvent.click(screen.getByText("ابدأ الوحدة"));
    for (let i = 0; i < 9; i++) fireEvent.click(screen.getByText("التالي"));
    fireEvent.click(screen.getByText(/ابدأ الاختبار/));
    fireEvent.click(screen.getByText("إبنغهاوس")); fireEvent.click(screen.getByText("تحقق")); fireEvent.click(screen.getByText("التالي"));
    fireEvent.click(screen.getByText("خطأ")); fireEvent.click(screen.getByText("تحقق")); fireEvent.click(screen.getByText("التالي"));
    fireEvent.click(screen.getByText("حين توشك أن تنسى")); fireEvent.click(screen.getByText("تحقق")); fireEvent.click(screen.getByText("التالي"));
    fireEvent.change(screen.getByPlaceholderText("اكتب إجابتك"), { target: { value: "نقاط الخبرة" } });
    fireEvent.click(screen.getByText("تحقق")); fireEvent.click(screen.getByText("التالي"));
    fireEvent.change(screen.getByPlaceholderText("جملة واحدة تكفي"), { target: { value: "لأن الاسترجاع يثبت المعلومة أكثر" } });
    fireEvent.click(screen.getByText("تحقق")); fireEvent.click(screen.getByText("النتيجة"));
    await waitFor(() => expect(screen.getByText("علامة كاملة")).toBeInTheDocument());
    expect(screen.getByText("+110")).toBeInTheDocument();
  });

  it("should resume the session on reload and allow logging out", async () => {
    db.user = { id: "u1", name: "سارة", email: "sara@example.com", settings: { ...settings } };
    db.state = emptyState();
    render(<App />);
    await screen.findByText("ابدأ الوحدة");
    fireEvent.click(screen.getByText("أنا"));
    fireEvent.click(await screen.findByText("تسجيل الخروج"));
    expect(await screen.findByText("ابدأ الرحلة")).toBeInTheDocument();
  });
});
