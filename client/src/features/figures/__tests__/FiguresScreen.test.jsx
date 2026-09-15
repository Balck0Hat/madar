import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { resetFigureProgress } from "../hooks/useFigureProgress";
import FiguresScreen from "../components/FiguresScreen";
import * as svc from "../services/figures.service";

const rows = [
  { figureId: "hammurabi", name: "حمورابي", englishName: "Hammurabi", tier: "1", born: "~-1810", died: "~-1750", era: "القديم", category: "قادة وسياسة", why: "الشريعة." },
  { figureId: "newton", name: "نيوتن", englishName: "Isaac Newton", tier: "1", born: "1643", died: "1727", era: "الحديث المبكر", category: "علوم وطب", why: "الجاذبية." },
];
vi.mock("../services/figures.service", () => ({
  listFigures: vi.fn(async ({ era, category, q } = {}) => rows.filter((r) => (!era || r.era === era) && (!category || r.category === category) && (!q || r.name.includes(q) || r.englishName.toLowerCase().includes(q.toLowerCase())))),
  getFigure: vi.fn(), getProgress: vi.fn(async () => ({ read: {}, page: {} })), putProgress: vi.fn(),
}));

beforeEach(() => { vi.clearAllMocks(); resetFigureProgress(); });

describe("FiguresScreen", () => {
  it("should list every figure with its why line", async () => {
    render(<FiguresScreen onBack={() => {}} onOpen={() => {}} />);
    expect(await screen.findByText("حمورابي")).toBeInTheDocument();
    expect(screen.getByText("نيوتن")).toBeInTheDocument();
    expect(screen.getByText("الجاذبية.")).toBeInTheDocument();
  });

  it("should narrow by era chip and by category chip without a reload", async () => {
    render(<FiguresScreen onBack={() => {}} onOpen={() => {}} />);
    await screen.findByText("حمورابي");
    fireEvent.click(screen.getByRole("button", { name: /^القديم/ }));
    await waitFor(() => expect(screen.queryByText("نيوتن")).not.toBeInTheDocument());
    expect(screen.getByText("حمورابي")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "كل العصور" }));
    fireEvent.click(screen.getByRole("button", { name: /^علوم وطب/ }));
    await waitFor(() => expect(screen.queryByText("حمورابي")).not.toBeInTheDocument());
    expect(screen.getByText("نيوتن")).toBeInTheDocument();
  });

  it("should search by English name after the debounce", async () => {
    render(<FiguresScreen onBack={() => {}} onOpen={() => {}} />);
    await screen.findByText("حمورابي");
    fireEvent.change(screen.getByLabelText("ابحث عن شخصية"), { target: { value: "newt" } });
    await waitFor(() => expect(screen.queryByText("حمورابي")).not.toBeInTheDocument(), { timeout: 1500 });
    expect(screen.getByText("نيوتن")).toBeInTheDocument();
    expect(svc.listFigures).toHaveBeenCalledWith(expect.objectContaining({ q: "newt" }));
  });

  it("should group the cards under period headings and badge the ones already read", async () => {
    svc.getProgress.mockResolvedValueOnce({ read: { newton: "2026-01-01T00:00:00.000Z" }, page: {} });
    render(<FiguresScreen onBack={() => {}} onOpen={() => {}} />);
    await screen.findByText("حمورابي");
    expect(screen.getByRole("heading", { name: "الألفية الثانية قبل الميلاد" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "القرن السابع عشر الميلادي" })).toBeInTheDocument();
    expect(await screen.findAllByText("قُرئ")).toHaveLength(1);
    expect(screen.getByRole("button", { name: /^القديم 1/ })).toBeInTheDocument(); // الفلتر يحمل عدده
  });

  it("should open a figure when its card is tapped", async () => {
    const onOpen = vi.fn();
    render(<FiguresScreen onBack={() => {}} onOpen={onOpen} />);
    fireEvent.click(await screen.findByText("حمورابي"));
    expect(onOpen).toHaveBeenCalledWith("hammurabi");
  });
});
