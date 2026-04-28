const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema({
  name:       { type: String, required: true },
  category:   { type: String, default: "General" }, // Medicine, Equipment, Consumable, General
  quantity:   { type: Number, default: 0 },
  unit:       { type: String, default: "units" },   // tablets, bottles, pieces, etc.
  minStock:   { type: Number, default: 10 },        // alert threshold
  supplier:   { type: String },
  notes:      { type: String }
}, { timestamps: true });

module.exports = mongoose.model("Inventory", inventorySchema);
