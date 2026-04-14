import { useState, useEffect } from "react";
import API from "../services/api";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";

const pageVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

function AddVisit() {
  const { id } = useParams(); // ✅ get patient_id from URL

  const [form, setForm] = useState({
    patient_id: "",
    diagnosis_code: "",
    diagnosis_desc: "",
    treatment_code: "",
    treatment_desc: "",
    cost: ""
  });

  // ✅ AUTO-FILL PATIENT ID
  useEffect(() => {
    if (id) {
      setForm((prev) => ({ ...prev, patient_id: id }));
    }
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 🔹 1. CREATE VISIT
      const visitRes = await API.post("/api/visits", {
        patient_id: form.patient_id
      });

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

      alert("Visit created successfully ✅");

      // reset form except patient_id
      setForm({
        patient_id: form.patient_id,
        diagnosis_code: "",
        diagnosis_desc: "",
        treatment_code: "",
        treatment_desc: "",
        cost: ""
      });

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

        {/* ✅ PATIENT ID (AUTO FILLED) */}
        <input
          name="patient_id"
          value={form.patient_id}
          readOnly
          className="border p-3 w-full rounded bg-gray-100"
        />

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

        {/* 🚀 SUBMIT */}
        <button className="bg-green-600 hover:bg-green-700 text-white w-full py-3 rounded-lg font-semibold">
          Create Visit
        </button>
      </form>
    </motion.div>
  );
}

export default AddVisit;