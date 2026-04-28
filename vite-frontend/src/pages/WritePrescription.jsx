import React, { useState, useEffect } from "react";
import API from "../services/api";
import { motion, AnimatePresence } from "framer-motion";

const emptyMed = { name: "", dosage: "", frequency: "", duration: "", notes: "" };

function WritePrescription() {
  const doctor = JSON.parse(localStorage.getItem("user") || "{}");
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({
    patient_id: "",
    visit_id: "",
    doctor_name: doctor.name || "",
    instructions: "",
    medicines: [{ ...emptyMed }]
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    API.get("/api/users/patients-list").then(r => setPatients(r.data)).catch(() => {});
  }, []);

  const setMed = (idx, field, val) => {
    setForm(f => {
      const meds = [...f.medicines];
      meds[idx] = { ...meds[idx], [field]: val };
      return { ...f, medicines: meds };
    });
  };

  const addMed = () => setForm(f => ({ ...f, medicines: [...f.medicines, { ...emptyMed }] }));
  const removeMed = idx => setForm(f => ({ ...f, medicines: f.medicines.filter((_, i) => i !== idx) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patient_id) return alert("Please select a patient");
    setLoading(true);
    try {
      await API.post("/api/prescriptions", form);
      setSaved(true);
      setForm(f => ({ ...f, patient_id: "", visit_id: "", instructions: "", medicines: [{ ...emptyMed }] }));
      setTimeout(() => setSaved(false), 4000);
    } catch {
      alert("Failed to save prescription ❌");
    } finally {
      setLoading(false);
    }
  };

  const inp = {
    width: "100%", padding: "9px 12px", borderRadius: 10,
    border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none",
    background: "#f8faff", boxSizing: "border-box",
    transition: "border-color 0.2s",
  };
  const label = { fontSize: 12, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 5, letterSpacing: "0.04em", textTransform: "uppercase" };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#f0f4ff", minHeight: "100vh", padding: "32px 24px" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#1e293b", margin: 0 }}>💊 Write Prescription</h1>
        <p style={{ color: "#94a3b8", fontSize: 13, marginTop: 6 }}>Prescriptions are automatically saved to the patient's profile</p>
      </motion.div>

      <AnimatePresence>
        {saved && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ background: "linear-gradient(135deg,#dcfce7,#bbf7d0)", border: "1.5px solid #86efac", borderRadius: 12, padding: "14px 20px", marginBottom: 20, color: "#15803d", fontWeight: 700, fontSize: 14 }}>
            ✅ Prescription saved to patient profile!
          </motion.div>
        )}
      </AnimatePresence>

      <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleSubmit}
        style={{ background: "#fff", borderRadius: 20, padding: 32, boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>

        {/* Patient + Visit ID */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
          <div>
            <label style={label}>Patient *</label>
            <select value={form.patient_id} onChange={e => setForm(f => ({ ...f, patient_id: e.target.value }))}
              required style={{ ...inp, cursor: "pointer" }}>
              <option value="">— Select patient —</option>
              {patients.map(p => (
                <option key={p.patient_id} value={p.patient_id}>
                  {p.name} ({p.patient_id})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={label}>Visit ID (optional)</label>
            <input value={form.visit_id} onChange={e => setForm(f => ({ ...f, visit_id: e.target.value }))}
              placeholder="VIS-2025-0001" style={inp} />
          </div>
        </div>

        {/* Medicines */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <label style={{ ...label, margin: 0 }}>Medicines</label>
            <button type="button" onClick={addMed}
              style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              + Add Medicine
            </button>
          </div>

          <AnimatePresence>
            {form.medicines.map((med, idx) => (
              <motion.div key={idx}
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                style={{ background: "#f8faff", borderRadius: 14, padding: "18px 20px", marginBottom: 14, border: "1.5px solid #e2e8f0", position: "relative" }}>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontWeight: 700, color: "#6366f1", fontSize: 13 }}>Medicine #{idx + 1}</span>
                  {form.medicines.length > 1 && (
                    <button type="button" onClick={() => removeMed(idx)}
                      style={{ background: "#fee2e2", color: "#ef4444", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                      Remove
                    </button>
                  )}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={label}>Medicine Name *</label>
                    <input value={med.name} onChange={e => setMed(idx, "name", e.target.value)}
                      placeholder="e.g. Amoxicillin" required style={inp} />
                  </div>
                  <div>
                    <label style={label}>Dosage</label>
                    <input value={med.dosage} onChange={e => setMed(idx, "dosage", e.target.value)}
                      placeholder="e.g. 500mg" style={inp} />
                  </div>
                  <div>
                    <label style={label}>Frequency</label>
                    <input value={med.frequency} onChange={e => setMed(idx, "frequency", e.target.value)}
                      placeholder="e.g. Twice a day" style={inp} />
                  </div>
                  <div>
                    <label style={label}>Duration</label>
                    <input value={med.duration} onChange={e => setMed(idx, "duration", e.target.value)}
                      placeholder="e.g. 7 days" style={inp} />
                  </div>
                </div>
                <div style={{ marginTop: 10 }}>
                  <label style={label}>Notes</label>
                  <input value={med.notes} onChange={e => setMed(idx, "notes", e.target.value)}
                    placeholder="e.g. Take after food" style={inp} />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Instructions */}
        <div style={{ marginBottom: 24 }}>
          <label style={label}>General Instructions</label>
          <textarea value={form.instructions} onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))}
            placeholder="e.g. Drink plenty of water, avoid alcohol..."
            rows={3}
            style={{ ...inp, resize: "vertical" }} />
        </div>

        <button type="submit" disabled={loading}
          style={{ background: loading ? "#94a3b8" : "linear-gradient(135deg,#3b82f6,#6366f1)", color: "#fff", border: "none", borderRadius: 12, padding: "14px 32px", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", width: "100%" }}>
          {loading ? "Saving…" : "💾 Save Prescription to Patient Profile"}
        </button>
      </motion.form>
    </div>
  );
}

export default WritePrescription;
