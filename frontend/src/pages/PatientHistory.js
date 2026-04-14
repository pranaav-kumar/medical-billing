import React, { useState } from "react";
import API from "../services/api";

function PatientHistory() {
  const [patientId, setPatientId] = useState("");
  const [data, setData] = useState(null);

  const fetchHistory = async () => {
    try {
      const res = await API.get(`/patient-history/${patientId}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
      alert("Error fetching history");
    }
  };

  return (
    <div>
      <h2>Patient History</h2>

      <input
        placeholder="Enter Patient ID"
        onChange={(e) => setPatientId(e.target.value)}
      />
      <button onClick={fetchHistory}>Get History</button>

      {data && (
        <div>
          <h3>{data.patient.name}</h3>
          <p>Phone: {data.patient.phone}</p>

          <h4>Visits:</h4>
          {data.visits.map((v, i) => (
            <div key={i}>
              <p>Date: {v.visit_date}</p>
              <p>Diagnosis: {v.diagnosis}</p>
              <p>Treatment: {v.treatment}</p>
              <p>Cost: ₹{v.cost}</p>
              <hr />
            </div>
          ))}

          <h3>Total Bill: ₹{data.totalBill}</h3>
        </div>
      )}
    </div>
  );
}

export default PatientHistory;