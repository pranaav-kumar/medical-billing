import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";

import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patient";
import AddPatient from "./pages/AddPatient";
import PatientHistory from "./pages/PatientHistory";
import AddVisit from "./pages/AddVisit";
import SearchPatient from "./pages/SearchPatient";
import BillingPage from "./pages/BillingPage";
import ClaimsPage from "./pages/ClaimsPage";
import Appointment from "./pages/Appointment";
import DoctorDashboard from "./pages/DoctorDashboard";
import Login from "./pages/Login";

function App() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <Routes>

      {/* ✅ LOGIN ROUTE */}
      <Route
        path="/login"
        element={!user ? <Login /> : <Navigate to="/redirect" />}
      />

      {/* ✅ ROLE REDIRECT HANDLER */}
      <Route
        path="/redirect"
        element={
          user ? (
            user.role === "admin" ? <Navigate to="/dashboard" /> :
            user.role === "doctor" ? <Navigate to="/doctor-dashboard" /> :
            <Navigate to="/appointment" />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* ✅ PROTECTED ROUTES */}
      <Route
        path="/"
        element={user ? <Layout /> : <Navigate to="/login" />}
      >
        {/* ADMIN */}
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="patients" element={<Patients />} />
        <Route path="add-patient" element={<AddPatient />} />
        <Route path="history/:id" element={<PatientHistory />} />
        <Route path="add-visit/:id" element={<AddVisit />} />
        <Route path="search" element={<SearchPatient />} />
        <Route path="billing/:visit_id" element={<BillingPage />} />
        <Route path="claims" element={<ClaimsPage />} />

        {/* COMMON */}
        <Route path="appointment" element={<Appointment />} />

        {/* DOCTOR */}
        <Route path="doctor-dashboard" element={<DoctorDashboard />} />
      </Route>

      {/* ✅ DEFAULT → LOGIN */}
      <Route path="*" element={<Navigate to="/login" />} />

    </Routes>
  );
}

export default App;