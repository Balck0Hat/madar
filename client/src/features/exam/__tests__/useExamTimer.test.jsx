import { describe, it, expect, vi, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useExamTimer, clock } from "../hooks/useExamTimer";

afterEach(() => vi.useRealTimers());

describe("useExamTimer", () => {
  it("should format the remaining time as mm:ss", () => {
    expect(clock(2700)).toBe("45:00");
    expect(clock(65)).toBe("1:05");
    expect(clock(0)).toBe("0:00");
  });

  it("should count down towards the server deadline and stop at zero", () => {
    vi.useFakeTimers();
    const endsAt = new Date(Date.now() + 3000).toISOString();
    const { result } = renderHook(() => useExamTimer(endsAt));
    expect(result.current).toBe(3);
    act(() => vi.advanceTimersByTime(2000));
    expect(result.current).toBe(1);
    act(() => vi.advanceTimersByTime(5000));
    expect(result.current).toBe(0);
  });

  it("should stay idle before an attempt is started", () => {
    const { result } = renderHook(() => useExamTimer(null));
    expect(result.current).toBe(0);
  });
});
