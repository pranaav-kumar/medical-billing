import { useState, useEffect } from "react";
import API from "../services/api";

function Appointments() {
  const [form, setForm] = useState({
    patient_id: "",
    doctor_name: "",
    date: "",
    time: ""
  });

  const [appointments, setAppointments] = useState([]);

  const fetchAppointments = async () => {
    const res = await API.get("/appointments");
    setAppointments(res.data);
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await API.post("/appointments", form);
    fetchAppointments();
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Appointments</h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input placeholder="Patient ID" onChange={(e)=>setForm({...form, patient_id:e.target.value})} />
        <input placeholder="Doctor Name" onChange={(e)=>setForm({...form, doctor_name:e.target.value})} />
        <input type="date" onChange={(e)=>setForm({...form, date:e.target.value})} />
        <input type="time" onChange={(e)=>setForm({...form, time:e.target.value})} />

        <button className="bg-green-500 text-white px-4 py-2">Add</button>
      </form>

      {appointments.map(a => (
        <div key={a._id} className="border p-3 mt-2">
          {a.patient_id} | {a.doctor_name} | {a.date}
        </div>
      ))}
    </div>
  );
}

export default Appointments;