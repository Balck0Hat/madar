import { useState, useEffect, useMemo } from "react";
import { Zap, Link2, Award } from "lucide-react";
import { C, MONO } from "../../../shared/constants/theme";
import { BADGES } from "../../../shared/data/curriculum";
import { unitInfo, parseId } from "../../../shared/utils/units";
import { levelFromXp, levelProgress, levelTitle } from "../../../shared/utils/level";
import { vibrate } from "../../../shared/utils/text";
import { useNum } from "../../../shared/context/NumContext";
import { Btn, Card, Bar, Confetti } from "../../../shared/components/ui";
import Wheel from "../../../shared/components/wheel/Wheel";
import { sectorMid } from "../../../shared/components/wheel/geometry";

function ScoreRing({ pct, label }) {
  const r = 44, circ = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 110 110" width="130" height="130" style={{ margin: "0 auto", display: "block" }}>
      <circle cx="55" cy="55" r={r} fill="none" stroke={C.line} strokeWidth="8" />
      <circle cx="55" cy="55" r={r} fill="none" stroke={C.red} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${circ * pct} ${circ}`} transform="rotate(-90 55 55)" />
      <text x="55" y="62" textAnchor="middle" fill={C.text} fontFamily={MONO} fontSize="24" fontWeight="800">{label}</text>
    </svg>
  );
}

export default function ResultScreen({ result, xp, progress, onMap, onNext, hasNext }) {
  const num = useNum();
  const info = unitInfo(result.unitId);
  const p = parseId(result.unitId);
  const pct = result.correct / result.total;
  const { level, cur, need } = levelProgress(xp);
  const lvlBefore = levelFromXp(result.xpBefore);
  const perfect = result.passed && pct === 1;
  const [phase, setPhase] = useState(0);
  useEffect(() => { const t = setTimeout(() => setPhase(1), 500); return () => clearTimeout(t); }, []);
  useEffect(() => { if (perfect) vibrate([30, 40, 30, 40, 80]); }, [perfect]);
  // العجلة قبل هذه الوحدة، لتُرى النجمة الجديدة وهي تظهر
  const before = useMemo(() => { const b = { ...progress }; if (result.fresh) delete b[result.unitId]; return b; }, [progress, result]);
  const shown = phase === 0 ? before : progress;
  const rotate = p.center ? 0 : -sectorMid(p.di);
  const highlight = p.center ? null : { di: p.di, r: p.r };
  const score = `${num(result.correct)}/${num(result.total)}`;

  return (
    <div className="madar-in" style={{ minHeight: "100vh", padding: "24px 20px 30px", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
      {perfect && phase === 1 && <Confetti color={info.color} />}
      {result.passed ? (
        <div style={{ display: "flex", justifyContent: "center", position: "relative" }}>
          <Wheel progress={shown} level={level} size={230} compact rotate={rotate} animate threadsNew={phase === 1 ? result.newThreads : []} highlight={phase === 1 ? highlight : null} />
          <div style={{ position: "absolute", bottom: -6, left: "50%", transform: "translateX(-50%)", background: C.surface, border: `1px solid ${info.color}`, borderRadius: 999, padding: "6px 14px", display: "flex", gap: 8, alignItems: "center", whiteSpace: "nowrap" }}>
            <span style={{ fontFamily: MONO, fontWeight: 800, color: info.color, fontSize: 18 }}>{score}</span>
            <span style={{ color: C.muted, fontSize: 12 }}>{result.sim ? "محاكاة" : "الاختبار"}</span>
          </div>
        </div>
      ) : <ScoreRing pct={pct} label={score} />}
      <div style={{ textAlign: "center", marginTop: 18 }}>
        <div style={{ fontSize: 26, fontWeight: 900 }}>{result.passed ? (perfect ? "علامة كاملة" : "اجتزت الوحدة") : "قريب من النجاح"}</div>
        <div style={{ color: C.muted, marginTop: 4, fontSize: 14, lineHeight: 1.6 }}>{result.passed ? info.title : "راجع البطاقات وأعد المحاولة، الأسئلة تتغير في كل مرة."}</div>
      </div>
      <div style={{ marginTop: 18, display: "grid", gap: 10 }}>
        {result.breakdown.length > 0 && (
          <Card>
            {result.breakdown.map(([l, v], k) => <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: k < result.breakdown.length - 1 ? `1px dashed ${C.line}` : "none", fontSize: 14 }}><span>{l}</span><span style={{ fontFamily: MONO, color: C.gold, fontWeight: 800 }}>+{num(v)}</span></div>)}
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 10, fontWeight: 800 }}><span>المجموع</span><span style={{ fontFamily: MONO, color: C.gold, display: "flex", alignItems: "center", gap: 4 }}><Zap size={14} />+{num(result.gain)}</span></div>
          </Card>
        )}
        {result.passed && result.breakdown.length === 0 && <Card><div style={{ color: C.muted, fontSize: 13 }}>وحدة مكتملة سابقاً: لا نقاط إضافية على الإعادة.</div></Card>}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
            <span style={{ fontWeight: 800 }}>المستوى {num(level)} · {levelTitle(level)}{level > lvlBefore && <span style={{ color: C.gold }}> ارتفعت!</span>}</span>
            <span style={{ fontFamily: MONO, color: C.muted }}>{num(cur)}/{num(need)}</span>
          </div>
          <Bar value={cur / need} />
        </Card>
        {(result.graded || []).filter((g) => g.feedback).map((g) => (
          <Card key={g.qid} accent={g.ok ? C.green : C.red}>
            <div style={{ fontWeight: 800, color: g.ok ? C.green : C.red, fontSize: 13 }}>{g.ok ? "إجابتك المفتوحة مقبولة" : "إجابتك المفتوحة لم تُقبل"}{g.source === "ai" && <span style={{ color: C.muted, fontWeight: 400 }}> · صحّحها المرشد الذكي</span>}</div>
            <div style={{ fontSize: 14, lineHeight: 1.7, marginTop: 4 }}>{g.feedback}</div>
          </Card>
        ))}
        {result.earnedFreeze && <Card accent={C.gold}><div style={{ fontWeight: 800 }}>❄ حصلت على تجميد للسلسلة</div><div style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>سبعة أيام متتالية. التجميد يحفظ سلسلتك إذا فاتك يوم.</div></Card>}
        {result.newThreads.length > 0 && <Card accent={C.gold}><div style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 800 }}><Link2 size={16} color={C.gold} />خيط معرفة اكتمل</div><div style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>رُسم خط ضوئي جديد على عجلتك بين مجالين.</div></Card>}
        {result.newBadges.map((id) => { const b = BADGES.find((x) => x.id === id); return <Card key={id} accent={C.gold}><div style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 800 }}><Award size={16} color={C.gold} />وسام جديد: {b.name}</div><div style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>{b.desc}</div></Card>; })}
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ display: "grid", gap: 8, marginTop: 20 }}>
        {result.passed && hasNext && <Btn primary onClick={onNext}>الوحدة التالية</Btn>}
        <Btn onClick={onMap}>العودة إلى الخريطة</Btn>
      </div>
    </div>
  );
}
