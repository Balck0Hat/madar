import { useState, useEffect } from "react";
import { C, MONO, T, R } from "../../../shared/constants/theme";
import { levelProgress, levelTitle } from "../../../shared/utils/level";
import { useNum } from "../../../shared/context/NumContext";
import { useCountUp } from "../../../shared/hooks/useCountUp";
import { Card, Bar } from "../../../shared/components/ui";
import { prefersStill, settled } from "./resultMotion";

const BADGE = { position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 24, height: 24, padding: "0 6px", borderRadius: R.pill, fontFamily: MONO };

// بطاقة المستوى: الشريط يمتلئ من موضع المستوى السابق، وعند الارتقاء
// تكبر حلقة الرقم مرة واحدة بوميض ذهبي وينزلق اللقب الجديد (أقل من 600ms)
export default function ResultLevel({ xp, xpBefore }) {
  const num = useNum();
  const { level, cur, need } = levelProgress(xp);
  const prev = levelProgress(xpBefore);
  const up = level > prev.level;
  const from = up ? 0 : prev.cur; // بعد الارتقاء يبدأ الشريط من أول المستوى الجديد
  const live = settled(useCountUp(cur, { duration: 900, delay: 300, from }), cur);
  const still = prefersStill();
  const [full, setFull] = useState(still);
  const [beat, setBeat] = useState(up && !still ? 0 : 2); // 0 ساكن · 1 وميض · 2 استقر

  useEffect(() => {
    if (still) return undefined;
    // تغيير القيمة بعد التركيب هو ما يشغّل انتقال عرض الشريط
    const timers = [setTimeout(() => setFull(true), 300)];
    if (up) timers.push(setTimeout(() => setBeat(1), 360), setTimeout(() => setBeat(2), 780));
    return () => timers.forEach(clearTimeout);
  }, [up, still]);

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: T.base, marginBottom: 8 }}>
        <span style={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 6 }}>
          المستوى
          <span style={{ ...BADGE, border: `1px solid ${up ? C.gold : C.line}`, background: up ? C.goldSoft : "transparent", color: up ? C.gold : C.text, transform: beat === 1 ? "scale(1.32)" : "scale(1)", transition: still ? "none" : "transform .3s cubic-bezier(.2,.8,.3,1)" }}>
            {num(level)}
            {up && <span aria-hidden="true" style={{ position: "absolute", inset: -3, borderRadius: R.pill, border: `2px solid ${C.gold}`, opacity: beat === 0 ? 0.85 : 0, transform: beat === 0 ? "scale(1)" : "scale(2.1)", transition: still ? "none" : "transform .5s ease-out, opacity .5s ease-out" }} />}
          </span>
          ·
          <span className={up ? "madar-slide" : undefined} style={{ color: up ? C.gold : "inherit", animationDelay: ".36s", animationFillMode: "both" }}>{levelTitle(level)}</span>
        </span>
        <span style={{ fontFamily: MONO, color: C.muted }}>{num(live)}/{num(need)}</span>
      </div>
      <Bar value={(full ? cur : from) / need} />
    </Card>
  );
}
