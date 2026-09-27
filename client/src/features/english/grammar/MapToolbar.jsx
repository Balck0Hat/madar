import { useEffect, useRef, useState } from "react";
import { Search, Heart, Map, List, Mountain } from "lucide-react";
import { C, R, S, T, TAP, alpha, inputStyle } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/PrefsContext";
import { searchGrammar } from "../services/english.service";

const BANDS = [["all", "الكل"], ["basics", "أساسي"], ["intermediate", "متوسط"], ["advanced", "متقدم"]];
const VIEWS = [["map", "خريطة", Map], ["list", "قائمة", List], ["journey", "رحلة", Mountain]];

// شريط الخريطة: بحث مع نتائج (بعد 300 ملّي ثانية)، تصفية بالمستوى، مفضلة، وطريقة العرض
export default function MapToolbar({ band, onBand, onlyMarked, onOnlyMarked, view, onView, onPick, count }) {
  const num = useNum();
  const [q, setQ] = useState("");
  const [hits, setHits] = useState([]);
  const [openList, setOpenList] = useState(false);
  const timer = useRef(null);
  useEffect(() => {
    clearTimeout(timer.current);
    if (q.trim().length < 2) { setHits([]); return undefined; }
    timer.current = setTimeout(() => { searchGrammar(q).then((h) => { setHits(h); setOpenList(true); }).catch(() => setHits([])); }, 300);
    return () => clearTimeout(timer.current);
  }, [q]);
  const pick = (id) => { onPick(id); setOpenList(false); setQ(""); };
  const chip = (active, label, onClick, Icon, extra = {}) => (
    <button key={label} type="button" onClick={onClick} aria-pressed={active} style={{ minHeight: TAP, padding: `0 ${S.x2}px`, borderRadius: R.pill, border: `1px solid ${active ? C.gold : C.line}`, background: active ? alpha(C.gold, 0.15) : C.surface, color: C.text, fontFamily: "inherit", fontSize: T.sm, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: S.sm, cursor: "pointer", flexShrink: 0, ...extra }}>{Icon && <Icon size={14} aria-hidden="true" />}{label}</button>
  );
  return (
    <div style={{ display: "grid", gap: S.lg }}>
      <div style={{ position: "relative" }}>
        <Search size={16} color={C.muted} aria-hidden="true" style={{ position: "absolute", insetInlineStart: S.x2, top: "50%", transform: "translateY(-50%)" }} />
        <input value={q} onChange={(e) => setQ(e.target.value)} onFocus={() => hits.length && setOpenList(true)} onBlur={() => setTimeout(() => setOpenList(false), 150)} onKeyDown={(e) => { if (e.key === "Escape") { setQ(""); setOpenList(false); } if (e.key === "Enter" && hits[0]) pick(hits[0].id); }}
          aria-label="ابحث في القواعد" placeholder={`ابحث في ${num(count)} قاعدة… (مثلاً: المضارع التام، conditionals)`} style={{ ...inputStyle, paddingInlineStart: S.x7 }} />
        {openList && hits.length > 0 && (
          <ul role="listbox" style={{ position: "absolute", insetInline: 0, top: "100%", marginTop: S.xs, zIndex: 10, listStyle: "none", margin: `${S.xs}px 0 0`, padding: S.sm, background: C.surface, border: `1px solid ${C.line}`, borderRadius: R.x2, boxShadow: "var(--shadow-2)", maxHeight: 280, overflowY: "auto" }}>
            {hits.map((h) => <li key={h.id}><button type="button" role="option" aria-selected={false} onMouseDown={(e) => e.preventDefault()} onClick={() => pick(h.id)} style={{ width: "100%", textAlign: "start", minHeight: TAP, padding: `${S.sm}px ${S.x2}px`, borderRadius: R.lg, border: 0, background: "transparent", color: C.text, fontFamily: "inherit", fontSize: T.base, display: "flex", justifyContent: "space-between", gap: S.lg, cursor: "pointer" }}><span>{h.title} <span dir="ltr" style={{ color: C.muted, fontSize: T.sm, fontFamily: "Georgia, serif" }}>{h.en}</span></span><span className="madar-num" style={{ color: C.muted, fontSize: T.xs }}>{h.level}</span></button></li>)}
          </ul>
        )}
        {q.trim().length >= 2 && openList && hits.length === 0 && <div role="status" style={{ position: "absolute", insetInline: 0, top: "100%", marginTop: S.xs, background: C.surface, border: `1px solid ${C.line}`, borderRadius: R.x2, padding: S.x2, color: C.muted, fontSize: T.sm, zIndex: 10 }}>لا نتيجة. جرّب اسم الزمن أو القاعدة بالعربية أو الإنجليزية.</div>}
      </div>
      <div style={{ display: "flex", gap: S.sm, overflowX: "auto", paddingBottom: S.xs }} aria-label="تصفية وعرض">
        {BANDS.map(([k, l]) => chip(band === k, l, () => onBand(k)))}
        {chip(onlyMarked, "المفضلة", () => onOnlyMarked(!onlyMarked), Heart)}
        <span aria-hidden="true" style={{ width: 1, background: C.line, flexShrink: 0 }} />
        {VIEWS.map(([k, l, Icon]) => chip(view === k, l, () => onView(k), Icon))}
      </div>
    </div>
  );
}
