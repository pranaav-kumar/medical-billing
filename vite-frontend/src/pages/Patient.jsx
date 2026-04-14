import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { motion } from "framer-motion";
const pageVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

function Patients() {
  const [patients, setPatients] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/patients").then(res => setPatients(res.data));
  }, []);

  return (
    <motion.div variants={pageVariant} initial="hidden" animate="visible">
      <h2 className="text-3xl font-bold mb-6">Patients</h2>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="w-full text-center">
          <thead className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
            <tr>
              <th className="p-3">ID</th>
              <th>Name</th>
              <th>Age</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {patients.map((p) => (
              <motion.tr
                key={p.patient_id}
                whileHover={{ backgroundColor: "#f9fafb" }}
                className="border-t"
              >
                <td>{p.patient_id}</td>
                <td>{p.name}</td>
                <td>{p.age}</td>

                <td className="space-x-2">
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                    onClick={() => navigate(`/history/${p.patient_id}`)}
                  >
                    View
                  </button>

                  <button
                    className="bg-green-500 text-white px-3 py-1 rounded"
                    onClick={() => navigate(`/add-visit/${p.patient_id}`)}
                  >
                    Visit
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

export default Patients;