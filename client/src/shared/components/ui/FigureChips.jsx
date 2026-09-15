import { useMemo } from "react";
import { useInRouterContext, useNavigate } from "react-router-dom";
import { UserRound } from "lucide-react";
import { P, R, S, TAP, alpha } from "../../constants/theme";
import { useFiguresIndex } from "../../hooks/useFiguresIndex";
import { mentionedIn } from "../../utils/mentions";
import { paths } from "../../../app/routes";

const MAX = 3;

// «شخصية في هذه البطاقة»: بطاقة درس تذكر حمورابي تقود إلى ملفه. المطابقة
// بالأسماء لا بقائمة يدوية، فكل شخصية تُضاف تربط نفسها بدروسها وحدها.
function Chips({ text, color }) {
  const nav = useNavigate();
  const list = useFiguresIndex();
  const hits = useMemo(() => mentionedIn(text, list).slice(0, MAX).map((x) => x.figure), [text, list]);
  if (!hits.length) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: S.md, marginTop: S.x3 }}>
      {hits.map((f) => (
        <button key={f.figureId} type="button" onClick={() => nav(paths.figure(f.figureId))} className="madar-press"
          style={{ display: "inline-flex", alignItems: "center", gap: S.md, minHeight: TAP - S.xl, fontFamily: "inherit", fontSize: ".82em", fontWeight: 600, cursor: "pointer",
            color: color || P.gold, background: alpha(color || P.gold, 0.1), border: `1px solid ${alpha(color || P.gold, 0.35)}`, borderRadius: R.pill, padding: `${S.sm}px ${S.x2}px` }}>
          <UserRound size={14} aria-hidden="true" />{f.name}
        </button>
      ))}
    </div>
  );
}

// خارج الموجّه (الاختبارات، الطباعة) لا روابط
export default function FigureChips(props) {
  return useInRouterContext() ? <Chips {...props} /> : null;
}
