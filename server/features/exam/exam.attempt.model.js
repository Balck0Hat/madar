import mongoose from "mongoose";

// أثر آخر محاولة امتحان لكل متعلم.
// لماذا وثيقة لا ذاكرة: فترة التبريد (30 يوماً) يجب أن تنجو من إعادة تشغيل الخادم،
// وإلا صار تجاوزها بانتظار نشرة جديدة.
const examAttemptSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    lastAttemptAt: { type: Date, default: Date.now },
    attempts: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const ExamAttempt = mongoose.models.ExamAttempt || mongoose.model("ExamAttempt", examAttemptSchema);
export default ExamAttempt;
