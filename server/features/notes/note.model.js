import mongoose from "mongoose";

// ألوان التظليل محدودة عمداً: القارئ يميّز بها الأنواع دون منتقي ألوان معقّد
export const NOTE_COLORS = ["gold", "green", "rose"];

// تظليل داخل درس: النص المقتبس كما قرأه صاحبه + ملاحظة اختيارية عليه.
// نخزّن النص نفسه لا موضعه، لأن محتوى الوحدة قد يُحرَّر لاحقاً من لوحة المشرف؛
// المطابقة عند العرض تكون بالبحث عن النص، وإن اختفى نتجاهل التظليل بصمت.
const noteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    unitId: { type: String, required: [true, "الوحدة مطلوبة"], trim: true },
    page: { type: Number, required: true, min: 0, default: 0 },
    text: { type: String, required: [true, "النص المظلَّل مطلوب"], trim: true, maxlength: 600 },
    note: { type: String, trim: true, maxlength: 500, default: "" },
    color: { type: String, enum: NOTE_COLORS, default: "gold" },
  },
  { timestamps: true },
);

// الاستعلام الأكثر تكراراً: تظليلات مستخدم داخل وحدة (تُقرأ مع كل فتح للدرس)
noteSchema.index({ user: 1, unitId: 1 });
// قائمة «تظليلاتي» في المكتبة: الأحدث أولاً
noteSchema.index({ user: 1, createdAt: -1 });

const Note = mongoose.models.Note || mongoose.model("Note", noteSchema);
export default Note;
