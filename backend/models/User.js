const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name:           String,
  email:          { type: String, unique: true },
  password:       String,
  role:           { type: String, enum: ["admin", "doctor", "patient"] },
  // Doctor-specific
  specialization: { type: String, default: "" },
  // Patient-specific (links to Patient collection)
  patient_id:     { type: String, default: "" },
});

module.exports = mongoose.model("User", userSchema);