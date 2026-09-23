import { describe, it, expect } from "vitest";
import { mergeStatus, cursorOf } from "../recite.merge.js";
import { words } from "../../../shared/utils/arabic.js";

const E = words("الله لا اله الا هو الحي القيوم لا تاخذه سنه ولا نوم");
const fresh = () => E.map(() => "pending");

describe("recite merge", () => {
  it("should turn heard words green in order and move the cursor", () => {
    const r = mergeStatus(fresh(), E, "الله لا اله");
    expect(r.status.slice(0, 4)).toEqual(["ok", "ok", "ok", "pending"]);
    expect(r.cursor).toBe(3);
    expect(r.done).toBe(false);
  });

  it("should never turn a green word red again when a later recognition drops it", () => {
    let r = mergeStatus(fresh(), E, "الله لا اله الا هو");
    r = mergeStatus(r.status, E, "هو الحي القيوم"); // النافذة انزلقت: أول الآية خرج منها
    expect(r.status.slice(0, 7).every((s) => s === "ok")).toBe(true);
    expect(r.miss).toBe(0);
  });

  it("should not flag a miss until the reader is two words past it", () => {
    let r = mergeStatus(fresh(), E, "الله لا الا"); // «اله» سقطت لكن لم يتجاوزها بكلمتين
    expect(r.status[2]).toBe("pending");
    r = mergeStatus(r.status, E, "الله لا الا هو الحي");
    expect(r.status[2]).toBe("miss");
    expect(r.cursor).toBe(2); // المؤشر يبقى على أول خطأ ليراه القارئ
  });

  it("should let a flagged word recover if it is heard later", () => {
    let r = mergeStatus(fresh(), E, "الله لا الا هو الحي");
    expect(r.status[2]).toBe("miss");
    r = mergeStatus(r.status, E, "لا اله الا هو الحي");
    expect(r.status[2]).toBe("ok");
  });

  it("should finish when every word is either heard or flagged", () => {
    let r = mergeStatus(fresh(), E, E.slice(0, 8).join(" "));
    r = mergeStatus(r.status, E, E.slice(5).join(" "));
    expect(r.done).toBe(true);
    expect(r.ok).toBe(E.length);
    expect(cursorOf(r.status)).toBe(E.length);
  });

  it("should ignore empty or unrelated text", () => {
    const r = mergeStatus(fresh(), E, "بسم الله الرحمن الرحيم");
    expect(r.ok).toBeLessThanOrEqual(1);
    expect(mergeStatus(fresh(), E, "").ok).toBe(0);
  });
});
