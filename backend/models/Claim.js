const mongoose = require("mongoose");

const ClaimSchema = new mongoose.Schema({
  claim_id: String,
  visit_id: String,
  patient_id: String,

  provider: String,     // hospital/doctor
  payer: String,        // insurance company

  total_amount: Number,
  status: {
    type: String,
    default: "Pending" // Pending | Approved | Rejected
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Claim", ClaimSchema);