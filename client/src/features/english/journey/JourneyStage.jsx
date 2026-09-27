import { useState } from "react";
import { Check, Lock, MapPin } from "lucide-react";
import { C, R, S, T, alpha } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/PrefsContext";
import { toneColor } from "../world/worldLayout";
import { WORLD } from "./journeyStages";


// محطة واحدة فوق منصّتها: المعلم المرسوم (إن وصل ملفه)، حلقة «أنت هنا»، ضباب المستقبل، ولافتة صغيرة.
// زر شفاف يغطي المنصّة كلها للنقر ولوحة المفاتيح.
export default function JourneyStage({ stage, selected, onSelect, setRef }) {
  const num = useNum();
  const [art, setArt] = useState(true);
  const { x, y, w, n, asset, scale = 1, base = [0.5, 0.75, 0.95], label: spot = null } = stage.art;
  const fit = (0.96 / base[2]) * scale; // أعرض حلقة = عرض المنصّة تقريباً
  const tone = toneColor(stage.tone);
  const current = stage.status === "current", locked = stage.status === "locked", completed = stage.status === "completed";
  const pos = (dy = 0) => ({ position: "absolute", left: `${x * 100}%`, top: `${(y + dy) * 100}%` });
  const tag = spot ? { position: "absolute", left: `${(spot[0] / WORLD.w) * 100}%`, top: `${(spot[1] / WORLD.h) * 100}%` } : pos(0.052);
  const label = `${n} · ${stage.title}${completed ? " · مكتملة" : current ? " · أنت هنا" : locked ? " · مقفلة" : " · التالية"}`;
  return (
    <>
      {current && <div aria-hidden="true" className="journey-ring" style={{ ...pos(), width: `${w * 112}%`, aspectRatio: "2.4 / 1", transform: "translate(-50%, -50%)", borderRadius: R.pill, border: `3px solid ${C.gold}`, boxShadow: `0 0 24px ${alpha(C.gold, 0.7)}, inset 0 0 18px ${alpha(C.gold, 0.45)}`, pointerEvents: "none" }} />}
      {completed && <div aria-hidden="true" style={{ ...pos(), width: `${w * 100}%`, aspectRatio: "2.4 / 1", transform: "translate(-50%, -50%)", borderRadius: R.pill, background: `radial-gradient(ellipse, ${alpha(C.gold, 0.28)}, transparent 70%)`, pointerEvents: "none" }} />}
      {art && asset && (
        <img src={asset} alt="" aria-hidden="true" loading={stage.distance > 2 ? "lazy" : "eager"} onError={() => setArt(false)} className={locked ? undefined : "journey-bob"}
          style={{ ...pos(), width: `${w * 100 * fit}%`, transform: `translate(-${base[0] * 100}%, -${base[1] * 100}%)${current ? " scale(1.04)" : ""}`, transformOrigin: `${base[0] * 100}% ${base[1] * 100}%`, pointerEvents: "none", animationDelay: `${n * 400}ms` }} />
      )}
      <button ref={setRef} type="button" onClick={() => onSelect(stage)} aria-label={label} aria-pressed={selected}
        style={{ ...pos(), width: `${w * 100}%`, aspectRatio: "1.8 / 1", transform: "translate(-50%, -55%)", background: "transparent", border: 0, borderRadius: R.pill, cursor: "pointer", outlineOffset: S.xs }} />
      <div aria-hidden="true" style={{ ...tag, transform: "translate(-50%, 0)", display: "grid", justifyItems: "center", gap: S.xs, pointerEvents: "none" }}>
        {current && <span className="journey-bob" style={{ display: "inline-flex", alignItems: "center", gap: S.sm, background: C.gold, color: C.bg, fontWeight: 700, fontSize: T.xs, borderRadius: R.pill, padding: `${S.xs}px ${S.lg}px`, boxShadow: "var(--shadow-2)", whiteSpace: "nowrap" }}><MapPin size={12} />أنت هنا</span>}
        <span dir="ltr" style={{ display: "inline-flex", alignItems: "center", gap: S.sm, background: alpha(C.surface, current ? 0.96 : 0.9), color: C.text, border: `2px solid ${selected || current ? C.gold : alpha(tone, 0.8)}`, borderRadius: R.pill, padding: `${S.xs}px ${S.lg}px`, fontSize: T.sm, fontWeight: 700, whiteSpace: "nowrap", boxShadow: "var(--shadow-1)" }}>
          {completed ? <Check size={12} color={C.green} /> : locked ? <Lock size={11} color={C.muted} /> : null}
          <span className="madar-num">{n}</span> · {stage.en}
          {(current || completed) && <span className="madar-num" style={{ color: C.muted, fontWeight: 400 }}>{num(stage.progress.done)}/{num(stage.progress.total)}</span>}
        </span>
        <span style={{ fontSize: T.xs, color: C.text, background: alpha(C.surface, 0.75), borderRadius: R.pill, padding: `0 ${S.md}px`, whiteSpace: "nowrap" }}>{stage.title}{stage.status === "next" ? " · التالية" : ""}</span>
      </div>
    </>
  );
}
