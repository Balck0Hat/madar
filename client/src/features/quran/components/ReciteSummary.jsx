import { C, P, R, S, T } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/PrefsContext";
import { Btn } from "../../../shared/components/ui";

// نهاية التسميع: كل آية بنتيجتها. النظيفة تُسجَّل صحيحة تلقائياً، وذات الأخطاء
// يقرّر القارئ فيها دفعة واحدة (الجهاز يخطئ في السمع أحياناً، والقارئ أعلم).
export function perAyah(ayahs, status) {
  return ayahs.map((x) => {
    const slice = status.slice(x.from, x.to);
    return { a: x.a, ok: slice.filter((s) => s === "ok").length, miss: slice.filter((s) => s === "miss").length, total: x.to - x.from, heard: slice.some((s) => s === "ok") };
  });
}

export default function ReciteSummary({ rows, saved, onDecide }) {
  const num = useNum();
  const flawed = rows.filter((r) => r.heard && r.miss > 0);
  const partial = rows.filter((r) => r.heard && r.miss === 0 && r.ok < r.total);
  const clean = rows.filter((r) => r.heard && r.ok === r.total);
  const unheard = rows.filter((r) => !r.heard);
  return (
    <div style={{ marginTop: S.x4, display: "grid", gap: S.x2 }}>
      <div style={{ fontWeight: 700 }}>النتيجة</div>
      <div style={{ color: P.muted, fontSize: T.sm, lineHeight: 1.7 }}>
        {num(clean.length)} آية كاملة{flawed.length ? ` · ${num(flawed.length)} فيها كلمات غير مطابقة` : ""}{partial.length ? ` · ${num(partial.length)} لم تكتمل` : ""}{unheard.length ? ` · ${num(unheard.length)} لم تُقرأ` : ""}
      </div>
      {flawed.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: S.md }}>
          {flawed.map((r) => <span key={r.a} style={{ fontSize: T.xs, color: C.red, border: `1px solid ${C.red}`, borderRadius: R.pill, padding: `${S.xs}px ${S.x2}px` }}>آية {num(r.a)}: {num(r.miss)} من {num(r.total)}</span>)}
        </div>
      )}
      {saved ? (
        <div style={{ color: C.green, fontWeight: 700 }}>سُجّلت النتائج في جدول المراجعة</div>
      ) : (
        <div style={{ display: "grid", gap: S.lg }}>
          {clean.length > 0 && <div style={{ color: P.muted, fontSize: T.xs }}>الآيات الكاملة تُسجَّل صحيحة. وما فيه أخطاء:</div>}
          <div style={{ display: "flex", gap: S.lg }}>
            <Btn primary color={C.green} style={{ color: P.bg }} onClick={() => onDecide(true)}>كانت صحيحة كلها</Btn>
            {(flawed.length > 0 || partial.length > 0) && <Btn paper onClick={() => onDecide(false)}>سجّل الأخطاء كأخطاء</Btn>}
          </div>
        </div>
      )}
    </div>
  );
}
