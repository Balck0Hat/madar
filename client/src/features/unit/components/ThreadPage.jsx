import { useState } from "react";
import { Link2 } from "lucide-react";
import { C, P } from "../../../shared/constants/theme";
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
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: P.gold, fontWeight: 800, fontSize: 13 }}><Link2 size={15} />خيط إلى {to.domainName}: {to.title}</div>
      <div style={{ fontSize: 16.5, lineHeight: 1.9, margin: "12px 0" }}>{thread.text}</div>
      <div style={{ fontWeight: 800, marginBottom: 10 }}>{thread.q}</div>
      <div style={{ display: "grid", gap: 8 }}>
        {thread.opts.map((o, i) => {
          const right = picked && i === thread.a, wrong = picked && i === sel && i !== thread.a;
          const bg = right ? C.green + "33" : wrong ? C.red + "33" : P.card;
          const bd = right ? C.green : wrong ? C.red : P.line;
          return (
            <button key={i} type="button" className={wrong ? "madar-shake" : ""} onClick={() => pick(i)} style={{ background: bg, border: `1px solid ${bd}`, borderRadius: 14, padding: "12px 14px", color: P.ink, textAlign: "start", cursor: "pointer", fontSize: 15 }}>
              {o}
            </button>
          );
        })}
      </div>
      {picked && (
        <div className="madar-in" style={{ marginTop: 12, color: P.muted, fontSize: 14, lineHeight: 1.7 }}>
          {thread.why} <span style={{ color: P.gold, fontWeight: 700 }}>يُضاء الخيط على عجلتك عند إكمال الوحدتين.</span>
        </div>
      )}
    </div>
  );
}
