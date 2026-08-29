import { Clock, Check } from "lucide-react";
import { P, MONO } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/NumContext";
import Art from "../../../shared/components/art/Art";

export function SparkPage({ info, content }) {
  const num = useNum();
  return (
    <div>
      {content.hero && (
        <div style={{ textAlign: "center", margin: "18px 0 10px" }}>
          <div style={{ fontFamily: MONO, fontSize: 84, fontWeight: 800, color: P.gold, lineHeight: 1, letterSpacing: "-0.03em" }}>{num(content.hero.num)}</div>
          <div style={{ color: P.muted, fontSize: 14, marginTop: 6 }}>{content.hero.label}</div>
        </div>
      )}
      <div style={{ fontSize: 23, fontWeight: 800, margin: "18px 0 14px", lineHeight: 1.4 }}>{info.title}</div>
      <div style={{ fontSize: 17.5, lineHeight: 1.95, borderInlineStart: `3px solid ${P.gold}`, paddingInlineStart: 14 }}>{content.spark}</div>
      <div style={{ color: P.muted, fontSize: 13, marginTop: 16, display: "flex", alignItems: "center", gap: 6 }}>
        <Clock size={13} />{num(info.minutes)} دقيقة · {num(content.cards.length)} بطاقات · اختبار من {num(content.quiz.length)} أسئلة
      </div>
      <div style={{ color: P.muted, fontSize: 12, marginTop: 24, textAlign: "center" }}>اسحب، أو اضغط على يسار الشاشة للمتابعة</div>
    </div>
  );
}

export function GoalsPage({ goals }) {
  const num = useNum();
  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 800, margin: "6px 0 16px" }}>بعد هذه الوحدة ستستطيع أن</div>
      <div style={{ display: "grid", gap: 10 }}>
        {goals.map((g, i) => (
          <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", background: P.card, border: `1px solid ${P.line}`, borderRadius: 16, padding: "12px 14px" }}>
            <span style={{ width: 26, height: 26, borderRadius: 99, background: P.ink, color: P.bg, display: "grid", placeItems: "center", fontFamily: MONO, fontWeight: 800, fontSize: 13, flexShrink: 0 }}>{num(i + 1)}</span>
            <span style={{ lineHeight: 1.6 }}>{g}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardPage({ card, index, total }) {
  const num = useNum();
  return (
    <div>
      <Art k={card.art} />
      <div style={{ color: P.gold, fontSize: 12, fontWeight: 700, marginTop: 14 }}>البطاقة {num(index)} من {num(total)}</div>
      <div style={{ fontSize: 22, fontWeight: 800, margin: "4px 0 10px", lineHeight: 1.4 }}>{card.h}</div>
      <div style={{ fontSize: 17, lineHeight: 1.95 }}>{card.p}</div>
    </div>
  );
}

export function TryPage({ tryIt }) {
  return (
    <div>
      <Art k="wheel" height={110} />
      <div style={{ fontSize: 22, fontWeight: 800, margin: "16px 0 10px" }}>{tryIt.title}</div>
      <div style={{ fontSize: 16.5, lineHeight: 1.9 }}>{tryIt.text}</div>
    </div>
  );
}

export function DeepPage({ deep }) {
  return (
    <div>
      <div style={{ color: P.muted, fontSize: 12, fontWeight: 700 }}>اختياري</div>
      <div style={{ fontSize: 19, fontWeight: 800, margin: "6px 0 12px", lineHeight: 1.5 }}>{deep.title}</div>
      <div style={{ background: P.card, border: `1px solid ${P.line}`, borderRadius: 16, padding: "12px 14px" }}>
        <div style={{ color: P.gold, fontSize: 12, fontWeight: 800, marginBottom: 4 }}>لماذا اخترناه</div>
        <div style={{ fontSize: 15.5, lineHeight: 1.9 }}>{deep.why}</div>
      </div>
    </div>
  );
}

export function EndPage({ summary }) {
  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 800, margin: "6px 0 14px" }}>الخلاصة</div>
      <div style={{ display: "grid", gap: 8 }}>
        {summary.map((s, i) => <div key={i} style={{ display: "flex", gap: 10, fontSize: 15.5, lineHeight: 1.7 }}><Check size={16} color={P.gold} style={{ flexShrink: 0, marginTop: 5 }} />{s}</div>)}
      </div>
      <div style={{ color: P.muted, fontSize: 13, marginTop: 16 }}>تُحفظ الخلاصة في مكتبتك وتدخل جدول المراجعة: غداً، ثم بعد 3 أيام، ثم أسبوع.</div>
    </div>
  );
}
