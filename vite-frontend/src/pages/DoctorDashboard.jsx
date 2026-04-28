import React, { useEffect, useState } from "react";
import API from "../services/api";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } }
};
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

function DoctorDashboard() {
  const [data, setData] = useState({
    opPatients: 0, ipPatients: 0, todayAppointments: 0,
    totalPatients: 0, totalVisits: 0
  });
  const [appointments, setAppointments] = useState([]);
  const [time, setTime] = useState(new Date());
  const navigate = useNavigate();

  const doctor = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchDashboard();
    fetchAppointments();
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await API.get("/api/dashboard");
      setData(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchAppointments = async () => {
    try {
      const res = await API.get("/api/appointments");
      const today = new Date().toISOString().split("T")[0];
      // Show ALL today's appointments to any logged-in doctor
      const todayAppts = res.data.filter(a => a.date === today);
      setAppointments(todayAppts.slice(0, 5));
    } catch (err) { console.error(err); }
  };

  const greeting = () => {
    const h = time.getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const cards = [
    { label: "OP Patients",          value: data.opPatients,        icon: "🏃", bg: "from-blue-500 to-blue-700" },
    { label: "IP Patients",          value: data.ipPatients,        icon: "🛏️", bg: "from-violet-500 to-violet-700" },
    { label: "Today's Appointments", value: data.todayAppointments, icon: "📅", bg: "from-emerald-500 to-emerald-700" },
    { label: "Total Patients",       value: data.totalPatients,     icon: "👥", bg: "from-amber-500 to-orange-500" },
  ];

  const quickBtns = [
    { label: "My Appointments",  path: "/appointments",       color: "#3b82f6" },
    { label: "IP Patients",      path: "/ip-patients",        color: "#7c3aed" },
    { label: "Write Prescription",path: "/write-prescription", color: "#10b981" },
    { label: "Request Inventory", path: "/request-inventory",  color: "#f59e0b" },
  ];

  const gradMap = {
    "from-blue-500 to-blue-700":    "#3b82f6,#1d4ed8",
    "from-violet-500 to-violet-700":"#8b5cf6,#6d28d9",
    "from-emerald-500 to-emerald-700":"#10b981,#059669",
    "from-amber-500 to-orange-500": "#f59e0b,#ea580c",
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#f8faff", minHeight: "100vh", padding: "28px" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@600&display=swap" rel="stylesheet" />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          <p style={{ color: "#64748b", fontSize: 14, marginBottom: 4 }}>{greeting()},</p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, color: "#0f172a", margin: 0 }}>
            Dr. {doctor.name || "Doctor"} 👋
          </h1>
          <p style={{ color: "#94a3b8", fontSize: 13, marginTop: 4 }}>
            {time.toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            {" · "}{time.toLocaleTimeString("en-IN")}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {quickBtns.map(btn => (
            <motion.button key={btn.path} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate(btn.path)}
              style={{ background: btn.color, color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              {btn.label}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Stat Cards */}
      <motion.div variants={stagger} initial="hidden" animate="visible"
        style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18, marginBottom: 28 }}>
        {cards.map((c, i) => (
          <motion.div key={i} variants={fadeUp} whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(0,0,0,0.12)" }}
            style={{ background: `linear-gradient(135deg,${gradMap[c.bg]})`, borderRadius: 16, padding: "24px", color: "#fff", transition: "all 0.2s" }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{c.icon}</div>
            <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 4 }}>{c.label}</div>
            <div style={{ fontSize: 36, fontWeight: 700 }}>{c.value}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Today's Appointments */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        style={{ background: "#fff", borderRadius: 18, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: "#0f172a", margin: 0 }}>Today's Appointments</h2>
          <button onClick={() => navigate("/appointments")}
            style={{ background: "none", border: "1px solid #e2e8f0", borderRadius: 8, padding: "6px 14px", fontSize: 12, color: "#64748b", cursor: "pointer" }}>
            View All →
          </button>
        </div>
        {appointments.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px", color: "#94a3b8" }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>📭</div>
            <p>No appointments today</p>
          </div>
        ) : (
          appointments.map((a, i) => (
            <motion.div key={a._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderRadius: 12, background: i % 2 === 0 ? "#f8faff" : "#fff", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 16 }}>
                  {a.patient_id?.charAt(0) || "P"}
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: "#1e293b", fontSize: 14 }}>{a.patient_id}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8" }}>{a.time}</div>
                </div>
              </div>
              <span style={{ background: "#dbeafe", color: "#1d4ed8", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600 }}>
                {a.status}
              </span>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
}

export default DoctorDashboard;