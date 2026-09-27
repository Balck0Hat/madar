import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import GrammarMapScreen from "../grammar/GrammarMapScreen";

const topic = (id, title, level, extra = {}) => ({ id, title, en: id, level, band: level === "A1" ? "basics" : "intermediate", tag: "present", summary: `ملخص ${title}`, ready: true, marked: false, mastery: null, ...extra });
const tree = { total: 3, marked: ["present-perfect"], branches: [
  { id: "tenses", title: "الأزمنة", en: "Tenses", hue: "violet", groups: [{ id: "present", title: "المضارع", en: "Present", topics: [topic("present-simple", "المضارع البسيط", "A1"), topic("present-perfect", "المضارع التام", "B1", { marked: true })] }] },
  { id: "verbs", title: "الأفعال", en: "Verbs", hue: "blue", groups: [{ id: "modals", title: "الأفعال الناقصة", en: "Modals", topics: [topic("can-could", "can و could", "A1")] }] },
] };
const full = { id: "present-perfect", title: "المضارع التام", en: "Present Perfect", level: "B1", band: "intermediate", tag: "perfect", summary: "أثر الماضي في الحاضر.", form: ["Subject + have/has + past participle"], usage: ["حدث له أثر الآن."], examples: [{ en: "I have lost my keys.", ar: "أضعت مفاتيحي." }], mistakes: [{ wrong: "I have seen him yesterday.", right: "I saw him yesterday.", note: "زمن محدد → ماضٍ بسيط." }], related: [{ id: "present-simple", title: "المضارع البسيط", level: "A1" }], path: { branch: { title: "الأزمنة" }, group: { title: "المضارع" } }, marked: true };
vi.mock("../services/english.service", () => ({
  getGrammarTree: vi.fn(async () => tree),
  getGrammarTopic: vi.fn(async () => full),
  searchGrammar: vi.fn(async (q) => (q.includes("تام") ? [{ id: "present-perfect", title: "المضارع التام", en: "Present Perfect", level: "B1" }] : [])),
  toggleGrammarMark: vi.fn(async () => ({ marked: false })),
}));

let desktop = false;
beforeEach(() => { window.matchMedia = vi.fn((q) => ({ matches: q.includes("min-width") ? desktop : false, addEventListener: () => {}, removeEventListener: () => {} })); });

describe("GrammarMapScreen", () => {
  it("should open a branch on the phone, open a topic sheet with its sections, and toggle the bookmark", async () => {
    const onPractice = vi.fn();
    render(<GrammarMapScreen onBack={() => {}} onLesson={() => {}} onPractice={onPractice} onJourney={() => {}} />);
    fireEvent.click(await screen.findByRole("button", { name: /^الأزمنة/ }));
    fireEvent.click(screen.getByRole("button", { name: /المضارع التام · B1/ }));
    expect(await screen.findByRole("dialog", { name: "المضارع التام" })).toBeInTheDocument();
    expect(screen.getByText("Subject + have/has + past participle")).toBeInTheDocument();
    expect(screen.getByText("I have seen him yesterday.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "الأمثلة" }));
    expect(screen.queryByText("Subject + have/has + past participle")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "أزل من المفضلة" }));
    expect(await screen.findByRole("button", { name: "أضف إلى المفضلة" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "تدرّب على هذا الموضوع" }));
    expect(onPractice).toHaveBeenCalledWith("perfect");
  });

  it("should filter by level, search with a debounce, and switch to the list view", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    render(<GrammarMapScreen onBack={() => {}} onLesson={() => {}} onPractice={() => {}} onJourney={() => {}} />);
    fireEvent.click(await screen.findByRole("button", { name: "قائمة" }));
    expect(screen.getByRole("region", { name: "الأفعال" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "متوسط" }));
    expect(screen.getByRole("button", { name: /المضارع البسيط/ }).style.opacity).toBe("0.35");
    expect(screen.getByRole("button", { name: /المضارع التام/ }).style.opacity).toBe("1");
    fireEvent.change(screen.getByLabelText("ابحث في القواعد"), { target: { value: "التام" } });
    await waitFor(() => expect(screen.getByRole("option")).toBeInTheDocument(), { timeout: 2000 });
    fireEvent.click(screen.getByRole("option"));
    expect(await screen.findByRole("dialog", { name: "المضارع التام" })).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("should render the illustrated world by default on desktop, then the draggable mind map", async () => {
    desktop = true;
    render(<GrammarMapScreen onBack={() => {}} onLesson={() => {}} onPractice={() => {}} onJourney={() => {}} />);
    expect(await screen.findByRole("application", { name: /عالم القواعد/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /جزيرة الأزمنة/ })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "خريطة مصغّرة" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "ذهنية" }));
    expect(await screen.findByRole("application", { name: /الخريطة الذهنية/ })).toBeInTheDocument();
    expect(screen.getByText("قواعد الإنجليزية")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "الأزمنة · 2 موضوعاً" })).toBeInTheDocument();
    const readout = () => screen.getByText(/٪$/).textContent;
    const before = readout();
    fireEvent.click(screen.getByRole("button", { name: "تكبير" }));
    expect(readout()).not.toBe(before); // التقريب يغيّر النسبة المعروضة
    desktop = false;
  });
});
