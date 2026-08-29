import { DOMAINS } from "../../data/domains";
import { sectorPath, HIT_GROW, HIT_UNIT } from "./geometry";
import { cueId } from "./wheelUnits";

// طبقة اللمس: أشكال شفافة أوسع من الرسم، فوقه كله.
// القطاع يمتد ٣ وحدات في كل اتجاه ويبتلع فجوة الزاوية، والوحدة قرص نصف قطره ١٣
// (٢٦px قطراً) — ولأن الأقراص تأتي بعد القطاعات فهي الفائزة عند التداخل،
// أي أن لمس نجمة يفتح وحدتها لا صفحة المجال.
export default function WheelHits({ units, prefix, label, on }) {
  return (
    <g style={{ cursor: "pointer" }}>
      {DOMAINS.map((d, di) =>
        d.rings.map((_, r) => {
          const cue = { kind: "sector", di, r };
          const text = label.sector(di, r);
          return (
            <path
              key={`${di}-${r}`}
              id={cueId(prefix, cue)}
              role="button"
              aria-label={text}
              d={sectorPath(di, r, 0, HIT_GROW)}
              fill="transparent"
              onClick={() => on.sector(di, r)}
              onPointerEnter={() => on.over(cue)}
              onPointerLeave={() => on.out(cue)}
            >
              <title>{text}</title>
            </path>
          );
        }),
      )}
      {units
        .filter((u) => !u.center && !u.locked)
        .map((u) => {
          const cue = { kind: "unit", id: u.id, di: u.di, r: u.r };
          return (
            <circle
              key={u.id}
              id={cueId(prefix, cue)}
              role="button"
              aria-label={u.title}
              cx={u.x}
              cy={u.y}
              r={HIT_UNIT}
              fill="transparent"
              onClick={(e) => { e.stopPropagation(); on.unit(u.id); }}
              onPointerEnter={() => on.over(cue)}
              onPointerLeave={() => on.out(cue)}
            >
              <title>{u.title}</title>
            </circle>
          );
        })}
    </g>
  );
}
