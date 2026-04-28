import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";

const WARD_COLORS = {
  ICU:     { bg: "#fee2e2", text: "#b91c1c" },
  General: { bg: "#dbeafe", text: "#1d4ed8" },
  Private: { bg: "#dcfce7", text: "#15803d" },
};

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
      const res = await API.get(`/api/patient-history/${id}`);
      setData(res.data);

      const diagMap = {};
      const treatMap = {};

      for (let v of res.data.visits) {
        const d = await API.get(`/api/diagnosis/${v.visit_id}`);
        const t = await API.get(`/api/treatments/${v.visit_id}`);

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
          const total = visitTreatments.reduce((sum, t) => sum + (t.cost || 0), 0);
          const ad  = v.admissionDetails || {};
          const wc  = WARD_COLORS[ad.ward] || {};
          const dis = v.dischargeDetails || {};

          return (
            <div key={v.visit_id} className="bg-white p-4 mb-4 shadow rounded">

              {/* Visit Header */}
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-bold text-lg">Visit: {v.visit_id}</h3>

                {/* 🛏️ IP Badge */}
                {v.admitted && (
                  <span style={{ background: wc.bg || "#dbeafe", color: wc.text || "#1d4ed8", borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 600 }}>
                    🛏️ {dis.discharged ? "Discharged" : `IP · ${ad.ward || "Admitted"}`}
                  </span>
                )}
              </div>

              {/* IP quick info */}
              {v.admitted && ad.ward && (
                <div style={{ background: "#f8faff", borderRadius: 8, padding: "8px 12px", marginBottom: 10, fontSize: 13, color: "#475569" }}>
                  Room <b>{ad.roomNumber}</b> · Bed <b>{ad.bedNumber}</b> · Dr. <b>{ad.attendingDoctor}</b>
                </div>
              )}

              {/* Diagnosis */}
              <div className="mt-2">
                <h4 className="font-semibold">Diagnosis (ICD)</h4>
                {visitDiagnosis.length > 0 ? (
                  visitDiagnosis.map((d, i) => (
                    <p key={i}>{d.code} - {d.description}</p>
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
                    <p key={i}>{t.code} - {t.description} ₹{t.cost}</p>
                  ))
                ) : (
                  <p className="text-gray-500">No treatments</p>
                )}
              </div>

              {/* Total */}
              <div className="mt-3 font-bold text-green-600">
                Total: ₹{total}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 mt-3 flex-wrap">
                <button
                  className="bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600"
                  onClick={() => navigate(`/billing/${v.visit_id}`)}
                >
                  View Invoice
                </button>

                {/* 🛏️ IP Detail Button */}
                {v.admitted && (
                  <button
                    style={{ background: "#0ea5e9", color: "#fff", border: "none", borderRadius: 6, padding: "4px 14px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
                    onClick={() => navigate(`/visit/${v.visit_id}`)}
                  >
                    🛏️ IP Details
                  </button>
                )}

                {/* Admit button if not yet admitted */}
                {!v.admitted && (
                  <button
                    style={{ background: "#f59e0b", color: "#fff", border: "none", borderRadius: 6, padding: "4px 14px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
                    onClick={() => navigate(`/admit/${v.visit_id}`)}
                  >
                    🏥 Admit
                  </button>
                )}
              </div>

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