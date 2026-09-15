import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import FigureScreen from "../components/FigureScreen";

const figure = {
  figureId: "hammurabi", name: "حمورابي", englishName: "Hammurabi", tier: "1", born: "~-1810", died: "~-1750",
  era: "القديم", region: "بابل", category: "قادة وسياسة", hero: { num: "282", label: "مادة قانونية" },
  why: "أول من جعل القانون نصاً عاماً.", quick: "ملخص سريع عن حمورابي سنة 1750.",
  story: [{ h: "بابل قبل حمورابي", p: "كانت بابل صغيرة وذكر سرجون." }, { h: "المسلّة", p: "نُقشت الشرائع على الديوريت." }],
  sources: ["Van De Mieroop, King Hammurabi of Babylon"],
  check: { q: "على ماذا نُقشت الشرائع؟", opts: ["طين", "ديوريت"], a: 1, why: "مسلّة من الديوريت." },
  geo: { lat: 32.5, lon: 44.4, place: "بابل" },
};
const rows = [
  { figureId: "sargon", name: "سرجون الأكادي", tier: "1", born: "~-2334", died: "~-2279", category: "قادة وسياسة", why: "أول إمبراطورية." },
  { figureId: "hammurabi", name: "حمورابي", tier: "1", born: "~-1810", died: "~-1750", category: "قادة وسياسة", why: "الشريعة." },
  { figureId: "akhenaten", name: "أخناتون", tier: "1", born: "~-1380", died: "~-1336", category: "دين وفلسفة", why: "آتون." },
];
vi.mock("../services/figures.service", () => ({ getFigure: vi.fn(async () => figure), listFigures: vi.fn(async () => rows) }));

beforeEach(() => localStorage.clear());

describe("FigureScreen", () => {
  it("should open on the quick summary with the hero number, the why line, and a way into the story", async () => {
    render(<FigureScreen figureId="hammurabi" onBack={() => {}} />);
    expect(await screen.findByText("حمورابي")).toBeInTheDocument();
    expect(screen.getByText("282")).toBeInTheDocument();
    expect(screen.getByText(/ملخص سريع عن حمورابي/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /اقرأ القصة الكاملة/ })).toBeInTheDocument();
    expect(screen.queryByText("بابل قبل حمورابي")).not.toBeInTheDocument();
  });

  it("should show the story one section at a time and reach sources, question, and next figure at the end", async () => {
    const onOpen = vi.fn();
    render(<FigureScreen figureId="hammurabi" onBack={() => {}} onOpen={onOpen} />);
    await screen.findByText("حمورابي");
    fireEvent.click(screen.getByRole("tab", { name: /القصة الكاملة/ }));
    expect(screen.getByText("بابل قبل حمورابي")).toBeInTheDocument();
    expect(screen.queryByText("المسلّة")).not.toBeInTheDocument();
    expect(screen.getByText("1 من 2")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "التالي" }));
    expect(screen.getByText("المسلّة")).toBeInTheDocument();
    expect(screen.getByText(/Van De Mieroop/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /سؤال سريع/ })).toBeInTheDocument();
    expect(screen.getByText("أخناتون")).toBeInTheDocument(); // التالي في القائمة
    expect(screen.getByText("سرجون الأكادي")).toBeInTheDocument(); // ذُكر في القصة
    fireEvent.click(screen.getByText("أخناتون"));
    expect(onOpen).toHaveBeenCalledWith("akhenaten");
  });

  it("should remember the last section on the device and mark the figure read at the end", async () => {
    const { unmount } = render(<FigureScreen figureId="hammurabi" onBack={() => {}} />);
    await screen.findByText("حمورابي");
    fireEvent.click(screen.getByRole("tab", { name: /القصة الكاملة/ }));
    fireEvent.click(screen.getByRole("button", { name: "التالي" }));
    unmount();
    render(<FigureScreen figureId="hammurabi" onBack={() => {}} />);
    await screen.findByText("حمورابي");
    fireEvent.click(screen.getByRole("tab", { name: /القصة الكاملة/ }));
    expect(screen.getByText("2 من 2")).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("madar.figures")).read.hammurabi).toBeTruthy();
  });

  it("should render the life span, how long ago, the map place, and the contemporaries line", async () => {
    render(<FigureScreen figureId="hammurabi" onBack={() => {}} />);
    expect(await screen.findByText(/نحو 1810 ق\.م – نحو 1750 ق\.م/)).toBeInTheDocument();
    expect(screen.getByText(/عاش قبل نحو/)).toBeInTheDocument();
    expect(screen.getByText("بابل")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /عاش بين/ })).toBeInTheDocument();
  });

  it("should set numbers in the summary in the numeral face", async () => {
    render(<FigureScreen figureId="hammurabi" onBack={() => {}} />);
    await screen.findByText("حمورابي");
    expect(document.querySelector(".madar-num")?.textContent).toBe("1750");
  });
});
