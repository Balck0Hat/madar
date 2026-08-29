import { Trash2, Plus } from "lucide-react";
import { C, inputStyle } from "../../../shared/constants/theme";
import { Btn } from "../../../shared/components/ui";
import Art from "../../../shared/components/art/Art";
import { ART_KEYS } from "../utils/editor.utils";

const small = { ...inputStyle, padding: "9px 12px", fontSize: 14 };

// محرّر بطاقات الدرس: عنوان، نص، رسمة
export default function CardsEditor({ cards, onChange }) {
  const update = (k, patch) => onChange(cards.map((c, i) => (i === k ? { ...c, ...patch } : c)));
  return (
    <div style={{ display: "grid", gap: 10 }}>
      {cards.map((c, k) => (
        <div key={k} style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, padding: 12, display: "grid", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontWeight: 800, color: C.gold }}>بطاقة {k + 1}</span>
            <select aria-label="الرسمة" value={c.art || "wheel"} onChange={(e) => update(k, { art: e.target.value })} style={{ ...small, width: "auto" }}>
              {ART_KEYS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
            <span style={{ flex: 1 }} />
            <button type="button" aria-label="حذف البطاقة" onClick={() => onChange(cards.filter((_, i) => i !== k))} style={{ background: "transparent", border: "none", color: C.red, cursor: "pointer" }}><Trash2 size={16} /></button>
          </div>
          <Art k={c.art || "wheel"} height={70} />
          <input value={c.h} onChange={(e) => update(k, { h: e.target.value })} placeholder="عنوان البطاقة" style={small} />
          <textarea value={c.p} onChange={(e) => update(k, { p: e.target.value })} placeholder="نص البطاقة (تحت 120 كلمة)" rows={4} style={{ ...small, resize: "vertical", lineHeight: 1.7 }} />
          <div style={{ color: C.muted, fontSize: 11 }}>{(c.p || "").trim().split(/\s+/).filter(Boolean).length} كلمة</div>
        </div>
      ))}
      <Btn small full={false} onClick={() => onChange([...cards, { h: "", p: "", art: "wheel" }])}><span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}><Plus size={14} />بطاقة جديدة</span></Btn>
    </div>
  );
}
