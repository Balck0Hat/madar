import { P, R, S, alpha } from "../../../shared/constants/theme";

// خريطة العالم القديم بنقطة واحدة: «ملطية» و«كروتون» و«أنشان» لا تعني شيئاً
// لأكثر القراء حتى يروا أين هي. الخريطة صورة ثابتة مقصوصة من خريطة مواقع
// بإسقاط مستطيل بسيط، فالنقطة تُحسب خطياً من خط الطول والعرض.
const BOX = { lonMin: -25, lonMax: 145, latMin: -12, latMax: 62 }; // ما تُغطّيه صورة الخريطة
const SRC = "/maps/old-world.png";

export const inBox = (geo) => Boolean(geo) && geo.lon >= BOX.lonMin && geo.lon <= BOX.lonMax && geo.lat >= BOX.latMin && geo.lat <= BOX.latMax;

export default function FigureMap({ geo, color }) {
  if (!inBox(geo)) return null;
  const left = ((geo.lon - BOX.lonMin) / (BOX.lonMax - BOX.lonMin)) * 100;
  const top = ((BOX.latMax - geo.lat) / (BOX.latMax - BOX.latMin)) * 100;
  return (
    <div style={{ marginTop: S.x3 }}>
      <div role="img" aria-label={geo.place ? `موقع ${geo.place} على الخريطة` : "الموقع على الخريطة"}
        style={{ position: "relative", background: alpha(color, 0.06), border: `1px solid ${P.line}`, borderRadius: R.x2, overflow: "hidden", aspectRatio: "1000 / 435" }}>
        <img src={SRC} alt="" width={1000} height={435} loading="lazy" decoding="async" style={{ display: "block", width: "100%", height: "100%", opacity: 0.8 }} />
        <span aria-hidden="true" style={{ position: "absolute", left: `${left}%`, top: `${top}%`, width: 12, height: 12, transform: "translate(-50%, -50%)", borderRadius: R.pill, background: color, boxShadow: `0 0 0 4px ${alpha(color, 0.3)}` }} />
        {geo.place && (
          <span style={{ position: "absolute", left: `${left}%`, top: `${top}%`, transform: "translate(-50%, 10px)", fontSize: ".72em", fontWeight: 700, color: P.ink, background: alpha(P.bg, 0.85), borderRadius: R.sm, padding: `${S.xs}px ${S.md}px`, whiteSpace: "nowrap" }}>
            {geo.place}
          </span>
        )}
      </div>
    </div>
  );
}
