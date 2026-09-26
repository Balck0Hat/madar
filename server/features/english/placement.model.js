import mongoose from "mongoose";

const { Schema } = mongoose;

// جلسة اختبار مستوى: تتقدّم على مراحل (قواعد ← قراءة ← استماع ← كتابة ← نتيجة).
// تُحفظ كل إجابة بمستوى سؤالها، فالتقدير يُعاد حسابه من السجل لا من عدّاد.
// choice: فهرس الخيار، أو النص المكتوب في أسئلة الفراغ. startedAt: بدء مؤقّت الجزء.
const answerSchema = new Schema({ itemId: String, level: String, correct: Boolean, choice: Schema.Types.Mixed, timedOut: Boolean }, { _id: false });
const partSchema = new Schema({ ids: { type: [String], default: [] }, answers: { type: [answerSchema], default: [] }, startedAt: Date }, { _id: false });
const writingSchema = new Schema(
  { promptId: String, text: String, status: { type: String, enum: ["none", "pending", "done", "failed", "skipped"], default: "none" }, cefr: String, ielts: Number, summary: String, corrections: { type: [{ quote: String, fix: String, note: String }], default: [] }, advice: { type: [String], default: [] } },
  { _id: false },
);

const placementSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    stage: { type: String, enum: ["grammar", "reading", "listening", "writing", "done"], default: "grammar", index: true },
    startLevel: { type: String, default: "B1" }, // بداية السلّم: مستوى آخر نتيجة إن وُجدت
    grammar: { type: partSchema, default: () => ({ startedAt: new Date() }) },
    reading: { type: partSchema, default: () => ({}) },
    listening: { type: partSchema, default: () => ({}) },
    writing: { type: writingSchema, default: () => ({}) },
    result: { type: Schema.Types.Mixed, default: null },
    finishedAt: Date,
  },
  { timestamps: true },
);

const Placement = mongoose.models.Placement || mongoose.model("Placement", placementSchema);
export default Placement;
