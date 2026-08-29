import { P, MONO, alpha } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/PrefsContext";

const key = (on) => ({
  fontFamily: "inherit", fontWeight: 800, fontSize: 15, lineHeight: 1,
  width: 38, height: 38, borderRadius: 999, display: "grid", placeItems: "center",
  background: "transparent", border: 0, color: on ? P.ink : P.muted,
  cursor: on ? "pointer" : "default", opacity: on ? 1 : 0.4,
});

// أدوات القراءة: حجم النص.
// تطفو أسفل عمود الدرس (sticky) فتبقى في المتناول دون أن تغطي أزرار التنقّل السفلية.
export default function ReaderTools({ font }) {
  const num = useNum();
  return (
    <div style={{ position: "sticky", bottom: 8, zIndex: 2, display: "flex", justifyContent: "flex-end", padding: "0 14px 2px", pointerEvents: "none" }}>
      <div style={{
        pointerEvents: "auto", display: "flex", alignItems: "center", gap: 2, padding: 3, borderRadius: 999,
        background: P.card, border: `1px solid ${P.line}`, boxShadow: `0 6px 18px ${alpha(P.ink, 0.16)}`,
      }}>
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
