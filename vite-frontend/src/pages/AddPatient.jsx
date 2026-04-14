import { useState } from "react";
import API from "../services/api";
import { motion } from "framer-motion";

function AddPatient() {
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    mobile: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await API.post("/patients", form);
    alert("Patient Added ✅");
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="max-w-md mx-auto bg-white p-6 shadow rounded-xl">
        <h2 className="text-xl font-bold mb-4">Add Patient</h2>

        <form onSubmit={handleSubmit} className="space-y-3">

          <input
            placeholder="Name"
            className="border p-2 w-full"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            type="number"
            placeholder="Age"
            className="border p-2 w-full"
            onChange={(e) => setForm({ ...form, age: e.target.value })}
          />

          <select
            className="border p-2 w-full"
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
          >
            <option>Select Gender</option>
            <option>Male</option>
            <option>Female</option>
          </select>

          <input
            placeholder="Mobile Number"
            className="border p-2 w-full"
            onChange={(e) => setForm({ ...form, mobile: e.target.value })}
          />

          <button className="bg-blue-500 text-white w-full py-2 rounded">
            Submit
          </button>

        </form>
      </div>
    </motion.div>
  );
}

export default AddPatient;