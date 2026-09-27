import { describe, it, expect, vi } from "vitest";
import { EventEmitter } from "node:events";

vi.mock("node:dns/promises", () => ({ default: {
  resolve4: vi.fn(async (h) => (h === "example.com" ? [{ address: "93.184.216.34", ttl: 300 }] : Promise.reject(new Error("ENOTFOUND")))),
  resolve6: vi.fn(async () => { throw new Error("ENODATA"); }),
  resolveCname: vi.fn(async () => { throw new Error("ENODATA"); }),
  resolveMx: vi.fn(async () => [{ exchange: "mail2.example.com", priority: 20 }, { exchange: "mail.example.com", priority: 10 }]),
  resolveNs: vi.fn(async () => ["a.iana-servers.net"]),
  resolveTxt: vi.fn(async () => [["v=spf1 -all"]]),
} }));
const spawnMock = vi.fn();
vi.mock("node:child_process", () => ({ spawn: (...a) => spawnMock(...a) }));
const tools = await import("../tools.service.js");

const fakeMtr = (stdout) => { const c = new EventEmitter(); c.stdout = new EventEmitter(); c.stderr = new EventEmitter(); setTimeout(() => { c.stdout.emit("data", stdout); c.emit("close", 0); }, 5); return c; };

describe("tech live tools", () => {
  it("should resolve a domain with sorted MX and TTLs, strip a pasted URL, and reject bad names", async () => {
    const r = await tools.lookup("https://Example.com/path");
    expect(r.host).toBe("example.com");
    expect(r.a).toEqual([{ address: "93.184.216.34", ttl: 300 }]);
    expect(r.mx.map((m) => m.priority)).toEqual([10, 20]);
    expect(r.txt).toEqual(["v=spf1 -all"]);
    await expect(tools.lookup("not a host")).rejects.toMatchObject({ code: "TOOL_BAD_INPUT" });
    await expect(tools.lookup("nope.invalid")).rejects.toMatchObject({ code: "DNS_NOT_FOUND" });
  });

  it("should report the visitor's public address from the proxy header and flag private ranges", () => {
    expect(tools.whoami({ headers: { "x-forwarded-for": "203.0.113.9, 10.0.0.1", "user-agent": "t" }, socket: {} })).toMatchObject({ ip: "203.0.113.9", family: "IPv4", private: false });
    expect(tools.whoami({ headers: {}, socket: { remoteAddress: "::ffff:192.168.1.20" } })).toMatchObject({ ip: "192.168.1.20", private: true });
  });

  it("should parse mtr hops, pass the host as a separate argument, and refuse unsafe input", async () => {
    spawnMock.mockImplementation(() => fakeMtr("Start: x\nHOST: qw  Loss%  Snt  Last  Avg  Best  Wrst StDev\n  1.|-- ???   100.0  1  0.0  0.0  0.0  0.0  0.0\n  2.|-- 141.101.65.120  0.0%  1  62.1  62.1  62.1  62.1  0.0\n  3.|-- 1.1.1.1  0.0%  1  1.0  1.0  1.0  1.0  0.0\n"));
    const r = await tools.trace("1.1.1.1");
    expect(spawnMock.mock.calls[0][0]).toBe("mtr");
    expect(spawnMock.mock.calls[0][1].at(-1)).toBe("1.1.1.1");
    expect(r.hops).toEqual([{ hop: 1, ip: null, loss: 100, ms: null }, { hop: 2, ip: "141.101.65.120", loss: 0, ms: 62.1 }, { hop: 3, ip: "1.1.1.1", loss: 0, ms: 1 }]);
    expect(r.reached).toBe(true);
    await expect(tools.trace("1.1.1.1; rm -rf /")).rejects.toMatchObject({ code: "TOOL_BAD_INPUT" });
    await expect(tools.trace("$(whoami).com")).rejects.toMatchObject({ code: "TOOL_BAD_INPUT" });
  });
});
