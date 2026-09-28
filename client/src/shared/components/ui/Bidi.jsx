// نصّ عربي فيه مقاطع إنجليزية: كل مقطع لاتيني يُعزل في <bdi dir="ltr"> فلا تنقلب الكلمات ولا تقفز
// علامات الترقيم والأقواس إلى الطرف الخطأ. المقطع يبدأ بحرف لاتيني أو رقم ويمتدّ عبر المسافات
// وعلامات الترقيم بين الكلمات الإنجليزية، ولا يبتلع علامة ترقيم في آخره.
const LATIN = /[A-Za-z0-9][A-Za-z0-9'’\-+/.,:;!?() ]*[A-Za-z0-9'’)?!]|[A-Za-z]/g;

const SHORT = 28; // عبارة إنجليزية قصيرة لا تنكسر بين سطرين فيبدو ترتيبها مقلوباً

export default function Bidi({ children }) {
  if (typeof children !== "string") return children;
  const parts = [];
  let last = 0;
  for (const m of children.matchAll(LATIN)) {
    if (m.index > last) parts.push(children.slice(last, m.index));
    parts.push(<bdi key={m.index} dir="ltr" style={m[0].length <= SHORT ? { whiteSpace: "nowrap" } : undefined}>{m[0]}</bdi>);
    last = m.index + m[0].length;
  }
  if (last < children.length) parts.push(children.slice(last));
  return <>{parts}</>;
}
