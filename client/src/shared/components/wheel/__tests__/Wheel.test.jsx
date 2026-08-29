import { render, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Wheel from "../Wheel";

const P = { "center-1": { score: 3, total: 3 }, "human-1-1": { score: 3, total: 3 } };

describe("wheel", () => {
  it("renders static when not interactive", () => {
    const { container } = render(<Wheel progress={P} level={2} />);
    expect(container.querySelectorAll('[role="button"]').length).toBe(0);
    expect(container.querySelector('[role="application"]')).toBe(null);
  });

  it("opens a unit by click and a sector by click", () => {
    const onSelectUnit = vi.fn(), onSelect = vi.fn();
    const { container } = render(<Wheel progress={P} level={2} onSelect={onSelect} onSelectUnit={onSelectUnit} />);
    const hits = container.querySelectorAll('[role="button"]');
    // 30 قطاعاً + وحدات المدار الأول المفتوحة (10×8) = 110 حين لا شيء مفتوح غيره
    expect(hits.length).toBe(30 + 80);
    const dot = [...hits].find((el) => el.tagName === "circle");
    fireEvent.click(dot);
    expect(onSelectUnit).toHaveBeenCalled();
    const sec = [...hits].find((el) => el.tagName === "path");
    fireEvent.click(sec);
    expect(onSelect).toHaveBeenCalledWith("human", 0, 0);
  });

  it("navigates by keyboard: arrows across sectors, Tab into units, Enter opens", () => {
    const onSelectUnit = vi.fn(), onSelect = vi.fn();
    const { container } = render(<Wheel progress={P} level={2} onSelect={onSelect} onSelectUnit={onSelectUnit} />);
    const app = container.querySelector('[role="application"]');
    fireEvent.focus(app);
    expect(app.getAttribute("aria-activedescendant")).toMatch(/s-0-0$/);
    fireEvent.keyDown(app, { key: "ArrowLeft" });
    expect(app.getAttribute("aria-activedescendant")).toMatch(/s-1-0$/);
    fireEvent.keyDown(app, { key: "ArrowUp" });
    expect(app.getAttribute("aria-activedescendant")).toMatch(/s-1-1$/);
    fireEvent.keyDown(app, { key: "ArrowDown" });
    fireEvent.keyDown(app, { key: "Enter" });
    expect(onSelect).toHaveBeenCalledWith("earth", 0, 1);
    fireEvent.keyDown(app, { key: "Tab" });
    expect(app.getAttribute("aria-activedescendant")).toMatch(/u-earth-1-1$/);
    fireEvent.keyDown(app, { key: "Tab" });
    expect(app.getAttribute("aria-activedescendant")).toMatch(/u-earth-1-2$/);
    fireEvent.keyDown(app, { key: "Enter" });
    expect(onSelectUnit).toHaveBeenCalledWith("earth-1-2");
    fireEvent.keyDown(app, { key: "Escape" });
    expect(app.getAttribute("aria-activedescendant")).toMatch(/s-1-0$/);
    fireEvent.blur(app);
    expect(app.getAttribute("aria-activedescendant")).toBe(null);
  });

  it("shows a label on hover and marks locked rings unclickable", () => {
    const { container, getAllByText, queryAllByText } = render(<Wheel progress={P} level={2} onSelect={() => {}} onSelectUnit={() => {}} />);
    const sec = container.querySelector('[role="button"]');
    expect(queryAllByText("الإنسان · المدار الأول · 1/8").length).toBe(1); // <title> فقط
    fireEvent.pointerEnter(sec);
    expect(getAllByText("الإنسان · المدار الأول · 1/8").length).toBe(2); // <title> + الشارة
    fireEvent.pointerLeave(sec);
    // لا أهداف لوحدات المدار الثاني (مقفل)
    expect([...container.querySelectorAll("circle[role=button]")].some((el) => el.id.includes("human-2-"))).toBe(false);
  });
});
