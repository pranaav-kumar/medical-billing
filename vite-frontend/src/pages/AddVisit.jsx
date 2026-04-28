import { useState, useEffect } from "react";
import API from "../services/api";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";

const pageVariant = {
  hidden:  { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

const WARD_STYLES = {
  ICU:     { border: "#ef4444", active: "#fee2e2", text: "#b91c1c" },
  General: { border: "#3b82f6", active: "#dbeafe", text: "#1d4ed8" },
  Private: { border: "#22c55e", active: "#dcfce7", text: "#15803d" },
};

function AddVisit() {
  const { id } = useParams();

  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({
    patient_id: id || "",
    diagnosis_code: "",
    diagnosis_desc: "",
    treatment_code: "",
    treatment_desc: "",
    cost: ""
  });

  // ─── IP admission fields ────────────────────────────────────────────────────
  const [admitted, setAdmitted] = useState(false);
  const [admForm, setAdmForm] = useState({
    admissionDate:   new Date().toISOString().slice(0, 10),
    ward:            "General",
    roomNumber:      "",
    bedNumber:       "",
    attendingDoctor: "",
  });

  useEffect(() => {
    fetchPatients();
    // If URL param given, pre-select
    if (id) setForm(prev => ({ ...prev, patient_id: id }));
  }, [id]);

  const fetchPatients = async () => {
    try {
      const res = await API.get("/api/users/patients-list");
      setPatients(res.data);
    } catch (err) { console.error(err); }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 🔹 1. CREATE VISIT
      const visitRes = await API.post("/api/visits", { patient_id: form.patient_id });
      const visit_id = visitRes.data.visitId;

      // 🔹 2. ADD DIAGNOSIS (ICD)
      await API.post("/api/diagnosis", {
        visit_id,
        code: form.diagnosis_code,
        description: form.diagnosis_desc
      });

      // 🔹 3. ADD TREATMENT (CPT)
      await API.post("/api/treatments", {
        visit_id,
        code: form.treatment_code,
        description: form.treatment_desc,
        cost: Number(form.cost)
      });

      // 🔹 4. If admitted → call admit route
      if (admitted) {
        await API.post(`/api/visits/${visit_id}/admit`, admForm);
      }

      alert(`Visit created successfully ✅${admitted ? " — Patient admitted!" : ""}`);

      setForm({
        patient_id: form.patient_id,
        diagnosis_code: "",
        diagnosis_desc: "",
        treatment_code: "",
        treatment_desc: "",
        cost: ""
      });
      setAdmitted(false);

    } catch (err) {
      console.error(err);
      alert("Error adding visit ❌");
    }
  };

  return (
    <motion.div
      variants={pageVariant}
      initial="hidden"
      animate="visible"
      className="flex justify-center mt-10"
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-lg space-y-4"
      >
        <h2 className="text-2xl font-bold text-gray-700 text-center">
          Add Visit
        </h2>

        {/* 🧑‍⚕️ PATIENT DROPDOWN */}
        <div style={{ marginBottom: 2 }}>
          <label style={{ fontWeight: 600, color: "#374151", fontSize: 14, display: "block", marginBottom: 6 }}>Patient</label>
          <select
            value={form.patient_id}
            onChange={e => setForm({ ...form, patient_id: e.target.value })}
            className="border p-2 w-full rounded bg-white text-sm"
            required
          >
            <option value="">— Select patient —</option>
            {patients.map(p => (
              <option key={p.patient_id} value={p.patient_id}>
                {p.patient_id} · {p.name} ({p.age}y, {p.gender})
              </option>
            ))}
            {patients.length === 0 && <option disabled>No registered patients yet</option>}
          </select>
        </div>

        {/* 🧾 DIAGNOSIS */}
        <h3 className="font-semibold text-gray-600">Diagnosis (ICD)</h3>

        <input
          name="diagnosis_code"
          placeholder="ICD Code (e.g. A01)"
          className="border p-2 w-full rounded"
          value={form.diagnosis_code}
          onChange={handleChange}
        />

        <input
          name="diagnosis_desc"
          placeholder="Diagnosis Description"
          className="border p-2 w-full rounded"
          value={form.diagnosis_desc}
          onChange={handleChange}
        />

        {/* 💉 TREATMENT */}
        <h3 className="font-semibold text-gray-600">Treatment (CPT)</h3>

        <input
          name="treatment_code"
          placeholder="CPT Code (e.g. T100)"
          className="border p-2 w-full rounded"
          value={form.treatment_code}
          onChange={handleChange}
        />

        <input
          name="treatment_desc"
          placeholder="Treatment Description"
          className="border p-2 w-full rounded"
          value={form.treatment_desc}
          onChange={handleChange}
        />

        <input
          name="cost"
          type="number"
          placeholder="Cost (₹)"
          className="border p-2 w-full rounded"
          value={form.cost}
          onChange={handleChange}
        />

        {/* 🛏️ IN-PATIENT TOGGLE */}
        <div style={{ border: admitted ? "2px solid #3b82f6" : "2px solid #e5e7eb", borderRadius: 12, padding: "14px 16px", transition: "border 0.2s" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontWeight: 600, color: "#374151" }}>
            <input
              type="checkbox"
              checked={admitted}
              onChange={e => setAdmitted(e.target.checked)}
              style={{ width: 18, height: 18, accentColor: "#3b82f6" }}
            />
            🛏️ Mark as In-Patient (Admitted)
          </label>

          {admitted && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Ward selector */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>Ward</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {["ICU", "General", "Private"].map(w => {
                    const s = WARD_STYLES[w];
                    const active = admForm.ward === w;
                    return (
                      <button type="button" key={w}
                        onClick={() => setAdmForm({ ...admForm, ward: w })}
                        style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: `2px solid ${active ? s.border : "#e5e7eb"}`, background: active ? s.active : "#f9fafb", color: active ? s.text : "#9ca3af", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                        {w}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4 }}>Room Number</label>
                  <input value={admForm.roomNumber} onChange={e => setAdmForm({ ...admForm, roomNumber: e.target.value })} placeholder="e.g. 204" required={admitted}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4 }}>Bed Number</label>
                  <input value={admForm.bedNumber} onChange={e => setAdmForm({ ...admForm, bedNumber: e.target.value })} placeholder="e.g. B-2" required={admitted}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4 }}>Attending Doctor</label>
                <input value={admForm.attendingDoctor} onChange={e => setAdmForm({ ...admForm, attendingDoctor: e.target.value })} placeholder="Dr. Name" required={admitted}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4 }}>Admission Date</label>
                <input type="date" value={admForm.admissionDate} onChange={e => setAdmForm({ ...admForm, admissionDate: e.target.value })}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
              </div>
            </motion.div>
          )}
        </div>

        {/* 🚀 SUBMIT */}
        <button className="bg-green-600 hover:bg-green-700 text-white w-full py-3 rounded-lg font-semibold">
          {admitted ? "Create Visit & Admit Patient 🛏️" : "Create Visit"}
        </button>
      </form>
    </motion.div>
  );
}

export default AddVisit;