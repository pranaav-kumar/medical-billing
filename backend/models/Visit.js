const mongoose = require("mongoose");

const visitSchema = new mongoose.Schema({
  visit_id: String,
  patient_id: String,
  diagnosis: String,
  treatment: String,
  amount: Number,
  doctor: String,
  department: String,
  symptoms: String,
  visit_date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Visit", visitSchema);