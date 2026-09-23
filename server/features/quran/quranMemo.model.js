import mongoose from "mongoose";

const { Schema } = mongoose;

// حفظ القرآن لكل مستخدم: هدف واحد (سورة أو جزء أو صفحات) وجرعة يومية، وحالة
// كل آية في جدول المراجعة: المرحلة، وموعد الرجوع، وعدد المرات والزلّات.
// مفتاح الآية «سورة:آية». وثيقة واحدة لكل مستخدم.
const itemSchema = new Schema(
  { stage: { type: Number, default: 0 }, due: { type: Date, required: true }, reps: { type: Number, default: 0 }, lapses: { type: Number, default: 0 }, last: { type: Date } },
  { _id: false },
);

const goalSchema = new Schema(
  { kind: { type: String, enum: ["sura", "juz", "page"], required: true }, from: { type: Number, required: true }, to: { type: Number, required: true }, perDay: { type: Number, default: 3, min: 1, max: 30 } },
  { _id: false },
);

const quranMemoSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    goal: { type: goalSchema, default: null },
    items: { type: Map, of: itemSchema, default: () => new Map() },
    sessions: { type: [{ at: Date, with: String, ayahs: Number }], default: [] }, // تسميع لشيخ أو صاحب، سجلّ يدوي
  },
  { timestamps: true },
);

const QuranMemo = mongoose.models.QuranMemo || mongoose.model("QuranMemo", quranMemoSchema);
export default QuranMemo;
