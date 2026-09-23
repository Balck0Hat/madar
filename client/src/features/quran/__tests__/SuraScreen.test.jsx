import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import SuraScreen from "../components/SuraScreen";
import { hiddenSet } from "../components/AyahText";

const sura = { n: 112, name: "الْإِخْلَاص", revelation: "مكية", page: 604, ayahs: [
  { s: 112, a: 1, t: "قُلۡ هُوَ ٱللَّهُ أَحَدٌ", n: "قل هو الله احد", p: 604, j: 30 },
  { s: 112, a: 2, t: "ٱللَّهُ ٱلصَّمَدُ", n: "الله الصمد", p: 604, j: 30 },
] };
vi.mock("../services/quran.service", async (orig) => ({
  ...(await orig()),
  getSura: vi.fn(async () => sura),
  getMemo: vi.fn(async () => ({ items: { "112:1": { stage: 2, reps: 3, lapses: 0 } } })),
  reviewAyah: vi.fn(async (s, a, correct) => ({ stage: correct ? 3 : 0, reps: 4, lapses: correct ? 0 : 1 })),
  getSimilar: vi.fn(async () => [{ s: 2, a: 1, t: "الٓمٓ", n: "الم" }]),
}));
import * as svc from "../services/quran.service";

describe("hiddenSet", () => {
  it("should hide every third, every second, or all but the first word", () => {
    expect([...hiddenSet(7, "third")]).toEqual([2, 5]);
    expect([...hiddenSet(5, "half")]).toEqual([1, 3]);
    expect([...hiddenSet(4, "all")]).toEqual([1, 2, 3]);
    expect(hiddenSet(4, "none").size).toBe(0);
  });
});

describe("SuraScreen", () => {
  it("should show the ayahs with their memorization state and hide words on demand, revealing on tap", async () => {
    render(<SuraScreen n={112} onBack={() => {}} onRecite={() => {}} />);
    expect(await screen.findByText("أَحَدٌ")).toBeInTheDocument();
    expect(screen.getByText(/متقَنة · مرحلة 3 من 6/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "أخفِ الكل" }));
    expect(screen.queryByText("أَحَدٌ")).not.toBeInTheDocument();
    const masks = screen.getAllByRole("button", { name: "اكشف الكلمة" });
    expect(masks).toHaveLength(3 + 1);
    fireEvent.click(masks[2]);
    expect(screen.getByText("أَحَدٌ")).toBeInTheDocument();
  });

  it("should record a review result and update the state line", async () => {
    render(<SuraScreen n={112} onBack={() => {}} onRecite={() => {}} />);
    await screen.findByText("أَحَدٌ");
    fireEvent.click(screen.getAllByRole("button", { name: "أخطأت فيها" })[0]);
    await waitFor(() => expect(svc.reviewAyah).toHaveBeenCalledWith(112, 1, false));
    expect(await screen.findByText(/قيد الحفظ · مرحلة 1 من 6 · زلّات 1/)).toBeInTheDocument();
  });

  it("should open similar verses and the recitation screen", async () => {
    const onRecite = vi.fn();
    render(<SuraScreen n={112} onBack={() => {}} onRecite={onRecite} />);
    await screen.findByText("أَحَدٌ");
    fireEvent.click(screen.getAllByRole("button", { name: "المتشابهات" })[0]);
    expect(await screen.findByText("آيات تشبهها")).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button", { name: "سمّع بالصوت" })[1]);
    expect(onRecite).toHaveBeenCalledWith(expect.objectContaining({ s: 112, a: 2 }));
  });
});
