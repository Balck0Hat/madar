import { C, alpha, T, R } from "../../../shared/constants/theme";

// تقييم ذاتي للسؤال المفتوح: المتعلم يسترجع أولاً، ثم يقارن بالإجابة النموذجية ويحكم على نفسه.
// أصدق من مطابقة الكلمات المفتاحية (تُغَشّ بكتابتها وتظلم من صاغ الفكرة بعبارته)،
// وأنفع تربوياً لأن المقارنة الواعية هي ما يثبّت الفهم. لا يدخل هذا الحكم في العلامة.
export default function OpenSelfCheck({ q, mark, onMark }) {
  const opts = [
    { key: "got", label: "فهمتها", color: C.green },
    { key: "unclear", label: "لم أفهمها", color: C.gold },
  ];
  return (
    <div className="madar-in" role="status" style={{ marginTop: 16, background: alpha(C.gold, 0.1), border: `1px solid ${alpha(C.gold, 0.35)}`, borderRadius: R.xl, padding: "12px 14px" }}>
      <div style={{ fontWeight: 800, color: C.gold, marginBottom: 6 }}>الإجابة النموذجية</div>
      <div style={{ fontSize: T.md, lineHeight: 1.8 }}>{q.why || "قارن ما كتبته بفكرة الدرس الأساسية."}</div>
      {q.keywords?.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <div style={{ color: C.muted, fontSize: T.sm, fontWeight: 700, marginBottom: 6 }}>النقاط التي كنا نبحث عنها</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {q.keywords.map((k) => (
              <span key={k} style={{ background: alpha(C.gold, 0.14), border: `1px solid ${alpha(C.gold, 0.3)}`, borderRadius: R.pill, padding: "4px 10px", fontSize: T.base }}>{k}</span>
            ))}
          </div>
        </div>
      )}
      <div style={{ color: C.muted, fontSize: T.base, marginTop: 12, lineHeight: 1.7 }}>قارن إجابتك بها بصدق. حكمك هنا لا يغيّر علامتك، لكنه يقرّر ما ستراه في المراجعة.</div>
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        {opts.map(({ key, label, color }) => (
          <button
            key={key}
            type="button"
            aria-pressed={mark === key}
            onClick={() => onMark(key)}
            style={{
              flex: 1, cursor: "pointer", borderRadius: R.lg, padding: "11px 12px", fontSize: T.lg, fontWeight: 700,
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
