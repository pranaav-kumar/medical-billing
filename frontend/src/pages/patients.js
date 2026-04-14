import React, { useEffect, useState } from "react";
import API from "../services/api";

function Patients() {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    API.get("/patients")
      .then(res => setPatients(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h2>Patients</h2>
      {patients.map(p => (
        <div key={p.patient_id}>
          <p>{p.name} - {p.phone}</p>
        </div>
      ))}
    </div>
  );
}

export default Patients;