import { useState } from "react";
import { Play, Pause, Mic, Link2, Check, X } from "lucide-react";
import { P, R, S, T, TAP, alpha, C } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/PrefsContext";
import { audioUrl, getSimilar } from "../services/quran.service";
import AyahText from "./AyahText";

const Ico = ({ Icon, label, on, color, onClick }) => (
  <button type="button" onClick={onClick} aria-label={label} aria-pressed={on} title={label} className="madar-press"
    style={{ width: TAP, height: TAP, display: "grid", placeItems: "center", background: on ? alpha(color || P.gold, 0.16) : P.card, border: `1px solid ${on ? (color || P.gold) : P.line}`, borderRadius: R.pill, color: on ? (color || P.gold) : P.muted, cursor: "pointer" }}>
    <Icon size={18} aria-hidden="true" />
  </button>
);

// آية واحدة: نصّها بوضع الإخفاء المختار، وصوت القارئ، والمتشابهات عند الطلب،
// وتسميع بالصوت، وزرّا «أتقنتها / أخطأت» لجدول المراجعة. حالة الحفظ في الهامش.
export default function AyahCard({ ayah, hide, item, onReview, onRecite, audio }) {
  const num = useNum();
  const [similar, setSimilar] = useState(null);
  const playing = audio?.current === `${ayah.s}:${ayah.a}`;
  const stage = item?.stage ?? null;
  const toggleSimilar = async () => { if (similar) { setSimilar(null); return; } setSimilar(await getSimilar(ayah.s, ayah.a).catch(() => [])); };

  return (
    <article style={{ borderBottom: `1px solid ${P.line}`, padding: `${S.x4}px 0` }}>
      <AyahText text={ayah.t} number={ayah.a} hide={hide} />
      <div style={{ display: "flex", alignItems: "center", gap: S.md, marginTop: S.x2, flexWrap: "wrap" }}>
        <Ico Icon={playing ? Pause : Play} label={playing ? "إيقاف" : "استمع"} on={playing} onClick={() => audio?.toggle(`${ayah.s}:${ayah.a}`, audioUrl(ayah.s, ayah.a))} />
        <Ico Icon={Mic} label="سمّع بالصوت" onClick={() => onRecite?.(ayah)} />
        <Ico Icon={Link2} label="المتشابهات" on={Boolean(similar)} onClick={toggleSimilar} />
        <span style={{ flex: 1 }} />
        {onReview && (
          <>
            <Ico Icon={Check} label="أتقنتها" color={C.green} onClick={() => onReview(ayah, true)} />
            <Ico Icon={X} label="أخطأت فيها" color={C.red} onClick={() => onReview(ayah, false)} />
          </>
        )}
      </div>
      <div style={{ color: P.muted, fontSize: T.xs, marginTop: S.md }}>
        صفحة {num(ayah.p)} · جزء {num(ayah.j)}
        {stage !== null && <> · {stage >= 2 ? "متقَنة" : "قيد الحفظ"} · مرحلة {num(stage + 1)} من 6{item?.lapses ? ` · زلّات ${num(item.lapses)}` : ""}</>}
      </div>
      {similar && (
        <div className="madar-in" style={{ marginTop: S.x2, background: P.card, border: `1px solid ${P.line}`, borderRadius: R.x2, padding: S.x3 }}>
          <div style={{ fontWeight: 700, fontSize: T.sm, marginBottom: S.md }}>{similar.length ? "آيات تشبهها" : "لا متشابهات محسوبة لهذه الآية"}</div>
          {similar.map((x) => (
            <div key={`${x.s}:${x.a}`} style={{ marginBottom: S.lg }}>
              <div style={{ color: P.muted, fontSize: T.xs }}>{num(x.s)}:{num(x.a)}</div>
              <AyahText text={x.t} size="1.2em" />
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
