import { useState } from "react";
import { C, P, R, S, alpha } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/PrefsContext";

// نصّ الآية بالرسم العثماني كلمةً كلمة. ثلاثة استعمالات: عرض عادي، وإخفاء
// للحفظ (تُخفى كلمات بنسبة، وتُكشف بالضغط)، وتسميع مباشر (كل كلمة بلونها:
// أخضر سُمعت، أحمر أُخطئت، والقادمة عليها مؤشر).
const SURFACE = { paper: { ink: P.ink, muted: P.muted, line: P.line, card: P.card }, app: { ink: C.text, muted: C.muted, line: C.line, card: C.surface2 } };

export const splitWords = (t) => String(t || "").trim().split(/\s+/);

// أي الكلمات تُخفى: كل ثالثة، ثم كل ثانية، ثم كلها إلا الأولى
export function hiddenSet(count, hide) {
  const out = new Set();
  if (hide === "third") for (let i = 2; i < count; i += 3) out.add(i);
  if (hide === "half") for (let i = 1; i < count; i += 2) out.add(i);
  if (hide === "all") for (let i = 1; i < count; i++) out.add(i);
  return out;
}

export default function AyahText({ text, number, hide = "none", status = [], cursor = -1, live = false, surface = "paper", size = "1.55em" }) {
  const num = useNum();
  const K = SURFACE[surface] || SURFACE.paper;
  const words = splitWords(text);
  const hidden = hiddenSet(words.length, hide);
  const [revealed, setRevealed] = useState(() => new Set());
  const reveal = (i) => setRevealed((r) => new Set(r).add(i));

  const color = (i) => {
    if (live) return status[i] === "ok" ? C.green : status[i] === "miss" ? C.red : K.ink;
    return K.ink;
  };
  return (
    <p className="madar-quran" dir="rtl" style={{ margin: 0, fontSize: size, lineHeight: 2.1, color: K.ink, textAlign: "justify" }}>
      {words.map((w, i) => {
        const masked = hidden.has(i) && !revealed.has(i);
        const isCursor = live && i === cursor && !status[i];
        return (
          <span key={i}>
            {masked ? (
              <button type="button" onClick={() => reveal(i)} aria-label="اكشف الكلمة"
                style={{ display: "inline-block", minWidth: `${Math.max(2, w.length * 0.55)}em`, height: ".85em", verticalAlign: "-.1em", background: alpha(K.muted, 0.18), border: `1px dashed ${K.line}`, borderRadius: R.sm, cursor: "pointer", padding: 0, margin: "0 .05em" }} />
            ) : (
              <span style={{ color: color(i), transition: "color .2s", background: isCursor ? alpha(C.gold, 0.22) : "transparent", borderRadius: R.xs, padding: isCursor ? "0 .08em" : 0 }}>{w}</span>
            )}
            {" "}
          </span>
        );
      })}
      {number !== undefined && <span aria-label={`آية ${number}`} style={{ color: C.gold, fontSize: ".6em", verticalAlign: "middle", margin: `0 ${S.xs}px` }}>﴿{num(number)}﴾</span>}
    </p>
  );
}
