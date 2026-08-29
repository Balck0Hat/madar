// نقاط الوحدات غير المكتملة. النجوم الذهبية للمكتملة تبقى في WheelBody كما هي،
// وهنا نضيف ما كان غائباً: علامة لكل وحدة متاحة لم تُقرأ بعد، وأثر باهت للمقفلة.
// بهذا تصير العجلة خريطة كاملة للشجرة لا سجلّ إنجاز فقط.
export default function UnitDots({ units, recommended, p }) {
  return (
    <g aria-hidden="true" pointerEvents="none">
      {units.map((u) => {
        if (u.center || u.done) return null;
        if (u.locked) return <circle key={u.id} cx={u.x} cy={u.y} r="1.5" fill={p.text} fillOpacity="0.1" />;
        // الوحدة الموصى بها تنبض ذهباً: العين تصل إلى «التالي» قبل أن تقرأ البطاقة
        const rec = recommended === u.id;
        return (
          <circle
            key={u.id}
            className={rec ? "madar-pulse" : undefined}
            cx={u.x}
            cy={u.y}
            r={rec ? 2.6 : 2}
            fill="none"
            stroke={rec ? p.gold : p.text}
            strokeOpacity={rec ? 1 : 0.42}
            strokeWidth={rec ? 1.4 : 0.9}
          />
        );
      })}
    </g>
  );
}
