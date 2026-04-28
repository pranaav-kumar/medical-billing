import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";

import Dashboard        from "./pages/Dashboard";
import Patients         from "./pages/Patient";
import AddPatient       from "./pages/AddPatient";
import PatientHistory   from "./pages/PatientHistory";
import SearchPatient    from "./pages/SearchPatient";
import BillingPage      from "./pages/BillingPage";
import ClaimsPage       from "./pages/ClaimsPage";
import Appointment      from "./pages/Appointment";
import DoctorDashboard  from "./pages/DoctorDashboard";
import DoctorAppointments from "./pages/Doctorappointments";
import Login            from "./pages/Login";
import Signup           from "./pages/Signup";

// IP Management
import IPPatientsList    from "./pages/IPPatientsList";
import VisitDetail       from "./pages/VisitDetail";
import AdmissionForm     from "./pages/AdmissionForm";
import DischargePage     from "./pages/DischargePage";
import DailyChargesEntry from "./pages/DailyChargesEntry";

// New Features
import WritePrescription    from "./pages/WritePrescription";
import PatientDashboard     from "./pages/PatientDashboard";
import InventoryPage        from "./pages/InventoryPage";
import RequestInventoryPage from "./pages/RequestInventoryPage";

function App() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <Routes>
      {/* PUBLIC */}
      <Route path="/login"  element={!user ? <Login />  : <Navigate to="/redirect" />} />
      <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/redirect" />} />

      {/* ROLE REDIRECT */}
      <Route path="/redirect" element={
        user ? (
          user.role === "admin"   ? <Navigate to="/dashboard" /> :
          user.role === "doctor"  ? <Navigate to="/doctor-dashboard" /> :
          <Navigate to="/patient-dashboard" />
        ) : <Navigate to="/login" />
      } />

      {/* PROTECTED */}
      <Route path="/" element={user ? <Layout /> : <Navigate to="/login" />}>

        {/* ADMIN */}
        <Route path="dashboard"    element={<Dashboard />} />
        <Route path="patients"     element={<Patients />} />
        <Route path="add-patient"  element={<AddPatient />} />
        <Route path="history/:id"  element={<PatientHistory />} />
        <Route path="search"       element={<SearchPatient />} />
        <Route path="billing/:visit_id" element={<BillingPage />} />
        <Route path="claims"       element={<ClaimsPage />} />
        <Route path="inventory"    element={<InventoryPage />} />

        {/* DOCTOR */}
        <Route path="doctor-dashboard"  element={<DoctorDashboard />} />
        <Route path="appointments"      element={<DoctorAppointments />} />
        <Route path="write-prescription" element={<WritePrescription />} />
        <Route path="request-inventory"  element={<RequestInventoryPage />} />

        {/* PATIENT */}
        <Route path="patient-dashboard" element={<PatientDashboard />} />
        <Route path="appointment"       element={<Appointment />} />

        {/* IP Management */}
        <Route path="ip-patients"             element={<IPPatientsList />} />
        <Route path="visit/:visit_id"         element={<VisitDetail />} />
        <Route path="admit/:visit_id"         element={<AdmissionForm />} />
        <Route path="discharge/:visit_id"     element={<DischargePage />} />
        <Route path="daily-charges/:visit_id" element={<DailyChargesEntry />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;