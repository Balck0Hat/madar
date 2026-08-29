import mongoose from "mongoose";

const { Schema } = mongoose;

const cardSchema = new Schema({ h: { type: String, trim: true }, p: { type: String, trim: true }, art: { type: String, default: "wheel" }, img: String }, { _id: false });

const questionSchema = new Schema(
  {
    qid: { type: String, required: true },
    t: { type: String, enum: ["mcq", "tf", "fill", "order", "open"], required: true },
    q: { type: String, required: true, trim: true },
    opts: [String],
    items: [String],
    a: { type: Schema.Types.Mixed },
    why: { type: String, trim: true },
    keywords: [String],
    // محجوز للامتحان: لا يظهر في اختبارات الوحدات، فيبقى الامتحان قياساً لما لم يُتمرَّن عليه
    examOnly: { type: Boolean },
  },
  { _id: false },
);

const threadSchema = new Schema({ to: String, text: String, q: String, opts: [String], a: Number, why: String }, { _id: false });

// وحدة تعليمية كاملة: البطاقات والخيط وبنك الأسئلة
const unitSchema = new Schema(
  {
    unitId: { type: String, required: true, unique: true, index: true, trim: true },
    title: { type: String, required: true, trim: true },
    hero: { num: String, label: String },
    spark: { type: String, trim: true },
    goals: [String],
    cards: [cardSchema],
    tryIt: { title: String, text: String },
    deep: { title: String, why: String },
    thread: threadSchema,
    summary: [String],
    questions: [questionSchema],
    published: { type: Boolean, default: false, index: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

// فهرس نصي للبحث؛ default_language "none" لأن تجذيع مونغو لا يدعم العربية
// (البحث الأساسي بـregex لالتقاط الأجزاء، وهذا الفهرس يلتقط الكلمات المتفرقة)
unitSchema.index(
  { title: "text", spark: "text", "cards.h": "text", "cards.p": "text", summary: "text" },
  { name: "unit_text", default_language: "none", weights: { title: 10, "cards.h": 4, summary: 3, spark: 2, "cards.p": 1 } },
);

// الأسئلة المعروضة للمتعلم لا تحمل الكلمات المفتاحية.
// وأسئلة examOnly تُحجب هنا كلياً: هذا المسار يعيد الإجابات مع الأسئلة، فلو مرّت
// لأمكن قراءة بنك الامتحان كاملاً من نقطة الوحدة قبل دخوله.
unitSchema.methods.toPublic = function toPublic() {
  const o = this.toObject({ versionKey: false });
  delete o._id;
  delete o.updatedBy;
  o.questions = (o.questions || []).filter((q) => q.examOnly !== true).map(({ keywords, examOnly, ...q }) => q);
  return o;
};

const Unit = mongoose.models.Unit || mongoose.model("Unit", unitSchema);
export default Unit;
