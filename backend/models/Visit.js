const mongoose = require("mongoose");

const visitSchema = new mongoose.Schema({
  // ─── Existing OP Fields (DO NOT CHANGE) ───────────────────────────────────
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
  },

  // ─── IP Extension Fields (all optional — backward compatible) ─────────────
  admitted: {
    type: Boolean,
    default: false
  },

  admissionDetails: {
    admissionDate: { type: Date },
    ward: { type: String },        // "ICU" | "General" | "Private"
    roomNumber: { type: String },
    bedNumber: { type: String },
    attendingDoctor: { type: String }
  },

  // IP daily treatments (separate from OP Treatment model)
  ipTreatments: [
    {
      date: { type: Date, default: Date.now },
      codeType: String,   // CPT / CDT / Custom
      code: String,
      description: String,
      cost: { type: Number, default: 0 }
    }
  ],

  // Recurring daily charges (room, nursing, medicine, etc.)
  dailyCharges: [
    {
      chargeType: String,  // "Room" | "ICU" | "Nursing" | "Medicine" | "Other"
      amount: { type: Number, default: 0 },
      date: { type: Date, default: Date.now },
      note: String
    }
  ],

  dischargeDetails: {
    dischargeDate: { type: Date },
    summary: { type: String },
    finalDiagnosis: { type: String },
    discharged: { type: Boolean, default: false }
  }
}, { timestamps: true });

module.exports = mongoose.model("Visit", visitSchema);