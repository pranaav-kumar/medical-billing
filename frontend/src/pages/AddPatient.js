import React, { useState } from "react";
import API from "../services/api";

function AddPatient() {
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    phone: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/patients", form);
      alert("Patient Added Successfully");
    } catch (err) {
      console.error(err);
      alert("Error adding patient");
    }
  };

  return (
    <div>
      <h2>Add Patient</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" onChange={handleChange} /><br/>
        <input name="age" placeholder="Age" onChange={handleChange} /><br/>
        <input name="gender" placeholder="Gender" onChange={handleChange} /><br/>
        <input name="phone" placeholder="Phone" onChange={handleChange} /><br/>
        <button type="submit">Add Patient</button>
      </form>
    </div>
  );
}

export default AddPatient;