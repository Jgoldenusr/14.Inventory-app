const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ItemSchema = new Schema({
  name: { type: String, maxLength: 30, required: true },
  description: { type: String, required: true },
  inStock: { type: Number, min: 0, required: true },
  category: [{ type: Schema.Types.ObjectId, ref: "Category", required: true }],
  price: { type: Schema.Types.Decimal128, min: 0, required: true },
});

ItemSchema.virtual("url").get(function () {
  return `/inventory/item/${this._id}`;
});

// Export model
module.exports = mongoose.model("Item", ItemSchema);
