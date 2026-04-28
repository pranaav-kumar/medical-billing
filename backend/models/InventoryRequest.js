const mongoose = require("mongoose");

const inventoryRequestSchema = new mongoose.Schema({
  item_name:   { type: String, required: true },
  category:    { type: String, default: "General" },
  quantity:    { type: Number, default: 1 },
  unit:        { type: String, default: "units" },
  reason:      { type: String },
  doctor_name: { type: String },
  doctor_id:   { type: String },
  status:      { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" }
}, { timestamps: true });

module.exports = mongoose.model("InventoryRequest", inventoryRequestSchema);
