import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { C, alpha, T, R } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/NumContext";
import { Btn } from "../../../shared/components/ui";
import { TOUR_CARDS } from "../data/tourCards";
import { markTourDone } from "../utils/tourStorage";
import TourArt from "./TourArt";

const backdrop = {
  position: "fixed", inset: 0, zIndex: 40, display: "grid", placeItems: "center", padding: 16,
  background: alpha(C.bg, 0.72), backdropFilter: "blur(6px)",
};

// جولة أول تشغيل: ثلاث بطاقات قصيرة تشرح العجلة والخيط وفتح المدارات.
// تُغلق نهائياً بعد أول عرض — لا تعليم متكرر لمن فهم من المرة الأولى.
export default function FirstRunTour({ onDone }) {
  const num = useNum();
  const [i, setI] = useState(0);
  const box = useRef(null);
  const opener = useRef(null);

  const close = () => { markTourDone(); onDone?.(); };

  useEffect(() => {
    opener.current = document.activeElement;
    box.current?.querySelector("button:last-of-type")?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") { e.preventDefault(); close(); return; }
      if (e.key !== "Tab") return;
      // حبس التركيز داخل الحوار: لا معنى لتبويب يهرب إلى شاشة محجوبة خلف الطبقة
      const f = box.current?.querySelectorAll("button");
      if (!f?.length) return;
      const [first, last] = [f[0], f[f.length - 1]];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); opener.current?.focus?.(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const card = TOUR_CARDS[i];
  const last = i === TOUR_CARDS.length - 1;

  return (
    <div style={backdrop} onClick={close}>
      <div
        ref={box}
        role="dialog"
        aria-modal="true"
        aria-labelledby="madar-tour-title"
        className="madar-rise"
        onClick={(e) => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 420, background: C.surface, border: `1px solid ${C.line}`, borderRadius: R.x4, padding: 20, boxShadow: "var(--shadow)" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: C.muted, fontSize: T.sm }}>{num(i + 1)} من {num(TOUR_CARDS.length)}</span>
          <button type="button" aria-label="تخطّي الجولة" onClick={close} style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer", padding: 6, lineHeight: 0 }}>
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* key يعيد تشغيل حركة الظهور عند كل بطاقة؛ الحركة نفسها مُعطّلة لمن طلب تقليلها */}
        <div key={card.id} className="madar-in" style={{ display: "grid", justifyItems: "center", gap: 10, textAlign: "center", padding: "6px 0 4px" }}>
          <TourArt k={card.art} size={116} />
          <h2 id="madar-tour-title" style={{ fontWeight: 900, fontSize: T.x3, margin: 0 }}>{card.title}</h2>
          <div style={{ display: "grid", gap: 7, color: C.muted, fontSize: T.md, lineHeight: 1.8, textAlign: "start" }}>
            {card.lines.map((l) => <p key={l} style={{ margin: 0 }}>{l}</p>)}
          </div>
        </div>

        <div style={{ display: "flex", gap: 6, justifyContent: "center", margin: "14px 0 12px" }} aria-hidden="true">
          {TOUR_CARDS.map((c, n) => (
            <span key={c.id} style={{ width: n === i ? 18 : 6, height: 6, borderRadius: R.pill, background: n === i ? C.gold : alpha(C.text, 0.2) }} />
          ))}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          {i > 0 && <Btn small={false} onClick={() => setI(i - 1)}>السابق</Btn>}
          <Btn primary onClick={() => (last ? close() : setI(i + 1))}>{last ? "ابدأ" : "التالي"}</Btn>
        </div>
      </div>
    </div>
  );
}
