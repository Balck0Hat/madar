import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useRef } from "react";
import { useSceneCamera } from "../grammar/scene/useSceneCamera";
import { SCENE } from "../grammar/scene/sceneLayout";

let last;
function Probe() {
  const box = useRef(null);
  const cam = useSceneCamera(box);
  last = cam;
  return <div ref={box} data-testid="box" onPointerDown={cam.onPointerDown} onWheel={cam.onWheel} />;
}
// jsdom بلا PointerEvent: نبني MouseEvent باسم الحدث ونضيف pointerId عليه
const fire = (target, type, id, x = 0, y = 0) => { const ev = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, button: 0 }); Object.defineProperty(ev, "pointerId", { value: id }); Object.defineProperty(ev, "pointerType", { value: "touch" }); act(() => { target.dispatchEvent(ev); }); };
const down = (el, id, x, y) => fire(el, "pointerdown", id, x, y);
const move = (id, x, y) => fire(window, "pointermove", id, x, y);
const up = (id) => fire(window, "pointerup", id);

beforeEach(() => {
  Object.defineProperty(HTMLElement.prototype, "clientWidth", { configurable: true, get() { return 800; } });
  Object.defineProperty(HTMLElement.prototype, "clientHeight", { configurable: true, get() { return 600; } });
  HTMLElement.prototype.getBoundingClientRect = vi.fn(() => ({ left: 0, top: 0, width: 800, height: 600 }));
});

describe("scene camera gestures", () => {
  it("should pan with one pointer and mark the gesture as moved so a click is not a pick", () => {
    render(<Probe />);
    const el = screen.getByTestId("box");
    const start = { ...last.view };
    down(el, 1, 100, 100); move(1, 160, 130);
    expect(last.view.x).toBeCloseTo(start.x + 60); expect(last.view.y).toBeCloseTo(start.y + 30);
    const fn = vi.fn(); last.pick(fn); expect(fn).not.toHaveBeenCalled();
    up(1);
  });

  it("should pinch-zoom about the midpoint, keeping the scene point under the fingers fixed, without panning jitter", () => {
    render(<Probe />);
    const el = screen.getByTestId("box");
    const v0 = { ...last.view };
    down(el, 1, 300, 300); down(el, 2, 500, 300); // إصبعان، منتصفهما (400,300)
    const sceneUnderMid = { x: (400 - v0.x) / v0.z, y: (300 - v0.y) / v0.z };
    move(1, 200, 300); move(2, 600, 300); // المسافة تضاعفت
    expect(last.view.z).toBeCloseTo(v0.z * 2);
    expect((400 - last.view.x) / last.view.z).toBeCloseTo(sceneUnderMid.x, 5);
    expect((300 - last.view.y) / last.view.z).toBeCloseTo(sceneUnderMid.y, 5);
    up(2); // بقي إصبع واحد: يعاد ضبط السحب من الوضع الحالي بلا قفزة
    const after = { ...last.view };
    move(1, 210, 310);
    expect(last.view.z).toBe(after.z);
    expect(last.view.x).toBeCloseTo(after.x + 10); expect(last.view.y).toBeCloseTo(after.y + 10);
    up(1);
  });

  it("should clamp so at least a third of the world stays in view, and fit within bounds", () => {
    render(<Probe />);
    act(() => last.panBy(-100000, -100000));
    expect(last.view.x).toBeGreaterThanOrEqual(800 * 0.35 - SCENE.w * last.view.z - 1);
    act(() => last.fit());
    expect(last.view.z).toBeCloseTo(Math.min(800 / SCENE.w, 600 / SCENE.h));
  });
});
