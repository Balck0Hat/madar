import { List } from "lucide-react";
import { P, MONO, T, R, S, TAP } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/PrefsContext";

const pill = {
  pointerEvents: "auto", display: "flex", alignItems: "center", gap: S.xs, padding: S.xs, borderRadius: R.pill,
  // الظل من رمز السمة: مشتقّاً من الحبر كان ينقلب إلى هالة مضيئة على ورق داكن
  background: P.card, border: `1px solid ${P.line}`, boxShadow: "var(--shadow-2)",
};

const key = (on) => ({
  fontFamily: "inherit", fontWeight: 700, fontSize: T.lg, lineHeight: 1,
  width: TAP, height: TAP, borderRadius: R.pill, display: "grid", placeItems: "center",
  background: "transparent", border: 0, color: on ? P.ink : P.muted,
  cursor: on ? "pointer" : "default", opacity: on ? 1 : 0.4,
});

// زر داخل شريط مجزّأ: المختار يأخذ خلفية داكنة ليُقرأ الفرق دون لون إضافي
const seg = (on) => ({
  fontFamily: "inherit", fontWeight: 700, fontSize: T.sm, lineHeight: 1, cursor: "pointer",
  minHeight: TAP, padding: `0 ${S.x2}px`, borderRadius: R.pill, border: 0,
  background: on ? P.ink : "transparent", color: on ? P.bg : P.muted,
});

// أدوات القراءة: الفهرس، ووضع القراءة، وحجم النص.
// تطفو أسفل عمود الدرس (sticky) فتبقى في المتناول دون أن تغطي أزرار التنقّل السفلية.
export default function ReaderTools({ font, mode, onMode, onIndex }) {
  const num = useNum();
  return (
    <div style={{ position: "sticky", bottom: 8, zIndex: 2, display: "flex", justifyContent: "space-between", alignItems: "center", gap: S.lg, flexWrap: "wrap", padding: `0 ${S.x3}px ${S.xs}px`, pointerEvents: "none" }}>
      <div style={pill}>
        <button type="button" onClick={onIndex} style={{ ...seg(false), display: "flex", alignItems: "center", gap: S.sm, color: P.ink }} aria-label="فهرس الدرس">
          <List size={14} aria-hidden="true" />فهرس
        </button>
        <span style={{ width: 1, height: 18, background: P.line, margin: `0 ${S.xs}px` }} aria-hidden="true" />
        <button type="button" onClick={() => onMode("cards")} style={seg(mode === "cards")} aria-pressed={mode === "cards"}>بطاقات</button>
        <button type="button" onClick={() => onMode("scroll")} style={seg(mode === "scroll")} aria-pressed={mode === "scroll"}>تمرير</button>
      </div>
      <div style={pill}>
        <button type="button" onClick={font.dec} disabled={!font.canDec} style={key(font.canDec)} aria-label="تصغير النص">A−</button>
        <span style={{ fontFamily: MONO, fontSize: T.xs, color: P.muted, minWidth: 26, textAlign: "center" }}
          aria-label={`حجم النص ${font.step} من ${font.total}`}>
          {num(font.step)}/{num(font.total)}
        </span>
        <button type="button" onClick={font.inc} disabled={!font.canInc} style={{ ...key(font.canInc), fontSize: T.x2 }} aria-label="تكبير النص">A+</button>
      </div>
    </div>
  );
}
