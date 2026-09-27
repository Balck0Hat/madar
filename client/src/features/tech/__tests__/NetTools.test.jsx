import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import NetTools from "../tools/NetTools";

vi.mock("../services/tech.service", () => ({
  getDns: vi.fn(async (name) => (name === "bad" ? Promise.reject(new Error("لم يُعثر على هذا الاسم")) : { host: name, ms: 12, a: [{ address: "93.184.216.34", ttl: 3600 }], aaaa: [], cname: [], mx: [{ exchange: "mail.example.com", priority: 10 }], ns: ["a.iana-servers.net"], txt: [] })),
  getMyIp: vi.fn(async () => ({ ip: "203.0.113.9", family: "IPv4", private: false, agent: "test" })),
  pingServer: vi.fn(async () => ({ t: 1 })),
  getTrace: vi.fn(async () => ({ host: "1.1.1.1", reached: true, hops: [{ hop: 1, ip: null, loss: 100, ms: null }, { hop: 2, ip: "1.1.1.1", loss: 0, ms: 9.5 }] })),
}));

describe("network live tools", () => {
  it("should resolve a domain and show its records, then show an error for a bad name", async () => {
    render(<NetTools only="dns" />);
    const input = screen.getByLabelText("اسم النطاق");
    fireEvent.change(input, { target: { value: "example.com" } });
    fireEvent.submit(input.closest("form"));
    expect(await screen.findByText(/93\.184\.216\.34/)).toBeInTheDocument();
    expect(screen.getByText(/mail\.example\.com/)).toBeInTheDocument();
    fireEvent.change(input, { target: { value: "bad" } });
    fireEvent.submit(input.closest("form"));
    expect(await screen.findByText("لم يُعثر على هذا الاسم")).toBeInTheDocument();
  });

  it("should switch tabs between tools and show the visitor address and a trace", async () => {
    render(<NetTools />);
    fireEvent.click(screen.getByRole("tab", { name: /ما عنواني/ }));
    expect(await screen.findByText("203.0.113.9")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: /تتبّع/ }));
    fireEvent.submit(screen.getByLabelText("الوجهة").closest("form"));
    expect(await screen.findByText(/لا يجيب/)).toBeInTheDocument();
    expect(screen.getByText("1.1.1.1")).toBeInTheDocument();
  });

  it("should run five latency rounds and report an average", async () => {
    render(<NetTools only="ping" />);
    fireEvent.click(screen.getByRole("button", { name: /قِس الكمون/ }));
    await waitFor(() => expect(screen.getByText(/المتوسط/)).toBeInTheDocument(), { timeout: 3000 });
    expect(screen.getAllByText(/ms$/)).toHaveLength(5);
  });
});
