const express = require("express");
const router = express.Router();

const Patient = require("../models/Patient");
const Visit = require("../models/Visit");
const Billing = require("../models/Billing");
const Treatment = require("../models/Treatment");
const Diagnosis = require("../models/Diagnosis");
const Claim = require("../models/Claim");
const Appointment = require("../models/Appointment");




// =============================
// 🧍 PATIENT ROUTES
// =============================

// CREATE PATIENT
router.post("/patients", async (req, res) => {
  try {
    const count = await Patient.countDocuments();
    const year = new Date().getFullYear();

    const patientId = `PAT-${year}-${String(count + 1).padStart(4, "0")}`;

    const newPatient = new Patient({
      patient_id: patientId,
      ...req.body
    });

    await newPatient.save();

    res.json({
      message: "Patient created",
      patient: newPatient
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating patient");
  }
});


// GET ALL PATIENTS
router.get("/patients", async (req, res) => {
  try {
    const patients = await Patient.find();
    res.json(patients);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching patients");
  }
});


// =============================
// 🏥 VISIT ROUTES
// =============================

// CREATE VISIT
router.post("/visits", async (req, res) => {
  console.log("VISIT BODY:", req.body);
  try {
    if (!req.body.patient_id) {
      return res.status(400).send("patient_id is required");
    }

    const count = await Visit.countDocuments();
    const year = new Date().getFullYear();

    const visitId = `VIS-${year}-${String(count + 1).padStart(4, "0")}`;

    const newVisit = new Visit({
      visit_id: visitId,
      patient_id: req.body.patient_id
    });

    await newVisit.save();

    // ✅ IMPORTANT FIX
    res.json({
      message: "Visit created",
      visitId: visitId
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating visit");
  }
});


// =============================
// 📜 PATIENT HISTORY
// =============================

router.get("/patient-history/:id", async (req, res) => {
  try {
    const patient = await Patient.findOne({ patient_id: req.params.id });
    const visits = await Visit.find({ patient_id: req.params.id });

    const totalBill = visits.reduce((sum, v) => sum + (v.amount || 0), 0);

    res.json({
      patient,
      visits,
      totalBill
    });

  } catch (err) {
    console.error("HISTORY ERROR:", err);
    res.status(500).send("Error fetching history");
  }
});


// =============================
// 🧾 DIAGNOSIS ROUTES
// =============================

// ADD DIAGNOSIS
router.post("/diagnosis", async (req, res) => {
  try {
    if (!req.body.visit_id) {
      return res.status(400).send("visit_id is required");
    }

    const newDiagnosis = new Diagnosis(req.body);
    await newDiagnosis.save();

    res.json({
      message: "Diagnosis added",
      data: newDiagnosis
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding diagnosis");
  }
});


// GET DIAGNOSIS BY VISIT
router.get("/diagnosis/:visit_id", async (req, res) => {
  try {
    const data = await Diagnosis.find({ visit_id: req.params.visit_id });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching diagnosis");
  }
});


// =============================
// 💉 TREATMENT ROUTES
// =============================

// ADD TREATMENT
router.post("/treatments", async (req, res) => {
  try {
    if (!req.body.visit_id) {
      return res.status(400).send("visit_id is required");
    }

    const newTreatment = new Treatment(req.body);
    await newTreatment.save();

    res.json({
      message: "Treatment added",
      data: newTreatment
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding treatment");
  }
});


// GET TREATMENTS BY VISIT
router.get("/treatments/:visit_id", async (req, res) => {
  try {
    const data = await Treatment.find({ visit_id: req.params.visit_id });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching treatments");
  }
});


// =============================
// 💰 BILLING ROUTES
// =============================

// GENERATE BILL
router.post("/billing/:visit_id", async (req, res) => {
  try {
    const visitId = req.params.visit_id;

    const treatments = await Treatment.find({ visit_id: visitId });

    const total = treatments.reduce((sum, t) => sum + (t.cost || 0), 0);

    const newBill = new Billing({
      visit_id: visitId,
      patient_id: req.body.patient_id,
      total_amount: total,
      status: "Pending"
    });

    await newBill.save();

    res.json({
      message: "Bill generated",
      bill: newBill
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Error generating bill");
  }
});


// GET BILL
router.get("/billing/:visit_id", async (req, res) => {
  try {
    const visitId = req.params.visit_id;

    const visit = await Visit.findOne({ visit_id: visitId });

    if (!visit) {
      return res.status(404).send("Visit not found");
    }

    const patient = await Patient.findOne({
      patient_id: visit.patient_id
    });

    const diagnosis = await Diagnosis.find({ visit_id: visitId });
    const treatments = await Treatment.find({ visit_id: visitId });

    const total = treatments.reduce(
      (sum, t) => sum + (t.cost || 0),
      0
    );

    // ✅ CHECK IF BILL EXISTS
    let bill = await Billing.findOne({ visit_id: visitId });

    // ✅ AUTO CREATE IF NOT EXISTS
    if (!bill) {
      bill = new Billing({
        visit_id: visitId,
        patient_id: visit.patient_id,
        total_amount: total,
        status: "Pending"
      });

      await bill.save();
    }

    res.json({
      bill,
      patient,
      visit,
      diagnosis,
      treatments,
      total
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching invoice");
  }
});


// MARK BILL AS PAID
router.put("/billing/pay/:visit_id", async (req, res) => {
  try {
    await Billing.findOneAndUpdate(
      { visit_id: req.params.visit_id },
      { status: "Paid" }
    );

    res.send("Payment updated");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating payment");
  }
});


// =============================
// 📊 DASHBOARD
// =============================

router.get("/dashboard", async (req, res) => {
  try {
    const patients = await Patient.countDocuments();
    const visits = await Visit.countDocuments();

    const bills = await Billing.find();
    const claims = await Claim.find();
    const appointments = await Appointment.find(); // ✅ NEW

    // 🔹 Total revenue
    const revenue = bills.reduce(
      (sum, b) => sum + (b.total_amount || 0),
      0
    );

    // 🔹 Revenue chart data (last 5)
    const revenueData = bills.slice(-5).map((b, i) => ({
      name: `Bill ${i + 1}`,
      amount: b.total_amount
    }));

    // 🔹 Claims chart
    const claimStats = {
      approved: claims.filter(c => c.status === "Approved").length,
      pending: claims.filter(c => c.status === "Pending").length,
      rejected: claims.filter(c => c.status === "Rejected").length
    };

    // ✅ TODAY APPOINTMENTS
    const today = new Date().toISOString().split("T")[0];

    const todayAppointments = appointments.filter(
      (a) => a.date === today
    ).length;

    // ✅ OP / IP logic
    const op = visits;
    const ip = Math.floor(visits * 0.3);

    // ✅ FINAL RESPONSE (MERGED)
    res.json({
      totalPatients: patients,
      totalVisits: visits,
      totalRevenue: revenue,
      revenueData,      // 📊 chart
      claimStats,       // 📊 chart
      opPatients: op,   // 👨‍⚕️ doctor dashboard
      ipPatients: ip,   // 👨‍⚕️ doctor dashboard
      todayAppointments // 👨‍⚕️ doctor dashboard
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Dashboard error");
  }
});

router.post("/claims/:visit_id", async (req, res) => {
  try {
    const visitId = req.params.visit_id;

    const visit = await Visit.findOne({ visit_id: visitId });

    if (!visit) {
      return res.status(404).send("Visit not found");
    }

    const bill = await Billing.findOne({ visit_id: visitId });

    const count = await Claim.countDocuments();
    const year = new Date().getFullYear();

    const claimId = `CLM-${year}-${String(count + 1).padStart(4, "0")}`;

    const newClaim = new Claim({
      claim_id: claimId,
      visit_id: visitId,
      patient_id: visit.patient_id,
      provider: req.body.provider,
      payer: req.body.payer,
      total_amount: bill?.total_amount || 0
    });

    await newClaim.save();

    res.json(newClaim);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating claim");
  }
});

router.get("/claims", async (req, res) => {
  try {
    const claims = await Claim.find();
    res.json(claims);
  } catch (err) {
    console.error("GET ERROR:", err);
    res.status(500).send("Server Error");
  }
});

// ✅ UPDATE CLAIM STATUS
router.put("/claims/:id", async (req, res) => {
  try {
    const { status } = req.body;

    const updatedClaim = await Claim.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedClaim) {
      return res.status(404).send("Claim not found");
    }

    res.json(updatedClaim);
  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).send("Error updating claim");
  }
});

// =============================
// 📅 APPOINTMENT ROUTES
// =============================

// CREATE APPOINTMENT
router.post("/appointments", async (req, res) => {
  try {
    const newAppointment = new Appointment(req.body);
    await newAppointment.save();

    res.json({
      message: "Appointment created",
      data: newAppointment
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating appointment");
  }
});

// GET ALL APPOINTMENTS
router.get("/appointments", async (req, res) => {
  try {
    const data = await Appointment.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).send("Error fetching appointments");
  }
});







module.exports = router;
