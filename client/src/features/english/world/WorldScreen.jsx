import { useEffect, useMemo, useRef, useState } from "react";
import { List, Navigation } from "lucide-react";
import { C, R, S, T, alpha } from "../../../shared/constants/theme";
import { useAsync } from "../../../shared/hooks/useAsync";
import { useDesktop, useMedia } from "../../../shared/hooks/useMedia";
import { useReducedMotion } from "../../../shared/hooks/useReducedMotion";
import { useNum } from "../../../shared/context/PrefsContext";
import { TopBar, Skeleton, ErrorState, Btn } from "../../../shared/components/ui";
import { getWorld } from "../services/english.service";
import { ensureWorldStyles } from "./worldStyles";
import { toneColor } from "./worldLayout";
import WorldScene from "./WorldScene";
import Island from "./Island";
import NodeSheet from "./NodeSheet";

// خريطة محطة واحدة من رحلة القواعد (أو كل المحطات بلا stageId) على مشهد مائل. الهاتف: عمودياً ولوح من الأسفل. الحاسوب: شبكة ولوح جانبي.
// الضغط على عقدة «ينزل» الكاميرا عليها ثم يفتح بطاقتها.
export default function WorldScreen({ stageId = null, onBack, onLesson, onPractice, onBoss, onList }) {
  const num = useNum();
  const desktop = useDesktop();
  const wide = useMedia("(min-width: 1100px)"); // لوح جانبي ثابت حين تتسع الشاشة له بجانب العمود
  const reduced = useReducedMotion();
  const { data: world, loading, error, reload } = useAsync(() => getWorld(), []);
  const [open, setOpen] = useState(null); // { node } أو { boss: island }
  const refs = useRef({});
  useEffect(() => { ensureWorldStyles(); }, []);

  const nodes = useMemo(() => Object.fromEntries((world?.islands || []).flatMap((i) => i.nodes.map((n) => [n.tag, { ...n, island: i, prereqTitles: Object.fromEntries(i.nodes.map((x) => [x.tag, x.title])) }]))), [world]);
  const friendsByTag = useMemo(() => (world?.friends || []).reduce((acc, f) => { (acc[f.tag] ||= []).push(f.name); return acc; }, {}), [world]);
  const focusIsland = open ? (open.node ? open.node.island.id : open.boss.id) : null;

  const openNode = (tag) => { setOpen({ node: nodes[tag] }); if (!desktop) refs.current[nodes[tag].island.id]?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" }); };
  const openBoss = (island) => { setOpen({ boss: island }); if (!desktop) refs.current[island.id]?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" }); };
  const resume = () => { const tag = world.quest || world.player; if (tag) openNode(tag); };

  const shell = (children) => (
    <div className="madar-in madar-tabpad madar-col">
      <TopBar title={(stageId && world?.islands.find((i) => i.id === stageId)?.en) || "خريطة القواعد"} onBack={onBack} right={<Btn small full={false} paper onClick={onList}><span style={{ display: "inline-flex", alignItems: "center", gap: S.md }}><List size={14} aria-hidden="true" />قائمة</span></Btn>} />
      <div style={{ padding: `0 ${S.x4}px`, display: "grid", gap: S.x3 }}>{children}</div>
    </div>
  );
  if (loading) return shell(<Skeleton lines={8} />);
  if (error) return shell(<ErrorState message={error.message} onRetry={reload} onBack={onBack} />);

  const stage = stageId ? world.islands.find((i) => i.id === stageId) : null;
  const questNode = world.quest && (!stage || stage.nodes.some((n) => n.tag === world.quest)) ? nodes[world.quest] : null;
  const doneHere = stage ? stage.mastered : world.mastered, totalHere = stage ? stage.nodes.length : world.total;
  const header = (
    <div style={{ display: "flex", alignItems: "center", gap: S.lg, flexWrap: "wrap", background: C.surface, border: `1px solid ${C.line}`, borderRadius: R.x2, padding: `${S.x2}px ${S.x3}px` }}>
      <div style={{ flex: 1, minWidth: 160 }}>
        <div style={{ fontWeight: 700 }}>أتقنت <span className="madar-num">{num(doneHere)}</span> من <span className="madar-num">{num(totalHere)}</span> {stage ? "دروس هذه المحطة" : "موضوعاً"}{stage ? (stage.boss.status === "passed" ? " · اجتزت الزعيم" : "") : <> · <span className="madar-num">{num(world.bosses)}</span> محطات مجتازة</>}</div>
        {questNode && <div style={{ color: C.muted, fontSize: T.sm, marginTop: S.xs }}>مهمة اليوم: <span dir="ltr">{questNode.en || questNode.title}</span>{questNode.en ? ` · ${questNode.title}` : ""}</div>}
      </div>
      <Btn primary full={false} small onClick={resume}><span style={{ display: "inline-flex", alignItems: "center", gap: S.md }}><Navigation size={14} aria-hidden="true" />ابدأ من حيث توقفت</span></Btn>
    </div>
  );
  const shown = stageId ? world.islands.filter((i) => i.id === stageId) : world.islands;
  const islands = shown.map((isl, i) => (
    <div key={isl.id} ref={(el) => { refs.current[isl.id] = el; }} style={{ gridColumn: desktop && isl.side ? "1 / -1" : undefined }}>
      <Island island={isl} index={i} depth={0} focused={focusIsland === isl.id} dim={Boolean(focusIsland) && focusIsland !== isl.id}
        focusedTag={open?.node?.tag} quest={world.quest} player={world.player} friendsByTag={friendsByTag} onOpenNode={openNode} onOpenBoss={openBoss} />
    </div>
  ));
  const sheet = open && (
    <NodeSheet node={open.node} boss={open.boss} tone={toneColor(open.node ? open.node.island.tone : open.boss.tone)} desktop={wide} onClose={() => setOpen(null)} onLesson={onLesson} onPractice={onPractice} onBoss={onBoss} />
  );
  return shell(
    <>
      {header}
      <WorldScene desktop={desktop} reduced={reduced}>
        <div style={{ display: "grid", gap: S.x6 }}>{islands}</div>
      </WorldScene>
      {sheet}
      <div style={{ color: C.muted, fontSize: T.xs, lineHeight: 1.7, background: alpha(C.gold, 0.06), borderRadius: R.lg, padding: S.x2 }}>أتقن الدرس بـ75٪ في تمرينه ليُفتح الدرس التالي. أتقن كل دروس المحطة ليظهر زعيمها، واجتيازه يفتح المحطة التالية في رحلتك.</div>
    </>,
  );
}
