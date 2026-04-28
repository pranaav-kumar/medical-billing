const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema({
  patient_id:      { type: String, required: true },
  visit_id:        { type: String },
  doctor_name:     { type: String },
  medicines: [
    {
      name:      { type: String },
      dosage:    { type: String },   // e.g. "500mg"
      frequency: { type: String },   // e.g. "Twice a day"
      duration:  { type: String },   // e.g. "7 days"
      notes:     { type: String }
    }
  ],
  instructions:    { type: String },
  date:            { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("Prescription", prescriptionSchema);
