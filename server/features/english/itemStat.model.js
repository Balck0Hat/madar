import mongoose from "mongoose";

const { Schema } = mongoose;

// إحصاء كل سؤال: كم مرة سُئل وكم مرة أُجيب صحيحاً. منه تُعاير مستويات الأسئلة:
// سؤال «B1» يخطئ فيه الجميع يُرفع إلى B2، وسؤال «B2» يصيبه الجميع يُنزَل إلى B1.
const itemStatSchema = new Schema(
  {
    itemId: { type: String, required: true, unique: true },
    level: { type: String, required: true }, // مستوى المؤلّف
    asked: { type: Number, default: 0 },
    correct: { type: Number, default: 0 },
    override: { type: String, default: null }, // المستوى المعاير إن اختلف
  },
  { timestamps: true },
);

const ItemStat = mongoose.models.ItemStat || mongoose.model("ItemStat", itemStatSchema);
export default ItemStat;
