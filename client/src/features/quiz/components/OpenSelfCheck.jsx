import { C, alpha, T, R, S } from "../../../shared/constants/theme";

// تقييم ذاتي للسؤال المفتوح: المتعلم يسترجع أولاً، ثم يقارن بالإجابة النموذجية ويحكم على نفسه.
// أصدق من مطابقة الكلمات المفتاحية (تُغَشّ بكتابتها وتظلم من صاغ الفكرة بعبارته)،
// وأنفع تربوياً لأن المقارنة الواعية هي ما يثبّت الفهم. لا يدخل هذا الحكم في العلامة.
export default function OpenSelfCheck({ q, mark, onMark }) {
  const opts = [
    { key: "got", label: "فهمتها", color: C.green },
    { key: "unclear", label: "لم أفهمها", color: C.gold },
  ];
  return (
    <div className="madar-in" role="status" style={{ marginTop: S.x4, background: alpha(C.gold, 0.1), border: `1px solid ${alpha(C.gold, 0.35)}`, borderRadius: R.xl, padding: `${S.x2}px ${S.x3}px` }}>
      <div style={{ fontWeight: 700, color: C.gold, marginBottom: S.md }}>الإجابة النموذجية</div>
      <div style={{ fontSize: T.md, lineHeight: 1.8 }}>{q.why || "قارن ما كتبته بفكرة الدرس الأساسية."}</div>
      {q.keywords?.length > 0 && (
        <div style={{ marginTop: S.xl }}>
          <div style={{ color: C.muted, fontSize: T.sm, fontWeight: 600, marginBottom: S.md }}>النقاط التي كنا نبحث عنها</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: S.md }}>
            {q.keywords.map((k) => (
              <span key={k} style={{ background: alpha(C.gold, 0.14), border: `1px solid ${alpha(C.gold, 0.3)}`, borderRadius: R.pill, padding: `${S.sm}px ${S.xl}px`, fontSize: T.base }}>{k}</span>
            ))}
          </div>
        </div>
      )}
      <div style={{ color: C.muted, fontSize: T.base, marginTop: S.x2, lineHeight: 1.7 }}>قارن إجابتك بها بصدق. حكمك هنا لا يغيّر علامتك، لكنه يقرّر ما ستراه في المراجعة.</div>
      <div style={{ display: "flex", gap: S.lg, marginTop: S.xl }}>
        {opts.map(({ key, label, color }) => (
          <button
            key={key}
            type="button"
            aria-pressed={mark === key}
            onClick={() => onMark(key)}
            style={{
              flex: 1, cursor: "pointer", borderRadius: R.lg, padding: `${S.xl}px ${S.x2}px`, fontSize: T.lg, fontWeight: 600,
              background: mark === key ? alpha(color, 0.2) : C.surface,
              border: `1px solid ${mark === key ? color : C.line}`,
              color: mark === key ? color : C.text,
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
