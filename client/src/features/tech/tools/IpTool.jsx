import { C, S } from "../../../shared/constants/theme";
import { useAsync } from "../../../shared/hooks/useAsync";
import { Skeleton } from "../../../shared/components/ui";
import { getMyIp } from "../services/tech.service";
import { Box, Row, Note } from "./toolUi";

// أداة «ما عنواني؟»: العنوان العام الذي وصل به طلبك إلى خادم مدار
export default function IpTool() {
  const { data, loading, error, reload } = useAsync(() => getMyIp(), []);
  return (
    <div style={{ display: "grid", gap: S.x2 }}>
      <Note>هذا هو العنوان الذي يراه أي موقع تزوره: عنوان بيتك (أو شبكة الهاتف) العام الذي أعطاه المزوّد لراوترك، لا عنوان جهازك الداخلي.</Note>
      {loading && <Skeleton lines={3} />}
      {error && <Box tone={C.red}>{error.message} <button type="button" onClick={reload} style={{ background: "transparent", border: 0, color: C.text, fontFamily: "inherit", textDecoration: "underline", cursor: "pointer" }}>أعد المحاولة</button></Box>}
      {data && (
        <Box tone={data.private ? C.gold : C.green}>
          <Row k="عنوانك" v={data.ip || "غير معروف"} />
          <Row k="النوع" v={data.family} />
          <Row k="متصفحك" v={data.agent} />
          <Note>{data.private ? "هذا عنوان داخلي (خاص): أنت تصل إلى مدار من داخل الشبكة نفسها أو عبر وسيط محلي." : "كل أجهزة بيتك تظهر للعالم بهذا العنوان الواحد (NAT). قد يتغير حين يُعاد تشغيل الراوتر، وعبر بيانات الهاتف يتغير كثيراً."}</Note>
        </Box>
      )}
    </div>
  );
}
