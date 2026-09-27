import { Routes, Route, useParams } from "react-router-dom";
import TechHubScreen from "./components/TechHubScreen";
import BranchScreen from "./components/BranchScreen";
import TopicScreen from "./components/TopicScreen";
import InterviewScreen from "./components/InterviewScreen";
import NetToolsScreen from "./tools/NetToolsScreen";
import NetworkLab from "./lab/NetworkLab";

// كل صفحات التقنية تحت /tech/*
const Branch = ({ nav, paths }) => { const { id } = useParams(); return <BranchScreen branchId={id} onBack={() => nav(paths.tech)} onTopic={(t) => nav(paths.techTopic(t))} onInterview={() => nav(paths.techInterview(id))} />; };
const Interview = ({ nav, paths }) => { const { id } = useParams(); return <InterviewScreen branchId={id} onBack={() => nav(paths.techBranch(id))} onTopic={(t) => nav(paths.techTopic(t))} />; };
const Topic = ({ nav, paths }) => { const { id } = useParams(); return <TopicScreen topicId={id} onBack={() => nav(-1)} onOpen={(t) => nav(paths.techTopic(t))} onBranch={(b) => nav(paths.techBranch(b))} onLab={() => nav(paths.techLab)} />; };

export default function TechRouter({ nav, paths }) {
  const hub = <TechHubScreen onBack={() => nav(paths.home)} onBranch={(id) => nav(paths.techBranch(id))} onTopic={(id) => nav(paths.techTopic(id))} onTools={() => nav(paths.techTools)} onLab={() => nav(paths.techLab)} />;
  return (
    <Routes>
      <Route index element={hub} />
      <Route path="tools" element={<NetToolsScreen onBack={() => nav(paths.tech)} />} />
      <Route path="lab" element={<NetworkLab onBack={() => nav(paths.tech)} />} />
      <Route path="c/:id" element={<Branch nav={nav} paths={paths} />} />
      <Route path="c/:id/interview" element={<Interview nav={nav} paths={paths} />} />
      <Route path="t/:id" element={<Topic nav={nav} paths={paths} />} />
      <Route path="*" element={hub} />
    </Routes>
  );
}
