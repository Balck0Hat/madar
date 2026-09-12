import { P, MONO, R, S } from "../../constants/theme";

// زينة النصّ من نصّه: الاقتباس «…» يُسمع، وأولاً/ثانياً/ثالثاً تصير خطوات.
// كلاهما عرض لا تحرير: الحروف كما هي، الترتيب كما هو، وما يتغيّر هو الشكل.

const QUOTE = /(«[^»]{20,140}»)/;
const ORD = /(?:^|(?<=[.:؛])\s+)(أولاً|ثانياً|ثالثاً|رابعاً|خامساً)(?=[،:\s])/g;

// الاقتباس بوزن أثقل والأقواس بلون المجال (--unit-color تضعه شاشة الوحدة)
export function emphasizeQuotes(text) {
  const parts = String(text || "").split(QUOTE);
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    QUOTE.test(part)
      ? <span key={i} className="madar-q"><span className="madar-q-mark">«</span>{part.slice(1, -1)}<span className="madar-q-mark">»</span></span>
      : <span key={i}>{part}</span>,
  );
}

// فقرة فيها تعداد صريح: ما قبل «أولاً» تمهيد، وكل ترتيب بند إلى الترتيب التالي
export function ordinalItems(text) {
  const src = String(text || "");
  const hits = [...src.matchAll(ORD)];
  if (hits.length < 2) return null;
  const starts = hits.map((m) => m.index + m[0].indexOf(m[1]));
  const lead = src.slice(0, starts[0]).trim();
  const items = starts.map((at, i) => src.slice(at, starts[i + 1] ?? src.length).trim());
  return { lead, items };
}

export default function Decorated({ text }) {
  const list = ordinalItems(text);
  if (!list) return emphasizeQuotes(text);
  return (
    <>
      {list.lead && <div>{emphasizeQuotes(list.lead)}</div>}
      <ol style={{ listStyle: "none", margin: `${list.lead ? S.x2 : 0}px 0 0`, padding: 0, display: "grid", gap: S.xl }}>
        {list.items.map((item, i) => (
          <li key={i} style={{ display: "flex", gap: S.x2, alignItems: "flex-start", animation: "madarRise .22s cubic-bezier(.2,.7,.3,1) both", animationDelay: `${i * 30}ms` }}>
            <span aria-hidden="true" style={{ width: 26, height: 26, borderRadius: R.pill, background: P.ink, color: P.bg, display: "grid", placeItems: "center", fontFamily: MONO, fontWeight: 700, fontSize: ".75em", flexShrink: 0, marginTop: "0.25em" }}>{i + 1}</span>
            <span style={{ minWidth: 0 }}>{emphasizeQuotes(item)}</span>
          </li>
        ))}
      </ol>
    </>
  );
}
