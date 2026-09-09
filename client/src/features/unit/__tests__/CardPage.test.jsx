import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import CardPage from "../components/CardPage";

const base = { art: "virus", img: "قلب بحجم قبضة يد", h: "القلب: مضخة بحجم قبضتك", p: "قلبك يدقّ نحو 70 مرة في الدقيقة، أي 100 ألف مرة يومياً، ويضخ 5 لترات كل دقيقة." };

describe("CardPage", () => {
  it("should show the author's image caption under the art", () => {
    render(<CardPage card={base} index={3} color="#c33" />);
    expect(screen.getByText("قلب بحجم قبضة يد")).toBeInTheDocument();
  });

  it("should set a definition heading as term then gloss", () => {
    render(<CardPage card={base} index={3} color="#c33" />);
    expect(screen.getByText("القلب")).toBeInTheDocument();
    expect(screen.getByText("مضخة بحجم قبضتك")).toBeInTheDocument();
  });

  it("should raise the card's numbers into tiles above the prose", () => {
    render(<CardPage card={base} index={3} color="#c33" />);
    expect(screen.getByText("70")).toBeInTheDocument();
    expect(screen.getByText("100 ألف")).toBeInTheDocument();
    expect(screen.getByText("لترات")).toBeInTheDocument();
  });

  it("should render a plain card without caption or tiles unchanged", () => {
    render(<CardPage card={{ art: "wheel", h: "مدينة من الخلايا", p: "نصّ قصير بلا أرقام." }} index={1} />);
    expect(screen.getByText("مدينة من الخلايا")).toBeInTheDocument();
    expect(screen.getByText("نصّ قصير بلا أرقام.")).toBeInTheDocument();
  });
});
