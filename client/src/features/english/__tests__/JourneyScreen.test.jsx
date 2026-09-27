import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import JourneyScreen from "../journey/JourneyScreen";
import { buildJourney, travelledPath, STAGE_ART } from "../journey/journeyStages";

const node = (tag, title, status, pct = null) => ({ tag, title, status, pct, prereqs: [], topics: [], tip: "" });
const isl = (id, title, en, open, boss, nodes, mastered = 0) => ({ id, title, en, level: "A1", tone: "green", open, mastered, boss: { status: boss, pct: boss === "passed" ? 90 : null }, edges: [], nodes });
const ids = Object.keys(STAGE_ART);
const world = {
  islands: [
    isl("sentence", "ابنِ الجملة", "Build a Sentence", true, "passed", [node("be-have", "فعل الكينونة", "mastered", 90)], 1),
    isl("time", "آلة الزمن", "Time Machine", true, "locked", [node("present", "المضارع", "mastered", 80), node("past", "الماضي", "available")], 1),
    ...ids.slice(2).map((id, i) => isl(id, `محطة ${i + 3}`, `Stage ${i + 3}`, false, "locked", [node(`t${i}`, `درس ${i}`, "locked")])),
  ],
  total: 8, mastered: 2, bosses: 1, quest: "past", player: "present", friends: [],
};
vi.mock("../services/english.service", () => ({ getWorld: vi.fn(async () => world) }));

beforeEach(() => {
  window.matchMedia = vi.fn(() => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} }));
  window.scrollTo = vi.fn();
  Element.prototype.scrollIntoView = vi.fn();
});

describe("journey stages", () => {
  it("should mark completed, current, next and locked stages in their fixed bottom-to-top order", () => {
    const j = buildJourney(world);
    expect(j.stages.map((s) => s.status)).toEqual(["completed", "current", "next", "locked", "locked", "locked", "locked"]);
    expect(j.current).toBe(1);
    expect(j.pct).toBe(25);
    expect(j.stages.map((s) => s.art.n)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(STAGE_ART.sentence.y).toBeGreaterThan(STAGE_ART.mastery.y); // الأولى في الأسفل
    expect(travelledPath(0)).toBe("");
    expect(travelledPath(1)).toMatch(/^M 290 1410 C .* 655 1090$/);
  });
});

describe("JourneyScreen", () => {
  it("should show the seven stages, open a stage sheet, continue the current lesson, and explore a stage", async () => {
    const onLesson = vi.fn(), onStage = vi.fn();
    render(<JourneyScreen onBack={() => {}} onLesson={onLesson} onBoss={() => {}} onStage={onStage} onList={() => {}} />);
    expect(await screen.findByRole("button", { name: "2 · آلة الزمن · أنت هنا" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "1 · ابنِ الجملة · مكتملة" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "3 · محطة 3 · التالية" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /· مقفلة$/ })).toHaveLength(4);
    await waitFor(() => expect(window.scrollTo).toHaveBeenCalled()); // تُفتح على المحطة الحالية
    const bar = screen.getByRole("region", { name: "تابع رحلتك" });
    expect(bar).toHaveTextContent("الماضي");
    fireEvent.click(screen.getByRole("button", { name: /^تابع/ }));
    expect(onLesson).toHaveBeenCalledWith("past");
    fireEvent.click(screen.getByRole("button", { name: "4 · محطة 4 · مقفلة" }));
    const sheet = await screen.findByRole("dialog", { name: "محطة 4" });
    expect(sheet).toHaveTextContent("اجتز زعيم «محطة 3» لتُفتح هذه المحطة.");
    fireEvent.click(screen.getByRole("button", { name: "استكشف المحطة" }));
    expect(onStage).toHaveBeenCalledWith("connect");
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
