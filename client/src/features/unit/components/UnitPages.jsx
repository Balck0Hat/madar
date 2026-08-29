import { Clock, Check } from "lucide-react";
import { P, MONO, READ } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/PrefsContext";
import Art from "../../../shared/components/art/Art";

// متن الدرس: خط نسخ للقراءة الطويلة وسطر مريح.
// القياسات نسبية (em) عمداً كي تتبع درجة حجم النص التي يختارها القارئ.
const body = { fontFamily: READ, fontSize: "1.07em", lineHeight: 1.95 };

// mark: دالة تلفّ النص بتظليلات القارئ. افتراضها الهوية كي تبقى الصفحات
// قابلة للاستخدام (وللاختبار) بمعزل عن ميزة التظليل.
const plain = (t) => t;

export function SparkPage({ info, content, mark = plain }) {
  const num = useNum();
  return (
    <div>
      {content.hero && (
        <div style={{ textAlign: "center", margin: "18px 0 10px" }}>
          <div style={{ fontFamily: MONO, fontSize: "5.2em", fontWeight: 800, color: info.color, lineHeight: 1, letterSpacing: "-0.03em" }}>{num(content.hero.num)}</div>
          <div style={{ color: P.muted, fontSize: ".88em", marginTop: 6 }}>{content.hero.label}</div>
        </div>
      )}
      <div style={{ fontSize: "1.44em", fontWeight: 800, margin: "18px 0 14px", lineHeight: 1.4 }}>{info.title}</div>
      <div style={{ ...body, fontSize: "1.1em", borderInlineStart: `3px solid ${info.color}`, paddingInlineStart: 14 }}>{mark(content.spark)}</div>
      <div style={{ color: P.muted, fontSize: ".82em", marginTop: 16, display: "flex", alignItems: "center", gap: 6 }}>
        <Clock size={13} />{num(info.minutes)} دقيقة · {num(content.cards.length)} بطاقات · اختبار من {num(content.quiz.length)} أسئلة
      </div>
      <div style={{ color: P.muted, fontSize: ".75em", marginTop: 24, textAlign: "center", lineHeight: 1.8 }}>
        اسحب، أو اضغط على يسار الشاشة للمتابعة<br />أو استخدم سهمي لوحة المفاتيح، وEsc للخروج
      </div>
    </div>
  );
}

export function GoalsPage({ goals }) {
  const num = useNum();
  return (
    <div>
      <div style={{ fontSize: "1.38em", fontWeight: 800, margin: "6px 0 16px" }}>بعد هذه الوحدة ستستطيع أن</div>
      <div style={{ display: "grid", gap: 10 }}>
        {goals.map((g, i) => (
          <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", background: P.card, border: `1px solid ${P.line}`, borderRadius: 16, padding: "12px 14px" }}>
            <span style={{ width: 26, height: 26, borderRadius: 99, background: P.ink, color: P.bg, display: "grid", placeItems: "center", fontFamily: MONO, fontWeight: 800, fontSize: ".8em", flexShrink: 0 }}>{num(i + 1)}</span>
            <span style={{ lineHeight: 1.6 }}>{g}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardPage({ card, index, total, color, mark = plain }) {
  const num = useNum();
  return (
    <div>
      <Art k={card.art} color={color} />
      <div style={{ color: color || P.gold, fontSize: ".75em", fontWeight: 700, marginTop: 14 }}>البطاقة {num(index)} من {num(total)}</div>
      <div style={{ fontSize: "1.38em", fontWeight: 800, margin: "4px 0 10px", lineHeight: 1.4 }}>{card.h}</div>
      <div style={body}>{mark(card.p)}</div>
    </div>
  );
}

export function TryPage({ tryIt, color, mark = plain }) {
  return (
    <div>
      <Art k="wheel" height={110} color={color} />
      <div style={{ fontSize: "1.38em", fontWeight: 800, margin: "16px 0 10px" }}>{tryIt.title}</div>
      <div style={{ ...body, fontSize: "1.03em" }}>{mark(tryIt.text)}</div>
    </div>
  );
}

export function DeepPage({ deep, mark = plain }) {
  return (
    <div>
      <div style={{ color: P.muted, fontSize: ".75em", fontWeight: 700 }}>اختياري</div>
      <div style={{ fontSize: "1.19em", fontWeight: 800, margin: "6px 0 12px", lineHeight: 1.5 }}>{deep.title}</div>
      <div style={{ background: P.card, border: `1px solid ${P.line}`, borderRadius: 16, padding: "12px 14px" }}>
        <div style={{ color: P.gold, fontSize: ".75em", fontWeight: 800, marginBottom: 4 }}>لماذا اخترناه</div>
        <div style={{ ...body, fontSize: ".97em" }}>{mark(deep.why)}</div>
      </div>
    </div>
  );
}

export function EndPage({ summary, mark = plain, action = null }) {
  return (
    <div>
      <div style={{ fontSize: "1.38em", fontWeight: 800, margin: "6px 0 14px" }}>الخلاصة</div>
      <div style={{ display: "grid", gap: 8 }}>
        {summary.map((s, i) => <div key={i} style={{ ...body, fontSize: ".97em", lineHeight: 1.8, display: "flex", gap: 10 }}><Check size={16} color={P.gold} style={{ flexShrink: 0, marginTop: 5 }} />{mark(s)}</div>)}
      </div>
      <div style={{ color: P.muted, fontSize: ".82em", marginTop: 16, lineHeight: 1.7 }}>تُحفظ الخلاصة في مكتبتك وتدخل جدول المراجعة: غداً، ثم بعد 3 أيام، ثم أسبوع.</div>
      {action && <div style={{ marginTop: 14 }}>{action}</div>}
    </div>
  );
}
