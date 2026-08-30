import { useState, useEffect, useMemo } from "react";
import { Link2, Award } from "lucide-react";
import { C, MONO, T, R, S, GUTTER } from "../../../shared/constants/theme";
import { BADGES } from "../../../shared/data/curriculum";
import { unitInfo, parseId } from "../../../shared/utils/units";
import { levelProgress } from "../../../shared/utils/level";
import { vibrate } from "../../../shared/utils/text";
import { useNum } from "../../../shared/context/NumContext";
import { useCountUp } from "../../../shared/hooks/useCountUp";
import { Btn, Card, Confetti } from "../../../shared/components/ui";
import Wheel from "../../../shared/components/wheel/Wheel";
import StarFlight from "../../../shared/components/wheel/StarFlight";
import { sectorMid } from "../../../shared/components/wheel/geometry";
import ScoreRing from "./ScoreRing";
import ResultBreakdown from "./ResultBreakdown";
import ResultLevel from "./ResultLevel";
import { prefersStill, settled } from "./resultMotion";

export default function ResultScreen({ result, xp, progress, onMap, onNext, hasNext }) {
  const num = useNum();
  const info = unitInfo(result.unitId);
  const p = parseId(result.unitId);
  const pct = result.correct / result.total;
  const { level } = levelProgress(xp);
  const perfect = result.passed && pct === 1;
  const flight = result.fresh && result.passed; // النجمة تطير فقط عند إنجاز جديد
  // 0: العجلة قبل الوحدة والنجمة تطير · 1: هبطت · 2: العجلة تتبنّى النجمة ويُرسم الخيط
  // مع تقليل الحركة نبدأ من الحالة النهائية مباشرة
  const [phase, setPhase] = useState(prefersStill() ? 2 : 0);
  useEffect(() => {
    if (phase === 2) return undefined;
    // بلا طيران نُبقي توقيت نصف الثانية القديم؛ بعد الهبوط نمهل الخيط ليُرسم بعد النجمة
    if (phase === 0 && flight) return undefined;
    const wait = phase === 0 ? 500 : result.newThreads.length ? 380 : 0;
    const t = setTimeout(() => setPhase(2), wait);
    return () => clearTimeout(t);
  }, [phase, flight, result.newThreads.length]);
  useEffect(() => { if (perfect) vibrate([30, 40, 30, 40, 80]); }, [perfect]);
  // العجلة قبل هذه الوحدة، لتُرى النجمة الجديدة وهي تصل
  const before = useMemo(() => { const b = { ...progress }; if (result.fresh) delete b[result.unitId]; return b; }, [progress, result]);
  const shown = phase === 2 ? progress : before;
  const rotate = p.center ? 0 : -sectorMid(p.di);
  const highlight = p.center ? null : { di: p.di, r: p.r };
  const correct = settled(useCountUp(result.correct, { duration: 700, delay: 150 }), result.correct);
  const score = `${num(correct)}/${num(result.total)}`;

  return (
    <div className="madar-in" style={{ minHeight: "100vh", padding: `${S.x6}px ${GUTTER}px ${S.x7}px`, display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
      {perfect && phase >= 1 && <Confetti color={info.color} />}
      {result.passed ? (
        <div style={{ display: "flex", justifyContent: "center", position: "relative" }}>
          <Wheel progress={shown} level={level} size={230} compact rotate={rotate} animate threadsNew={phase === 2 ? result.newThreads : []} highlight={phase === 2 ? highlight : null} />
          {flight && phase < 2 && <StarFlight unitId={result.unitId} size={230} rotate={rotate} color={info.color} onLand={() => setPhase(1)} />}
          <div style={{ position: "absolute", bottom: -6, left: "50%", transform: "translateX(-50%)", background: C.surface, border: `1px solid ${info.color}`, borderRadius: R.pill, padding: `${S.md}px ${S.x3}px`, display: "flex", gap: S.lg, alignItems: "center", whiteSpace: "nowrap" }}>
            <span style={{ fontFamily: MONO, fontWeight: 700, color: info.color, fontSize: T.x2 }}>{score}</span>
            <span style={{ color: C.muted, fontSize: T.sm }}>{result.sim ? "محاكاة" : "الاختبار"}</span>
          </div>
        </div>
      ) : <ScoreRing pct={correct / result.total} label={score} />}
      <div style={{ textAlign: "center", marginTop: S.x4 }}>
        <div style={{ fontSize: T.x5, fontWeight: 700 }}>{result.passed ? (perfect ? "علامة كاملة" : "اجتزت الوحدة") : "قريب من النجاح"}</div>
        <div style={{ color: C.muted, marginTop: S.sm, fontSize: T.md, lineHeight: 1.6 }}>{result.passed ? info.title : "راجع البطاقات وأعد المحاولة، الأسئلة تتغير في كل مرة."}</div>
      </div>
      <div style={{ marginTop: S.x4, display: "grid", gap: S.xl }}>
        {result.breakdown.length > 0 && <ResultBreakdown breakdown={result.breakdown} gain={result.gain} />}
        {result.passed && result.breakdown.length === 0 && <Card><div style={{ color: C.muted, fontSize: T.base }}>وحدة مكتملة سابقاً: لا نقاط إضافية على الإعادة.</div></Card>}
        <ResultLevel xp={xp} xpBefore={result.xpBefore} />
        {(result.graded || []).filter((g) => g.feedback).map((g) => (
          <Card key={g.qid} accent={g.ok ? C.green : C.red}>
            <div style={{ fontWeight: 700, color: g.ok ? C.green : C.red, fontSize: T.base }}>{g.ok ? "إجابتك المفتوحة مقبولة" : "إجابتك المفتوحة لم تُقبل"}{g.source === "ai" && <span style={{ color: C.muted, fontWeight: 400 }}> · صحّحها المرشد الذكي</span>}</div>
            <div style={{ fontSize: T.md, lineHeight: 1.7, marginTop: S.sm }}>{g.feedback}</div>
          </Card>
        ))}
        {result.earnedFreeze && <Card accent={C.gold}><div style={{ fontWeight: 700 }}>❄ حصلت على تجميد للسلسلة</div><div style={{ color: C.muted, fontSize: T.base, marginTop: S.sm }}>سبعة أيام متتالية. التجميد يحفظ سلسلتك إذا فاتك يوم.</div></Card>}
        {result.newThreads.length > 0 && <Card accent={C.gold}><div style={{ display: "flex", gap: S.lg, alignItems: "center", fontWeight: 700 }}><Link2 size={16} color={C.gold} />خيط معرفة اكتمل</div><div style={{ color: C.muted, fontSize: T.base, marginTop: S.sm }}>رُسم خط ضوئي جديد على عجلتك بين مجالين.</div></Card>}
        {result.newBadges.map((id) => { const b = BADGES.find((x) => x.id === id); return <Card key={id} accent={C.gold}><div style={{ display: "flex", gap: S.lg, alignItems: "center", fontWeight: 700 }}><Award size={16} color={C.gold} />وسام جديد: {b.name}</div><div style={{ color: C.muted, fontSize: T.base, marginTop: S.sm }}>{b.desc}</div></Card>; })}
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ display: "grid", gap: S.lg, marginTop: S.x5 }}>
        {result.passed && hasNext && <Btn primary onClick={onNext}>الوحدة التالية</Btn>}
        <Btn onClick={onMap}>العودة إلى الخريطة</Btn>
      </div>
    </div>
  );
}
