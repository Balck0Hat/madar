import { P, R, S } from "../../../shared/constants/theme";
import Art from "../../../shared/components/art/Art";
import Figure from "./figures/Figure";
import { body, plain } from "./UnitPages";
import CardHeading from "./CardHeading";
import StatTiles from "./StatTiles";
import CheckIn from "../../../shared/components/ui/CheckIn";
import { statTiles } from "../utils/cardShape";

// التعداد المحشور في النثر يُقرأ سرداً لا قائمة: العين لا تعدّ ما لا يُرى
// مفصولاً. البنود هنا صفوف، كل بند سطره، بعلامة مدار صغيرة تحمل لون المجال.
function Points({ items, color }) {
  if (!items?.length) return null;
  return (
    <ul style={{ ...body, listStyle: "none", margin: `${S.x2}px 0 0`, padding: 0, display: "grid", gap: S.xl }}>
      {items.map((t, i) => (
        <li key={i} style={{ animation: "madarRise .22s cubic-bezier(.2,.7,.3,1) both", animationDelay: `${i * 30}ms`, display: "flex", gap: S.x2, alignItems: "flex-start" }}>
          <span aria-hidden="true" style={{ flexShrink: 0, width: 7, height: 7, borderRadius: R.pill, background: color || P.gold, marginTop: "0.62em" }} />
          <span style={{ minWidth: 0 }}>{t}</span>
        </li>
      ))}
    </ul>
  );
}

// وصف الصورة كتبه المؤلّف لكل بطاقة (2620 من 2985) ولم يكن يُعرض لأحد.
// يظهر الآن تعليقاً تحت الرسمة: ما قصده عن الصورة بدل رسمة عامة صامتة.
export default function CardPage({ card, index, color, mark = plain, check = null }) {
  const tiles = statTiles(card);
  return (
    <div>
      {card.fig ? <Figure fig={card.fig} art={card.art} color={color} /> : <Art k={card.art} color={color} />}
      {card.img && <div style={{ color: P.muted, fontSize: ".8em", textAlign: "center", marginTop: S.md, lineHeight: 1.5 }}>{card.img}</div>}
      <CardHeading h={card.h} index={index} color={color} />
      <StatTiles tiles={tiles} color={color} />
      <div style={body}>{mark(card.p)}</div>
      <Points items={card.points} color={color} />
      {card.after && <div style={{ ...body, marginTop: S.x2 }}>{mark(card.after)}</div>}
      <CheckIn question={check} color={color} />
    </div>
  );
}
