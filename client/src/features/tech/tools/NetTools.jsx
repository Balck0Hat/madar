import { useState } from "react";
import { Globe, MapPin, Activity, Route } from "lucide-react";
import { C, R, S, T, TAP, alpha } from "../../../shared/constants/theme";
import DnsTool from "./DnsTool";
import IpTool from "./IpTool";
import PingTool from "./PingTool";
import TraceTool from "./TraceTool";

export const TOOLS = [
  { id: "dns", title: "حلّ الأسماء", Icon: Globe, Comp: DnsTool }, { id: "ip", title: "ما عنواني؟", Icon: MapPin, Comp: IpTool },
  { id: "ping", title: "قِس الكمون", Icon: Activity, Comp: PingTool }, { id: "trace", title: "تتبّع المسار", Icon: Route, Comp: TraceTool },
];

// أدوات الشبكة الحيّة: أداة واحدة (داخل صفحة موضوع) أو الأربع بتبويبات (صفحة الأدوات)
export default function NetTools({ only, hue = C.gold }) {
  const [tab, setTab] = useState(only || TOOLS[0].id);
  const active = TOOLS.find((t) => t.id === (only || tab)) || TOOLS[0];
  return (
    <div style={{ display: "grid", gap: S.x3 }}>
      {!only && (
        <div role="tablist" aria-label="الأدوات" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: S.sm }}>
          {TOOLS.map(({ id, title, Icon }) => (
            <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)} style={{ minHeight: TAP, borderRadius: R.xl, border: `1px solid ${tab === id ? hue : C.line}`, background: tab === id ? alpha(hue, 0.12) : C.surface, color: tab === id ? hue : C.text, fontFamily: "inherit", fontWeight: 700, fontSize: T.sm, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: S.md, cursor: "pointer" }}>
              <Icon size={16} aria-hidden="true" />{title}
            </button>
          ))}
        </div>
      )}
      <div role={only ? undefined : "tabpanel"} aria-label={active.title}><active.Comp hue={hue} /></div>
    </div>
  );
}
