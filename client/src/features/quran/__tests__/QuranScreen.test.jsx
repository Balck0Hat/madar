import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import QuranScreen from "../components/QuranScreen";

const suras = [
  { n: 1, name: "الْفَاتِحَة", nameSimple: "الفاتحه", revelation: "مكية", ayahs: 7, page: 1, juz: 1 },
  { n: 112, name: "الْإِخْلَاص", nameSimple: "الاخلاص", revelation: "مكية", ayahs: 4, page: 604, juz: 30 },
  { n: 114, name: "النَّاس", nameSimple: "الناس", revelation: "مكية", ayahs: 6, page: 604, juz: 30 },
];
const juz = Array.from({ length: 30 }, (_, i) => ({ juz: i + 1, total: 100, started: i === 29 ? 5 : 0, strong: i === 29 ? 2 : 0 }));
let memo;
vi.mock("../services/quran.service", async (orig) => ({
  ...(await orig()),
  listSuras: vi.fn(async () => suras),
  getMemo: vi.fn(async () => memo),
  setGoal: vi.fn(async (goal) => { memo = { ...memo, goal, today: { due: [], fresh: ["112:1", "112:2"], total: 4, started: 0, memorized: 0 } }; return memo; }),
}));

beforeEach(() => { memo = { goal: null, today: { due: [], fresh: [], total: 0, started: 0, memorized: 0 }, juz, items: {}, sessions: [] }; });

describe("QuranScreen", () => {
  it("should ask for a goal first, then show today's dose after saving", async () => {
    render(<QuranScreen onBack={() => {}} onOpenSura={() => {}} onRecite={() => {}} />);
    expect(await screen.findByText("ماذا تحفظ؟")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "احفظ الهدف" }));
    expect(await screen.findByText("جرعة اليوم")).toBeInTheDocument();
    expect(screen.getByText(/الجزء 30/)).toBeInTheDocument();
    expect(screen.getAllByText("الْإِخْلَاص").length).toBeGreaterThan(0);
  });

  it("should list due reviews before fresh ayahs and start a recitation", async () => {
    const onRecite = vi.fn();
    memo = { ...memo, goal: { kind: "sura", from: 112, to: 112, perDay: 2 }, today: { due: ["114:1"], fresh: ["112:1"], total: 4, started: 1, memorized: 0 } };
    render(<QuranScreen onBack={() => {}} onOpenSura={() => {}} onRecite={onRecite} />);
    expect(await screen.findByText("راجع أولاً")).toBeInTheDocument();
    expect(screen.getByText("ثم احفظ")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /سمّع النَّاس آية 1/ }));
    expect(onRecite).toHaveBeenCalledWith(114, 1);
    expect(screen.getByRole("img", { name: "خريطة الأجزاء الثلاثين" })).toBeInTheDocument();
  });

  it("should search suras by name without diacritics and open one", async () => {
    const onOpenSura = vi.fn();
    memo = { ...memo, goal: { kind: "juz", from: 30, to: 30, perDay: 3 } };
    render(<QuranScreen onBack={() => {}} onOpenSura={onOpenSura} onRecite={() => {}} />);
    await screen.findByText("جرعة اليوم");
    fireEvent.change(screen.getByLabelText("ابحث عن سورة"), { target: { value: "الناس" } });
    await waitFor(() => expect(screen.queryByText("الْفَاتِحَة")).not.toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /النَّاس/ }));
    expect(onOpenSura).toHaveBeenCalledWith(114);
  });
});
