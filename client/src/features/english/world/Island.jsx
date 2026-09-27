import { Crown, Lock } from "lucide-react";
import { C, R, S, T, TAP, alpha } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/PrefsContext";
import NodeTower from "./NodeTower";
import { islandHeight, nodePos, bossPos, toneColor, curve, islandBody } from "./worldLayout";

// الخلفية صورة ثابتة الألوان في الوضعين، فألوان الجزيرة فوقها ثابتة كذلك: زجاج داكن وخطوط فاتحة
const GLASS = "#0b1030";
const INK = "#ffffff";

// جزيرة: جسم SVG بسُمك (عمق)، مسارات منحنية بين العقد تُرسم كأن قلماً يخطها، العقد كأزرار
// فوق الرسم، زعيم الجزيرة في أسفلها، ضباب على المقفلة، وجسر إلى التالية حين يُجتاز الزعيم.
export default function Island({ island, index, focusedTag, quest, player, friendsByTag, onOpenNode, onOpenBoss, focused, dim, depth = 0 }) {
  const num = useNum();
  const tone = toneColor(island.tone);
  const n = island.nodes.length;
  const h = islandHeight(n);
  const pos = Object.fromEntries(island.nodes.map((node, i) => [node.tag, nodePos(i, n)]));
  const boss = bossPos(n);
  const bossOpen = island.boss.status !== "locked";
  return (
    <section aria-label={`جزيرة ${island.title}`} className={island.open ? "world-float" : undefined}
      style={{ position: "relative", width: "100%", animationDelay: `${index * 700}ms`, transform: focused ? "scale(1.03)" : undefined, transition: "transform .45s cubic-bezier(.2,.7,.3,1), opacity .3s", opacity: dim ? 0.55 : 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: S.lg, marginBottom: S.sm }}>
        <h2 style={{ margin: 0, fontSize: T.lg, fontWeight: 700, color: island.open ? C.text : C.muted, background: alpha(C.surface, 0.9), borderRadius: R.pill, padding: `${S.sm}px ${S.x3}px`, borderInlineStart: `4px solid ${tone}` }}>{island.title}</h2>
        <span className="madar-num" style={{ fontSize: T.xs, color: C.muted, background: alpha(C.surface, 0.9), borderRadius: R.pill, padding: `${S.sm}px ${S.x2}px` }}>{island.level} · {num(island.mastered)} من {num(n)}</span>
      </div>
      <div style={{ position: "relative", aspectRatio: `100 / ${h}` }}>
        <svg viewBox={`0 0 100 ${h}`} width="100%" height="100%" aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <path d={islandBody(h)} style={{ fill: alpha(GLASS, 0.35) }} transform="translate(0 6)" />
          <path d={islandBody(h)} style={{ fill: alpha(GLASS, island.open ? 0.3 : 0.22), stroke: alpha(tone, 0.85) }} strokeWidth={0.6} />
          {island.edges.map(([a, b]) => {
            const done = island.nodes.find((x) => x.tag === a)?.status === "mastered";
            return <path key={`${a}-${b}`} d={curve(pos[a], pos[b])} fill="none" style={{ stroke: done ? C.gold : alpha(INK, 0.6) }} strokeWidth={done ? 1.4 : 1} strokeDasharray={done ? undefined : "2 2"} pathLength={1} className={done ? "world-draw" : undefined} strokeLinecap="round" />;
          })}
          <path d={curve(pos[island.nodes[n - 1].tag], boss)} fill="none" style={{ stroke: bossOpen ? C.gold : alpha(INK, 0.5) }} strokeWidth={1} strokeDasharray={bossOpen ? undefined : "2 2"} strokeLinecap="round" />
        </svg>
        {island.nodes.map((node, i) => (
          <NodeTower key={node.tag} index={i} node={node} pos={pos[node.tag]} tone={tone} quest={quest === node.tag} player={player === node.tag} friends={friendsByTag[node.tag] || []} focused={focusedTag === node.tag} onOpen={onOpenNode} />
        ))}
        <button type="button" onClick={() => onOpenBoss(island)} aria-label={`زعيم ${island.title}${island.boss.status === "passed" ? " · مجتاز" : island.boss.status === "locked" ? " · مقفل" : ""}`} className="world-node madar-press"
          style={{ position: "absolute", left: `${boss.x}%`, top: `${boss.y}%`, transform: "translate(-50%, -50%)", minWidth: TAP + 8, height: TAP + 8, borderRadius: R.pill, padding: `0 ${S.x2}px`, border: `3px solid ${island.boss.status === "passed" ? C.gold : bossOpen ? C.red : C.muted}`, background: island.boss.status === "passed" ? C.gold : C.surface, color: island.boss.status === "passed" ? C.bg : bossOpen ? C.red : C.muted, display: "inline-flex", alignItems: "center", gap: S.md, fontFamily: "inherit", fontWeight: 700, fontSize: T.sm, cursor: "pointer", boxShadow: `0 8px 14px ${alpha("#000", 0.25)}`, filter: bossOpen ? undefined : "saturate(.4)" }}>
          {bossOpen ? <Crown size={18} aria-hidden="true" /> : <Lock size={16} aria-hidden="true" />}الزعيم{island.boss.pct !== null ? <span className="madar-num"> {num(island.boss.pct)}٪</span> : null}
        </button>
        {!island.open && (
          <div aria-hidden="true" className="world-fog" style={{ position: "absolute", inset: -8, borderRadius: R.x4, background: `radial-gradient(ellipse at center, ${alpha(GLASS, 0.3)}, ${alpha(GLASS, 0.6)})`, backdropFilter: "blur(1.5px)", display: "grid", placeItems: "center", color: C.muted, fontWeight: 700, fontSize: T.sm }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: S.md, background: alpha(C.surface, 0.9), borderRadius: R.pill, padding: `${S.md}px ${S.x3}px` }}><Lock size={14} aria-hidden="true" />اجتز زعيم الجزيرة السابقة</span>
          </div>
        )}
      </div>
    </section>
  );
}
