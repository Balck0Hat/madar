import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import TechHubScreen from "../components/TechHubScreen";
import BranchScreen from "../components/BranchScreen";
import TopicScreen from "../components/TopicScreen";

const topic = (id, title, level, extra = {}) => ({ id, title, en: id, level, summary: `ملخص ${title}`, ready: true, marked: false, ...extra });
const tree = { total: 3, marked: ["dns"], branches: [
  { id: "networks", title: "الشبكات والإنترنت", en: "Networks", hue: "teal", groups: [{ id: "how", title: "كيف يعمل الإنترنت", en: "How", topics: [topic("ip-addresses", "عناوين IP", "basics"), topic("dns", "نظام أسماء النطاقات", "intermediate", { marked: true })] }] },
  { id: "ai", title: "الذكاء الاصطناعي", en: "AI", hue: "orange", groups: [{ id: "b", title: "أساسيات", en: "Basics", topics: [topic("llms-chatgpt", "النماذج اللغوية", "intermediate")] }] },
] };
const full = { id: "dns", title: "نظام أسماء النطاقات", en: "DNS", level: "intermediate", summary: "دليل الهاتف للإنترنت.", how: ["يسأل جهازك خادم DNS.", "الجواب يُحفظ مؤقتاً.", "الأسماء هرمية."], uses: ["تغيير DNS قد يسرّع التصفح.", "رقابة الأهل تعمل عبر DNS."], terms: [{ en: "cache", ar: "ذاكرة مؤقتة", note: "نسخة محفوظة." }], myths: [{ wrong: "DNS هو مزوّد الإنترنت.", right: "DNS خدمة دليل فقط.", note: "المزوّد يعطيك الاتصال." }], related: [{ id: "ip-addresses", title: "عناوين IP", level: "basics" }], path: { branch: { id: "networks", title: "الشبكات والإنترنت" }, group: { title: "كيف يعمل الإنترنت" } }, marked: true, prev: { id: "ip-addresses", title: "عناوين IP" }, next: null };
vi.mock("../services/tech.service", () => ({
  getTechTree: vi.fn(async () => tree),
  getTechTopic: vi.fn(async () => full),
  searchTech: vi.fn(async (q) => (q.includes("DNS") || q.includes("نطاق") ? [{ id: "dns", title: "نظام أسماء النطاقات", en: "DNS", level: "intermediate" }] : [])),
  toggleTechMark: vi.fn(async () => ({ marked: false })),
}));

beforeEach(() => { window.scrollTo = vi.fn(); });

describe("tech screens", () => {
  it("should list the branches on the hub, filter topics by level, and search", async () => {
    const onBranch = vi.fn(), onTopic = vi.fn();
    render(<TechHubScreen onBack={() => {}} onBranch={onBranch} onTopic={onTopic} />);
    expect(await screen.findByRole("region", { name: "الشبكات والإنترنت" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "أساسي" }));
    expect(screen.getByRole("button", { name: /عناوين IP/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /نظام أسماء النطاقات/ })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "المفضلة" })); fireEvent.click(screen.getByRole("button", { name: "الكل" }));
    expect(screen.getByRole("button", { name: /نظام أسماء النطاقات/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /نظام أسماء النطاقات/ }));
    expect(onTopic).toHaveBeenCalledWith("dns");
    fireEvent.change(screen.getByLabelText("ابحث في التقنية"), { target: { value: "DNS" } });
    expect(await screen.findByRole("option", {}, { timeout: 2000 })).toBeInTheDocument();
  });

  it("should show a branch with level tabs and open a topic", async () => {
    const onTopic = vi.fn();
    render(<BranchScreen branchId="networks" onBack={() => {}} onTopic={onTopic} />);
    expect(await screen.findByRole("region", { name: "كيف يعمل الإنترنت" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "متوسط" }));
    expect(screen.queryByRole("button", { name: /عناوين IP/ })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /نظام أسماء النطاقات/ }));
    expect(onTopic).toHaveBeenCalledWith("dns");
  });

  it("should render a topic with its sections, toggle the bookmark, and navigate to related and previous topics", async () => {
    const onOpen = vi.fn();
    render(<TopicScreen topicId="dns" onBack={() => {}} onOpen={onOpen} onBranch={() => {}} />);
    expect(await screen.findByRole("heading", { level: 1 })).toHaveTextContent("نظام أسماء النطاقات");
    expect(screen.getByText("يسأل جهازك خادم DNS.")).toBeInTheDocument();
    expect(screen.getByText("DNS هو مزوّد الإنترنت.")).toBeInTheDocument();
    expect(screen.getByText("cache")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "أزل من المفضلة" }));
    expect(await screen.findByRole("button", { name: "أضف إلى المفضلة" })).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button", { name: /عناوين IP/ })[0]);
    expect(onOpen).toHaveBeenCalledWith("ip-addresses");
  });
});
