const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  patient_id: String,
  doctor_name: String,
  date: String, // format: YYYY-MM-DD
  time: String,
  status: {
    type: String,
    default: "Scheduled"
  }
}, { timestamps: true });

module.exports = mongoose.model("Appointment", appointmentSchema);