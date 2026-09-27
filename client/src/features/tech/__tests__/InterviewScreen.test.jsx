import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import InterviewScreen from "../components/InterviewScreen";

const q = (text, level, a) => ({ q: text, level, a, hint: "تلميح" });
const data = { branch: { id: "networks", title: "الشبكات والإنترنت", en: "Networks", hue: "teal" }, total: 3, groups: [
  { id: "how", title: "كيف يعمل الإنترنت", topics: [
    { id: "dns", title: "نظام أسماء النطاقات", questions: [q("ما هو DNS؟", "basics", "دليل يحوّل الأسماء إلى عناوين."), q("ما DNS over HTTPS؟", "advanced", "استعلام مشفّر داخل HTTPS.")] },
    { id: "ip-addresses", title: "عناوين IP", questions: [q("ما الفرق بين IPv4 وIPv6؟", "intermediate", "طول العنوان وعدد العناوين.")] },
  ] },
] };
vi.mock("../services/tech.service", () => ({ getTechInterview: vi.fn(async () => data) }));

describe("InterviewScreen", () => {
  it("should list questions by group, hide answers until revealed, and filter by level", async () => {
    render(<InterviewScreen branchId="networks" onBack={() => {}} onTopic={() => {}} />);
    expect(await screen.findByRole("region", { name: "كيف يعمل الإنترنت" })).toBeInTheDocument();
    expect(screen.queryByText("دليل يحوّل الأسماء إلى عناوين.")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /ما هو DNS؟/ }));
    expect(screen.getByText("دليل يحوّل الأسماء إلى عناوين.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "متقدم" }));
    expect(screen.queryByRole("button", { name: /ما هو DNS؟/ })).toBeNull();
    expect(screen.getByRole("button", { name: /DNS over HTTPS/ })).toBeInTheDocument();
  });

  it("should run the quiz mode one question at a time with reveal and next", async () => {
    const onTopic = vi.fn();
    render(<InterviewScreen branchId="networks" onBack={() => {}} onTopic={onTopic} />);
    fireEvent.click(await screen.findByRole("button", { name: "بالترتيب" }));
    expect(screen.getByText(/اختبرني · 1 من 3/)).toBeInTheDocument();
    expect(screen.queryByText("دليل يحوّل الأسماء إلى عناوين.")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "اكشف الجواب" }));
    expect(screen.getByText("دليل يحوّل الأسماء إلى عناوين.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "السؤال التالي" }));
    expect(screen.getByText(/اختبرني · 2 من 3/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "نظام أسماء النطاقات" }));
    expect(onTopic).toHaveBeenCalledWith("dns");
  });
});
