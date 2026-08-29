import { useEffect, useRef } from "react";
import { P, FONT, alpha } from "../../../shared/constants/theme";
import { COLOR_KEYS, tintOf } from "../utils/highlight";

const MAX = 500;

// محرّر الملاحظة داخل الشريط نفسه — لا prompt() من المتصفح ولا شاشة تقطع القراءة
export default function NoteComposer({ value, onChange, color, onColor, onSave, onCancel, busy, showColors = true }) {
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus(); }, []);
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <textarea
        ref={ref}
        value={value}
        maxLength={MAX}
        rows={3}
        aria-label="نص الملاحظة"
        placeholder="لماذا يهمّك هذا المقطع؟"
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Escape") { e.stopPropagation(); onCancel(); } }}
        style={{
          width: "100%", resize: "vertical", fontFamily: FONT, fontSize: 14, lineHeight: 1.7,
          background: P.bg, color: P.ink, border: `1px solid ${P.line}`, borderRadius: 12, padding: "8px 10px",
        }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {showColors && (
          <div role="radiogroup" aria-label="لون التظليل" style={{ display: "flex", gap: 6 }}>
            {COLOR_KEYS.map((key) => (
              <button
                key={key} type="button" role="radio" aria-checked={color === key} aria-label={`لون ${key}`}
                onClick={() => onColor(key)}
                style={{
                  width: 22, height: 22, borderRadius: 99, cursor: "pointer",
                  background: alpha(tintOf(key), 0.45),
                  border: `2px solid ${color === key ? tintOf(key) : "transparent"}`,
                }}
              />
            ))}
          </div>
        )}
        <div style={{ marginInlineStart: "auto", display: "flex", gap: 6 }}>
          <button type="button" onClick={onCancel} style={{ ...btn, background: "transparent", color: P.muted, border: "none" }}>إلغاء</button>
          <button type="button" disabled={busy} onClick={() => onSave(value.trim())} style={{ ...btn, background: P.ink, color: P.bg, opacity: busy ? 0.5 : 1 }}>
            {busy ? "…" : "حفظ"}
          </button>
        </div>
      </div>
    </div>
  );
}

const btn = { fontFamily: FONT, fontWeight: 700, fontSize: 13, borderRadius: 10, padding: "7px 12px", border: "none", cursor: "pointer" };
