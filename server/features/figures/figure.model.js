import mongoose from "mongoose";

const { Schema } = mongoose;

// شخصية من الشخصيات التي شكّلت التاريخ. القصة أقسام {h, p} كبطاقات الوحدة،
// فتُقرأ بالفقرات والاقتباسات والخطوات نفسها. الأنبياء لهم tier «prophet»
// خارج أي ترتيب أثر: يُعرضون ولا يُرتَّبون.
const sectionSchema = new Schema({ h: { type: String, trim: true, required: true }, p: { type: String, trim: true, required: true } }, { _id: false });

// صورة من المشاع العام بعزوها، وسؤال سريع اختياري واحد، وموضع على الخريطة
const imageSchema = new Schema(
  { src: { type: String, trim: true, required: true }, thumb: { type: String, trim: true }, w: Number, h: Number, alt: { type: String, trim: true }, credit: { type: String, trim: true }, license: { type: String, trim: true }, source: { type: String, trim: true } },
  { _id: false },
);
const checkSchema = new Schema(
  { q: { type: String, trim: true, required: true }, opts: { type: [String], required: true }, a: { type: Number, required: true }, why: { type: String, trim: true } },
  { _id: false },
);
const geoSchema = new Schema({ lat: { type: Number, required: true }, lon: { type: Number, required: true }, place: { type: String, trim: true } }, { _id: false });
// الدروس التي تذكر الشخصية، تُحسب عند الزرع من نصوص الوحدات
const unitRefSchema = new Schema({ unitId: { type: String, required: true }, title: { type: String, trim: true } }, { _id: false });

const figureSchema = new Schema(
  {
    figureId: { type: String, required: true, unique: true, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    englishName: { type: String, required: true, trim: true },
    tier: { type: String, enum: ["prophet", "1", "2"], required: true },
    born: { type: String, trim: true, default: "" },
    died: { type: String, trim: true, default: "" },
    era: { type: String, enum: ["القديم", "الوسيط", "الحديث المبكر", "الحديث", "المعاصر"], required: true, index: true },
    region: { type: String, trim: true, default: "" },
    category: { type: String, required: true, index: true },
    hero: { num: { type: String, trim: true }, label: { type: String, trim: true } },
    why: { type: String, trim: true, required: true },
    quick: { type: String, trim: true, required: true },
    story: { type: [sectionSchema], default: [] },
    sources: { type: [String], default: [] },
    image: { type: imageSchema, default: null },
    check: { type: checkSchema, default: null },
    geo: { type: geoSchema, default: null },
    units: { type: [unitRefSchema], default: [] },
    order: { type: Number, default: 0, index: true },
    published: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

figureSchema.index({ name: "text", englishName: "text", why: "text", quick: "text", "story.h": "text", "story.p": "text" }, { name: "figure_text", default_language: "none" });

figureSchema.methods.toPublic = function toPublic() {
  const o = this.toObject({ versionKey: false });
  delete o._id;
  return o;
};

const Figure = mongoose.models.Figure || mongoose.model("Figure", figureSchema);
export default Figure;
