// الهوية البصرية: كحلي ليلي وذهب (شاشات التطبيق)
export const C = {
  bg: "#0B1020",
  surface: "#141B33",
  surface2: "#1B2444",
  line: "#26304F",
  text: "#F2EFE6",
  muted: "#8C93AD",
  gold: "#F2B544",
  goldSoft: "rgba(242,181,68,0.16)",
  green: "#3FB68B",
  red: "#F26B5B",
};

// ورق: لوحة الدرس المقروء
export const P = {
  bg: "#F3EBDD",
  ink: "#1E2235",
  muted: "#6B6F80",
  line: "#DDD2BE",
  panel: "#0B1020",
  card: "#FBF7EE",
  gold: "#A9781A",
};

export const FONT = '"SF Arabic","Segoe UI","Noto Naskh Arabic","Noto Sans Arabic",Tahoma,sans-serif';
export const MONO = 'ui-monospace,"SF Mono",Menlo,Consolas,monospace';

export const inputStyle = {
  width: "100%",
  background: C.surface2,
  border: `1px solid ${C.line}`,
  borderRadius: 14,
  padding: "14px 16px",
  color: C.text,
  fontSize: 16,
  fontFamily: FONT,
};
