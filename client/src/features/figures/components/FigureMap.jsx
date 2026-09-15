import { P, R, S, alpha } from "../../../shared/constants/theme";

// خريطة العالم القديم: «ملطية» و«كروتون» و«أنشان» لا تعني شيئاً لأكثر القراء
// حتى يروا أين هي. الخريطة صورة ثابتة مقصوصة من خريطة مواقع بإسقاط مستطيل
// بسيط، فالنقطة تُحسب خطياً من خط الطول والعرض. وسائر شخصيات القائمة نقاط
// أصغر تُفتح بالنقر: الخريطة فهرس لا زينة.
const BOX = { lonMin: -25, lonMax: 145, latMin: -12, latMax: 62 }; // ما تُغطّيه صورة الخريطة
const SRC = "/maps/old-world.png";

export const inBox = (geo) => Boolean(geo) && geo.lon >= BOX.lonMin && geo.lon <= BOX.lonMax && geo.lat >= BOX.latMin && geo.lat <= BOX.latMax;
const pos = (geo) => ({ left: `${((geo.lon - BOX.lonMin) / (BOX.lonMax - BOX.lonMin)) * 100}%`, top: `${((BOX.latMax - geo.lat) / (BOX.latMax - BOX.latMin)) * 100}%` });

export default function FigureMap({ figure, list = [], color, onOpen }) {
  const geo = figure?.geo;
  if (!inBox(geo)) return null;
  const others = list.filter((o) => o.figureId !== figure.figureId && inBox(o.geo));
  return (
    <div style={{ marginTop: S.x4 }}>
      <div role="group" aria-label={geo.place ? `موقع ${geo.place} على الخريطة` : "الموقع على الخريطة"}
        style={{ position: "relative", background: alpha(color, 0.06), border: `1px solid ${P.line}`, borderRadius: R.x2, overflow: "hidden", aspectRatio: "1000 / 435" }}>
        <img src={SRC} alt="" width={1000} height={435} loading="lazy" decoding="async" style={{ display: "block", width: "100%", height: "100%", opacity: 0.8 }} />
        {others.map((o) => (
          <button key={o.figureId} type="button" title={`${o.name}${o.geo.place ? ` · ${o.geo.place}` : ""}`} aria-label={`افتح ${o.name}`} onClick={() => onOpen?.(o.figureId)}
            style={{ position: "absolute", ...pos(o.geo), width: 22, height: 22, marginLeft: -11, marginTop: -11, padding: 0, border: 0, background: "transparent", display: "grid", placeItems: "center", cursor: onOpen ? "pointer" : "default" }}>
            <span aria-hidden="true" style={{ display: "block", width: 8, height: 8, borderRadius: R.pill, background: P.muted, opacity: 0.7, boxShadow: `0 0 0 2px ${alpha(P.bg, 0.8)}` }} />
          </button>
        ))}
        <span aria-hidden="true" style={{ position: "absolute", ...pos(geo), width: 12, height: 12, marginLeft: -6, marginTop: -6, borderRadius: R.pill, background: color, boxShadow: `0 0 0 4px ${alpha(color, 0.3)}` }} />
        {geo.place && (
          <span style={{ position: "absolute", ...pos(geo), transform: "translate(-50%, 10px)", fontSize: ".72em", fontWeight: 700, color: P.ink, background: alpha(P.bg, 0.88), borderRadius: R.sm, padding: `${S.xs}px ${S.md}px`, whiteSpace: "nowrap", pointerEvents: "none" }}>
            {geo.place}
          </span>
        )}
      </div>
      {others.length > 0 && <div style={{ color: P.muted, fontSize: ".72em", marginTop: S.sm }}>النقاط الرمادية شخصيات أخرى في القائمة، انقر واحدة لتفتحها.</div>}
    </div>
  );
}
