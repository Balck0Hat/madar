import { useMemo, useState } from "react";
import { Globe2, Crown, Scale } from "lucide-react";
import { C, alpha, T, R, S, TAP } from "../../../shared/constants/theme";
import { useAsync } from "../../../shared/hooks/useAsync";
import { useNum } from "../../../shared/context/PrefsContext";
import { TopBar, Skeleton, ErrorState } from "../../../shared/components/ui";
import { getOverview, listCountries, listTitles } from "../services/politics.service";
import CountriesTab from "./CountriesTab";
import TitlesTab from "./TitlesTab";
import SystemsTab from "./SystemsTab";

const TABS = [
  { k: "countries", label: "الدول", Icon: Globe2 },
  { k: "titles", label: "الألقاب", Icon: Crown },
  { k: "systems", label: "أنواع الحكم", Icon: Scale },
];

// قسم السياسة: ثلاث خانات في شاشة واحدة. الدول (كيف تُحكم كل دولة ومن يحكمها
// الآن)، والألقاب (معنى كل لقب وأصل كلمته ومهامه)، وأنواع الحكم. التبويب في
// الرابط، فالعودة من ملف دولة ترجع إلى حيث كان القارئ.
export default function PoliticsScreen({ tab = "countries", onTab, onBack, onOpenCountry }) {
  const num = useNum();
  const [system, setSystem] = useState(""); // فلتر نوع الحكم، يضبطه تبويب الأنواع أيضاً
  const { data, loading, error, reload } = useAsync(
    () => Promise.all([getOverview(), listCountries(), listTitles()]).then(([overview, countries, families]) => ({ overview, countries, families })),
    [],
  );
  const colors = useMemo(() => Object.fromEntries((data?.overview.systems || []).map((s) => [s.name, s.color])), [data]);
  const active = TABS.some((t) => t.k === tab) ? tab : "countries";
  const showSystem = (name) => { setSystem(name); onTab?.("countries"); };

  return (
    <div className="madar-in madar-tabpad madar-col">
      <TopBar title="السياسة" onBack={onBack} />
      <div style={{ padding: `0 ${S.x4}px`, display: "grid", gap: S.x3 }}>
        <div role="tablist" style={{ display: "flex", gap: S.md, background: C.surface2, border: `1px solid ${C.line}`, borderRadius: R.xl, padding: S.sm }}>
          {TABS.map(({ k, label, Icon }) => (
            <button key={k} type="button" role="tab" aria-selected={active === k} onClick={() => onTab?.(k)} className="madar-press"
              style={{ flex: 1, minHeight: TAP, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: S.md, fontFamily: "inherit", fontSize: T.sm, fontWeight: 700, cursor: "pointer", borderRadius: R.lg,
                border: `1px solid ${active === k ? alpha(C.gold, 0.5) : "transparent"}`, background: active === k ? C.goldSoft : "transparent", color: active === k ? C.gold : C.muted }}>
              <Icon size={16} aria-hidden="true" />{label}
            </button>
          ))}
        </div>
        {loading && <Skeleton lines={6} />}
        {error && <ErrorState message={error.message} onRetry={reload} onBack={onBack} />}
        {data && (
          <>
            {active === "countries" && <CountriesTab countries={data.countries} systems={data.overview.systems} colors={colors} system={system} onSystem={setSystem} onOpen={onOpenCountry} />}
            {active === "titles" && <TitlesTab families={data.families} />}
            {active === "systems" && <SystemsTab systems={data.overview.systems} onShow={showSystem} />}
            {data.overview.asOf && (
              <div style={{ color: C.muted, fontSize: T.xs, textAlign: "center", padding: `${S.md}px 0 ${S.x4}px`, lineHeight: 1.7 }}>
                {num(data.overview.counts.countries)} دولة · {num(data.overview.counts.titles)} لقباً · أسماء الحكّام كما تحقّقنا منها في {num(data.overview.asOf)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
