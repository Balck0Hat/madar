import { Routes, Route, useParams } from "react-router-dom";
import EnglishScreen from "./components/EnglishScreen";
import PlacementScreen from "./components/PlacementScreen";
import TrackScreen from "./components/TrackScreen";
import ModuleScreen from "./components/ModuleScreen";
import LessonScreen from "./components/LessonScreen";
import WeakPracticeScreen from "./components/WeakPracticeScreen";
import WritingTaskScreen from "./components/WritingTaskScreen";
import CalibrationScreen from "./components/CalibrationScreen";

// كل صفحات الإنجليزية تحت /english/*؛ paths و nav تأتيان من قشرة التطبيق
const Track = ({ nav, paths }) => { const { track } = useParams(); return <TrackScreen track={track} onBack={() => nav(paths.english)} onModule={(id) => nav(paths.module(track, id))} onWriting={(id) => nav(paths.writingTask(track, id))} onLesson={(tag) => nav(paths.lesson(tag))} />; };
const Module = ({ nav, paths }) => { const { track, moduleId } = useParams(); return <ModuleScreen moduleId={moduleId} onBack={() => nav(paths.track(track))} />; };
const Lesson = ({ nav, paths }) => { const { tag } = useParams(); return <LessonScreen tag={tag} onBack={() => nav(paths.track("general"))} />; };
const Weak = ({ nav, paths }) => { const { tag } = useParams(); return <WeakPracticeScreen tag={tag} onBack={() => nav(paths.english)} onLesson={(t) => nav(paths.lesson(t))} />; };
const Writing = ({ nav, paths }) => { const { track, taskId } = useParams(); return <WritingTaskScreen taskId={taskId} onBack={() => nav(paths.track(track))} />; };

export default function EnglishRouter({ nav, paths, isAdmin }) {
  const p = { nav, paths };
  return (
    <Routes>
      <Route index element={<EnglishScreen onBack={() => nav(paths.home)} onPlacement={() => nav(paths.placement)} onTrack={(id) => nav(paths.track(id))} onWeak={(tag) => nav(paths.weak(tag))} onAdmin={() => nav(paths.englishAdmin)} isAdmin={isAdmin} />} />
      <Route path="placement" element={<PlacementScreen onBack={() => nav(paths.english)} onGo={(track) => nav(paths.track((track || "general").replace("-plus", "")))} />} />
      <Route path="t/:track" element={<Track {...p} />} />
      <Route path="t/:track/m/:moduleId" element={<Module {...p} />} />
      <Route path="t/general/l/:tag" element={<Lesson {...p} />} />
      <Route path="t/:track/w/:taskId" element={<Writing {...p} />} />
      <Route path="practice/:tag" element={<Weak {...p} />} />
      {isAdmin && <Route path="admin" element={<CalibrationScreen onBack={() => nav(paths.english)} />} />}
      <Route path="*" element={<EnglishScreen onBack={() => nav(paths.home)} onPlacement={() => nav(paths.placement)} onTrack={(id) => nav(paths.track(id))} onWeak={(tag) => nav(paths.weak(tag))} onAdmin={() => nav(paths.englishAdmin)} isAdmin={isAdmin} />} />
    </Routes>
  );
}
