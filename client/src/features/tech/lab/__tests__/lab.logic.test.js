import { describe, it, expect } from "vitest";
import { empty, addDevice, toggleLink, togglePower, setIp, removeDevice, route, conflicts } from "../lab.logic";
import { SCENARIOS } from "../scenarios";

const wire = (s, a, b) => toggleLink(s, a, b).state;

describe("network lab logic", () => {
  it("should hand out addresses only to devices that reach a running router, and free them when unplugged", () => {
    let s = addDevice(addDevice(addDevice(empty(), "router"), "pc"), "phone");
    expect(s.devices.find((d) => d.kind === "router").ip).toBe("192.168.1.1");
    expect(s.devices.find((d) => d.id === "pc-1").ip).toBeUndefined();
    s = wire(wire(s, "pc-1", "router-1"), "phone-1", "router-1");
    expect(s.devices.map((d) => d.ip)).toEqual(["192.168.1.1", "192.168.1.10", "192.168.1.11"]);
    s = wire(s, "pc-1", "router-1");
    expect(s.devices.find((d) => d.id === "pc-1").ip).toBeUndefined();
    expect(s.devices.find((d) => d.id === "phone-1").ip).toBe("192.168.1.10");
  });

  it("should route through switches, refuse when the router is off, and explain a missing link", () => {
    let s = addDevice(addDevice(addDevice(addDevice(empty(), "router"), "switch"), "pc"), "server");
    s = wire(wire(wire(s, "pc-1", "switch-1"), "switch-1", "router-1"), "server-1", "router-1");
    expect(route(s, "pc-1", "server-1")).toMatchObject({ ok: true, path: ["pc-1", "switch-1", "router-1", "server-1"], hops: 3 });
    const off = togglePower(s, "router-1");
    expect(route(off, "pc-1", "server-1").ok).toBe(false);
    expect(route(off, "pc-1", "server-1").reason).toMatch(/بلا عنوان/);
    const lonely = addDevice(s, "phone");
    expect(route(lonely, "phone-1", "server-1").reason).toMatch(/بلا عنوان/);
    expect(route(removeDevice(s, "switch-1"), "pc-1", "server-1").ok).toBe(false);
  });

  it("should only let the internet hang off a router and require the router on the way out", () => {
    let s = addDevice(addDevice(addDevice(empty(), "router"), "pc"), "internet");
    expect(toggleLink(s, "pc-1", "internet-1").error).toMatch(/راوتر/);
    expect(addDevice(s, "internet").devices.filter((d) => d.kind === "internet")).toHaveLength(1);
    s = wire(wire(s, "pc-1", "router-1"), "router-1", "internet-1");
    expect(route(s, "pc-1", "internet-1")).toMatchObject({ ok: true, path: ["pc-1", "router-1", "internet-1"] });
    expect(toggleLink(s, "pc-1", "pc-1").error).toBeTruthy();
  });

  it("should detect duplicate manual addresses and block delivery until fixed", () => {
    let s = addDevice(addDevice(addDevice(empty(), "router"), "pc"), "server");
    s = wire(wire(s, "pc-1", "router-1"), "server-1", "router-1");
    s = setIp(setIp(s, "pc-1", "192.168.1.50"), "server-1", "192.168.1.50");
    expect(conflicts(s)).toEqual([{ ip: "192.168.1.50", ids: ["pc-1", "server-1"] }]);
    expect(route(s, "pc-1", "server-1")).toMatchObject({ ok: false, conflict: { ip: "192.168.1.50" } });
    const fixed = toggleLink(setIp(s, "server-1", ""), "server-1", "router-1");
    const back = toggleLink(fixed.state, "server-1", "router-1").state;
    expect(conflicts(back)).toEqual([]);
    expect(route(back, "pc-1", "server-1").ok).toBe(true);
  });

  it("should ship scenarios that start unsolved and become solved by the intended fix", () => {
    for (const sc of SCENARIOS) expect(sc.check(sc.build()), sc.id).toBe(false);
    const first = SCENARIOS[0].build();
    expect(SCENARIOS[0].check(wire(wire(first, "pc-1", "router-1"), "phone-1", "router-1"))).toBe(true);
    expect(SCENARIOS[3].check(togglePower(SCENARIOS[3].build(), "switch-1"))).toBe(true);
  });
});
