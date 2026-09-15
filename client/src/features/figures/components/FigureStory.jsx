import { useEffect, useRef, useState } from "react";
import { P, R, S } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/PrefsContext";
import { Btn } from "../../../shared/components/ui";
import { usePageKeys } from "../../../shared/hooks/usePageKeys";
import FigureSectionText from "./FigureSectionText";
import FigureEnd from "./FigureEnd";

const SWIPE = 55;

// القصة الكاملة قسماً في كل شاشة، كبطاقات الدرس: سحب أو نقر على الجانبين أو
// سهما لوحة المفاتيح، وشريط تقدّم، وعنوان القسم بالشكل الذي تحمله بطاقات
// الدروس. الموضع يُحفظ على الحساب، وبلوغ آخر قسم يعلّم الملف مقروءاً.
export default function FigureStory({ figure, list, color, progress, onOpen, onOpenUnit, onExit, noteId = null }) {
  const num = useNum();
  const sections = figure.story || [];
  const lastIdx = Math.max(0, sections.length - 1);
  const [page, go] = useState(() => Math.min(progress?.page?.[figure.figureId] || 0, lastIdx));
  const touched = useRef(false);
  const touch = useRef(null);
  const dir = useRef(1);
  const last = page === lastIdx;

  // موضع الحساب يصل بعد لحظة: نقفز إليه ما لم يكن القارئ قد قلّب بنفسه
  useEffect(() => {
    const saved = progress?.page?.[figure.figureId];
    if (progress?.loaded && !touched.current && Number.isInteger(saved) && saved !== page) go(Math.min(saved, lastIdx));
  }, [progress?.loaded]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (touched.current) progress?.setPage?.(figure.figureId, page);
    if (page === lastIdx) progress?.markRead?.(figure.figureId);
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  const jump = (n, d) => { touched.current = true; dir.current = d; go(n); };
  const next = () => { if (!last) jump(page + 1, 1); };
  const prev = () => { if (page > 0) jump(page - 1, -1); };
  usePageKeys({ next, prev, exit: onExit });

  const tap = (e) => {
    if (e.target.closest && e.target.closest("button,input,textarea,a,mark")) return;
    if (window.getSelection?.()?.toString()) return; // تحديد للتظليل، لا نقرة للتقليب
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    if (x < 0.22) next(); else if (x > 0.78) prev();
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
      <div role="progressbar" aria-valuemin={1} aria-valuemax={sections.length} aria-valuenow={page + 1} aria-label="موضع القراءة" style={{ display: "flex", gap: S.sm, marginBottom: S.x4 }}>
        {sections.map((_, i) => <span key={i} style={{ flex: 1, height: 3, borderRadius: R.pill, background: i <= page ? color : P.line, transition: "background .2s" }} />)}
      </div>
      <div key={page} className={dir.current > 0 ? "madar-turn-next" : "madar-turn-prev"} onClick={tap} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
        role="region" aria-live="polite" aria-label={`قسم ${page + 1} من ${sections.length}`}>
        <div style={{ color, fontSize: ".75em", fontWeight: 600 }}>القسم {num(page + 1)} من {num(sections.length)}</div>
        <h2 style={{ fontSize: "1.42em", fontWeight: 700, margin: `${S.sm}px 0 ${S.x2}px`, lineHeight: 1.4 }}>{s.h}</h2>
        <FigureSectionText noteId={noteId} page={page} text={s.p} />
        {last && <FigureEnd figure={figure} list={list} color={color} onOpen={onOpen} onOpenUnit={onOpenUnit} />}
      </div>
      <div style={{ display: "flex", gap: S.lg, alignItems: "center", marginTop: S.x5 }}>
        <Btn ghost paper full={false} small onClick={page > 0 ? prev : onExit}>{page > 0 ? "السابق" : "الملخص"}</Btn>
        {!last && <Btn primary color={color} style={{ color: P.bg }} onClick={next}>التالي</Btn>}
        {last && <Btn paper onClick={() => jump(0, -1)}>من البداية</Btn>}
      </div>
    </div>
  );
}
