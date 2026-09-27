import { useState } from "react";
import { Search } from "lucide-react";
import { C, R, S, T, TAP, alpha } from "../../../shared/constants/theme";

// قطع مشتركة لأدوات الشبكة: نموذج اسم مضيف، صندوق نتيجة، وسطر مفتاح/قيمة
export function HostForm({ label, placeholder, initial = "", busy, onSubmit, hue = C.gold, action = "افحص" }) {
  const [v, setV] = useState(initial);
  const submit = (e) => { e.preventDefault(); if (v.trim() && !busy) onSubmit(v.trim()); };
  return (
    <form onSubmit={submit} style={{ display: "flex", gap: S.md }}>
      <input aria-label={label} dir="ltr" value={v} onChange={(e) => setV(e.target.value)} placeholder={placeholder} autoCapitalize="none" autoCorrect="off" spellCheck={false} inputMode="url"
        style={{ flex: 1, minWidth: 0, minHeight: TAP, padding: `0 ${S.x3}px`, borderRadius: R.lg, border: `1px solid ${C.line}`, background: C.surface2, color: C.text, fontFamily: "inherit", fontSize: T.lg }} />
      <button type="submit" disabled={busy || !v.trim()} style={{ minHeight: TAP, padding: `0 ${S.x4}px`, borderRadius: R.lg, border: 0, background: hue, color: C.bg, fontFamily: "inherit", fontWeight: 700, fontSize: T.md, display: "inline-flex", alignItems: "center", gap: S.md, cursor: busy ? "wait" : "pointer", opacity: busy || !v.trim() ? 0.6 : 1 }}>
        <Search size={16} aria-hidden="true" />{busy ? "…" : action}
      </button>
    </form>
  );
}

export const Box = ({ children, tone, style = {} }) => (
  <div style={{ background: tone ? alpha(tone, 0.08) : C.surface2, border: `1px solid ${tone ? alpha(tone, 0.4) : C.line}`, borderRadius: R.xl, padding: S.x3, display: "grid", gap: S.md, lineHeight: 1.8, ...style }}>{children}</div>
);

export const Row = ({ k, v, mono = true }) => (
  <div style={{ display: "flex", gap: S.lg, alignItems: "baseline", flexWrap: "wrap" }}>
    <span style={{ color: C.muted, fontSize: T.sm, minWidth: 72 }}>{k}</span>
    <span dir={mono ? "ltr" : undefined} className={mono ? "madar-num" : undefined} style={{ flex: 1, minWidth: 0, wordBreak: "break-all", fontFamily: mono ? "ui-monospace, Menlo, monospace" : "inherit", fontSize: T.md }}>{v}</span>
  </div>
);

export const Note = ({ children }) => <div style={{ color: C.muted, fontSize: T.sm, lineHeight: 1.7 }}>{children}</div>;

// شريط أفقي نسبي لعرض الأزمنة
export const Bar = ({ value, max, tone, label }) => (
  <div style={{ display: "flex", alignItems: "center", gap: S.lg }}>
    <div style={{ flex: 1, height: S.lg, background: C.line, borderRadius: R.pill, overflow: "hidden" }}><div style={{ width: `${Math.max(2, Math.min(100, (value / max) * 100))}%`, height: "100%", background: tone, borderRadius: R.pill, transition: "width .3s" }} /></div>
    <span className="madar-num" dir="ltr" style={{ minWidth: 64, textAlign: "end", fontSize: T.sm, color: tone, fontWeight: 700 }}>{label}</span>
  </div>
);

export const toneForMs = (ms) => (ms < 60 ? C.green : ms < 150 ? C.gold : C.red);
