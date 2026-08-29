import { useState, useRef } from "react";
import { C, P, MONO } from "../../../shared/constants/theme";
import { CONTENT } from "../../../shared/data/content";
import { unitInfo } from "../../../shared/utils/units";
import { useNum } from "../../../shared/context/NumContext";
import { Btn, TopBar } from "../../../shared/components/ui";
import UnitPlaceholder from "./UnitPlaceholder";
import ThreadPage from "./ThreadPage";
import { SparkPage, GoalsPage, CardPage, TryPage, DeepPage, EndPage } from "./UnitPages";

const LABEL = { spark: "الشرارة", goals: "الأهداف", card: "الدرس", try: "جرّب", deep: "التعمق", thread: "الخيط", end: "الخلاصة" };

const buildPages = (content) => [
  { t: "spark" }, { t: "goals" },
  ...content.cards.map((c) => ({ t: "card", c })),
  { t: "try" }, { t: "deep" }, { t: "thread" }, { t: "end" },
];

// الدرس: بطاقات كقصص على ورق، تنقّل بالسحب أو النقر على جانبي الشاشة
export default function UnitScreen({ unitId, onBack, onStartQuiz, onSimulate }) {
  const num = useNum();
  const info = unitInfo(unitId);
  const content = CONTENT[unitId];
  const [page, setPage] = useState(0);
  const touch = useRef(null);
  if (!content) return <UnitPlaceholder info={info} onBack={onBack} onSimulate={onSimulate} />;

  const pages = buildPages(content);
  const p = pages[page];
  const last = page === pages.length - 1;
  const next = () => { if (!last) setPage(page + 1); };
  const prev = () => { if (page > 0) setPage(page - 1); };
  const tap = (e) => {
    if (e.target.closest && e.target.closest("button,input,textarea,a")) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    if (x < 0.38) next(); else if (x > 0.62) prev();
  };
  const onTouchStart = (e) => { touch.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touch.current == null) return;
    const dx = e.changedTouches[0].clientX - touch.current;
    touch.current = null;
    if (dx > 55) next(); else if (dx < -55) prev();
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: P.bg, color: P.ink, transition: "background .4s" }}>
      <div style={{ padding: "12px 12px 0", display: "flex", gap: 3 }}>
        {pages.map((_, i) => <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i <= page ? C.gold : P.line, transition: "background .3s" }} />)}
      </div>
      <TopBar paper onBack={onBack}
        title={<span style={{ fontSize: 15 }}>{info.domainName} <span style={{ color: P.muted, fontWeight: 400 }}>· {LABEL[p.t]}</span></span>}
        right={<span style={{ fontFamily: MONO, color: P.muted, fontSize: 12 }}>{num(page + 1)}/{num(pages.length)}</span>} />
      <div key={page} className="madar-slide" onClick={tap} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} style={{ flex: 1, padding: "8px 20px 16px", userSelect: "none", WebkitUserSelect: "none" }}>
        {p.t === "spark" && <SparkPage info={info} content={content} />}
        {p.t === "goals" && <GoalsPage goals={content.goals} />}
        {p.t === "card" && <CardPage card={p.c} index={page - 1} total={content.cards.length} />}
        {p.t === "try" && <TryPage tryIt={content.tryIt} />}
        {p.t === "deep" && <DeepPage deep={content.deep} />}
        {p.t === "thread" && content.thread && <ThreadPage thread={content.thread} />}
        {p.t === "end" && <EndPage summary={content.summary} />}
      </div>
      <div style={{ padding: "8px 16px 22px", display: "flex", gap: 8, alignItems: "center" }}>
        <Btn ghost paper full={false} small onClick={() => (page > 0 ? prev() : onBack())}>{page > 0 ? "السابق" : "خروج"}</Btn>
        <Btn primary color={last ? C.gold : P.ink} style={last ? {} : { color: P.bg }} onClick={() => (last ? onStartQuiz() : next())}>
          {last ? `ابدأ الاختبار (${num(content.quiz.length)} أسئلة)` : "التالي"}
        </Btn>
      </div>
    </div>
  );
}
