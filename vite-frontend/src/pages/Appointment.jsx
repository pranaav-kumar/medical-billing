import React, { useState, useEffect } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

function Appointment() {
  const loggedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isPatient  = loggedUser?.role === "patient";
  const navigate   = useNavigate();

  // Redirect doctors away — they have their own appointments page
  useEffect(() => {
    if (!isPatient) navigate("/appointments", { replace: true });
  }, []);

  const [form, setForm] = useState({
    patient_id:  loggedUser.patient_id || "",
    doctor_name: "",
    date:        "",
    time:        ""
  });

  const [doctors, setDoctors]               = useState([]);
  const [myAppointments, setMyAppointments] = useState([]);
  const [loading, setLoading]               = useState(false);
  const [submitted, setSubmitted]           = useState(false);

  useEffect(() => {
    fetchDoctors();
    fetchMyAppointments();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await API.get("/api/users/doctors");
      setDoctors(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchMyAppointments = async () => {
    try {
      const res = await API.get("/api/appointments");
      const pid = loggedUser.patient_id || "";
      const sorted = res.data
        .filter(a => a.patient_id === pid)
        .sort((a, b) => {
          if (a.date !== b.date) return a.date > b.date ? 1 : -1;
          return a.time > b.time ? 1 : -1;
        });
      setMyAppointments(sorted);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/api/appointments", form);
      setSubmitted(true);
      setForm(f => ({ ...f, doctor_name: "", date: "", time: "" }));
      fetchMyAppointments();
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      alert("Error booking appointment ❌");
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    Scheduled: { bg: "#dbeafe", text: "#1d4ed8", dot: "#3b82f6" },
    Completed: { bg: "#dcfce7", text: "#15803d", dot: "#22c55e" },
    Cancelled: { bg: "#fee2e2", text: "#b91c1c", dot: "#ef4444" },
  };

  const today = new Date().toISOString().split("T")[0];
  const upcoming = myAppointments.filter(a => a.date >= today && a.status !== "Cancelled");
  const past     = myAppointments.filter(a => a.date < today || a.status === "Cancelled");

  if (!isPatient) return null;

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#f8faff", minHeight: "100vh", padding: "32px 28px" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#0f172a", margin: 0 }}>📅 Book an Appointment</h1>
        <p style={{ color: "#64748b", fontSize: 14, marginTop: 6 }}>
          Schedule a visit with one of our doctors · Your ID: <strong>{form.patient_id}</strong>
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, alignItems: "start" }}>

        {/* Booking Form */}
        <div style={{ background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginTop: 0, marginBottom: 24 }}>New Appointment</h2>

          {submitted && (
            <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 12, padding: "12px 16px", marginBottom: 20, color: "#15803d", fontWeight: 600, fontSize: 14 }}>
              ✅ Appointment booked successfully!
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* Patient ID — read-only */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Patient ID</label>
              <input
                value={form.patient_id}
                readOnly
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14, background: "#f9fafb", color: "#6b7280", boxSizing: "border-box" }}
              />
            </div>

            {/* Doctor dropdown */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Select Doctor</label>
              <select
                value={form.doctor_name}
                onChange={e => setForm({ ...form, doctor_name: e.target.value })}
                required
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14, background: "#fff", boxSizing: "border-box", cursor: "pointer" }}
              >
                <option value="">— Choose a doctor —</option>
                {doctors.map(d => (
                  <option key={d._id} value={d.name}>
                    Dr. {d.name}{d.specialization ? ` · ${d.specialization}` : ""}
                  </option>
                ))}
              </select>
              {doctors.length === 0 && (
                <p style={{ color: "#f59e0b", fontSize: 12, marginTop: 4 }}>⚠️ No doctors found.</p>
              )}
            </div>

            {/* Date + Time */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Date</label>
                <input type="date" value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                  min={today} required
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14, boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Time</label>
                <input type="time" value={form.time}
                  onChange={e => setForm({ ...form, time: e.target.value })}
                  required
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14, boxSizing: "border-box" }}
                />
              </div>
            </div>

            <button type="submit" disabled={loading}
              style={{ background: loading ? "#94a3b8" : "linear-gradient(135deg,#3b82f6,#6366f1)", color: "#fff", border: "none", borderRadius: 12, padding: "13px", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", transition: "all 0.2s" }}>
              {loading ? "Booking…" : "Book Appointment →"}
            </button>
          </form>
        </div>

        {/* My Appointments panel */}
        <div>
          <div style={{ background: "#fff", borderRadius: 20, padding: 24, boxShadow: "0 2px 16px rgba(0,0,0,0.07)", marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginTop: 0, marginBottom: 16 }}>
              Upcoming ({upcoming.length})
            </h3>
            {upcoming.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px 0", color: "#94a3b8" }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>🗓️</div>
                <p style={{ fontSize: 13 }}>No upcoming appointments</p>
              </div>
            ) : upcoming.map(a => {
              const sc = statusColors[a.status] || statusColors.Scheduled;
              return (
                <div key={a._id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderRadius: 12, border: "1.5px solid #e5e7eb", marginBottom: 10, background: "#fafbff" }}>
                  <div>
                    <div style={{ fontWeight: 600, color: "#1e293b", fontSize: 14 }}>Dr. {a.doctor_name}</div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>
                      {new Date(a.date + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })} · {a.time}
                    </div>
                  </div>
                  <span style={{ background: sc.bg, color: sc.text, borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: sc.dot }} />
                    {a.status}
                  </span>
                </div>
              );
            })}
          </div>

          {past.length > 0 && (
            <div style={{ background: "#fff", borderRadius: 20, padding: 24, boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#64748b", marginTop: 0, marginBottom: 16 }}>Past / Cancelled</h3>
              {past.map(a => {
                const sc = statusColors[a.status] || statusColors.Scheduled;
                return (
                  <div key={a._id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: 10, background: "#f8faff", marginBottom: 8, opacity: 0.75 }}>
                    <div>
                      <div style={{ fontWeight: 600, color: "#334155", fontSize: 13 }}>Dr. {a.doctor_name}</div>
                      <div style={{ fontSize: 12, color: "#94a3b8" }}>{a.date} · {a.time}</div>
                    </div>
                    <span style={{ background: sc.bg, color: sc.text, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 600 }}>{a.status}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Appointment;