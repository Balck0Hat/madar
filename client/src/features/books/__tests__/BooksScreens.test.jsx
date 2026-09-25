import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import BooksScreen from "../components/BooksScreen";
import BookScreen from "../components/BookScreen";
import ChapterScreen from "../components/ChapterScreen";
import { resetBookProgress } from "../hooks/useBookProgress";

const books = [{ bookId: "do-everything", order: 1, title: "افعل كل شيء", subtitle: "كيف تجد وقتاً لكل شيء", cover: { color: "#C9A227", glyph: "⏳" }, chapters: 2, minutes: 15 }];
const book = { ...books[0], tagline: "168 ساعة تكفي.", audience: "لكل مشغول.", promise: "خطة أسبوع.", intro: "مقدمة الكتاب.", sources: ["Laura Vanderkam, 168 Hours"], toc: [{ chapterId: "a", order: 1, title: "أين يذهب وقتك", minutes: 7 }, { chapterId: "b", order: 2, title: "ليس أولوية", minutes: 8 }] };
const chapter = { chapterId: "a", order: 1, title: "أين يذهب وقتك", bookId: "do-everything", bookTitle: "افعل كل شيء", color: "#C9A227", total: 2, minutes: 7, hook: "افتتاحية.", sections: [{ h: "168 ساعة", p: "الأسبوع 168 ساعة." }, { h: "التدقيق", p: "سجّل أسبوعاً." }], exercise: { title: "تمرين اليوم", steps: ["افتح دفتراً", "سجّل ساعتك"], minutes: 10 }, takeaways: ["الوقت موجود", "الأولوية قرار"], check: { q: "كم ساعة في الأسبوع؟", opts: ["100", "168"], a: 1, why: "24 × 7." } };
let progress;
vi.mock("../services/books.service", async (orig) => ({
  ...(await orig()),
  listBooks: vi.fn(async () => books), getBook: vi.fn(async () => book), getChapter: vi.fn(async () => chapter),
  getProgress: vi.fn(async () => progress),
  putProgress: vi.fn(async (id, patch) => { if (patch.read) progress.read[`${id}:${patch.chapter}`] = 1; if (patch.chapter) progress.last[id] = patch.chapter; return progress; }),
}));
vi.mock("../../notes", () => ({
  Marked: ({ text }) => <span>{text}</span>,
  NoteToolbar: () => null,
  useSelectionNote: () => ({ ref: { current: null }, onClick: () => {}, pageNotes: [], sel: null, busy: false, err: "", close: () => {}, save: () => {}, edit: () => {}, remove: () => {} }),
}));
import * as svc from "../services/books.service";

beforeEach(() => { vi.clearAllMocks(); resetBookProgress(); progress = { read: {}, last: {} }; });

describe("books", () => {
  it("should shelve the books with progress and open one", async () => {
    const onOpen = vi.fn();
    render(<BooksScreen onBack={() => {}} onOpen={onOpen} />);
    expect(await screen.findByText("افعل كل شيء")).toBeInTheDocument();
    expect(screen.getByText(/2 فصول · نحو 15 دقيقة/)).toBeInTheDocument();
    expect(screen.getByText("لم تبدأه بعد")).toBeInTheDocument();
    fireEvent.click(screen.getByText("افعل كل شيء"));
    expect(onOpen).toHaveBeenCalledWith("do-everything");
  });

  it("should show the table of contents with read marks and resume at the first unread chapter", async () => {
    progress = { read: { "do-everything:1": 1 }, last: { "do-everything": 1 } };
    const onOpenChapter = vi.fn();
    render(<BookScreen bookId="do-everything" onBack={() => {}} onOpenChapter={onOpenChapter} />);
    expect(await screen.findByRole("heading", { name: "افعل كل شيء" })).toBeInTheDocument();
    await screen.findByText(/تابع: الفصل 2/);
    fireEvent.click(screen.getByText(/تابع: الفصل 2/));
    expect(onOpenChapter).toHaveBeenCalledWith(2);
    fireEvent.click(screen.getByRole("button", { name: /ليس أولوية/ }));
    expect(onOpenChapter).toHaveBeenCalledWith(2);
    expect(screen.getByRole("button", { name: /تنزيل الكتاب PDF/ })).toBeInTheDocument();
  });

  it("should read a chapter with sections, exercise, takeaways and an optional question, then mark it read and go on", async () => {
    const onOpenChapter = vi.fn();
    render(<ChapterScreen bookId="do-everything" n={1} onBack={() => {}} onOpenChapter={onOpenChapter} />);
    expect(await screen.findByRole("heading", { name: "أين يذهب وقتك" })).toBeInTheDocument();
    expect(screen.getByText("الفصل 1 من 2")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "168 ساعة" })).toBeInTheDocument();
    expect(screen.getByText("افتح دفتراً")).toBeInTheDocument();
    expect(screen.getByText("الأولوية قرار")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /سؤال سريع/ })).toBeInTheDocument();
    await waitFor(() => expect(svc.putProgress).toHaveBeenCalledWith("do-everything", { chapter: 1 }));
    fireEvent.click(screen.getByRole("button", { name: /أنهيت الفصل/ }));
    await waitFor(() => expect(svc.putProgress).toHaveBeenCalledWith("do-everything", { chapter: 1, read: true }));
    expect(onOpenChapter).toHaveBeenCalledWith(2);
  });
});
