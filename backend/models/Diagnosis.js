const mongoose = require("mongoose");

const diagnosisSchema = new mongoose.Schema({
  visit_id: String,
  code: String,
  description: String
});

module.exports = mongoose.model("Diagnosis", diagnosisSchema);