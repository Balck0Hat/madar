import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Figure from "../components/figures/Figure";
import CardPage from "../components/CardPage";

describe("Figure", () => {
  it("should draw a timeline with every year and label", () => {
    const fig = { t: "timeline", items: [{ y: "1796", l: "جينر" }, { y: "1885", l: "باستور" }, { y: "1980", l: "الاستئصال" }] };
    render(<Figure fig={fig} color="#c33" />);
    expect(screen.getByText("1796")).toBeInTheDocument();
    expect(screen.getByText("الاستئصال")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("should size bars relative to the largest value", () => {
    const fig = { t: "bars", unit: "ألف سنة", items: [{ v: 17, l: "لاسكو" }, { v: 34, l: "شوفيه" }] };
    const { container } = render(<Figure fig={fig} color="#c33" />);
    const fills = [...container.querySelectorAll("div[style*='width']")].map((d) => d.style.width).filter((w) => w.endsWith("%"));
    expect(fills).toContain("50%");
    expect(fills).toContain("100%");
    expect(screen.getByText("34 ألف سنة")).toBeInTheDocument();
  });

  it("should stack layers widening downward for a pyramid", () => {
    const fig = { t: "layers", shape: "pyramid", items: ["الملك", "النبلاء", "الفلاحين"] };
    const { container } = render(<Figure fig={fig} color="#c33" />);
    const widths = [...container.querySelectorAll("div[style*='width']")].map((d) => parseFloat(d.style.width)).filter(Boolean);
    expect(widths[0]).toBeLessThan(widths[2]);
  });

  it("should render nothing for an unknown kind, so the card keeps its art", () => {
    const { container } = render(<Figure fig={{ t: "pie" }} color="#c33" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("should replace the generic art on a card that carries a figure", () => {
    const card = { art: "wheel", h: "هرم الإقطاع", p: "نصّ.", fig: { t: "layers", items: ["أ", "ب", "ج"] } };
    const { container } = render(<CardPage card={card} index={2} color="#c33" />);
    expect(container.querySelector("figure")).not.toBeNull();
    expect(container.querySelector("svg")).toBeNull();
  });
});
