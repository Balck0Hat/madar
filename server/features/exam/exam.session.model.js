import mongoose from "mongoose";

// المحاولة الجارية: الأسئلة المسحوبة وإجاباتها حتى اللحظة.
//
// لماذا وثيقة لا Map في الذاكرة: كانت المحاولة تعيش في ذاكرة العملية، فأي
// إعادة تشغيل — ومنها كل نشر — تمحوها. والتبريد مسجَّل من لحظة البدء، فيخسر
// المتعلّم محاولته ثلاثين يوماً بلا ذنب. ولأن الإجابات لم تكن تُحفظ إلا عند
// التسليم النهائي، كان إغلاق اللسان أو نفاد البطارية يضيّع أربعين إجابة.
const answerSchema = new mongoose.Schema(
  { unitId: { type: String, required: true }, qid: { type: String, required: true }, answer: mongoose.Schema.Types.Mixed },
  { _id: false },
);

const examSessionSchema = new mongoose.Schema(
  {
    // محاولة حيّة واحدة لكل متعلّم: الاستئناف يعود إليها بدل أن يفتح ثانية
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    attemptId: { type: String, required: true, index: true },
    // الأسئلة كاملة بمفاتيحها: التصحيح يجري على النسخة المعروضة بعد خلط الخيارات
    questions: { type: [mongoose.Schema.Types.Mixed], required: true },
    answers: { type: [answerSchema], default: [] },
    startedAt: { type: Date, default: Date.now },
    deadline: { type: Date, required: true },
    submittedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// تنظيف تلقائي بعد المهلة بيوم: الوثيقة لا قيمة لها بعد التصحيح،
// والمهلة نفسها تُفحص في الخدمة فلا نعتمد على دقة توقيت الحذف.
examSessionSchema.index({ deadline: 1 }, { expireAfterSeconds: 24 * 60 * 60 });

const ExamSession = mongoose.models.ExamSession || mongoose.model("ExamSession", examSessionSchema);
export default ExamSession;
