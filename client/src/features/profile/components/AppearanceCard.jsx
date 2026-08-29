import { Sun, Moon, Monitor, Type } from "lucide-react";
import { C, MONO, alpha } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/NumContext";
import { Card } from "../../../shared/components/ui";

const THEMES = [["system", "النظام", Monitor], ["light", "فاتح", Sun], ["dark", "داكن", Moon]];
const SCALES = [0.9, 1, 1.1, 1.25, 1.4];

const seg = (active) => ({
  background: active ? C.gold : "transparent",
  color: active ? "var(--bg)" : C.muted,
  border: "none", borderRadius: 999, padding: "7px 12px", cursor: "pointer",
  fontWeight: 800, fontSize: 13, display: "flex", alignItems: "center", gap: 6,
});
const group = { display: "flex", background: C.surface2, borderRadius: 999, padding: 3, border: `1px solid ${C.line}`, gap: 2 };

// المظهر: السمة وحجم النص وشكل الأرقام — كلها تُحفظ على الحساب
export default function AppearanceCard({ theme, fontScale, arabicNums, onChange }) {
  const num = useNum();
  return (
    <Card>
      <div style={{ fontWeight: 800, marginBottom: 12 }}>المظهر</div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
        <div style={{ color: C.muted, fontSize: 13 }}>السمة</div>
        <div role="group" aria-label="السمة" style={group}>
          {THEMES.map(([v, label, I]) => (
            <button key={v} type="button" aria-pressed={theme === v} onClick={() => onChange({ theme: v })} style={seg(theme === v)}>
              <I size={14} />{label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
        <div style={{ color: C.muted, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}><Type size={14} />حجم النص</div>
        <div role="group" aria-label="حجم النص" style={group}>
          {SCALES.map((s) => (
            <button key={s} type="button" aria-pressed={fontScale === s} onClick={() => onChange({ fontScale: s })} style={{ ...seg(fontScale === s), fontSize: 11 + (s - 0.9) * 12, padding: "7px 10px" }}>
              أ
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div style={{ color: C.muted, fontSize: 13 }}>الأرقام</div>
        <div role="group" aria-label="شكل الأرقام" style={group}>
          {[["123", false], ["١٢٣", true]].map(([l, v]) => (
            <button key={l} type="button" aria-pressed={arabicNums === v} onClick={() => onChange({ arabicNums: v })} style={{ ...seg(arabicNums === v), fontFamily: MONO }}>{l}</button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 12, background: alpha(C.gold, 0.08), border: `1px dashed ${alpha(C.gold, 0.3)}`, fontSize: 13, lineHeight: 1.8 }}>
        معاينة: تُقاس المسافة إلى الشمس بنحو {num(150)} مليون كيلومتر.
      </div>
    </Card>
  );
}
