import { useEffect, useState, useMemo } from "react";
import API from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Calendar, CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight, RefreshCw, User } from "lucide-react";

const STATUS_STYLE = {
  Scheduled: { bg: "#dbeafe", text: "#1d4ed8", dot: "#3b82f6" },
  Completed: { bg: "#dcfce7", text: "#065f46", dot: "#22c55e" },
  Cancelled:  { bg: "#fee2e2", text: "#991b1b", dot: "#ef4444" },
};

function pad(n) { return String(n).padStart(2, "0"); }

function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [selected, setSelected]         = useState(null); // YYYY-MM-DD
  const [viewMonth, setViewMonth]       = useState(new Date());
  const navigate = useNavigate();
  const doctor   = JSON.parse(localStorage.getItem("user") || "{}");

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetchAppointments();
    setSelected(today);
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await API.get("/api/appointments");
      // Filter by this doctor's name
      const mine = res.data.filter(
        a => a.doctor_name?.toLowerCase() === doctor.name?.toLowerCase()
      );
      setAppointments(mine);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/api/appointments/${id}`, { status });
      fetchAppointments();
    } catch (err) { console.error(err); }
  };

  // Build a map: date -> appointments[]
  const byDate = useMemo(() => {
    const map = {};
    appointments.forEach(a => {
      if (!map[a.date]) map[a.date] = [];
      map[a.date].push(a);
    });
    return map;
  }, [appointments]);

  // Appointments for selected day sorted by time
  const dayAppts = useMemo(() => {
    if (!selected) return [];
    return (byDate[selected] || []).slice().sort((a, b) => a.time > b.time ? 1 : -1);
  }, [byDate, selected]);

  // ── Calendar helpers ──────────────────────────────────────────
  const year  = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setViewMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setViewMonth(new Date(year, month + 1, 1));

  const monthName = viewMonth.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  // Stats
  const totalScheduled = appointments.filter(a => a.status === "Scheduled").length;
  const totalCompleted = appointments.filter(a => a.status === "Completed").length;
  const totalCancelled = appointments.filter(a => a.status === "Cancelled").length;
  const todayCount     = (byDate[today] || []).length;

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#f8faff", minHeight: "100vh", padding: "28px" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
            <Calendar size={24} color="#6366f1" /> My Appointment Calendar
          </h1>
          <p style={{ color: "#64748b", fontSize: 13, marginTop: 5 }}>Dr. {doctor.name} · All patient bookings</p>
        </div>
        <button onClick={fetchAppointments}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "9px 16px", fontSize: 13, color: "#475569", cursor: "pointer", fontWeight: 600 }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </motion.div>

      {/* ── Stat Cards ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Today",      value: todayCount,     color: "#6366f1", bg: "#eef2ff" },
          { label: "Scheduled",  value: totalScheduled, color: "#3b82f6", bg: "#dbeafe" },
          { label: "Completed",  value: totalCompleted, color: "#22c55e", bg: "#dcfce7" },
          { label: "Cancelled",  value: totalCancelled, color: "#ef4444", bg: "#fee2e2" },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: 14, padding: "18px 22px", borderLeft: `4px solid ${s.color}` }}>
            <p style={{ color: s.color, fontWeight: 700, fontSize: 28, margin: 0 }}>{s.value}</p>
            <p style={{ color: "#64748b", fontSize: 12, margin: "4px 0 0" }}>{s.label}</p>
          </div>
        ))}
      </motion.div>

      {/* ── Main: Calendar + Day Detail ── */}
      <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 22, alignItems: "start" }}>

        {/* Calendar */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          style={{ background: "#fff", borderRadius: 20, padding: 24, boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>

          {/* Month nav */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <button onClick={prevMonth} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: 8, color: "#64748b" }}>
              <ChevronLeft size={18} />
            </button>
            <span style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>{monthName}</span>
            <button onClick={nextMonth} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: 8, color: "#64748b" }}>
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Day-of-week headers */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 8 }}>
            {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
              <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 600, color: "#94a3b8", padding: "4px 0" }}>{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
            {/* empty cells before first day */}
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day   = i + 1;
              const dateStr = `${year}-${pad(month + 1)}-${pad(day)}`;
              const hasAppts = !!(byDate[dateStr]?.length);
              const isToday  = dateStr === today;
              const isSel    = dateStr === selected;
              const scheduled = (byDate[dateStr] || []).filter(a => a.status === "Scheduled").length;
              const completed = (byDate[dateStr] || []).filter(a => a.status === "Completed").length;

              return (
                <button key={day} onClick={() => setSelected(dateStr)}
                  style={{
                    position: "relative",
                    aspectRatio: "1",
                    borderRadius: 10,
                    border: isToday ? "2px solid #6366f1" : "2px solid transparent",
                    background: isSel ? "#6366f1" : hasAppts ? "#eef2ff" : "#f8faff",
                    color: isSel ? "#fff" : isToday ? "#6366f1" : "#0f172a",
                    fontWeight: isSel || isToday ? 700 : 400,
                    fontSize: 13,
                    cursor: "pointer",
                    padding: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 2,
                    transition: "all 0.15s"
                  }}>
                  {day}
                  {hasAppts && (
                    <div style={{ display: "flex", gap: 2 }}>
                      {scheduled > 0 && <span style={{ width: 5, height: 5, borderRadius: "50%", background: isSel ? "#fff" : "#3b82f6" }} />}
                      {completed > 0 && <span style={{ width: 5, height: 5, borderRadius: "50%", background: isSel ? "#a5f3fc" : "#22c55e" }} />}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ display: "flex", gap: 12, marginTop: 16, justifyContent: "center", flexWrap: "wrap" }}>
            {[
              { dot: "#3b82f6", label: "Scheduled" },
              { dot: "#22c55e", label: "Completed" },
            ].map(l => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#64748b" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: l.dot }} /> {l.label}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Day Detail Panel */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          style={{ background: "#fff", borderRadius: 20, padding: 24, boxShadow: "0 2px 16px rgba(0,0,0,0.07)", minHeight: 400 }}>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: 0 }}>
                {selected
                  ? new Date(selected + "T00:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
                  : "Select a date"}
              </h2>
              <p style={{ color: "#94a3b8", fontSize: 13, margin: "4px 0 0" }}>
                {dayAppts.length} appointment{dayAppts.length !== 1 ? "s" : ""}
              </p>
            </div>
            {selected === today && (
              <span style={{ background: "#eef2ff", color: "#6366f1", borderRadius: 20, padding: "4px 14px", fontSize: 12, fontWeight: 700 }}>Today</span>
            )}
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: 48, color: "#94a3b8" }}>Loading…</div>
          ) : dayAppts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 0", color: "#94a3b8" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
              <p style={{ fontSize: 14 }}>No appointments on this day</p>
            </div>
          ) : (
            <AnimatePresence>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {dayAppts.map((a, i) => {
                  const ss = STATUS_STYLE[a.status] || STATUS_STYLE.Scheduled;
                  return (
                    <motion.div key={a._id}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.05 }}
                      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", borderRadius: 14, border: "1.5px solid #e5e7eb", background: "#fafbff", gap: 12 }}>

                      {/* Left: time + patient */}
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", borderRadius: 12, padding: "10px 14px", color: "#fff", fontWeight: 700, fontSize: 14, minWidth: 60, textAlign: "center" }}>
                          <Clock size={12} style={{ display: "block", margin: "0 auto 2px" }} />
                          {a.time}
                        </div>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13 }}>
                              <User size={14} />
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: "#0f172a", fontSize: 14 }}>Patient: {a.patient_id}</div>
                              <div style={{ fontSize: 12, color: "#94a3b8" }}>Booked appointment</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: status + actions */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                        <span style={{ background: ss.bg, color: ss.text, borderRadius: 20, padding: "5px 12px", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: ss.dot }} />
                          {a.status}
                        </span>
                        {a.status === "Scheduled" && (
                          <>
                            <button onClick={() => updateStatus(a._id, "Completed")}
                              title="Mark Completed"
                              style={{ background: "#dcfce7", color: "#15803d", border: "none", borderRadius: 8, padding: "7px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                              <CheckCircle size={13} /> Done
                            </button>
                            <button onClick={() => updateStatus(a._id, "Cancelled")}
                              title="Cancel"
                              style={{ background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 8, padding: "7px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                              <XCircle size={13} /> Cancel
                            </button>
                          </>
                        )}
                        <button onClick={() => navigate(`/history/${a.patient_id}`)}
                          style={{ background: "#eef2ff", color: "#6366f1", border: "none", borderRadius: 8, padding: "7px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                          View →
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </AnimatePresence>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default DoctorAppointments;