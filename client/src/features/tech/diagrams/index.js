import { routerModem, ipAddresses, ispBackbone, wifi } from "./scenes/internet";
import { dns, https, tcpUdp, bandwidthLatency } from "./scenes/protocols";
import { vpn, cdn, cloud } from "./scenes/services";
import { cpuCycle, ramVsStorage, gpuParallel } from "./scenes/hardware";
import { boot, processes, containers } from "./scenes/system";
import { git, apis, cicd } from "./scenes/programming";
import { encryption, twoFactor, phishing, firewall } from "./scenes/security";
import { machineLearning, neuralNet, llm, recommend } from "./scenes/ai";
import { email, cloudSync, browserRender, blockchain } from "./scenes/software";

// سجل الرسوم المتحركة: معرّف الموضوع → المشهد. الموضوع الذي له مشهد يعرض «شاهد كيف يحدث» في صفحته.
export const SCENES = [
  routerModem, ipAddresses, ispBackbone, wifi, dns, https, tcpUdp, bandwidthLatency, vpn, cdn, cloud,
  cpuCycle, ramVsStorage, gpuParallel, boot, processes, containers, git, apis, cicd,
  encryption, twoFactor, phishing, firewall, machineLearning, neuralNet, llm, recommend, email, cloudSync, browserRender, blockchain,
];
const BY_ID = Object.fromEntries(SCENES.map((s) => [s.id, s]));
export const sceneOf = (topicId) => BY_ID[topicId] || null;
export const hasScene = (topicId) => topicId in BY_ID;

// الأداة الحيّة المناسبة لكل موضوع (تُعرض داخل الصفحة)
export const TOOL_OF = { dns: "dns", "ip-addresses": "ip", "bandwidth-latency": "ping", "isp-and-backbone": "trace", "router-modem": "ip", "cdn-and-servers": "trace" };
export const toolOf = (topicId) => TOOL_OF[topicId] || null;

export { default as StepDiagram } from "./StepDiagram";
