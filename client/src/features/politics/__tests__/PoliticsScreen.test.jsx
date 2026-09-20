import { render, screen, fireEvent, within } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useState } from "react";
import PoliticsScreen from "../components/PoliticsScreen";

const systems = [
  { systemId: "ruling-monarchy", name: "ملكية حاكمة", color: "#C9A227", count: "نحو 10", ours: 1, what: "الملك يملك ويحكم.", how: "بالوراثة.", accountability: "تتفاوت.", examples: ["الأردن"], note: "" },
  { systemId: "parliamentary", name: "برلماني", color: "#3FA0D8", count: "نحو 40", ours: 1, what: "رئيس الوزراء يحكم.", how: "ثقة البرلمان.", accountability: "سحب الثقة.", examples: ["العراق"], note: "" },
  { systemId: "one-party", name: "حزب واحد", color: "#E08FB0", count: "6", ours: 0, what: "حزب يحتكر.", how: "داخل الحزب.", accountability: "داخل الحزب.", examples: ["الصين"], note: "" },
];
const countries = [
  { countryId: "jordan", name: "الأردن", officialName: "المملكة الأردنية الهاشمية", englishName: "Jordan", flag: "🇯🇴", region: "الشام والعراق", capital: "عمّان", geo: { lat: 31.9, lon: 35.9 }, government: { type: "ملكية حاكمة", form: "ملكية", headOfState: { title: "الملك", name: "عبد الله الثاني" }, headOfGovernment: { title: "رئيس الوزراء", name: "جعفر حسان" } } },
  { countryId: "iraq", name: "العراق", officialName: "جمهورية العراق", englishName: "Iraq", flag: "🇮🇶", region: "الشام والعراق", capital: "بغداد", geo: { lat: 33.3, lon: 44.4 }, government: { type: "برلماني", form: "جمهورية", headOfState: { title: "رئيس الجمهورية", name: "نزار آميدي" }, headOfGovernment: { title: "رئيس الوزراء", name: "علي الزيدي" } } },
];
const families = [{ familyId: "sovereign", family: "ألقاب السيادة الوراثية", intro: "رأس الدولة بالوراثة.", titles: [
  { titleId: "sultan", name: "سلطان", original: "Sultan", meaning: "حاكم مسلم مستقل.", origin: "من السلطة أي القوة والحجة.", duties: "يحكم ويقود الجيش.", rank: "دون الخليفة اسمياً.", today: "عُمان وبروناي.", holders: ["صلاح الدين"] },
  { titleId: "caesar", name: "قيصر", original: "Caesar", meaning: "لقب أباطرة روما.", origin: "من اسم يوليوس قيصر.", duties: "الحكم المطلق.", rank: "أعلى لقب.", today: "انقرض.", holders: ["أغسطس"] },
] }];

vi.mock("../services/politics.service", () => ({
  getOverview: vi.fn(async () => ({ systems, counts: { countries: 2, titles: 2, families: 1 }, asOf: "2026-09-20" })),
  listCountries: vi.fn(async () => countries), listTitles: vi.fn(async () => families), getCountry: vi.fn(),
}));

function Host({ onOpenCountry = () => {} }) {
  const [tab, setTab] = useState("countries");
  return <PoliticsScreen tab={tab} onTab={setTab} onBack={() => {}} onOpenCountry={onOpenCountry} />;
}

describe("PoliticsScreen", () => {
  it("should list countries with who rules now, grouped by region, and open one", async () => {
    const onOpen = vi.fn();
    render(<Host onOpenCountry={onOpen} />);
    expect(await screen.findByText("الأردن")).toBeInTheDocument();
    expect(screen.getByText("عبد الله الثاني")).toBeInTheDocument();
    expect(screen.getByText("علي الزيدي")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "الشام والعراق" })).toBeInTheDocument();
    expect(screen.getByText(/تحقّقنا منها في 2026-09-20/)).toBeInTheDocument();
    fireEvent.click(screen.getByText("العراق"));
    expect(onOpen).toHaveBeenCalledWith("iraq");
  });

  it("should filter by government type, hide types we have no countries for, and search by ruler name", async () => {
    render(<Host />);
    await screen.findByText("الأردن");
    expect(screen.queryByRole("button", { name: /^حزب واحد/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /^برلماني/ }));
    expect(screen.queryByText("الأردن")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "كل الأنواع" }));
    fireEvent.change(screen.getByLabelText("ابحث عن دولة"), { target: { value: "جعفر" } });
    expect(screen.getByText("الأردن")).toBeInTheDocument();
    expect(screen.queryByText("العراق")).not.toBeInTheDocument();
  });

  it("should open a title to show where the word came from, and search titles", async () => {
    render(<Host />);
    await screen.findByText("الأردن");
    fireEvent.click(screen.getByRole("tab", { name: /الألقاب/ }));
    expect(screen.queryByText("من السلطة أي القوة والحجة.")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /سلطان/ }));
    expect(screen.getByText("من السلطة أي القوة والحجة.")).toBeInTheDocument();
    expect(screen.getByText("صلاح الدين")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("ابحث عن لقب"), { target: { value: "يوليوس" } });
    expect(screen.queryByRole("button", { name: /سلطان/ })).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("ابحث عن لقب"), { target: { value: "أغسطس" } });
    expect(screen.getByText("من اسم يوليوس قيصر.")).toBeInTheDocument(); // نتيجة واحدة تُفتح وحدها
  });

  it("should explain each system and jump to its countries", async () => {
    render(<Host />);
    await screen.findByText("الأردن");
    fireEvent.click(screen.getByRole("tab", { name: /أنواع الحكم/ }));
    const card = screen.getByRole("heading", { name: "برلماني" }).closest("article");
    expect(within(card).getByText("سحب الثقة.")).toBeInTheDocument();
    fireEvent.click(within(card).getByRole("button", { name: /اعرض دولنا/ }));
    expect(screen.getByText("العراق")).toBeInTheDocument();
    expect(screen.queryByText("الأردن")).not.toBeInTheDocument();
  });
});
