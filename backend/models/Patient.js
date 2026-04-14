const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
  patient_id: String,
  name: String,
  age: Number,
  gender: String,
  phone: String
});

module.exports = mongoose.model("Patient", patientSchema);