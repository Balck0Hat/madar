import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import FigureChips from "../FigureChips";
import { resetFiguresIndex } from "../../../hooks/useFiguresIndex";

vi.mock("../../../utils/api", () => ({ get: vi.fn(async () => ({ figures: [{ figureId: "hammurabi", name: "حمورابي" }, { figureId: "cyrus", name: "كورش الكبير" }] })) }));

const Where = () => <div data-testid="where">{useLocation().pathname}</div>;

beforeEach(() => resetFiguresIndex());

describe("FigureChips", () => {
  it("should render a chip for each figure named in the text and open its page", async () => {
    render(
      <MemoryRouter initialEntries={["/u/history-1-2"]}>
        <Routes><Route path="*" element={<><FigureChips text="سنّ حمورابي شرائعه في بابل." /><Where /></>} /></Routes>
      </MemoryRouter>,
    );
    const chip = await screen.findByRole("button", { name: "حمورابي" });
    expect(screen.queryByRole("button", { name: "كورش الكبير" })).not.toBeInTheDocument();
    fireEvent.click(chip);
    await waitFor(() => expect(screen.getByTestId("where").textContent).toBe("/figures/hammurabi"));
  });

  it("should render nothing outside a router or when no figure is named", async () => {
    const { container } = render(<FigureChips text="سنّ حمورابي شرائعه." />);
    expect(container).toBeEmptyDOMElement();
    render(<MemoryRouter><FigureChips text="لا أحد هنا." /></MemoryRouter>);
    await waitFor(() => expect(screen.queryByRole("button")).not.toBeInTheDocument());
  });
});
