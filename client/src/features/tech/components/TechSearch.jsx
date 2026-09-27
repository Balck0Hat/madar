import { useEffect, useRef, useState } from "react";
import { Search, Heart } from "lucide-react";
import { C, R, S, T, TAP, alpha, inputStyle } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/PrefsContext";
import { searchTech } from "../services/tech.service";
import { LEVELS, levelTone, LEVEL_LABEL } from "./tech.meta";

// بحث في التقنية (بعد 300 ملّي ثانية) مع نتائج، وتصفية بالمستوى والمفضلة
export default function TechSearch({ level, onLevel, onlyMarked, onOnlyMarked, onPick, count }) {
  const num = useNum();
  const [q, setQ] = useState("");
  const [hits, setHits] = useState([]);
  const [open, setOpen] = useState(false);
  const timer = useRef(null);
  useEffect(() => {
    clearTimeout(timer.current);
    if (q.trim().length < 2) { setHits([]); return undefined; }
    timer.current = setTimeout(() => searchTech(q).then((h) => { setHits(h); setOpen(true); }).catch(() => setHits([])), 300);
    return () => clearTimeout(timer.current);
  }, [q]);
  const pick = (id) => { onPick(id); setOpen(false); setQ(""); };
  const chip = (active, label, onClick, Icon, tone = C.gold) => (
    <button key={label} type="button" onClick={onClick} aria-pressed={active} style={{ minHeight: TAP, padding: `0 ${S.x2}px`, borderRadius: R.pill, border: `1px solid ${active ? tone : C.line}`, background: active ? alpha(tone, 0.15) : C.surface, color: C.text, fontFamily: "inherit", fontSize: T.sm, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: S.sm, cursor: "pointer", flexShrink: 0 }}>{Icon && <Icon size={14} aria-hidden="true" />}{label}</button>
  );
  return (
    <div style={{ display: "grid", gap: S.lg }}>
      <div style={{ position: "relative" }}>
        <Search size={16} color={C.muted} aria-hidden="true" style={{ position: "absolute", insetInlineStart: S.x2, top: "50%", transform: "translateY(-50%)" }} />
        <input value={q} onChange={(e) => setQ(e.target.value)} onFocus={() => hits.length && setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 150)} onKeyDown={(e) => { if (e.key === "Escape") { setQ(""); setOpen(false); } if (e.key === "Enter" && hits[0]) pick(hits[0].id); }}
          aria-label="ابحث في التقنية" placeholder={`ابحث في ${num(count)} موضوعاً… (مثلاً: VPN، الذاكرة، ChatGPT)`} style={{ ...inputStyle, paddingInlineStart: S.x7 }} />
        {open && hits.length > 0 && (
          <ul role="listbox" style={{ position: "absolute", insetInline: 0, top: "100%", zIndex: 10, listStyle: "none", margin: `${S.xs}px 0 0`, padding: S.sm, background: C.surface, border: `1px solid ${C.line}`, borderRadius: R.x2, boxShadow: "var(--shadow-2)", maxHeight: 300, overflowY: "auto" }}>
            {hits.map((h) => <li key={h.id}><button type="button" role="option" aria-selected={false} onMouseDown={(e) => e.preventDefault()} onClick={() => pick(h.id)} style={{ width: "100%", textAlign: "start", minHeight: TAP, padding: `${S.sm}px ${S.x2}px`, borderRadius: R.lg, border: 0, background: "transparent", color: C.text, fontFamily: "inherit", fontSize: T.base, display: "flex", justifyContent: "space-between", gap: S.lg, cursor: "pointer" }}><span>{h.title} <span dir="ltr" style={{ color: C.muted, fontSize: T.sm }}>{h.en}</span></span><span style={{ color: levelTone(h.level), fontSize: T.xs, flexShrink: 0 }}>{LEVEL_LABEL[h.level]}</span></button></li>)}
          </ul>
        )}
        {q.trim().length >= 2 && open && hits.length === 0 && <div role="status" style={{ position: "absolute", insetInline: 0, top: "100%", marginTop: S.xs, background: C.surface, border: `1px solid ${C.line}`, borderRadius: R.x2, padding: S.x2, color: C.muted, fontSize: T.sm, zIndex: 10 }}>لا نتيجة. جرّب الاسم بالعربية أو الإنجليزية.</div>}
      </div>
      <div style={{ display: "flex", gap: S.sm, overflowX: "auto", paddingBottom: S.xs }} aria-label="تصفية">
        {chip(level === "all", "الكل", () => onLevel("all"))}
        {LEVELS.map(([k, l]) => chip(level === k, l, () => onLevel(k), null, levelTone(k)))}
        {chip(onlyMarked, "المفضلة", () => onOnlyMarked(!onlyMarked), Heart, C.red)}
      </div>
    </div>
  );
}
