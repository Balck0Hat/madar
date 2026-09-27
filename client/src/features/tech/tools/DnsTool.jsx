import { useState } from "react";
import { C, S } from "../../../shared/constants/theme";
import { useNum } from "../../../shared/context/PrefsContext";
import { getDns } from "../services/tech.service";
import { HostForm, Box, Row, Note } from "./toolUi";

// أداة DNS: اكتب اسم نطاق واعرف عناوينه وسجلاته وكم يبقى الجواب صالحاً
export default function DnsTool({ hue = C.gold }) {
  const num = useNum();
  const [state, setState] = useState({ busy: false, data: null, error: null });
  const run = async (name) => {
    setState({ busy: true, data: null, error: null });
    try { setState({ busy: false, data: await getDns(name), error: null }); } catch (err) { setState({ busy: false, data: null, error: err.message }); }
  };
  const d = state.data;
  const ttl = (s) => (s >= 3600 ? `${num(Math.round(s / 3600))} س` : s >= 60 ? `${num(Math.round(s / 60))} د` : `${num(s)} ث`);
  return (
    <div style={{ display: "grid", gap: S.x2 }}>
      <Note>خادم مدار يسأل محلّل DNS نيابة عنك ويعرض الجواب كاملاً: العنوان، ومن يستقبل البريد، ومن يدير النطاق.</Note>
      <HostForm label="اسم النطاق" placeholder="example.com" initial="wikipedia.org" busy={state.busy} onSubmit={run} hue={hue} action="حلّ" />
      {state.error && <Box tone={C.red}>{state.error}</Box>}
      {d && (
        <Box>
          <Row k="الاسم" v={d.host} />
          {d.a.map((r) => <Row key={r.address} k="IPv4" v={`${r.address}  (صالح ${ttl(r.ttl)})`} />)}
          {d.aaaa.map((r) => <Row key={r.address} k="IPv6" v={`${r.address}  (صالح ${ttl(r.ttl)})`} />)}
          {d.cname.map((c) => <Row key={c} k="اسم بديل" v={c} />)}
          {d.mx.map((m) => <Row key={m.exchange} k="البريد" v={`${m.exchange}  (أولوية ${num(m.priority)})`} />)}
          {d.ns.map((n) => <Row key={n} k="مدير النطاق" v={n} />)}
          {d.txt.map((t, i) => <Row key={i} k="نصّ" v={t} />)}
          <Note>استغرق الحلّ {num(d.ms)} ملّي ثانية. «صالح» هي مدة TTL: بعدها يعيد المحلّل السؤال؛ لذلك تغيير عنوان موقع يحتاج وقتاً حتى «ينتشر».</Note>
        </Box>
      )}
    </div>
  );
}
