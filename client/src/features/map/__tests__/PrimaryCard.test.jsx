import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import PrimaryCard from "../components/PrimaryCard";
import { unitInfo } from "../../../shared/utils/units";

const card = (id) => render(<PrimaryCard info={unitInfo(id)} minutes={30} onOpen={() => {}} />);

// من لا يرى موضعه في المركز لا يعرف متى ينتهي، فيظنّه بلا نهاية
describe("PrimaryCard on a centre unit", () => {
  it("should show which centre unit this is out of how many", () => {
    card("center-1");
    expect(screen.getByText("المركز · 1 من 3")).toBeInTheDocument();
  });

  it("should say the domains are already open rather than implying a gate", () => {
    card("center-2");
    expect(screen.getByText(/المجالات مفتوحة لك من الآن/)).toBeInTheDocument();
  });

  it("should announce the last centre unit as the last", () => {
    card("center-3");
    expect(screen.getByText("المركز · 3 من 3")).toBeInTheDocument();
    expect(screen.getByText(/آخر وحدة في المركز/)).toBeInTheDocument();
  });

  it("should keep the domain label untouched outside the centre", () => {
    card("human-1-1");
    expect(screen.getByText(/المدار الأول/)).toBeInTheDocument();
    expect(screen.queryByText(/المركز/)).not.toBeInTheDocument();
  });
});
