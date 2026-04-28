const express = require("express");
const router = express.Router();

const Patient          = require("../models/Patient");
const Visit            = require("../models/Visit");
const Billing          = require("../models/Billing");
const Treatment        = require("../models/Treatment");
const Diagnosis        = require("../models/Diagnosis");
const Claim            = require("../models/Claim");
const Appointment      = require("../models/Appointment");
const Prescription     = require("../models/Prescription");
const Inventory        = require("../models/Inventory");
const InventoryRequest = require("../models/InventoryRequest");
const User             = require("../models/User");




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

    // ✅ Real IP / OP counts from DB
    const ip = await Visit.countDocuments({ admitted: true });
    const op = visits - ip;

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
    const data = await Appointment.find();
    // Sort newest first in JS (Cosmos DB doesn't index createdAt for sort by default)
    data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(data);
  } catch (err) {
    res.status(500).send("Error fetching appointments");
  }
});

// UPDATE APPOINTMENT STATUS
router.put("/appointments/:id", async (req, res) => {
  try {
    const updated = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).send("Error updating appointment");
  }
});


// =============================
// 🛏️  IN-PATIENT (IP) ROUTES
// =============================

// ADMIT PATIENT — POST /api/visits/:visit_id/admit
router.post("/visits/:visit_id/admit", async (req, res) => {
  try {
    const visit = await Visit.findOneAndUpdate(
      { visit_id: req.params.visit_id },
      {
        admitted: true,
        admissionDetails: {
          admissionDate: req.body.admissionDate || new Date(),
          ward: req.body.ward,
          roomNumber: req.body.roomNumber,
          bedNumber: req.body.bedNumber,
          attendingDoctor: req.body.attendingDoctor
        }
      },
      { new: true }
    );

    if (!visit) return res.status(404).send("Visit not found");

    res.json({ message: "Patient admitted", visit });
  } catch (err) {
    console.error("ADMIT ERROR:", err);
    res.status(500).send("Error admitting patient");
  }
});


// ADD IP TREATMENT — POST /api/visits/:visit_id/ip-treatments
router.post("/visits/:visit_id/ip-treatments", async (req, res) => {
  try {
    const visit = await Visit.findOne({ visit_id: req.params.visit_id });
    if (!visit) return res.status(404).send("Visit not found");

    visit.ipTreatments.push({
      date: req.body.date || new Date(),
      codeType: req.body.codeType,
      code: req.body.code,
      description: req.body.description,
      cost: Number(req.body.cost) || 0
    });

    await visit.save();
    res.json({ message: "IP treatment added", ipTreatments: visit.ipTreatments });
  } catch (err) {
    console.error("IP TREATMENT ERROR:", err);
    res.status(500).send("Error adding IP treatment");
  }
});


// ADD DAILY CHARGE — POST /api/visits/:visit_id/daily-charges
router.post("/visits/:visit_id/daily-charges", async (req, res) => {
  try {
    const visit = await Visit.findOne({ visit_id: req.params.visit_id });
    if (!visit) return res.status(404).send("Visit not found");

    visit.dailyCharges.push({
      chargeType: req.body.chargeType,
      amount: Number(req.body.amount) || 0,
      date: req.body.date || new Date(),
      note: req.body.note || ""
    });

    await visit.save();
    res.json({ message: "Daily charge added", dailyCharges: visit.dailyCharges });
  } catch (err) {
    console.error("DAILY CHARGE ERROR:", err);
    res.status(500).send("Error adding daily charge");
  }
});


// DISCHARGE PATIENT — POST /api/visits/:visit_id/discharge
router.post("/visits/:visit_id/discharge", async (req, res) => {
  try {
    const visit = await Visit.findOneAndUpdate(
      { visit_id: req.params.visit_id },
      {
        dischargeDetails: {
          dischargeDate: req.body.dischargeDate || new Date(),
          summary: req.body.summary,
          finalDiagnosis: req.body.finalDiagnosis,
          discharged: true
        }
      },
      { new: true }
    );

    if (!visit) return res.status(404).send("Visit not found");

    // Recalculate total = IP treatments + daily charges
    const treatTotal = (visit.ipTreatments || []).reduce((s, t) => s + (t.cost || 0), 0);
    const chargeTotal = (visit.dailyCharges || []).reduce((s, c) => s + (c.amount || 0), 0);
    const grandTotal = treatTotal + chargeTotal;

    // Update or create billing record
    let bill = await Billing.findOne({ visit_id: visit.visit_id });
    if (bill) {
      bill.total_amount = grandTotal;
      await bill.save();
    } else {
      bill = new Billing({
        visit_id: visit.visit_id,
        patient_id: visit.patient_id,
        total_amount: grandTotal,
        status: "Pending"
      });
      await bill.save();
    }

    res.json({ message: "Patient discharged", visit, bill });
  } catch (err) {
    console.error("DISCHARGE ERROR:", err);
    res.status(500).send("Error discharging patient");
  }
});


// GET SINGLE VISIT DETAIL — GET /api/visits/:visit_id
router.get("/visits/:visit_id", async (req, res) => {
  try {
    const visit = await Visit.findOne({ visit_id: req.params.visit_id });
    if (!visit) return res.status(404).send("Visit not found");

    const patient = await Patient.findOne({ patient_id: visit.patient_id });
    const diagnosis = await Diagnosis.find({ visit_id: visit.visit_id });
    const treatments = await Treatment.find({ visit_id: visit.visit_id });
    const bill = await Billing.findOne({ visit_id: visit.visit_id });

    res.json({ visit, patient, diagnosis, treatments, bill });
  } catch (err) {
    console.error("VISIT DETAIL ERROR:", err);
    res.status(500).send("Error fetching visit detail");
  }
});


// GET ALL ADMITTED (IP) PATIENTS — GET /api/ip-patients
router.get("/ip-patients", async (req, res) => {
  try {
    // Note: Cosmos DB doesn't index nested paths by default, so we sort in JS
    const ipVisits = await Visit.find({
      admitted: true,
      "dischargeDetails.discharged": { $ne: true }
    });

    // Enrich with patient info
    const enriched = await Promise.all(
      ipVisits.map(async (v) => {
        const patient = await Patient.findOne({ patient_id: v.patient_id });
        return { visit: v, patient };
      })
    );

    // Sort newest admission first (in JS — avoids Cosmos DB index requirement)
    enriched.sort((a, b) => {
      const dateA = a.visit?.admissionDetails?.admissionDate ? new Date(a.visit.admissionDetails.admissionDate) : 0;
      const dateB = b.visit?.admissionDetails?.admissionDate ? new Date(b.visit.admissionDetails.admissionDate) : 0;
      return dateB - dateA;
    });

    res.json(enriched);
  } catch (err) {
    console.error("IP PATIENTS ERROR:", err);
    res.status(500).send("Error fetching IP patients");
  }
});


// =============================
// 💊 PRESCRIPTION ROUTES
// =============================

// POST /api/prescriptions — doctor saves prescription
router.post("/prescriptions", async (req, res) => {
  try {
    const rx = new Prescription(req.body);
    await rx.save();
    res.json({ message: "Prescription saved", data: rx });
  } catch (err) {
    console.error("RX ERROR:", err);
    res.status(500).send("Error saving prescription");
  }
});

// GET /api/prescriptions/patient/:patient_id — patient/doctor fetches prescriptions
router.get("/prescriptions/patient/:patient_id", async (req, res) => {
  try {
    const data = await Prescription.find({ patient_id: req.params.patient_id });
    data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching prescriptions");
  }
});

// GET /api/prescriptions/visit/:visit_id
router.get("/prescriptions/visit/:visit_id", async (req, res) => {
  try {
    const data = await Prescription.find({ visit_id: req.params.visit_id });
    data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(data);
  } catch (err) {
    res.status(500).send("Error fetching prescriptions");
  }
});


// =============================
// 📦 INVENTORY ROUTES (Admin)
// =============================

// GET /api/inventory
router.get("/inventory", async (req, res) => {
  try {
    const items = await Inventory.find();
    items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(items);
  } catch (err) {
    res.status(500).send("Error fetching inventory");
  }
});

// POST /api/inventory — admin adds item
router.post("/inventory", async (req, res) => {
  try {
    const item = new Inventory(req.body);
    await item.save();
    res.json({ message: "Item added", item });
  } catch (err) {
    res.status(500).send("Error adding item");
  }
});

// PUT /api/inventory/:id — admin updates item
router.put("/inventory/:id", async (req, res) => {
  try {
    const updated = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).send("Item not found");
    res.json(updated);
  } catch (err) {
    res.status(500).send("Error updating item");
  }
});

// DELETE /api/inventory/:id — admin removes item
router.delete("/inventory/:id", async (req, res) => {
  try {
    await Inventory.findByIdAndDelete(req.params.id);
    res.json({ message: "Item deleted" });
  } catch (err) {
    res.status(500).send("Error deleting item");
  }
});


// =============================
// 📋 INVENTORY REQUESTS (Doctor → Admin)
// =============================

// POST /api/inventory-requests — doctor submits request
router.post("/inventory-requests", async (req, res) => {
  try {
    const request = new InventoryRequest(req.body);
    await request.save();
    res.json({ message: "Request submitted", data: request });
  } catch (err) {
    res.status(500).send("Error submitting request");
  }
});

// GET /api/inventory-requests — admin/doctor views all requests
router.get("/inventory-requests", async (req, res) => {
  try {
    const requests = await InventoryRequest.find();
    requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(requests);
  } catch (err) {
    res.status(500).send("Error fetching requests");
  }
});

// PUT /api/inventory-requests/:id/approve — admin approves, auto-adds to inventory
router.put("/inventory-requests/:id/approve", async (req, res) => {
  try {
    const request = await InventoryRequest.findByIdAndUpdate(
      req.params.id,
      { status: "Approved" },
      { new: true }
    );
    if (!request) return res.status(404).send("Request not found");

    // Auto-add to inventory
    const newItem = new Inventory({
      name:     request.item_name,
      category: request.category,
      quantity: request.quantity,
      unit:     request.unit,
      notes:    request.reason
    });
    await newItem.save();

    res.json({ message: "Approved and added to inventory", request, item: newItem });
  } catch (err) {
    console.error("APPROVE ERR:", err);
    res.status(500).send("Error approving request");
  }
});

// PUT /api/inventory-requests/:id/reject — admin rejects
router.put("/inventory-requests/:id/reject", async (req, res) => {
  try {
    const request = await InventoryRequest.findByIdAndUpdate(
      req.params.id,
      { status: "Rejected" },
      { new: true }
    );
    res.json({ message: "Request rejected", request });
  } catch (err) {
    res.status(500).send("Error rejecting request");
  }
});


// =============================
// 🧍 PATIENT DASHBOARD DATA
// =============================
router.get("/patient-dashboard/:email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.status(404).send("User not found");

    if (!user.patient_id) {
      return res.json({ status: "unlinked" });
    }

    const patient = await Patient.findOne({ patient_id: user.patient_id });
    if (!patient) return res.status(404).send("Linked patient record not found");

    const appointments = await Appointment.find({ patient_id: patient.patient_id });
    appointments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    let visits = await Visit.find({ patient_id: patient.patient_id });
    visits.sort((a, b) => new Date(b.visit_date) - new Date(a.visit_date));
    visits = visits.slice(0, 5);

    const bills = await Billing.find({ patient_id: patient.patient_id });
    bills.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const prescriptions = await Prescription.find({ patient_id: patient.patient_id });
    prescriptions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ status: "linked", patient, appointments, visits, bills, prescriptions });
  } catch (err) {
    console.error("Patient Dashboard ERR:", err);
    res.status(500).send("Error fetching dashboard data");
  }
});


module.exports = router;
