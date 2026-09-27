import { useState } from "react";
import { Check, Lock, MapPin } from "lucide-react";
import { C, R, S, T, alpha } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/PrefsContext";
import { toneColor } from "../world/worldLayout";

const HAZE = "#eef2ff"; // ضباب المسافة فوق الصورة (ثابت لأن الصورة ثابتة في الوضعين)

// محطة واحدة فوق منصّتها: المعلم المرسوم (إن وصل ملفه)، حلقة «أنت هنا»، ضباب المستقبل، ولافتة صغيرة.
// زر شفاف يغطي المنصّة كلها للنقر ولوحة المفاتيح.
export default function JourneyStage({ stage, selected, onSelect, setRef }) {
  const num = useNum();
  const [art, setArt] = useState(true);
  const { x, y, w, n, asset, scale = 1, fit = 1, anchor = 0.8 } = stage.art;
  const tone = toneColor(stage.tone);
  const current = stage.status === "current", locked = stage.status === "locked", completed = stage.status === "completed";
  const fade = locked ? Math.min(0.35, 0.08 + stage.distance * 0.06) : 0;
  const pos = (dy = 0) => ({ position: "absolute", left: `${x * 100}%`, top: `${(y + dy) * 100}%` });
  const label = `${n} · ${stage.title}${completed ? " · مكتملة" : current ? " · أنت هنا" : locked ? " · مقفلة" : " · التالية"}`;
  return (
    <>
      {current && <div aria-hidden="true" className="journey-ring" style={{ ...pos(), width: `${w * 112}%`, aspectRatio: "2.4 / 1", transform: "translate(-50%, -50%)", borderRadius: R.pill, border: `3px solid ${C.gold}`, boxShadow: `0 0 24px ${alpha(C.gold, 0.7)}, inset 0 0 18px ${alpha(C.gold, 0.45)}`, pointerEvents: "none" }} />}
      {completed && <div aria-hidden="true" style={{ ...pos(), width: `${w * 100}%`, aspectRatio: "2.4 / 1", transform: "translate(-50%, -50%)", borderRadius: R.pill, background: `radial-gradient(ellipse, ${alpha(C.gold, 0.28)}, transparent 70%)`, pointerEvents: "none" }} />}
      {art && asset && (
        <img src={asset} alt="" aria-hidden="true" loading={stage.distance > 2 ? "lazy" : "eager"} onError={() => setArt(false)} className={locked ? undefined : "journey-bob"}
          style={{ ...pos(), width: `${w * 100 * fit * scale}%`, transform: `translate(-50%, -${anchor * 100}%)${current ? " scale(1.06)" : ""}`, transformOrigin: `50% ${anchor * 100}%`, pointerEvents: "none", filter: locked ? `saturate(${1 - fade}) brightness(${1 - fade / 3})` : undefined, animationDelay: `${n * 400}ms` }} />
      )}
      {fade > 0 && <div aria-hidden="true" style={{ ...pos(-0.02), width: `${w * 130}%`, aspectRatio: "1.3 / 1", transform: "translate(-50%, -60%)", borderRadius: R.pill, background: `radial-gradient(ellipse, ${alpha(HAZE, fade + 0.15)}, transparent 70%)`, pointerEvents: "none" }} />}
      <button ref={setRef} type="button" onClick={() => onSelect(stage)} aria-label={label} aria-pressed={selected}
        style={{ ...pos(), width: `${w * 100}%`, aspectRatio: "1.8 / 1", transform: "translate(-50%, -55%)", background: "transparent", border: 0, borderRadius: R.pill, cursor: "pointer", outlineOffset: S.xs }} />
      <div aria-hidden="true" style={{ ...pos(0.052), transform: "translate(-50%, 0)", display: "grid", justifyItems: "center", gap: S.xs, pointerEvents: "none" }}>
        {current && <span className="journey-bob" style={{ display: "inline-flex", alignItems: "center", gap: S.sm, background: C.gold, color: C.bg, fontWeight: 700, fontSize: T.xs, borderRadius: R.pill, padding: `${S.xs}px ${S.lg}px`, boxShadow: "var(--shadow-2)", whiteSpace: "nowrap" }}><MapPin size={12} />أنت هنا</span>}
        <span style={{ display: "inline-flex", alignItems: "center", gap: S.sm, background: alpha(C.surface, current ? 0.96 : 0.88), color: C.text, border: `2px solid ${selected || current ? C.gold : alpha(tone, 0.8)}`, borderRadius: R.pill, padding: `${S.xs}px ${S.lg}px`, fontSize: T.xs, fontWeight: 700, whiteSpace: "nowrap", boxShadow: "var(--shadow-1)", opacity: locked ? 0.9 : 1 }}>
          {completed ? <Check size={12} color={C.green} /> : locked ? <Lock size={11} color={C.muted} /> : null}
          <span className="madar-num">{num(n)}</span> · {stage.title}
          {(current || completed) && <span className="madar-num" style={{ color: C.muted, fontWeight: 400 }}>{num(stage.progress.done)}/{num(stage.progress.total)}</span>}
        </span>
        <span dir="ltr" style={{ fontSize: T.xs, color: C.text, background: alpha(C.surface, 0.7), borderRadius: R.pill, padding: `0 ${S.md}px`, whiteSpace: "nowrap" }}>{stage.en}{stage.status === "next" ? " · next" : ""}</span>
      </div>
    </>
  );
}
