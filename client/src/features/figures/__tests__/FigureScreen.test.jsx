import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import FigureScreen from "../components/FigureScreen";

const figure = {
  figureId: "hammurabi", name: "حمورابي", englishName: "Hammurabi", tier: "1", born: "~-1810", died: "~-1750",
  era: "القديم", region: "بابل", category: "قادة وسياسة", hero: { num: "282", label: "مادة قانونية" },
  why: "أول من جعل القانون نصاً عاماً.", quick: "ملخص سريع عن حمورابي.",
  story: [{ h: "بابل قبل حمورابي", p: "كانت بابل صغيرة." }, { h: "المسلّة", p: "نُقشت الشرائع على الديوريت." }],
  sources: ["Van De Mieroop, King Hammurabi of Babylon"],
};
vi.mock("../services/figures.service", () => ({ getFigure: vi.fn(async () => figure), listFigures: vi.fn(async () => [figure]) }));

describe("FigureScreen", () => {
  it("should open on the quick summary with the hero number and the why line", async () => {
    render(<FigureScreen figureId="hammurabi" onBack={() => {}} />);
    expect(await screen.findByText("حمورابي")).toBeInTheDocument();
    expect(screen.getByText("282")).toBeInTheDocument();
    expect(screen.getByText("ملخص سريع عن حمورابي.")).toBeInTheDocument();
    expect(screen.queryByText("بابل قبل حمورابي")).not.toBeInTheDocument();
  });

  it("should switch to the full story without reloading and show its sections and sources", async () => {
    render(<FigureScreen figureId="hammurabi" onBack={() => {}} />);
    await screen.findByText("حمورابي");
    fireEvent.click(screen.getByRole("tab", { name: /القصة الكاملة/ }));
    expect(screen.getByText("بابل قبل حمورابي")).toBeInTheDocument();
    expect(screen.getByText("المسلّة")).toBeInTheDocument();
    expect(screen.getByText(/Van De Mieroop/)).toBeInTheDocument();
    expect(screen.queryByText("ملخص سريع عن حمورابي.")).not.toBeInTheDocument();
  });

  it("should render the life span in Arabic with BC years", async () => {
    render(<FigureScreen figureId="hammurabi" onBack={() => {}} />);
    expect(await screen.findByText(/نحو 1810 ق\.م – نحو 1750 ق\.م/)).toBeInTheDocument();
  });
});
