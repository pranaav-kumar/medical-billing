import React, { useState } from "react";
import API from "../services/api";

function AddVisit() {
  const [form, setForm] = useState({
    patient_id: "",
    visit_date: "",
    diagnosis: "",
    treatment: "",
    cost: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/visit", form);
      alert("Visit Added Successfully");
    } catch (err) {
      console.error(err);
      alert("Error adding visit");
    }
  };

  return (
    <div>
      <h2>Add Visit</h2>
      <form onSubmit={handleSubmit}>
        <input name="patient_id" placeholder="Patient ID" onChange={handleChange} /><br/>
        <input name="visit_date" type="date" onChange={handleChange} /><br/>
        <input name="diagnosis" placeholder="Diagnosis" onChange={handleChange} /><br/>
        <input name="treatment" placeholder="Treatment" onChange={handleChange} /><br/>
        <input name="cost" placeholder="Cost" onChange={handleChange} /><br/>
        <button type="submit">Add Visit</button>
      </form>
    </div>
  );
}

export default AddVisit;
