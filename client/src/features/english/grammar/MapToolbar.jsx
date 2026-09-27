import { useEffect, useRef, useState } from "react";
import { Search, Heart, Map, List, Mountain, Globe, Network, SlidersHorizontal, Check } from "lucide-react";
import { C, R, S, T, TAP, alpha, inputStyle } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/PrefsContext";
import { searchGrammar } from "../services/english.service";

const BANDS = [["all", "كل المستويات"], ["basics", "أساسي"], ["intermediate", "متوسط"], ["advanced", "متقدم"]];
const VIEWS = [["world", "العالم", Globe], ["branches", "الفروع", Map], ["map", "خريطة ذهنية", Network], ["list", "قائمة", List], ["journey", "الرحلة", Mountain]];

// شريط الخريطة في سطر واحد: بحث (بعد 300 ملّي ثانية)، زر «تصفية» يجمع المستوى والمفضلة، وأيقونات طريقة العرض
export default function MapToolbar({ band, onBand, onlyMarked, onOnlyMarked, view, onView, onPick, count }) {
  const num = useNum();
  const [q, setQ] = useState("");
  const [hits, setHits] = useState([]);
  const [openList, setOpenList] = useState(false);
  const [filters, setFilters] = useState(false);
  const timer = useRef(null);
  const box = useRef(null);
  useEffect(() => {
    clearTimeout(timer.current);
    if (q.trim().length < 2) { setHits([]); return undefined; }
    timer.current = setTimeout(() => { searchGrammar(q).then((h) => { setHits(h); setOpenList(true); }).catch(() => setHits([])); }, 300);
    return () => clearTimeout(timer.current);
  }, [q]);
  useEffect(() => {
    if (!filters) return undefined;
    const off = (e) => { if (!box.current?.contains(e.target)) setFilters(false); };
    const key = (e) => { if (e.key === "Escape") { e.stopPropagation(); setFilters(false); } };
    document.addEventListener("pointerdown", off); document.addEventListener("keydown", key, true);
    return () => { document.removeEventListener("pointerdown", off); document.removeEventListener("keydown", key, true); };
  }, [filters]);
  const pick = (id) => { onPick(id); setOpenList(false); setQ(""); };
  const active = (band !== "all" ? 1 : 0) + (onlyMarked ? 1 : 0);
  const iconBtn = (on) => ({ width: TAP, height: TAP, borderRadius: R.lg, border: 0, background: on ? alpha(C.gold, 0.18) : "transparent", color: on ? C.gold : C.muted, display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 });
  const row = (on, label, fn, Icon) => (
    <button key={label} type="button" role="menuitemcheckbox" aria-checked={on} onClick={fn} style={{ width: "100%", minHeight: TAP, display: "flex", alignItems: "center", gap: S.lg, padding: `0 ${S.x2}px`, borderRadius: R.lg, border: 0, background: on ? alpha(C.gold, 0.12) : "transparent", color: C.text, fontFamily: "inherit", fontSize: T.base, textAlign: "start", cursor: "pointer" }}>
      {Icon ? <Icon size={16} color={on ? C.red : C.muted} fill={on && Icon === Heart ? C.red : "none"} aria-hidden="true" /> : <span style={{ width: 16 }} aria-hidden="true" />}<span style={{ flex: 1 }}>{label}</span>{on && <Check size={16} color={C.gold} aria-hidden="true" />}
    </button>
  );
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: S.lg, alignItems: "center" }}>
      <div style={{ position: "relative", flex: "1 1 280px", minWidth: 0 }}>
        <Search size={16} color={C.muted} aria-hidden="true" style={{ position: "absolute", insetInlineStart: S.x2, top: "50%", transform: "translateY(-50%)" }} />
        <input value={q} onChange={(e) => setQ(e.target.value)} onFocus={() => hits.length && setOpenList(true)} onBlur={() => setTimeout(() => setOpenList(false), 150)} onKeyDown={(e) => { if (e.key === "Escape") { setQ(""); setOpenList(false); } if (e.key === "Enter" && hits[0]) pick(hits[0].id); }}
          aria-label="ابحث في القواعد" placeholder={`ابحث في ${num(count)} قاعدة…`} style={{ ...inputStyle, paddingInlineStart: S.x7 }} />
        {openList && hits.length > 0 && (
          <ul role="listbox" style={{ position: "absolute", insetInline: 0, top: "100%", zIndex: 10, listStyle: "none", margin: `${S.xs}px 0 0`, padding: S.sm, background: C.surface, border: `1px solid ${C.line}`, borderRadius: R.x2, boxShadow: "var(--shadow-2)", maxHeight: 280, overflowY: "auto" }}>
            {hits.map((h) => <li key={h.id}><button type="button" role="option" aria-selected={false} onMouseDown={(e) => e.preventDefault()} onClick={() => pick(h.id)} style={{ width: "100%", textAlign: "start", minHeight: TAP, padding: `${S.sm}px ${S.x2}px`, borderRadius: R.lg, border: 0, background: "transparent", color: C.text, fontFamily: "inherit", fontSize: T.base, display: "flex", justifyContent: "space-between", gap: S.lg, cursor: "pointer" }}><span>{h.title} <span dir="ltr" style={{ color: C.muted, fontSize: T.sm, fontFamily: "Georgia, serif" }}>{h.en}</span></span><span className="madar-num" style={{ color: C.muted, fontSize: T.xs }}>{h.level}</span></button></li>)}
          </ul>
        )}
        {q.trim().length >= 2 && openList && hits.length === 0 && <div role="status" style={{ position: "absolute", insetInline: 0, top: "100%", marginTop: S.xs, background: C.surface, border: `1px solid ${C.line}`, borderRadius: R.x2, padding: S.x2, color: C.muted, fontSize: T.sm, zIndex: 10 }}>لا نتيجة. جرّب اسم الزمن أو القاعدة بالعربية أو الإنجليزية.</div>}
      </div>
      <div style={{ display: "flex", gap: S.lg, alignItems: "center", marginInlineStart: "auto" }}>
        <div ref={box} style={{ position: "relative" }}>
          <button type="button" onClick={() => setFilters((f) => !f)} aria-expanded={filters} aria-haspopup="menu" style={{ minHeight: TAP, display: "inline-flex", alignItems: "center", gap: S.md, padding: `0 ${S.x2}px`, borderRadius: R.pill, border: `1px solid ${active ? C.gold : C.line}`, background: active ? alpha(C.gold, 0.12) : C.surface, color: C.text, fontFamily: "inherit", fontSize: T.sm, fontWeight: 600, cursor: "pointer" }}>
            <SlidersHorizontal size={16} aria-hidden="true" />تصفية{active > 0 && <span className="madar-num" style={{ minWidth: S.x4, height: S.x4, borderRadius: R.pill, background: C.gold, color: C.bg, fontSize: T.xs, display: "grid", placeItems: "center" }}>{num(active)}</span>}
          </button>
          {filters && (
            <div role="menu" aria-label="تصفية" style={{ position: "absolute", top: "100%", insetInlineEnd: 0, marginTop: S.sm, zIndex: 20, width: 220, padding: S.sm, background: C.surface, border: `1px solid ${C.line}`, borderRadius: R.x2, boxShadow: "var(--shadow-3)", display: "grid", gap: S.xs }}>
              {BANDS.map(([k, l]) => row(band === k, l, () => onBand(k)))}
              <div aria-hidden="true" style={{ height: 1, background: C.line, margin: `${S.xs}px 0` }} />
              {row(onlyMarked, "المفضلة فقط", () => onOnlyMarked(!onlyMarked), Heart)}
            </div>
          )}
        </div>
        <div role="group" aria-label="طريقة العرض" style={{ display: "flex", gap: S.xs, padding: S.xs, borderRadius: R.xl, background: C.surface, border: `1px solid ${C.line}` }}>
          {VIEWS.map(([k, l, Icon]) => <button key={k} type="button" onClick={() => onView(k)} aria-pressed={view === k} aria-label={l} title={l} style={iconBtn(view === k)}><Icon size={18} aria-hidden="true" /></button>)}
        </div>
      </div>
    </div>
  );
}
