import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ReciteScreen from "../components/ReciteScreen";

const sura = { n: 112, name: "الْإِخْلَاص", ayahs: [{ s: 112, a: 1, t: "قُلۡ هُوَ ٱللَّهُ أَحَدٌ", n: "قل هو الله احد", p: 604, j: 30 }] };
vi.mock("../services/quran.service", async (orig) => ({ ...(await orig()), getSura: vi.fn(async () => sura), reviewAyah: vi.fn(async () => ({ stage: 1 })) }));
vi.mock("../hooks/useRecorder", () => ({ useRecorder: () => ({ recording: rec.on, level: 0, error: "", start: vi.fn(async () => { rec.on = true; }), stop: vi.fn(() => { rec.on = false; }) }) }));
import * as svc from "../services/quran.service";

const rec = { on: false };
// قناة WebSocket مزيّفة: نتحكم بما «يسمعه» الخادم
const sockets = [];
class FakeWS {
  constructor() { this.readyState = 1; this.sent = []; sockets.push(this); setTimeout(() => this.onopen?.(), 0); }
  send(d) { this.sent.push(d); if (typeof d === "string" && JSON.parse(d).t === "start") setTimeout(() => this.emit({ t: "ready", words: 4 }), 0); }
  close() { this.readyState = 3; this.onclose?.(); }
  emit(m) { this.onmessage?.({ data: JSON.stringify(m) }); }
}

beforeEach(() => { sockets.length = 0; rec.on = false; vi.stubGlobal("WebSocket", FakeWS); vi.clearAllMocks(); });

describe("ReciteScreen", () => {
  it("should colour words as they are heard and save a clean ayah as correct", async () => {
    render(<ReciteScreen s="112" a="1" onBack={() => {}} />);
    await screen.findByText("أَحَدٌ");
    fireEvent.click(screen.getByRole("button", { name: "ابدأ التسميع" }));
    await waitFor(() => expect(sockets[0].sent[0]).toContain('"start"'));
    await act(async () => { sockets[0].emit({ t: "state", status: ["ok", "ok", "pending", "pending"], cursor: 2, done: false, text: "قل هو", ok: 2, miss: 0 }); });
    expect(screen.getByText(/سمعتُ: قل هو/)).toBeInTheDocument();
    await act(async () => {
      sockets[0].emit({ t: "state", status: ["ok", "ok", "ok", "ok"], cursor: 4, done: true, text: "قل هو الله احد", ok: 4, miss: 0 });
      sockets[0].emit({ t: "done" });
    });
    await waitFor(() => expect(svc.reviewAyah).toHaveBeenCalledWith(112, 1, true));
    expect(await screen.findByText(/سُجّلت صحيحة/)).toBeInTheDocument();
  });

  it("should let the reader decide when a word was missed", async () => {
    render(<ReciteScreen s="112" a="1" onBack={() => {}} />);
    await screen.findByText("أَحَدٌ");
    fireEvent.click(screen.getByRole("button", { name: "ابدأ التسميع" }));
    await waitFor(() => expect(sockets[0].sent[0]).toContain('"start"'));
    await act(async () => { await new Promise((r) => setTimeout(r, 5)); });
    await act(async () => {
      sockets[0].emit({ t: "state", status: ["ok", "miss", "ok", "ok"], cursor: 4, done: true, text: "قل الله احد", ok: 3, miss: 1 });
      sockets[0].emit({ t: "done" });
    });
    expect(await screen.findByText(/1 كلمة غير مطابقة/)).toBeInTheDocument();
    expect(svc.reviewAyah).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "أخطأت، أعدها غداً" }));
    await waitFor(() => expect(svc.reviewAyah).toHaveBeenCalledWith(112, 1, false));
  });

  it("should surface a channel error", async () => {
    render(<ReciteScreen s="112" a="1" onBack={() => {}} />);
    await screen.findByText("أَحَدٌ");
    fireEvent.click(screen.getByRole("button", { name: "ابدأ التسميع" }));
    await waitFor(() => expect(sockets[0].sent[0]).toContain('"start"'));
    await act(async () => { sockets[0].emit({ t: "error", message: "خدمة التعرّف غير متاحة الآن" }); });
    expect(screen.getByText("خدمة التعرّف غير متاحة الآن")).toBeInTheDocument();
  });
});
