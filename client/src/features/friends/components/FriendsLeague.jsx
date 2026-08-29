import { Zap } from "lucide-react";
import { C, MONO } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/NumContext";
import { Skeleton, ErrorState } from "../../../shared/components/ui";
import { personName } from "../utils/friends.utils";

const SR = { position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" };
const TH = { textAlign: "start", padding: "0 10px", fontWeight: 700 };

// خصائص الحواف منطقية (start/end) لتنعكس صحيحاً في الاتجاه من اليمين لليسار
const cell = (me, pos) => ({
  background: me ? C.goldSoft : C.surface,
  padding: "10px 10px",
  borderBlock: `1px solid ${me ? C.gold : C.line}`,
  borderInlineStart: pos === "start" ? `1px solid ${me ? C.gold : C.line}` : "none",
  borderInlineEnd: pos === "end" ? `1px solid ${me ? C.gold : C.line}` : "none",
  borderStartStartRadius: pos === "start" ? 14 : 0,
  borderEndStartRadius: pos === "start" ? 14 : 0,
  borderStartEndRadius: pos === "end" ? 14 : 0,
  borderEndEndRadius: pos === "end" ? 14 : 0,
});

// دوري الأصدقاء: نفس ترتيب الدوري العام لكن بين من تعرفهم فقط
export default function FriendsLeague({ rows, loading, error, onRetry }) {
  const num = useNum();
  if (loading) return <Skeleton lines={4} />;
  if (error) return <ErrorState message={error.message} onRetry={onRetry} />;
  if (!rows.length) return <div style={{ color: C.muted, fontSize: 13, lineHeight: 1.7 }}>يظهر الترتيب حين يسجّل أصدقاؤك نقاطاً هذا الأسبوع.</div>;

  return (
    <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 6px", fontSize: 14 }}>
      <caption style={SR}>ترتيب الأصدقاء بنقاط هذا الأسبوع</caption>
      <thead>
        <tr style={{ color: C.muted, fontSize: 11 }}>
          <th scope="col" style={{ ...TH, width: 36 }}>#</th>
          <th scope="col" style={TH}>المتعلم</th>
          <th scope="col" style={{ ...TH, textAlign: "end" }}>نقاط الأسبوع</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, k) => (
          <tr key={r.id ?? k}>
            <td style={{ ...cell(r.me, "start"), fontFamily: MONO, fontWeight: 800, color: k < 3 ? C.gold : C.muted }}>{num(k + 1)}</td>
            <td style={{ ...cell(r.me, "mid"), fontWeight: r.me ? 800 : 600 }}>
              {personName(r)}
              {r.me && <span style={{ color: C.muted, fontWeight: 400, fontSize: 12 }}> (أنت)</span>}
            </td>
            <td style={{ ...cell(r.me, "end"), fontFamily: MONO, fontWeight: 800, color: C.gold, textAlign: "end" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Zap size={12} />{num(r.xp ?? 0)}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
