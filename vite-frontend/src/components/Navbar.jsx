import React from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="bg-gray-900 text-white p-4 flex justify-between">

      <h1 className="font-bold">Med System</h1>

      <div className="space-x-4">

        <Link to="/">Home</Link>

        {user?.role === "admin" && (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/patients">Patients</Link>
          </>
        )}

        {user?.role === "doctor" && (
          <>
            <Link to="/doctor-dashboard">Doctor Dashboard</Link>
            <Link to="/appointments">Appointments</Link>
          </>
        )}

        {user?.role === "patient" && (
          <>
            <Link to="/patient-dashboard">My Dashboard</Link>
            <Link to="/appointment">Book Appointment</Link>
          </>
        )}

        {user && (
          <button
            onClick={logout}
            className="bg-red-500 px-2 py-1 rounded"
          >
            Logout
          </button>
        )}

      </div>
    </div>
  );
}

export default Navbar;