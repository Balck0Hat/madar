import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import App from "../App";

const START_BTN = "ابدأ الرحلة";

async function goToMap(name = "سارة") {
  render(<App />);
  fireEvent.click(screen.getByText(START_BTN));
  fireEvent.change(screen.getByPlaceholderText("اسمك"), { target: { value: name } });
  fireEvent.click(screen.getByText("التالي"));
  fireEvent.click(screen.getByText("التالي"));
  fireEvent.click(screen.getByText("افتح الخريطة"));
  await screen.findByText("ابدأ الوحدة");
}

describe("App flow", () => {
  it("should render the landing screen first", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: "مدار" })).toBeInTheDocument();
    expect(screen.getByText(START_BTN)).toBeInTheDocument();
  });

  it("should reach the map after onboarding and recommend the first center unit", async () => {
    await goToMap();
    expect(screen.getByText("كيف يتعلم دماغك، وكيف يعمل مدار")).toBeInTheDocument();
    expect(screen.getByText("زائر")).toBeInTheDocument();
  });

  it("should complete the center-1 lesson, pass the quiz and award XP", async () => {
    await goToMap();
    fireEvent.click(screen.getByText("ابدأ الوحدة"));
    // 2 + 4 بطاقات + 4 صفحات = 10 صفحات؛ نتنقل حتى زر الاختبار
    for (let i = 0; i < 9; i++) fireEvent.click(screen.getByText("التالي"));
    fireEvent.click(screen.getByText(/ابدأ الاختبار/));

    fireEvent.click(screen.getByText("إبنغهاوس")); fireEvent.click(screen.getByText("تحقق")); fireEvent.click(screen.getByText("التالي"));
    fireEvent.click(screen.getByText("خطأ")); fireEvent.click(screen.getByText("تحقق")); fireEvent.click(screen.getByText("التالي"));
    fireEvent.click(screen.getByText("حين توشك أن تنسى")); fireEvent.click(screen.getByText("تحقق")); fireEvent.click(screen.getByText("التالي"));
    fireEvent.change(screen.getByPlaceholderText("اكتب إجابتك"), { target: { value: "نقاط الخبرة" } });
    fireEvent.click(screen.getByText("تحقق")); fireEvent.click(screen.getByText("التالي"));
    fireEvent.change(screen.getByPlaceholderText("جملة واحدة تكفي"), { target: { value: "لأن الاسترجاع يثبت المعلومة أكثر" } });
    fireEvent.click(screen.getByText("تحقق")); fireEvent.click(screen.getByText("النتيجة"));

    await waitFor(() => expect(screen.getByText("علامة كاملة")).toBeInTheDocument());
    // 50 درس + 30 اختبار + 30 علامة كاملة = 110
    expect(screen.getByText("+110")).toBeInTheDocument();
    expect(screen.getByText("وسام جديد: الخطوة الأولى")).toBeInTheDocument();
  });

  it("should simulate an unauthored unit and return to the map with progress", async () => {
    await goToMap();
    fireEvent.click(screen.getByRole("button", { name: /^الأرض/ }));
    await screen.findByText("الأرض تتحرك: الليل والنهار والفصول");
    fireEvent.click(screen.getByText("الأرض تتحرك: الليل والنهار والفصول"));
    fireEvent.click(await screen.findByText("محاكاة الإكمال"));
    await screen.findByText("محاكاة");
    fireEvent.click(screen.getByText("العودة إلى الخريطة"));
    await screen.findByText("ابدأ الوحدة");
    expect(screen.getAllByText("1/8").length).toBeGreaterThan(0);
  });

  it("should switch to Arabic-Indic numerals from the profile", async () => {
    await goToMap();
    fireEvent.click(screen.getByText("أنا"));
    fireEvent.click(await screen.findByText("١٢٣"));
    expect(screen.getByText("٠/٨")).toBeInTheDocument();
  });
});
