import { describe, it, expect } from "vitest";
import { mergeStatus, mergeSequential, relevant, cursorOf } from "../recite.merge.js";
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
    expect(r.cursor).toBe(6); // المؤشر على أول ما لم يُقرأ؛ الفائتة حمراء أصلاً
  });

  it("should let a flagged word recover if it is heard later", () => {
    let r = mergeStatus(fresh(), E, "الله لا اله الا الحي القيوم"); // «هو» سقطت
    expect(r.status[4]).toBe("miss");
    r = mergeStatus(r.status, E, "هو الحي القيوم"); // أعادها القارئ وهي قريبة من موضعه
    expect(r.status[4]).toBe("ok");
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

describe("recite sequential", () => {
  const A = words("قل هو الله احد"), B = words("الله الصمد"), Cc = words("لم يلد ولم يولد");
  const E = [...A, ...B, ...Cc];
  const bounds = [{ a: 1, from: 0, to: 4 }, { a: 2, from: 4, to: 6 }, { a: 3, from: 6, to: 10 }];
  const fresh = () => E.map(() => "pending");

  it("should ignore speech from a farther ayah while the current one is open", () => {
    const r = mergeSequential(fresh(), E, "لم يلد ولم يولد", bounds);
    expect(r.ok).toBe(0);
    expect(r.status.every((s) => s === "pending")).toBe(true);
  });

  it("should advance within the current ayah only, then move on when it is complete", () => {
    let r = mergeSequential(fresh(), E, "هو الله احد الله الصمد لم", bounds); // بدأ من الكلمة الثانية: «قل» فائتة
    expect(r.status.slice(0, 4)).toEqual(["miss", "ok", "ok", "ok"]);
    expect(r.status.slice(4, 7)).toEqual(["ok", "ok", "ok"]); // اكتملت الأولى فتابع في الثانية والثالثة من الدفعة نفسها
    r = mergeSequential(r.status, E, "يلد", bounds);
    expect(r.status[7]).toBe("ok");
  });

  it("should close an unfinished ayah as missed only when the next ayah has clearly begun", () => {
    let r = mergeSequential(fresh(), E, "قل هو الله احد الله", bounds); // الأولى كاملة، والثانية بدأت بكلمة
    expect(r.status.slice(4, 6)).toEqual(["ok", "pending"]);
    r = mergeSequential(r.status, E, "لم", bounds); // كلمة واحدة من الثالثة لا تكفي لإغلاق الثانية
    expect(r.status.slice(5, 8)).toEqual(["pending", "pending", "pending"]);
    r = mergeSequential(r.status, E, "لم يلد", bounds);
    expect(r.status.slice(5, 8)).toEqual(["miss", "ok", "ok"]);
    expect(r.cursor).toBe(8); // المؤشر على أول ما لم يُقرأ
  });

  it("should tell relevant speech from noise near the cursor", () => {
    expect(relevant(fresh(), E, "ما السعير")).toBe(false);
    expect(relevant(fresh(), E, "قل")).toBe(true);
  });
});
