import { useEffect, useState } from "react";
import API from "../services/api";
import { motion } from "framer-motion";

const pageVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

function ClaimsPage() {
  const [claims, setClaims] = useState([]);

  // ✅ Fetch claims
  const fetchClaims = async () => {
    try {
      const res = await API.get("/api/claims");
      setClaims(res.data);
    } catch (err) {
      console.error("Error fetching claims:", err);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  // ✅ Update claim status (FIXED _id)
  const updateStatus = async (id, newStatus) => {
    try {
      await API.put(`/api/claims/${id}`, { status: newStatus });
      fetchClaims(); // refresh
    } catch (err) {
      console.error("Error updating claim:", err);
    }
  };

  return (
    <motion.div
      variants={pageVariant}
      initial="hidden"
      animate="visible"
      className="p-6"
    >
      <h2 className="text-3xl font-bold mb-6 text-gray-700">
        Insurance Claims
      </h2>

      {/* 🔥 SUMMARY */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="bg-blue-500 text-white p-5 rounded-xl shadow">
          <h3>Total Claims</h3>
          <p className="text-2xl font-bold">{claims.length}</p>
        </div>

        <div className="bg-green-500 text-white p-5 rounded-xl shadow">
          <h3>Approved</h3>
          <p className="text-2xl font-bold">
            {claims.filter((c) => c.status === "Approved").length}
          </p>
        </div>

        <div className="bg-yellow-500 text-white p-5 rounded-xl shadow">
          <h3>Pending</h3>
          <p className="text-2xl font-bold">
            {claims.filter((c) => c.status === "Pending").length}
          </p>
        </div>
      </div>

      {/* 🧾 TABLE */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="w-full text-center">
          <thead className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
            <tr>
              <th className="p-3">Visit ID</th>
              <th>Insurance</th>
              <th>Amount (₹)</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {claims.length > 0 ? (
              claims.map((c) => (
                <motion.tr
                  key={c._id}
                  whileHover={{ scale: 1.01 }}
                  className="border-t"
                >
                  <td>{c.visit_id}</td>
                  <td>{c.payer}</td>

                  <td className="font-bold text-blue-600">
                    ₹{c.total_amount || 0}
                  </td>

                  <td className="flex flex-col items-center justify-center space-y-1 p-2">
                    <span
                      className={`px-3 py-1 rounded text-white ${
                        c.status === "Approved"
                          ? "bg-green-500"
                          : c.status === "Rejected"
                          ? "bg-red-500"
                          : "bg-yellow-500"
                      }`}
                    >
                      {c.status}
                    </span>

                    {c.status === "Pending" && (
                      <div className="flex space-x-2 mt-1">
                        <button
                          onClick={() => updateStatus(c._id, "Approved")}
                          className="bg-green-600 px-2 py-1 rounded text-white text-sm"
                        >
                          Approve
                        </button>

                        <button
                          onClick={() => updateStatus(c._id, "Rejected")}
                          className="bg-red-600 px-2 py-1 rounded text-white text-sm"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="p-6 text-gray-500">
                  No claims found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

export default ClaimsPage;