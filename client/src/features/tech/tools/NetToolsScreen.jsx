import { C, S, T } from "../../../shared/constants/theme";
import { TopBar } from "../../../shared/components/ui";
import { metaOf } from "../components/tech.meta";
import NetTools from "./NetTools";

// صفحة الأدوات الحيّة المستقلة: /tech/tools
export default function NetToolsScreen({ onBack }) {
  const { hue } = metaOf("networks");
  return (
    <div className="madar-in madar-col" style={{ paddingBottom: S.x8 }}>
      <TopBar title="أدوات الشبكة" onBack={onBack} />
      <div style={{ padding: `0 ${S.x4}px`, display: "grid", gap: S.x3 }}>
        <p style={{ margin: 0, color: C.muted, lineHeight: 1.8, fontSize: T.md }}>أربع أدوات حقيقية تعمل من خادم مدار ومن متصفحك: جرّبها وأنت تقرأ موضوعات الشبكات لترى المفاهيم تحدث فعلاً.</p>
        <NetTools hue={hue} />
      </div>
    </div>
  );
}
