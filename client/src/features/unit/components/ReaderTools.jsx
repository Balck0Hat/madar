import { List } from "lucide-react";
import { P, MONO, alpha } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/PrefsContext";

const pill = {
  pointerEvents: "auto", display: "flex", alignItems: "center", gap: 2, padding: 3, borderRadius: 999,
  background: P.card, border: `1px solid ${P.line}`, boxShadow: `0 6px 18px ${alpha(P.ink, 0.16)}`,
};

const key = (on) => ({
  fontFamily: "inherit", fontWeight: 800, fontSize: 15, lineHeight: 1,
  width: 38, height: 38, borderRadius: 999, display: "grid", placeItems: "center",
  background: "transparent", border: 0, color: on ? P.ink : P.muted,
  cursor: on ? "pointer" : "default", opacity: on ? 1 : 0.4,
});

// زر داخل شريط مجزّأ: المختار يأخذ خلفية داكنة ليُقرأ الفرق دون لون إضافي
const seg = (on) => ({
  fontFamily: "inherit", fontWeight: 800, fontSize: 12.5, lineHeight: 1, cursor: "pointer",
  minHeight: 32, padding: "0 12px", borderRadius: 999, border: 0,
  background: on ? P.ink : "transparent", color: on ? P.bg : P.muted,
});

// أدوات القراءة: الفهرس، ووضع القراءة، وحجم النص.
// تطفو أسفل عمود الدرس (sticky) فتبقى في المتناول دون أن تغطي أزرار التنقّل السفلية.
export default function ReaderTools({ font, mode, onMode, onIndex }) {
  const num = useNum();
  return (
    <div style={{ position: "sticky", bottom: 8, zIndex: 2, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap", padding: "0 14px 2px", pointerEvents: "none" }}>
      <div style={pill}>
        <button type="button" onClick={onIndex} style={{ ...seg(false), display: "flex", alignItems: "center", gap: 5, color: P.ink }} aria-label="فهرس الدرس">
          <List size={14} aria-hidden="true" />فهرس
        </button>
        <span style={{ width: 1, height: 18, background: P.line, margin: "0 2px" }} aria-hidden="true" />
        <button type="button" onClick={() => onMode("cards")} style={seg(mode === "cards")} aria-pressed={mode === "cards"}>بطاقات</button>
        <button type="button" onClick={() => onMode("scroll")} style={seg(mode === "scroll")} aria-pressed={mode === "scroll"}>تمرير</button>
      </div>
      <div style={pill}>
        <button type="button" onClick={font.dec} disabled={!font.canDec} style={key(font.canDec)} aria-label="تصغير النص">A−</button>
        <span style={{ fontFamily: MONO, fontSize: 11, color: P.muted, minWidth: 26, textAlign: "center" }}
          aria-label={`حجم النص ${font.step} من ${font.total}`}>
          {num(font.step)}/{num(font.total)}
        </span>
        <button type="button" onClick={font.inc} disabled={!font.canInc} style={{ ...key(font.canInc), fontSize: 17 }} aria-label="تكبير النص">A+</button>
      </div>
    </div>
  );
}
