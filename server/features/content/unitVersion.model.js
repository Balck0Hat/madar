import mongoose from "mongoose";

const { Schema } = mongoose;

// لقطة كاملة لوحدة قبل الكتابة فوقها. اللقطة Mixed لأنها نسخة تاريخية:
// لو تغيّر مخطط الوحدة لاحقاً يجب أن تبقى النسخ القديمة قابلة للقراءة كما كُتبت.
// counts مخزّنة (لا محسوبة) لتُعرض القائمة دون تحميل اللقطات الثقيلة.
const unitVersionSchema = new Schema(
  {
    unitId: { type: String, required: true, trim: true, index: true },
    version: { type: Number, required: true, min: 1 },
    snapshot: { type: Schema.Types.Mixed, required: true },
    counts: {
      cards: { type: Number, default: 0 },
      questions: { type: Number, default: 0 },
    },
    editedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    note: { type: String, trim: true, maxlength: 200, default: "" },
  },
  { timestamps: { createdAt: true, updatedAt: false }, minimize: false },
);

// الترتيب التنازلي هو استعلام القائمة الوحيد، والتفرّد يمنع تكرار رقم النسخة
unitVersionSchema.index({ unitId: 1, version: -1 }, { unique: true });

const UnitVersion = mongoose.models.UnitVersion || mongoose.model("UnitVersion", unitVersionSchema);
export default UnitVersion;
