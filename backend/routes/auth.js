const express = require("express");
const router = express.Router();
const User    = require("../models/User");
const Patient = require("../models/Patient");

// ─── REGISTER (generic — existing, kept for compatibility) ────────────────────
router.post("/register", async (req, res) => {
  try {
    const existing = await User.findOne({ email: req.body.email });
    if (existing) return res.status(400).json({ msg: "Email already in use" });

    const user = new User(req.body);
    await user.save();
    res.json({ message: "User registered", user });
  } catch (err) {
    res.status(500).send("Error registering");
  }
});

// ─── REGISTER DOCTOR ──────────────────────────────────────────────────────────
router.post("/register/doctor", async (req, res) => {
  try {
    const { name, email, password, specialization } = req.body;
    if (!name || !email || !password) return res.status(400).json({ msg: "All fields required" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: "Email already registered" });

    const user = new User({ name, email, password, role: "doctor", specialization });
    await user.save();
    res.json({ message: "Doctor registered successfully", user });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error registering doctor");
  }
});

// ─── REGISTER PATIENT ─────────────────────────────────────────────────────────
// Creates a User (role=patient) AND a Patient record, links them by patient_id
router.post("/register/patient", async (req, res) => {
  try {
    const { name, email, password, age, gender, phone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ msg: "All fields required" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: "Email already registered" });

    // Auto-generate patient_id
    const count = await Patient.countDocuments();
    const year  = new Date().getFullYear();
    const patient_id = `PAT-${year}-${String(count + 1).padStart(4, "0")}`;

    // Create Patient record
    const patient = new Patient({ patient_id, name, age: Number(age), gender, phone });
    await patient.save();

    // Create User with patient_id stored for easy linking
    const user = new User({ name, email, password, role: "patient", patient_id });
    await user.save();

    res.json({ message: "Patient registered successfully", user, patient });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error registering patient");
  }
});

// ─── LOGIN ────────────────────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ msg: "Email & Password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });
    if (user.password !== password) return res.status(400).json({ msg: "Invalid password" });

    res.json({ msg: "Login success", user });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).send("Server error");
  }
});

// ─── GET ALL DOCTORS (for appointment booking dropdown) ───────────────────────
router.get("/users/doctors", async (req, res) => {
  try {
    const doctors = await User.find({ role: "doctor" }, "name email specialization _id");
    res.json(doctors);
  } catch (err) {
    res.status(500).send("Error fetching doctors");
  }
});

// ─── GET ALL PATIENTS (for admin/doctor dropdowns) ────────────────────────────
router.get("/users/patients-list", async (req, res) => {
  try {
    const patients = await Patient.find({}, "patient_id name age gender phone");
    res.json(patients);
  } catch (err) {
    res.status(500).send("Error fetching patients");
  }
});

module.exports = router;