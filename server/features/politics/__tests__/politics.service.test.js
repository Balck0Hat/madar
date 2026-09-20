import { describe, it, expect } from "vitest";
import * as politics from "../politics.service.js";

describe("politics.service", () => {
  it("should list countries as cards without the long texts", () => {
    const list = politics.listCountries();
    expect(list.length).toBeGreaterThan(0);
    expect(list[0].quick).toBeUndefined();
    expect(list[0].story).toBeUndefined();
    expect(list[0].government.headOfState.name).toBeTruthy();
  });

  it("should return a full country and reject an unknown id", () => {
    const id = politics.listCountries()[0].countryId;
    expect(politics.getCountry(id).story.length).toBe(4);
    expect(() => politics.getCountry("atlantis")).toThrowError(expect.objectContaining({ code: "COUNTRY_NOT_FOUND" }));
  });

  it("should count our countries under each system and report the latest verification date", () => {
    const o = politics.overview();
    expect(o.systems.reduce((n, s) => n + s.ours, 0)).toBe(o.counts.countries);
    expect(o.asOf).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(o.counts.titles).toBeGreaterThan(0);
  });
});
