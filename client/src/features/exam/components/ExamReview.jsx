import { C, T, R, S } from "../../../shared/constants/theme";
import { Btn } from "../../../shared/components/ui";

// شبكة المراجعة قبل التسليم: كل سؤال مربّع، والفارغ ظاهر بلونه.
// لم يكن في الامتحان رجوع ولا مراجعة — أربعون سؤالاً في اتجاه واحد،
// مرة كل ثلاثين يوماً، بلا فرصة لتصحيح إجابة أو رؤية ما تُرك.
export default function ExamReview({ questions, answers, keyOf, onJump, onSubmit, busy }) {
  const blank = questions.filter((q) => {
    const v = answers[keyOf(q)];
    return v === null || v === undefined || v === "";
  }).length;
  return (
    <div style={{ display: "grid", gap: S.x4 }}>
      <div>
        <div style={{ fontWeight: 700, fontSize: T.x2 }}>راجع قبل التسليم</div>
        <div style={{ color: blank ? C.red : C.muted, fontSize: T.md, marginTop: S.md, lineHeight: 1.7 }}>
          {blank ? `${blank} سؤالاً بلا إجابة. اضغط أي رقم للعودة إليه.` : "أجبت عن كل الأسئلة. اضغط أي رقم لمراجعته."}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(44px, 1fr))", gap: S.lg }}>
        {questions.map((q, k) => {
          const done = ![null, undefined, ""].includes(answers[keyOf(q)]);
          return (
            <button
              key={keyOf(q)} type="button" onClick={() => onJump(k)}
              aria-label={`السؤال ${k + 1}${done ? " — مُجاب" : " — بلا إجابة"}`}
              style={{
                minHeight: 44, borderRadius: R.lg, cursor: "pointer", fontFamily: "inherit",
                fontWeight: 700, fontSize: T.md,
                background: done ? C.surface2 : "transparent",
                color: done ? C.text : C.red,
                border: `1px solid ${done ? C.line : C.red}`,
              }}
            >
              {k + 1}
            </button>
          );
        })}
      </div>
      <Btn primary disabled={busy} onClick={onSubmit}>{busy ? "يُصحَّح..." : "سلّم الامتحان"}</Btn>
    </div>
  );
}
