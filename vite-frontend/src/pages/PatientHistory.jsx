import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";

function PatientHistory() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [diagnosis, setDiagnosis] = useState({});
  const [treatments, setTreatments] = useState({});

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await API.get(`/patient-history/${id}`);
      setData(res.data);

      const diagMap = {};
      const treatMap = {};

      // fetch diagnosis & treatments per visit
      for (let v of res.data.visits) {
        const d = await API.get(`/diagnosis/${v.visit_id}`);
        const t = await API.get(`/treatments/${v.visit_id}`);

        diagMap[v.visit_id] = d.data;
        treatMap[v.visit_id] = t.data;
      }

      setDiagnosis(diagMap);
      setTreatments(treatMap);

    } catch (err) {
      console.error("Error fetching history:", err);
    }
  };

  if (!data) return <p className="text-center mt-5">Loading...</p>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Patient History</h2>

      {/* Patient Info */}
      <div className="bg-white p-4 shadow mb-4 rounded">
        <p><b>ID:</b> {data.patient.patient_id}</p>
        <p><b>Name:</b> {data.patient.name}</p>
        <p><b>Age:</b> {data.patient.age}</p>
      </div>

      {/* Visits */}
      {data.visits.length > 0 ? (
        data.visits.map((v) => {
          const visitDiagnosis = diagnosis[v.visit_id] || [];
          const visitTreatments = treatments[v.visit_id] || [];

          const total = visitTreatments.reduce(
            (sum, t) => sum + (t.cost || 0),
            0
          );

          return (
            <div key={v.visit_id} className="bg-white p-4 mb-4 shadow rounded">

              {/* Visit Header */}
              <h3 className="font-bold text-lg mb-2">
                Visit: {v.visit_id}
              </h3>

              {/* Diagnosis */}
              <div className="mt-2">
                <h4 className="font-semibold">Diagnosis (ICD)</h4>
                {visitDiagnosis.length > 0 ? (
                  visitDiagnosis.map((d, i) => (
                    <p key={i}>
                      {d.code} - {d.description}
                    </p>
                  ))
                ) : (
                  <p className="text-gray-500">No diagnosis</p>
                )}
              </div>

              {/* Treatments */}
              <div className="mt-2">
                <h4 className="font-semibold">Treatments (CPT)</h4>
                {visitTreatments.length > 0 ? (
                  visitTreatments.map((t, i) => (
                    <p key={i}>
                      {t.code} - {t.description} ₹{t.cost}
                    </p>
                  ))
                ) : (
                  <p className="text-gray-500">No treatments</p>
                )}
              </div>

              {/* Total */}
              <div className="mt-3 font-bold text-green-600">
                Total: ₹{total}
              </div>

              {/* 🔥 View Invoice Button */}
              <button
                className="bg-purple-500 text-white px-3 py-1 mt-3 rounded hover:bg-purple-600"
                onClick={() => navigate(`/billing/${v.visit_id}`)}
              >
                View Invoice
              </button>

            </div>
          );
        })
      ) : (
        <p className="text-center text-gray-500">No visits found</p>
      )}
    </div>
  );
}

export default PatientHistory;