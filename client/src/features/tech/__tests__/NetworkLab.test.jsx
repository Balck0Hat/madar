import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import NetworkLab from "../lab/NetworkLab";
import StepDiagram from "../diagrams/StepDiagram";
import { sceneOf } from "../diagrams";

const dev = (re) => screen.getByRole("button", { name: re });

describe("network lab", () => {
  it("should connect devices by tapping, hand out addresses, send a packet, and solve the first scenario", () => {
    render(<NetworkLab onBack={() => {}} />);
    expect(screen.getByText(/الهدف:/)).toBeInTheDocument();
    fireEvent.click(dev(/^حاسوب 1/)); fireEvent.click(dev(/^راوتر 1/));
    expect(dev(/^حاسوب 1 192\.168\.1\.10/)).toBeInTheDocument();
    fireEvent.click(dev(/^هاتف 1/)); fireEvent.click(dev(/^راوتر 1/));
    fireEvent.click(screen.getByRole("radio", { name: /أرسل رزمة/ }));
    fireEvent.click(dev(/^حاسوب 1/)); fireEvent.click(dev(/^هاتف 1/));
    expect(screen.getByRole("status")).toHaveTextContent(/وصلت الرزمة في 2 قفزة/);
    expect(screen.getByText(/أحسنت، تحقق الهدف/)).toBeInTheDocument();
  });

  it("should explain a failed delivery when a switch is off and let the user turn it back on", () => {
    render(<NetworkLab onBack={() => {}} />);
    fireEvent.click(screen.getByRole("tab", { name: "الشبكة انقطعت" }));
    fireEvent.click(screen.getByRole("radio", { name: /أرسل رزمة/ }));
    fireEvent.click(dev(/^حاسوب 1/)); fireEvent.click(dev(/^الإنترنت 1/));
    expect(screen.getByRole("status")).toHaveTextContent(/لم تصل/);
    fireEvent.click(screen.getByRole("radio", { name: /وصل/ }));
    fireEvent.click(dev(/^سويتش 1.*مطفأ/));
    fireEvent.click(screen.getByRole("button", { name: "شغّل" }));
    expect(screen.getByText(/أحسنت، تحقق الهدف/)).toBeInTheDocument();
  });

  it("should add devices on a free board and refuse a second internet", () => {
    render(<NetworkLab onBack={() => {}} />);
    fireEvent.click(screen.getByRole("tab", { name: "لوحة حرة" }));
    expect(screen.getByText(/اللوحة فارغة/)).toBeInTheDocument();
    const add = screen.getByRole("group", { name: "أضف جهازاً" });
    fireEvent.click(add.querySelector("button:last-child")); fireEvent.click(add.querySelector("button:last-child"));
    expect(screen.getAllByRole("button", { name: /^الإنترنت 1/ })).toHaveLength(1);
    expect(screen.getByRole("status")).toHaveTextContent("إنترنت واحد يكفي");
  });
});

describe("step diagram", () => {
  it("should step through a scene with captions and disable the edges", () => {
    render(<StepDiagram scene={sceneOf("dns")} />);
    expect(screen.getByRole("button", { name: "السابق" })).toBeDisabled();
    expect(screen.getByText(/الخطوة 1 من 5/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "التالي" }));
    expect(screen.getByText(/الخطوة 2 من 5/)).toBeInTheDocument();
    for (let i = 0; i < 5; i++) fireEvent.click(screen.getByRole("button", { name: "التالي" }));
    expect(screen.getByRole("button", { name: "التالي" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "من البداية" }));
    expect(screen.getByText(/الخطوة 1 من 5/)).toBeInTheDocument();
  });
});
