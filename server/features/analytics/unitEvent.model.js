import mongoose from "mongoose";

export const EVENT_KINDS = ["open", "page", "quiz_start", "finish"];

// أثر خفيف لرحلة المتعلم داخل الوحدة: نعرف أين يفتح وأين يقف، لا ماذا أجاب
// (سجل إلحاقي فقط: لا updatedAt لأن الحدث لا يُعدَّل بعد كتابته)
const unitEventSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    unitId: { type: String, required: true },
    kind: { type: String, enum: EVENT_KINDS, required: [true, "نوع حدث غير معروف"] },
    // رقم البطاقة لأحداث "page" وحدها؛ يبقى صفراً لغيرها كي يعمل $max بلا شروط إضافية
    page: { type: Number, default: 0, min: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

// كتم التكرار: البحث عن نفس (مستخدم، وحدة، صفحة) في الدقيقة الأخيرة
unitEventSchema.index({ user: 1, unitId: 1, kind: 1, page: 1, createdAt: -1 });
// تجميع القمع: مسح أحداث وحدة داخل نافذة زمنية
unitEventSchema.index({ unitId: 1, createdAt: -1 });

const UnitEvent = mongoose.models.UnitEvent || mongoose.model("UnitEvent", unitEventSchema);
export default UnitEvent;
