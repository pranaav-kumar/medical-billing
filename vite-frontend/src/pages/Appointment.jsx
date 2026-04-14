import React, { useState } from "react";
import API from "../services/api";

function Appointment() {
  const [form, setForm] = useState({
    patient_id: "",
    doctor_name: "",
    date: "",
    time: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/api/appointments", form);
      alert("Appointment booked successfully");

      setForm({
        patient_id: "",
        doctor_name: "",
        date: "",
        time: ""
      });

    } catch (err) {
      console.error(err);
      alert("Error booking appointment");
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">

      <h2 className="text-2xl font-bold mb-4">
        Book Appointment
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        <input
          placeholder="Patient ID"
          value={form.patient_id}
          onChange={(e) =>
            setForm({ ...form, patient_id: e.target.value })
          }
          className="border p-2 w-full"
        />

        <input
          placeholder="Doctor Name"
          value={form.doctor_name}
          onChange={(e) =>
            setForm({ ...form, doctor_name: e.target.value })
          }
          className="border p-2 w-full"
        />

        <input
          type="date"
          value={form.date}
          onChange={(e) =>
            setForm({ ...form, date: e.target.value })
          }
          className="border p-2 w-full"
        />

        <input
          type="time"
          value={form.time}
          onChange={(e) =>
            setForm({ ...form, time: e.target.value })
          }
          className="border p-2 w-full"
        />

        <button
          type="submit"
          className="bg-green-600 text-white w-full p-2 rounded"
        >
          Book Appointment
        </button>

      </form>
    </div>
  );
}

export default Appointment;