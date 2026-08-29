import { useEffect, useRef } from "react";
import { Share2 } from "lucide-react";
import { C, MONO, alpha } from "../../../shared/constants/theme";
import { vibrate } from "../../../shared/utils/text";
import { useNum } from "../../../shared/context/NumContext";
import { Btn, Confetti } from "../../../shared/components/ui";
import { Icon } from "../../../shared/components/icons/Icon";
import Wheel from "../../../shared/components/wheel/Wheel";
import { sectorSummary } from "../utils/sector.utils";

const Stat = ({ value, label, color }) => (
  <div style={{ textAlign: "center", minWidth: 92 }}>
    <div style={{ fontFamily: MONO, fontSize: 26, fontWeight: 800, color }}>{value}</div>
    <div style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>{label}</div>
  </div>
);

// لحظة احتفال واحدة عند إكمال وحدات المدار الأول الثماني لمجال، ثم يعود المتعلم لطريقه
export default function SectorCelebration({ domainId, progress = {}, level = 1, onClose, onShare }) {
  const num = useNum();
  const closeRef = useRef(null);
  const { domain, di, units, questions } = sectorSummary(domainId, progress);

  useEffect(() => { vibrate([25, 40, 25, 40, 70]); }, []);
  // التركيز على «متابعة» ليكون الخروج بضغطة واحدة للوحة المفاتيح، وEscape يغلق أيضاً
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!domain) return null;
  const color = domain.color;

  return (
    <div role="dialog" aria-modal="true" aria-label={`اكتمل قطاع ${domain.name}`}
      style={{ position: "fixed", inset: 0, zIndex: 40, background: C.bg, overflowY: "auto", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "28px 20px", textAlign: "center" }}>
      <Confetti color={color} />
      <div className="madar-in" style={{ display: "grid", gap: 16, justifyItems: "center", width: "100%", maxWidth: 380 }}>
        <span style={{ width: 60, height: 60, borderRadius: 99, display: "grid", placeItems: "center", background: alpha(color, 0.15), border: `1px solid ${alpha(color, 0.45)}` }}>
          <Icon id={domain.id} size={30} color={color} />
        </span>
        <div>
          <h1 style={{ fontSize: 25, fontWeight: 900, margin: 0 }}>اكتمل قطاع {domain.name}</h1>
          <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.7, margin: "6px 0 0" }}>{domain.desc}</p>
        </div>
        <Wheel progress={progress} level={level} size={210} compact highlight={{ di, r: 0 }} />
        <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
          <Stat value={num(units)} label="وحدة مكتملة" color={color} />
          <span aria-hidden="true" style={{ width: 1, background: C.line }} />
          <Stat value={num(questions)} label="سؤالاً أجبت عنه" color={C.gold} />
        </div>
        <div style={{ display: "grid", gap: 8, width: "100%", marginTop: 4 }}>
          <Btn primary color={color} onClick={onShare}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><Share2 size={16} />شارك إنجازك</span>
          </Btn>
          <button ref={closeRef} type="button" onClick={onClose}
            style={{ background: C.surface2, color: C.text, border: `1px solid ${C.line}`, borderRadius: 14, padding: "14px 18px", fontSize: 16, fontWeight: 700, fontFamily: "inherit", minHeight: 44, cursor: "pointer", width: "100%" }}>
            متابعة
          </button>
        </div>
      </div>
    </div>
  );
}
