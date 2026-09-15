import { useEffect, useRef, useState } from "react";
import { P, MONO, READ, R, S } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/PrefsContext";
import { Btn } from "../../../shared/components/ui";
import Prose from "../../../shared/components/ui/Prose";
import { usePageKeys } from "../../../shared/hooks/usePageKeys";
import { getPage, setPage, markRead } from "../utils/figureStore";
import FigureEnd from "./FigureEnd";

const SWIPE = 55;
const body = { fontFamily: READ, fontSize: "1.07em", lineHeight: 1.95 };

// القصة الكاملة قسماً في كل شاشة، كبطاقات الدرس: سحب أو نقر على الجانبين أو
// سهما لوحة المفاتيح، ومؤشر «3 من 8»، وآخر قسم يُحفظ على الجهاز فيُستأنف.
// بلوغ آخر قسم يعلّم الملف مقروءاً في القائمة.
export default function FigureStory({ figure, list, color, onOpen, onExit }) {
  const num = useNum();
  const sections = figure.story || [];
  const [page, go] = useState(() => Math.min(getPage(figure.figureId), Math.max(0, sections.length - 1)));
  const touch = useRef(null);
  const dir = useRef(1);
  const last = page === sections.length - 1;

  useEffect(() => { setPage(figure.figureId, page); if (page === sections.length - 1) markRead(figure.figureId); }, [figure.figureId, page, sections.length]);

  const next = () => { if (!last) { dir.current = 1; go(page + 1); } };
  const prev = () => { if (page > 0) { dir.current = -1; go(page - 1); } };
  usePageKeys({ next, prev, exit: onExit });

  const tap = (e) => {
    if (e.target.closest && e.target.closest("button,input,textarea,a")) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    if (x < 0.3) next(); else if (x > 0.7) prev();
  };
  const onTouchStart = (e) => { touch.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touch.current == null) return;
    const dx = e.changedTouches[0].clientX - touch.current;
    touch.current = null;
    if (dx > SWIPE) next(); else if (dx < -SWIPE) prev();
  };

  const s = sections[page];
  if (!s) return null;
  return (
    <div>
      <div role="progressbar" aria-valuemin={1} aria-valuemax={sections.length} aria-valuenow={page + 1} aria-label="موضع القراءة"
        style={{ display: "flex", gap: S.sm, marginBottom: S.x3 }}>
        {sections.map((_, i) => (
          <span key={i} style={{ flex: 1, height: 3, borderRadius: R.pill, background: i <= page ? color : P.line, transition: "background .2s" }} />
        ))}
      </div>
      <div key={page} className={dir.current > 0 ? "madar-turn-next" : "madar-turn-prev"} onClick={tap} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
        role="region" aria-live="polite" aria-label={`قسم ${page + 1} من ${sections.length}`}>
        <div style={{ fontFamily: MONO, color, fontSize: ".75em", fontWeight: 600 }}>{num(page + 1)} من {num(sections.length)}</div>
        <h2 style={{ fontSize: "1.3em", fontWeight: 700, margin: `${S.sm}px 0 ${S.xl}px`, lineHeight: 1.4 }}>{s.h}</h2>
        <div style={body}><Prose text={s.p} mono /></div>
        {last && <FigureEnd figure={figure} list={list} color={color} onOpen={onOpen} />}
      </div>
      <div style={{ display: "flex", gap: S.lg, alignItems: "center", marginTop: S.x5 }}>
        <Btn ghost paper full={false} small onClick={page > 0 ? prev : onExit}>{page > 0 ? "السابق" : "الملخص"}</Btn>
        {!last && <Btn primary color={color} style={{ color: P.bg }} onClick={next}>التالي</Btn>}
        {last && <Btn paper onClick={() => { dir.current = -1; go(0); }}>من البداية</Btn>}
      </div>
    </div>
  );
}
