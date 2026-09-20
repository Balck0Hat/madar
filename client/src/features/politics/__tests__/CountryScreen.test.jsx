import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import CountryScreen from "../components/CountryScreen";

const country = {
  countryId: "jordan", name: "الأردن", officialName: "المملكة الأردنية الهاشمية", englishName: "Jordan", flag: "🇯🇴", region: "الشام والعراق", continent: "آسيا",
  capital: "عمّان", population: "نحو 11.5 مليون", area: "89,342 كم²", independence: "1946", currency: "الدينار", languages: ["العربية"], geo: { lat: 31.9, lon: 35.9 }, asOf: "2026-09-20",
  government: { type: "ملكية حاكمة", form: "ملكية", headOfState: { title: "الملك", name: "عبد الله الثاني", since: "1999" }, headOfGovernment: { title: "رئيس الوزراء", name: "جعفر حسان", since: "2024" }, how: "العرش بالوراثة.", term: "مدى الحياة.", legislature: "مجلس نواب منتخب ومجلس أعيان معيَّن.", note: "" },
  why: "مملكة في قلب المشرق.", quick: "ملخص عن الأردن.", story: [{ h: "كيف نشأت", p: "نشأت إمارة سنة 1921." }, { h: "كيف تُحكم", p: "ملكية وراثية." }],
  check: { q: "متى استقل الأردن؟", opts: ["1921", "1946"], a: 1, why: "سنة 1946." }, sources: ["الدستور الأردني 1952"],
};
const list = [{ countryId: "jordan", name: "الأردن", flag: "🇯🇴", geo: country.geo, government: country.government }, { countryId: "syria", name: "سوريا", flag: "🇸🇾", geo: { lat: 33.5, lon: 36.3 }, government: { type: "انتقالي" } }];
vi.mock("../services/politics.service", () => ({
  getCountry: vi.fn(async () => country), listCountries: vi.fn(async () => list),
  getOverview: vi.fn(async () => ({ systems: [{ name: "ملكية حاكمة", color: "#C9A227" }] })),
}));

describe("CountryScreen", () => {
  it("should lead with who rules now and how, then the numbers and the story", async () => {
    render(<CountryScreen countryId="jordan" onBack={() => {}} />);
    expect(await screen.findByRole("heading", { name: "الأردن" })).toBeInTheDocument();
    expect(screen.getByText("عبد الله الثاني")).toBeInTheDocument();
    expect(screen.getByText("جعفر حسان")).toBeInTheDocument();
    expect(screen.getByText("العرش بالوراثة.")).toBeInTheDocument();
    expect(screen.getByText("مجلس نواب منتخب ومجلس أعيان معيَّن.")).toBeInTheDocument();
    expect(screen.getByText("1946")).toBeInTheDocument();
    expect(screen.getByText(/تحقّقنا منها في 2026-09-20/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "كيف نشأت" })).toBeInTheDocument();
    expect(screen.getByText(/الدستور الأردني/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /سؤال سريع/ })).toBeInTheDocument();
  });

  it("should open the next country and other countries from the map", async () => {
    const onOpen = vi.fn();
    render(<CountryScreen countryId="jordan" onBack={() => {}} onOpen={onOpen} />);
    await screen.findByRole("heading", { name: "الأردن" });
    fireEvent.click(screen.getByRole("button", { name: /التالي/ }));
    expect(onOpen).toHaveBeenCalledWith("syria");
    fireEvent.click(screen.getByRole("button", { name: "افتح سوريا" }));
    expect(onOpen).toHaveBeenCalledTimes(2);
  });
});
