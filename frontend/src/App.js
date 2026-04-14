import Patients from "./pages/patients";
import AddPatient from "./pages/AddPatient";
import AddVisit from "./pages/AddVisit";
import PatientHistory from "./pages/PatientHistory";

function App() {
  return (
    <div>
      <AddPatient />
      <AddVisit />
      <PatientHistory />
      <Patients />
    </div>
  );
}

export default App;