import { Mic, BookOpen, RotateCcw } from "lucide-react";
import { C, R, S, T, TAP, alpha } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/PrefsContext";
import { parseKey } from "../services/quran.service";

const Row = ({ s, a, name, kind, onRecite, onOpenSura }) => {
  const num = useNum();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: S.lg, background: C.surface, border: `1px solid ${C.line}`, borderRadius: R.xl, padding: `${S.lg}px ${S.x2}px` }}>
      {kind === "due" ? <RotateCcw size={16} color={C.gold} aria-hidden="true" /> : <BookOpen size={16} color={C.gold} aria-hidden="true" />}
      <button type="button" onClick={() => onOpenSura(s)} style={{ flex: 1, minWidth: 0, minHeight: TAP - S.x2, textAlign: "start", fontFamily: "inherit", background: "none", border: 0, color: C.text, cursor: "pointer", padding: 0 }}>
        <span style={{ fontWeight: 700 }}>{name}</span><span style={{ color: C.muted, fontSize: T.sm }}> · آية {num(a)}</span>
      </button>
      <button type="button" onClick={() => onRecite(s, a)} aria-label={`سمّع ${name} آية ${a}`} className="madar-press"
        style={{ width: TAP, height: TAP, display: "grid", placeItems: "center", background: alpha(C.gold, 0.12), border: `1px solid ${alpha(C.gold, 0.4)}`, borderRadius: R.pill, color: C.gold, cursor: "pointer" }}>
        <Mic size={16} aria-hidden="true" />
      </button>
    </div>
  );
};

// جرعة اليوم: ما حان موعد مراجعته أولاً، ثم الآيات الجديدة بعدد الجرعة
export default function TodayDose({ today, byN, onRecite, onOpenSura }) {
  const num = useNum();
  const rows = (keys, kind) => keys.map((k) => { const [s, a] = parseKey(k); return <Row key={k} s={s} a={a} name={byN[s]?.name || `سورة ${s}`} kind={kind} onRecite={onRecite} onOpenSura={onOpenSura} />; });
  const empty = !today.due.length && !today.fresh.length;
  return (
    <div style={{ display: "grid", gap: S.lg }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: S.lg }}>
        <div style={{ fontWeight: 700, fontSize: T.lg, flex: 1 }}>جرعة اليوم</div>
        <div style={{ color: C.muted, fontSize: T.xs }}>{num(today.due.length)} مراجعة · {num(today.fresh.length)} جديدة</div>
      </div>
      {empty && <div style={{ color: C.muted, fontSize: T.sm, lineHeight: 1.7 }}>أنهيت الهدف كله ولا مراجعة اليوم. غيّر الهدف أو ارجع غداً.</div>}
      {today.due.length > 0 && <div style={{ color: C.muted, fontSize: T.xs }}>راجع أولاً</div>}
      {rows(today.due, "due")}
      {today.fresh.length > 0 && <div style={{ color: C.muted, fontSize: T.xs, marginTop: S.xs }}>ثم احفظ</div>}
      {rows(today.fresh, "fresh")}
    </div>
  );
}
