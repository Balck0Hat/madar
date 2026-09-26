import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import WorldScreen from "../world/WorldScreen";

const node = (tag, title, status, extra = {}) => ({ tag, title, status, pct: null, prereqs: [], topics: ["أ", "ب", "ج"], tip: "نصيحة", level: "A1", minutes: 12, ...extra });
const world = {
  islands: [
    { id: "base", title: "أساس الجملة", level: "A1", tone: "green", open: true, mastered: 1, boss: { status: "locked", pct: null }, edges: [["be-have", "pronouns"]],
      nodes: [node("be-have", "فعل الكينونة والملكية", "mastered", { pct: 90 }), node("pronouns", "الضمائر", "available"), node("articles", "أدوات التعريف", "locked", { prereqs: ["pronouns"] })] },
    { id: "time", title: "الزمن", level: "A1–B1", tone: "gold", open: false, mastered: 0, boss: { status: "locked", pct: null }, edges: [], nodes: [node("present", "المضارع", "locked")] },
  ],
  total: 4, mastered: 1, bosses: 0, quest: "pronouns", player: "be-have", friends: [{ name: "سارة", tag: "pronouns" }], bossItems: 15,
};
vi.mock("../services/english.service", () => ({ getWorld: vi.fn(async () => world), startBoss: vi.fn() }));

let reduced = false;
beforeEach(() => {
  window.matchMedia = vi.fn((q) => ({ matches: q.includes("reduced-motion") ? reduced : false, addEventListener: () => {}, removeEventListener: () => {} }));
  Element.prototype.scrollIntoView = vi.fn();
});

describe("WorldScreen", () => {
  it("should draw the islands, mark locked nodes, show the quest, and open a node sheet with lesson and practice", async () => {
    const onLesson = vi.fn(), onPractice = vi.fn();
    render(<WorldScreen onBack={() => {}} onLesson={onLesson} onPractice={onPractice} onBoss={() => {}} onList={() => {}} />);
    expect(await screen.findByRole("region", { name: "جزيرة أساس الجملة" })).toBeInTheDocument();
    expect(screen.getByText(/مهمة اليوم: الضمائر/)).toBeInTheDocument();
    expect(screen.getByText("اجتز زعيم الجزيرة السابقة")).toBeInTheDocument(); // ضباب الجزيرة المقفلة
    fireEvent.click(screen.getByRole("button", { name: /أدوات التعريف · مقفل/ }));
    expect(await screen.findByRole("dialog", { name: "أدوات التعريف" })).toBeInTheDocument();
    expect(screen.getByText(/أتقن أولاً: الضمائر/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "تمرين 10 أسئلة" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "افتح الدرس" }));
    expect(onLesson).toHaveBeenCalledWith("articles");
    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.click(screen.getByRole("button", { name: /الضمائر/ }));
    fireEvent.click(await screen.findByRole("button", { name: "تمرين 10 أسئلة" }));
    expect(onPractice).toHaveBeenCalledWith("pronouns");
  });

  it("should jump to the quest node from the resume button and open the boss sheet", async () => {
    const onBoss = vi.fn();
    render(<WorldScreen onBack={() => {}} onLesson={() => {}} onPractice={() => {}} onBoss={onBoss} onList={() => {}} />);
    fireEvent.click(await screen.findByRole("button", { name: /ابدأ من حيث توقفت/ }));
    expect(await screen.findByRole("dialog", { name: "الضمائر" })).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.click(screen.getByRole("button", { name: /زعيم أساس الجملة/ }));
    expect(await screen.findByRole("dialog", { name: "زعيم أساس الجملة" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ابدأ امتحان الزعيم" })).toBeDisabled();
  });

  it("should render the scene flat when the user prefers reduced motion", async () => {
    reduced = true;
    const { container } = render(<WorldScreen onBack={() => {}} onLesson={() => {}} onPractice={() => {}} onBoss={() => {}} onList={() => {}} />);
    await screen.findByRole("region", { name: "جزيرة أساس الجملة" });
    const scene = container.querySelector(".world-scene");
    expect(scene.style.transform).toBe("none"); // بلا ميلان؛ والحركات تُعطَّل في CSS بقاعدة prefers-reduced-motion
    reduced = false;
  });
});
