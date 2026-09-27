import { Cpu, MonitorCog, Network, Code2, ShieldCheck, Brain, AppWindow, Lightbulb } from "lucide-react";
import { C, HUE } from "../../../shared/constants/theme";

// هوية كل فرع من فروع التقنية (أيقونة ولون) ومستويات الموضوعات
export const BRANCH_META = {
  hardware: { Icon: Cpu, hue: HUE.blue },
  os: { Icon: MonitorCog, hue: HUE.violet },
  networks: { Icon: Network, hue: HUE.teal },
  programming: { Icon: Code2, hue: HUE.lime },
  security: { Icon: ShieldCheck, hue: HUE.pink },
  ai: { Icon: Brain, hue: HUE.orange },
  software: { Icon: AppWindow, hue: HUE.yellow },
  concepts: { Icon: Lightbulb, hue: HUE.slate },
};
export const metaOf = (id) => BRANCH_META[id] || { Icon: Lightbulb, hue: C.gold };

export const LEVELS = [["basics", "أساسي"], ["intermediate", "متوسط"], ["advanced", "متقدم"]];
export const LEVEL_LABEL = Object.fromEntries(LEVELS);
export const levelTone = (level) => (level === "basics" ? C.green : level === "advanced" ? C.red : C.gold);
