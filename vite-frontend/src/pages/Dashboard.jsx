import { useEffect, useState } from "react";
import API from "../services/api";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

const pageVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

function Dashboard() {
  const [data, setData] = useState({
    totalPatients: 0,
    totalVisits: 0,
    totalRevenue: 0,
    revenueData: [],
    claimStats: {}
  });

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await API.get("/api/dashboard");
      setData(res.data);
    } catch (err) {
      console.error("Dashboard error:", err);
    }
  };

  // 📊 BAR CHART DATA (FROM BACKEND)
  const revenueData = data.revenueData || [];

  // 🥧 PIE CHART DATA (CLAIMS)
  const claimData = [
    { name: "Approved", value: data.claimStats.approved || 0 },
    { name: "Pending", value: data.claimStats.pending || 0 },
    { name: "Rejected", value: data.claimStats.rejected || 0 }
  ];

  const COLORS = ["#22c55e", "#facc15", "#ef4444"];

  return (
    <motion.div
      variants={pageVariant}
      initial="hidden"
      animate="visible"
      className="p-6 space-y-6"
    >
      <h1 className="text-3xl font-bold text-gray-700">
        Dashboard
      </h1>

      {/* 🔥 TOP CARDS */}
      <div className="grid grid-cols-4 gap-6">

        <motion.div whileHover={{ scale: 1.05 }}
          className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-6 rounded-xl shadow-lg">
          <h3>Total Patients</h3>
          <p className="text-3xl font-bold">{data.totalPatients}</p>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }}
          className="bg-gradient-to-r from-green-500 to-green-700 text-white p-6 rounded-xl shadow-lg">
          <h3>Total Visits</h3>
          <p className="text-3xl font-bold">{data.totalVisits}</p>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }}
          className="bg-gradient-to-r from-purple-500 to-purple-700 text-white p-6 rounded-xl shadow-lg">
          <h3>Total Revenue</h3>
          <p className="text-3xl font-bold">₹{data.totalRevenue}</p>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }}
          className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-xl shadow-lg">
          <h3>Claims</h3>
          <p className="text-3xl font-bold">
            {(data.claimStats.approved || 0) +
             (data.claimStats.pending || 0) +
             (data.claimStats.rejected || 0)}
          </p>
        </motion.div>

      </div>

      {/* 📊 CHARTS */}
      <div className="grid grid-cols-2 gap-6">

        {/* 📊 REVENUE BAR CHART */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="font-bold mb-4 text-gray-700">
            Revenue per Bill
          </h3>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <XAxis 
                dataKey="name"
                angle={-20}
                textAnchor="end"
                interval={0}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="amount" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 🥧 CLAIMS PIE CHART */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="font-bold mb-4 text-gray-700">
            Claims Status
          </h3>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={claimData}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >
                {claimData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>

    </motion.div>
  );
}

export default Dashboard;