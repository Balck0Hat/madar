import { useMemo, useState } from "react";
import { BookOpen, Mic, Search } from "lucide-react";
import { C, inputStyle, R, S, T, TAP, alpha } from "../../../shared/constants/theme";
import { useAsync } from "../../../shared/hooks/useAsync";
import { useNum } from "../../../shared/context/PrefsContext";
import { TopBar, Skeleton, ErrorState, Card, Btn } from "../../../shared/components/ui";
import { listSuras, getMemo, setGoal, parseKey } from "../services/quran.service";
import GoalPicker from "./GoalPicker";
import JuzMap from "./JuzMap";
import TodayDose from "./TodayDose";

// خانة حفظ القرآن: الهدف وجرعة اليوم (مراجعات حان موعدها، ثم آيات جديدة)،
// وخريطة الأجزاء، وقائمة السور للتصفح.
export default function QuranScreen({ onBack, onOpenSura, onRecite, onListenRandom }) {
  const num = useNum();
  const [editing, setEditing] = useState(false);
  const [q, setQ] = useState("");
  const { data, loading, error, reload } = useAsync(() => Promise.all([listSuras(), getMemo()]).then(([suras, memo]) => ({ suras, memo })), []);
  const suras = data?.suras || [];
  const memo = data?.memo;
  const byN = useMemo(() => Object.fromEntries(suras.map((s) => [s.n, s])), [suras]);
  const shown = useMemo(() => { const n = q.trim(); return n ? suras.filter((s) => s.name.includes(n) || s.nameSimple.includes(n) || String(s.n) === n) : suras; }, [suras, q]);

  const save = async (goal) => { await setGoal(goal); setEditing(false); reload(); };
  const label = (g) => (g.kind === "sura" ? `سورة ${byN[g.from]?.name || g.from}${g.to > g.from ? ` إلى ${byN[g.to]?.name || g.to}` : ""}` : g.kind === "juz" ? `الجزء ${num(g.from)}${g.to > g.from ? ` إلى ${num(g.to)}` : ""}` : `الصفحات ${num(g.from)} إلى ${num(g.to)}`);

  return (
    <div className="madar-in madar-tabpad madar-col">
      <TopBar title="حفظ القرآن" onBack={onBack} />
      <div style={{ padding: `0 ${S.x4}px`, display: "grid", gap: S.x3 }}>
        {loading && <Skeleton lines={6} />}
        {error && <ErrorState message={error.message} onRetry={reload} onBack={onBack} />}
        {memo && (!memo.goal || editing) && <GoalPicker suras={suras} goal={memo.goal} onSave={save} onCancel={memo.goal ? () => setEditing(false) : null} />}
        {memo?.goal && !editing && (
          <>
            <Card accent={C.gold} style={{ display: "grid", gap: S.md }}>
              <div style={{ display: "flex", alignItems: "center", gap: S.lg }}>
                <div style={{ flex: 1 }}>
                  <div style={{ color: C.muted, fontSize: T.xs }}>هدفي</div>
                  <div style={{ fontWeight: 700, fontSize: T.x2 }}>{label(memo.goal)}</div>
                </div>
                <button type="button" onClick={() => setEditing(true)} style={{ minHeight: TAP - S.xl, fontFamily: "inherit", fontSize: T.sm, color: C.muted, background: "none", border: `1px solid ${C.line}`, borderRadius: R.pill, padding: `${S.sm}px ${S.x2}px`, cursor: "pointer" }}>غيّر</button>
              </div>
              <div style={{ height: 6, background: C.surface2, borderRadius: R.pill, overflow: "hidden" }}>
                <div style={{ width: `${memo.today.total ? (memo.today.memorized / memo.today.total) * 100 : 0}%`, height: "100%", background: C.gold }} />
              </div>
              <div style={{ color: C.muted, fontSize: T.sm }}>أتقنت {num(memo.today.memorized)} من {num(memo.today.total)} آية · بدأت {num(memo.today.started)} · {num(memo.goal.perDay)} آيات جديدة يومياً</div>
            </Card>
            <TodayDose today={memo.today} byN={byN} onRecite={onRecite} onOpenSura={onOpenSura} />
            <div>
              <div style={{ fontWeight: 700, fontSize: T.sm, color: C.muted, margin: `${S.md}px 0 ${S.lg}px` }}>خريطة المصحف</div>
              <JuzMap juz={memo.juz} />
            </div>
          </>
        )}
        {onListenRandom && (
          <button type="button" onClick={onListenRandom} className="madar-press" style={{ minHeight: TAP, fontFamily: "inherit", fontWeight: 700, cursor: "pointer", color: C.gold, background: C.goldSoft, border: `1px solid ${alpha(C.gold, 0.4)}`, borderRadius: R.xl, padding: `${S.lg}px ${S.x3}px`, textAlign: "start" }}>
            استماع عشوائي من المصحف كله، لا يتوقف حتى توقفه
          </button>
        )}
        {suras.length > 0 && (
          <div style={{ display: "grid", gap: S.lg }}>
            <div style={{ fontWeight: 700, fontSize: T.sm, color: C.muted, marginTop: S.md }}>المصحف</div>
            <div style={{ display: "flex", alignItems: "center", gap: S.lg, background: C.surface2, border: `1px solid ${C.line}`, borderRadius: R.xl, padding: `0 ${S.x2}px`, height: TAP + 4 }}>
              <Search size={16} color={C.muted} aria-hidden="true" />
              <input aria-label="ابحث عن سورة" value={q} onChange={(e) => setQ(e.target.value)} placeholder="اسم السورة أو رقمها" style={{ ...inputStyle, background: "transparent", border: 0, padding: 0, height: "100%" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: S.md }}>
              {shown.map((s) => (
                <button key={s.n} type="button" onClick={() => onOpenSura(s.n)} className="madar-press"
                  style={{ minHeight: TAP, textAlign: "start", fontFamily: "inherit", cursor: "pointer", background: C.surface, border: `1px solid ${C.line}`, borderRadius: R.xl, padding: `${S.lg}px ${S.x2}px`, color: C.text, display: "flex", alignItems: "center", gap: S.lg }}>
                  <span style={{ color: C.muted, fontSize: T.xs, width: 22, textAlign: "center" }}>{num(s.n)}</span>
                  <span style={{ flex: 1, minWidth: 0 }}><span style={{ display: "block", fontWeight: 700 }}>{s.name}</span><span style={{ display: "block", color: C.muted, fontSize: T.xs }}>{s.revelation} · {num(s.ayahs)} آية</span></span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
