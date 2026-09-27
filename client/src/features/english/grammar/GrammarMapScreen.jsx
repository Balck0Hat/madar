import { useCallback, useEffect, useMemo, useState } from "react";
import { C, R, S, T, alpha } from "../../../shared/constants/theme";
import { useAsync } from "../../../shared/hooks/useAsync";
import { useDesktop, useMedia } from "../../../shared/hooks/useMedia";
import { useNum } from "../../../shared/context/PrefsContext";
import { TopBar, Skeleton, ErrorState } from "../../../shared/components/ui";
import { getGrammarTree } from "../services/english.service";
import { layout, hueOf } from "./mapLayout";
import MindMap from "./MindMap";
import MobileMap from "./MobileMap";
import GrammarList from "./GrammarList";
import MapToolbar from "./MapToolbar";
import SceneMap from "./scene/SceneMap";
import IslandSheet from "./scene/IslandSheet";
import TopicPanel from "./TopicPanel";

// خريطة القواعد الذهنية: كل القواعد في شجرة واحدة (مركز، ثمانية فروع، مجموعات، موضوعات).
// الحاسوب: خريطة تُسحب وتُقرَّب ولوح جانبي. الهاتف: فروع تنفتح وورقة من الأسفل. بحث وتصفية ومفضلة.
export default function GrammarMapScreen({ onBack, onLesson, onPractice, onJourney, initialTopic = null, onTopicChange }) {
  const num = useNum();
  const desktop = useDesktop();
  const wide = useMedia("(min-width: 1100px)");
  const { data, loading, error, reload } = useAsync(() => getGrammarTree(), []);
  const [selected, setSelected] = useState(initialTopic);
  const [band, setBand] = useState("all");
  const [onlyMarked, setOnlyMarked] = useState(false);
  const [view, setView] = useState("world"); // العالم أولاً على كل الشاشات؛ الهاتف بنمط مضغوط
  const [marks, setMarks] = useState(null);
  const [openBranch, setOpenBranch] = useState(null);
  const [related, setRelated] = useState([]); // القواعد المرتبطة بالمختارة، لخطوط العلاقة في العالم
  const [island, setIsland] = useState(null); // جزيرة مفتوحة في ورقة (الهاتف)
  const [full, setFull] = useState(false); // العالم بملء الشاشة
  useEffect(() => { if (data) setMarks(new Set(data.marked)); }, [data]);
  useEffect(() => { setSelected(initialTopic); }, [initialTopic]);

  const branches = useMemo(() => (data?.branches || []).map((b) => ({ ...b, groups: b.groups.map((g) => ({ ...g, topics: g.topics.map((t) => ({ ...t, marked: marks ? marks.has(t.id) : t.marked })) })) })), [data, marks]);
  const map = useMemo(() => (branches.length ? layout(branches) : null), [branches]);
  const dimmed = useCallback((n) => { if (n.kind && n.kind !== "topic") return false; if (onlyMarked && !n.marked) return true; return band !== "all" && n.band !== band; }, [band, onlyMarked]);
  const select = (id) => { const n = map?.byId.get(id); if (n && n.kind !== "topic") return; setSelected(id); onTopicChange?.(id); };
  const close = useCallback(() => { setSelected(null); onTopicChange?.(null); }, [onTopicChange]);
  const hueOfTopic = (id) => { const n = map?.byId.get(id); return n?.hue || (branches.find((b) => b.groups.some((g) => g.topics.some((t) => t.id === id)))?.hue ? hueOf(branches.find((b) => b.groups.some((g) => g.topics.some((t) => t.id === id))).hue) : C.gold); };
  const onView = (v) => { if (v === "journey") onJourney(); else setView(v); };

  const shell = (children) => (
    <div className="madar-in madar-tabpad madar-col" style={desktop ? { maxWidth: "none" } : undefined}>
      <TopBar title="خريطة القواعد" onBack={onBack} />
      <div style={{ padding: `0 ${desktop ? S.x6 : S.x4}px`, display: "grid", gap: S.x2 }}>{children}</div>
    </div>
  );
  if (loading) return shell(<Skeleton lines={8} />);
  if (error) return shell(<ErrorState message={error.message} onRetry={reload} onBack={onBack} />);

  const ready = branches.flatMap((b) => b.groups.flatMap((g) => g.topics)).filter((t) => t.ready).length;
  const panel = selected && <TopicPanel topicId={selected} hue={hueOfTopic(selected)} desktop={wide} onClose={close} onOpen={select} onLesson={onLesson} onPractice={onPractice} onLoaded={(t) => setRelated(t.related.map((r) => r.id))} onMarked={(id, m) => setMarks((s) => { const n = new Set(s || []); if (m) n.add(id); else n.delete(id); return n; })} />;
  const body = view === "list"
    ? <GrammarList branches={branches} dimmed={dimmed} selected={selected} onSelect={select} />
    : view === "world"
      ? <SceneMap branches={branches} dimmed={dimmed} selected={selected} related={related} onSelect={select} total={data.total} compact={!desktop} onIsland={(id) => setIsland(branches.find((b) => b.id === id))} full={full} onFull={() => setFull((f) => !f)} height={full ? "100dvh" : desktop ? "max(560px, calc(100dvh - 190px))" : 460} />
      : view === "map" && map
        ? <MindMap data={map} dimmed={dimmed} selected={selected} onSelect={select} height={desktop ? "max(520px, calc(100dvh - 190px))" : 560} />
        : <MobileMap branches={branches} dimmed={dimmed} selected={selected} onSelect={select} openBranch={openBranch} />;
  const islandSheet = island && !selected && <IslandSheet island={branches.find((b) => b.id === island.id) || island} dimmed={dimmed} selected={selected} onSelect={(id) => { select(id); }} onClose={() => setIsland(null)} />;
  if (full && view === "world") return (
    <div style={{ position: "fixed", inset: 0, zIndex: 35, background: C.bg }}>
      {body}
      {islandSheet}
      {panel}
    </div>
  );
  return shell(
    <>
      <MapToolbar band={band} onBand={setBand} onlyMarked={onlyMarked} onOnlyMarked={setOnlyMarked} view={view} onView={onView} onPick={select} count={data.total} />
      <div style={wide && selected ? { display: "grid", gridTemplateColumns: "minmax(0, 1fr) 420px", gap: S.x4, alignItems: "start" } : undefined}>
        {body}
        {wide && panel}
      </div>
      {!wide && panel}
      {islandSheet}
      <div style={{ color: C.muted, fontSize: T.xs, lineHeight: 1.7, background: alpha(C.gold, 0.06), borderRadius: R.lg, padding: S.x2 }}>
        {num(data.total)} قاعدة في ثمانية فروع{ready < data.total ? ` (${num(ready)} جاهزة الآن)` : ""}. اضغط أي قاعدة لترى صيغتها واستعمالها وأمثلتها وأخطاءها الشائعة، والقلب يحفظها في مفضلتك. {view === "world" ? "اسحب العالم وقرّبه بالعجلة أو بإصبعين، والقلعة في المركز." : desktop ? "اسحب الخريطة وقرّبها بالعجلة." : "افتح الفرع لترى قواعده."}
      </div>
    </>,
  );
}
