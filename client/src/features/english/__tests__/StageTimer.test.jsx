import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import StageTimer from "../components/StageTimer";

afterEach(() => vi.useRealTimers());

describe("StageTimer", () => {
  it("should count down from the server start time and fire onExpire once at zero", () => {
    vi.useFakeTimers();
    const now = Date.now();
    const onExpire = vi.fn();
    render(<StageTimer timer={{ startedAt: new Date(now - 58 * 1000).toISOString(), budget: 60, now }} onExpire={onExpire} />);
    expect(screen.getByRole("timer")).toHaveTextContent("00:02");
    act(() => { vi.advanceTimersByTime(3000); });
    expect(screen.getByRole("timer")).toHaveTextContent("00:00");
    act(() => { vi.advanceTimersByTime(2000); });
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it("should correct for a client clock that runs ahead of the server", () => {
    vi.useFakeTimers();
    const now = Date.now();
    const serverNow = now - 3600 * 1000; // ساعة الخادم متأخرة ساعة عن ساعة الجهاز
    render(<StageTimer timer={{ startedAt: new Date(serverNow - 10 * 1000).toISOString(), budget: 600, now: serverNow }} onExpire={() => {}} />);
    expect(screen.getByRole("timer")).toHaveTextContent("09:50"); // الساعة المحلية سابقة بساعة، والفرق يُلغى
  });

  it("should render nothing without a start time", () => {
    const { container } = render(<StageTimer timer={{ budget: 600 }} />);
    expect(container).toBeEmptyDOMElement();
  });
});
