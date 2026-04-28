import React, { useEffect, useState } from "react";
import API from "../services/api";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const fade = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export default function PatientDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    if (user?.email) {
      API.get(`/api/patient-dashboard/${user.email}`)
        .then(r => setData(r.data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, []);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#f0f4ff" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>⏳</div>
        <p style={{ color: "#64748b", fontWeight: 600 }}>Loading your health portal…</p>
      </div>
    </div>
  );

  if (!data) return <div style={{ padding: 40, color: "#ef4444", fontWeight: 600 }}>Failed to load dashboard.</div>;

  if (data.status === "unlinked") return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#667eea,#764ba2)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'Inter', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet" />
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        style={{ background: "#fff", borderRadius: 24, padding: 48, maxWidth: 500, width: "100%", textAlign: "center", boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🏥</div>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: "#1e293b", marginBottom: 8 }}>Account Created!</h2>
        <p style={{ color: "#64748b", marginBottom: 24, lineHeight: 1.6 }}>Your portal account is ready. To view your medical records, provide your <strong>System User ID</strong> to the hospital registration desk.</p>
        <div style={{ background: "linear-gradient(135deg,#f0f4ff,#e8efff)", border: "2px dashed #6366f1", borderRadius: 16, padding: 24, marginBottom: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Your System User ID</p>
          <p style={{ fontSize: 20, fontWeight: 800, color: "#1e293b", fontFamily: "monospace", wordBreak: "break-all" }}>{user._id}</p>
        </div>
        <p style={{ color: "#94a3b8", fontSize: 12, fontStyle: "italic" }}>Show this ID at reception to link your records.</p>
      </motion.div>
    </div>
  );

  const { patient, appointments = [], visits = [], bills = [], prescriptions = [] } = data;
  const pendingBills = bills.filter(b => b.status !== "Paid");
  const totalDue = pendingBills.reduce((s, b) => s + (b.total_amount || 0), 0);
  const upcoming = appointments.filter(a => a.status !== "Completed" && a.status !== "Cancelled");

  const tabs = [
    { id: "overview", label: "Overview", icon: "🏠" },
    { id: "appointments", label: "Appointments", icon: "📅" },
    { id: "prescriptions", label: "Prescriptions", icon: "💊" },
    { id: "bills", label: "Bills", icon: "💳" },
    { id: "visits", label: "Visit History", icon: "📋" },
  ];

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#f0f4ff", minHeight: "100vh", padding: "28px 24px" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Hero Header */}
      <motion.div variants={fade} initial="hidden" animate="visible"
        style={{ background: "linear-gradient(135deg,#667eea,#764ba2)", borderRadius: 20, padding: "28px 32px", marginBottom: 24, color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div>
          <p style={{ fontSize: 13, opacity: 0.8, margin: 0 }}>Welcome back,</p>
          <h1 style={{ fontSize: 30, fontWeight: 800, margin: "4px 0" }}>{patient.name} 👋</h1>
          <div style={{ display: "flex", gap: 16, marginTop: 8, flexWrap: "wrap" }}>
            <span style={{ background: "rgba(255,255,255,0.15)", borderRadius: 8, padding: "4px 12px", fontSize: 12 }}>🪪 {patient.patient_id}</span>
            <span style={{ background: "rgba(255,255,255,0.15)", borderRadius: 8, padding: "4px 12px", fontSize: 12 }}>Age {patient.age}</span>
            {patient.gender && <span style={{ background: "rgba(255,255,255,0.15)", borderRadius: 8, padding: "4px 12px", fontSize: 12 }}>{patient.gender}</span>}
            {patient.phone && <span style={{ background: "rgba(255,255,255,0.15)", borderRadius: 8, padding: "4px 12px", fontSize: 12 }}>📞 {patient.phone}</span>}
          </div>
        </div>
        <Link to="/appointment"
          style={{ background: "#fff", color: "#6366f1", borderRadius: 12, padding: "12px 24px", fontWeight: 700, fontSize: 14, textDecoration: "none", boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}>
          + Book Appointment
        </Link>
      </motion.div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { icon: "📅", label: "Upcoming", value: upcoming.length, color: "#6366f1" },
          { icon: "💊", label: "Prescriptions", value: prescriptions.length, color: "#8b5cf6" },
          { icon: "🏥", label: "Total Visits", value: visits.length, color: "#0ea5e9" },
          { icon: "💳", label: "Amount Due", value: `₹${totalDue}`, color: totalDue > 0 ? "#ef4444" : "#22c55e" },
        ].map((c, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(0,0,0,0.1)" }}
            style={{ background: "#fff", borderRadius: 16, padding: "20px 22px", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", borderLeft: `4px solid ${c.color}`, transition: "all 0.2s" }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{c.icon}</div>
            <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>{c.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: c.color, marginTop: 4 }}>{c.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, background: "#fff", borderRadius: 14, padding: 6, boxShadow: "0 2px 10px rgba(0,0,0,0.05)", overflowX: "auto" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ flex: 1, border: "none", borderRadius: 10, padding: "10px 16px", fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap",
              background: tab === t.id ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "transparent",
              color: tab === t.id ? "#fff" : "#64748b" }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>

        {/* OVERVIEW */}
        {tab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {/* Next Appointment */}
            <div style={{ background: "#fff", borderRadius: 18, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", marginTop: 0 }}>📅 Next Appointment</h3>
              {upcoming.length > 0 ? (
                <div style={{ background: "linear-gradient(135deg,#f0f4ff,#e8efff)", borderRadius: 12, padding: 16 }}>
                  <p style={{ fontWeight: 700, color: "#1e293b", margin: "0 0 4px" }}>Dr. {upcoming[0].doctor_name}</p>
                  <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>{upcoming[0].date} at {upcoming[0].time}</p>
                  <span style={{ background: "#dbeafe", color: "#1d4ed8", borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 600, display: "inline-block", marginTop: 8 }}>{upcoming[0].status}</span>
                </div>
              ) : <p style={{ color: "#94a3b8" }}>No upcoming appointments</p>}
            </div>

            {/* Latest Prescription */}
            <div style={{ background: "#fff", borderRadius: 18, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", marginTop: 0 }}>💊 Latest Prescription</h3>
              {prescriptions.length > 0 ? (
                <div>
                  <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 8px" }}>by Dr. {prescriptions[0].doctor_name} · {new Date(prescriptions[0].createdAt).toLocaleDateString("en-IN")}</p>
                  {prescriptions[0].medicines.slice(0, 3).map((m, i) => (
                    <div key={i} style={{ background: "#f8faff", borderRadius: 8, padding: "8px 12px", marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 600, color: "#1e293b", fontSize: 13 }}>{m.name}</span>
                      <span style={{ color: "#64748b", fontSize: 12 }}>{m.dosage} · {m.frequency}</span>
                    </div>
                  ))}
                  {prescriptions[0].medicines.length > 3 && <p style={{ color: "#6366f1", fontSize: 12, margin: 0 }}>+{prescriptions[0].medicines.length - 3} more medicines</p>}
                </div>
              ) : <p style={{ color: "#94a3b8" }}>No prescriptions yet</p>}
            </div>

            {/* Pending Bills Alert */}
            {totalDue > 0 && (
              <div style={{ background: "linear-gradient(135deg,#fef2f2,#fee2e2)", border: "1.5px solid #fca5a5", borderRadius: 18, padding: 24, gridColumn: "1 / -1" }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#b91c1c", marginTop: 0 }}>⚠️ Pending Bills</h3>
                <p style={{ color: "#dc2626", fontSize: 22, fontWeight: 800, margin: "0 0 4px" }}>₹{totalDue}</p>
                <p style={{ color: "#ef4444", fontSize: 13, margin: 0 }}>{pendingBills.length} bill(s) pending. Please clear at the hospital or reception.</p>
              </div>
            )}
          </div>
        )}

        {/* APPOINTMENTS */}
        {tab === "appointments" && (
          <div style={{ background: "#fff", borderRadius: 18, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1e293b", marginTop: 0 }}>Your Appointments</h3>
            {appointments.length === 0 ? <p style={{ color: "#94a3b8" }}>No appointments found.</p> : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {appointments.map(a => {
                  const colors = { Scheduled: "#dbeafe/#1d4ed8", Completed: "#dcfce7/#15803d", Cancelled: "#fee2e2/#b91c1c" };
                  const [bg, clr] = (colors[a.status] || colors.Scheduled).split("/");
                  return (
                    <div key={a._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8faff", borderRadius: 12, padding: "14px 18px", border: "1.5px solid #e2e8f0" }}>
                      <div>
                        <p style={{ fontWeight: 700, color: "#1e293b", margin: "0 0 4px", fontSize: 14 }}>Dr. {a.doctor_name}</p>
                        <p style={{ color: "#64748b", fontSize: 12, margin: 0 }}>{a.date} at {a.time}</p>
                      </div>
                      <span style={{ background: bg, color: clr, borderRadius: 20, padding: "4px 14px", fontSize: 12, fontWeight: 700 }}>{a.status}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* PRESCRIPTIONS */}
        {tab === "prescriptions" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {prescriptions.length === 0 ? (
              <div style={{ background: "#fff", borderRadius: 18, padding: 40, textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>💊</div>
                <p style={{ color: "#94a3b8", fontWeight: 600 }}>No prescriptions yet</p>
              </div>
            ) : prescriptions.map((rx, i) => (
              <motion.div key={rx._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                style={{ background: "#fff", borderRadius: 18, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div>
                    <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700, color: "#1e293b" }}>Prescription #{prescriptions.length - i}</h3>
                    <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>
                      Dr. {rx.doctor_name} · {new Date(rx.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      {rx.visit_id && ` · Visit: ${rx.visit_id}`}
                    </p>
                  </div>
                  <span style={{ background: "#f0f4ff", color: "#6366f1", borderRadius: 8, padding: "4px 12px", fontSize: 12, fontWeight: 700 }}>💊 {rx.medicines.length} medicine(s)</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12, marginBottom: rx.instructions ? 12 : 0 }}>
                  {rx.medicines.map((m, j) => (
                    <div key={j} style={{ background: "linear-gradient(135deg,#f8faff,#f0f4ff)", borderRadius: 12, padding: "12px 16px", border: "1.5px solid #e2e8f0" }}>
                      <p style={{ fontWeight: 700, color: "#6366f1", margin: "0 0 6px", fontSize: 14 }}>{m.name}</p>
                      <p style={{ margin: "0 0 2px", fontSize: 12, color: "#475569" }}>💊 {m.dosage || "—"} &nbsp;·&nbsp; {m.frequency || "—"}</p>
                      <p style={{ margin: "0 0 2px", fontSize: 12, color: "#475569" }}>⏱ {m.duration || "—"}</p>
                      {m.notes && <p style={{ margin: "6px 0 0", fontSize: 11, color: "#94a3b8", fontStyle: "italic" }}>{m.notes}</p>}
                    </div>
                  ))}
                </div>
                {rx.instructions && (
                  <div style={{ background: "#fefce8", border: "1.5px solid #fde68a", borderRadius: 10, padding: "10px 14px" }}>
                    <p style={{ margin: 0, fontSize: 13, color: "#92400e" }}>📝 <strong>Instructions:</strong> {rx.instructions}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* BILLS */}
        {tab === "bills" && (
          <div style={{ background: "#fff", borderRadius: 18, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1e293b", marginTop: 0 }}>Billing Records</h3>
            {bills.length === 0 ? <p style={{ color: "#94a3b8" }}>No bills found.</p> : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {bills.map((b, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8faff", borderRadius: 12, padding: "14px 18px", border: "1.5px solid #e2e8f0" }}>
                    <div>
                      <p style={{ fontWeight: 700, color: "#1e293b", margin: "0 0 3px", fontSize: 14 }}>Visit: {b.visit_id}</p>
                      <p style={{ fontWeight: 800, color: "#1e293b", fontSize: 18, margin: 0 }}>₹{b.total_amount}</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ background: b.status === "Paid" ? "#dcfce7" : "#fee2e2", color: b.status === "Paid" ? "#15803d" : "#b91c1c", borderRadius: 20, padding: "4px 14px", fontSize: 12, fontWeight: 700 }}>{b.status}</span>
                      <Link to={`/billing/${b.visit_id}`} style={{ color: "#6366f1", fontSize: 12, fontWeight: 700 }}>View →</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VISIT HISTORY */}
        {tab === "visits" && (
          <div style={{ background: "#fff", borderRadius: 18, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1e293b", marginTop: 0 }}>Visit History</h3>
            {visits.length === 0 ? <p style={{ color: "#94a3b8" }}>No visits recorded.</p> : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {visits.map(v => (
                  <div key={v.visit_id} style={{ background: "#f8faff", borderRadius: 12, padding: "14px 18px", border: "1.5px solid #e2e8f0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <p style={{ fontWeight: 700, color: "#1e293b", margin: "0 0 4px", fontSize: 14 }}>Visit ID: {v.visit_id}</p>
                      {v.admitted && <span style={{ background: "#dbeafe", color: "#1d4ed8", borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 600 }}>🛏 In-Patient</span>}
                    </div>
                    <p style={{ color: "#64748b", fontSize: 12, margin: 0 }}>{v.diagnosis || "No diagnosis recorded"} · {v.doctor || ""}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </motion.div>
    </div>
  );
}
