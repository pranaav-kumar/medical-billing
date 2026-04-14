const mongoose = require("mongoose");

const billingSchema = new mongoose.Schema({
  visit_id: String,
  patient_id: String,
  total_amount: Number,
  status: {
    type: String,
    default: "Pending"
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Billing", billingSchema);