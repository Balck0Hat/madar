import { useState } from "react";
import { Link2 } from "lucide-react";
import { C, P, READ, alpha, R, S } from "../../../shared/constants/theme";
import { unitInfo } from "../../../shared/utils/units";
import { vibrate } from "../../../shared/utils/text";

// صفحة الخيط: سؤال يربط الوحدة بمجال آخر
export default function ThreadPage({ thread }) {
  const [sel, setSel] = useState(null);
  const to = unitInfo(thread.to);
  const picked = sel !== null;
  const pick = (i) => {
    if (picked) return;
    setSel(i);
    vibrate(i === thread.a ? [20] : [40, 30, 40]);
  };
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: S.lg, color: P.gold, fontWeight: 700, fontSize: ".82em" }}><Link2 size={15} />خيط إلى {to.domainName}: {to.title}</div>
      {/* المتن بخط النسخ كبقية الدرس، والخيارات بخط الواجهة لأنها أزرار */}
      <div style={{ fontFamily: READ, fontSize: "1.03em", lineHeight: 1.95, margin: `${S.x2}px 0` }}>{thread.text}</div>
      <div style={{ fontWeight: 700, marginBottom: S.xl }}>{thread.q}</div>
      <div style={{ display: "grid", gap: S.lg }}>
        {thread.opts.map((o, i) => {
          const right = picked && i === thread.a, wrong = picked && i === sel && i !== thread.a;
          const bg = right ? alpha(C.green, 0.2) : wrong ? alpha(C.red, 0.2) : P.card;
          const bd = right ? C.green : wrong ? C.red : P.line;
          return (
            <button key={i} type="button" className={wrong ? "madar-shake" : ""} onClick={() => pick(i)} style={{ background: bg, border: `1px solid ${bd}`, borderRadius: R.xl, padding: `${S.x2}px ${S.x3}px`, color: P.ink, textAlign: "start", cursor: "pointer", fontSize: ".94em", minHeight: 44 }}>
              {o}
            </button>
          );
        })}
      </div>
      {picked && (
        <div className="madar-in" role="status" style={{ marginTop: S.x2, color: P.muted, fontSize: ".88em", lineHeight: 1.7 }}>
          {thread.why} <span style={{ color: P.gold, fontWeight: 600 }}>يُضاء الخيط على عجلتك عند إكمال الوحدتين.</span>
        </div>
      )}
    </div>
  );
}
