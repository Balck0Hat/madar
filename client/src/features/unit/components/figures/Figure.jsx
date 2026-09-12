import { P, R, S, alpha } from "../../../../shared/constants/theme";
import Timeline from "./Timeline";
import Bars from "./Bars";
import Layers from "./Layers";
import ImageFigure from "./ImageFigure";

const KIND = { timeline: Timeline, bars: Bars, layers: Layers };

// الشكل المرسوم من نصّ البطاقة يحلّ محلّ الرسمة العامة في إطارها نفسه.
// نوع غير معروف يعود null فتعرض البطاقة رسمتها كما كانت.
export default function Figure({ fig, art, color }) {
  // الصورة لها إطارها وبديلها الخاص
  if (fig?.t === "image") return <ImageFigure fig={fig} art={art} color={color} />;
  const Kind = fig && KIND[fig.t];
  if (!Kind) return null;
  return (
    <figure style={{ margin: 0, background: P.card, border: `1px solid ${alpha(color, 0.3)}`, borderRadius: R.x3, padding: `${S.lg}px ${S.x3}px` }}>
      <Kind {...fig} color={color} />
    </figure>
  );
}
