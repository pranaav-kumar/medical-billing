import React, { useEffect, useState } from "react";
import API from "../services/api";

function DoctorDashboard() {
  const [data, setData] = useState({
    opPatients: 0,
    ipPatients: 0,
    todayAppointments: 0
  });

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await API.get("/api/dashboard");
      console.log("Doctor Dashboard Data:", res.data); // ✅ DEBUG

      setData({
        opPatients: res.data.opPatients || 0,
        ipPatients: res.data.ipPatients || 0,
        todayAppointments: res.data.todayAppointments || 0
      });

    } catch (err) {
      console.error("Doctor Dashboard error:", err);
    }
  };

  return (
    <div className="p-6">

      <h2 className="text-2xl font-bold mb-6">Doctor Dashboard</h2>

      <div className="grid grid-cols-3 gap-6">

        <div className="bg-blue-500 text-white p-6 rounded shadow">
          <h3>OP Patients</h3>
          <p className="text-3xl font-bold">{data.opPatients}</p>
        </div>

        <div className="bg-purple-500 text-white p-6 rounded shadow">
          <h3>IP Patients</h3>
          <p className="text-3xl font-bold">{data.ipPatients}</p>
        </div>

        <div className="bg-green-500 text-white p-6 rounded shadow">
          <h3>Today's Appointments</h3>
          <p className="text-3xl font-bold">
            {data.todayAppointments}
          </p>
        </div>

      </div>

    </div>
  );
}

export default DoctorDashboard;