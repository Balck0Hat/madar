import { Sun, Moon, Monitor, Type, Waves } from "lucide-react";
import { C, MONO, alpha, T, R, S } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/NumContext";
import { Card } from "../../../shared/components/ui";

const THEMES = [["system", "النظام", Monitor], ["light", "فاتح", Sun], ["dark", "داكن", Moon]];
const SCALES = [0.9, 1, 1.1, 1.25, 1.4];

const seg = (active) => ({
  background: active ? C.gold : "transparent",
  color: active ? "var(--bg)" : C.muted,
  border: "none", borderRadius: R.pill, padding: `${S.md}px ${S.x2}px`, cursor: "pointer",
  fontWeight: 700, fontSize: T.base, display: "flex", alignItems: "center", gap: S.md,
});
const group = { display: "flex", background: C.surface2, borderRadius: R.pill, padding: S.xs, border: `1px solid ${C.line}`, gap: S.xs };

// المقبض ينزلق بـ transform وحده، ويثبت لمن طلب حركة مخفّضة
const SWITCH_CSS = `
.madar-knob{transition:transform .18s ease}
@media (prefers-reduced-motion:reduce){.madar-knob{transition:none}}
`;

// المظهر: السمة وحجم النص وشكل الأرقام ووضع الهدوء — كلها تُحفظ على الحساب
export default function AppearanceCard({ theme, fontScale, arabicNums, calm = false, onChange }) {
  const num = useNum();
  return (
    <Card>
      <div style={{ fontWeight: 700, marginBottom: S.x2 }}>المظهر</div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: S.xl, flexWrap: "wrap", marginBottom: S.x3 }}>
        <div style={{ color: C.muted, fontSize: T.base }}>السمة</div>
        <div role="group" aria-label="السمة" style={group}>
          {THEMES.map(([v, label, I]) => (
            <button key={v} type="button" aria-pressed={theme === v} onClick={() => onChange({ theme: v })} style={seg(theme === v)}>
              <I size={14} />{label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: S.xl, flexWrap: "wrap", marginBottom: S.x3 }}>
        <div style={{ color: C.muted, fontSize: T.base, display: "flex", alignItems: "center", gap: S.md }}><Type size={14} />حجم النص</div>
        <div role="group" aria-label="حجم النص" style={group}>
          {SCALES.map((s) => (
            <button key={s} type="button" aria-pressed={fontScale === s} onClick={() => onChange({ fontScale: s })} style={{ ...seg(fontScale === s), fontSize: T.xs + (s - 0.9) * T.sm, padding: `${S.md}px ${S.xl}px` }}>
              أ
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: S.xl, flexWrap: "wrap" }}>
        <div style={{ color: C.muted, fontSize: T.base }}>الأرقام</div>
        <div role="group" aria-label="شكل الأرقام" style={group}>
          {[["123", false], ["١٢٣", true]].map(([l, v]) => (
            <button key={l} type="button" aria-pressed={arabicNums === v} onClick={() => onChange({ arabicNums: v })} style={{ ...seg(arabicNums === v), fontFamily: MONO }}>{l}</button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: S.x2, padding: `${S.xl}px ${S.x2}px`, borderRadius: R.lg, background: alpha(C.gold, 0.08), border: `1px dashed ${alpha(C.gold, 0.3)}`, fontSize: T.base, lineHeight: 1.8 }}>
        معاينة: تُقاس المسافة إلى الشمس بنحو {num(150)} مليون كيلومتر.
      </div>

      {/* وضع الهدوء: من يتعلّم لنفسه لا يحتاج عدّادات تلاحقه.
          نخفي أدوات التحفيز فقط — النقاط تُحتسب كما هي وتظهر في «إحصاءاتي». */}
      <div style={{ marginTop: S.x3, paddingTop: S.x3, borderTop: `1px solid ${C.line}`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: S.x2 }}>
        <style>{SWITCH_CSS}</style>
        <div>
          <div style={{ fontWeight: 600, fontSize: T.md, display: "flex", alignItems: "center", gap: S.md }}>
            <Waves size={15} color={calm ? C.gold : C.muted} aria-hidden="true" />وضع الهدوء
          </div>
          <div style={{ color: C.muted, fontSize: T.sm, marginTop: S.sm, lineHeight: 1.7, maxWidth: "34ch" }}>
            يخفي السلسلة والدوري والتحدي. تقدّمك يُحسب كما هو.
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={calm}
          aria-label="وضع الهدوء"
          onClick={() => onChange({ calm: !calm })}
          style={{ flexShrink: 0, background: "transparent", border: "none", padding: `${S.lg}px 0`, minHeight: 44, cursor: "pointer" }}
        >
          <span style={{ display: "block", width: 46, height: 26, borderRadius: R.pill, background: calm ? C.gold : C.surface2, border: `1px solid ${calm ? "transparent" : C.line}`, padding: S.xs }}>
            <span className="madar-knob" style={{ display: "block", width: 18, height: 18, borderRadius: R.pill, background: calm ? "var(--bg)" : C.muted, transform: calm ? "translateX(-20px)" : "none" }} />
          </span>
        </button>
      </div>
    </Card>
  );
}
