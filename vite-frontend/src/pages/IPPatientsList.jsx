import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { motion } from "framer-motion";
import { BedDouble, RefreshCw, Eye, LogOut, Search } from "lucide-react";

const WARD_STYLES = {
  ICU:     { bg: "#fee2e2", text: "#b91c1c", dot: "#ef4444" },
  General: { bg: "#dbeafe", text: "#1d4ed8", dot: "#3b82f6" },
  Private: { bg: "#dcfce7", text: "#15803d", dot: "#22c55e" },
};

const stagger = { visible: { transition: { staggerChildren: 0.07 } } };
const row = { hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0, transition: { duration: 0.35 } } };

export default function IPPatientsList() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const navigate = useNavigate();

  useEffect(() => { fetchIP(); }, []);

  const fetchIP = async () => {
    setLoading(true);
    try {
      const res = await API.get("/api/ip-patients");
      setPatients(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const filtered = patients.filter(({ visit, patient }) => {
    const q = search.toLowerCase();
    return (
      patient?.name?.toLowerCase().includes(q) ||
      visit?.visit_id?.toLowerCase().includes(q) ||
      visit?.admissionDetails?.ward?.toLowerCase().includes(q) ||
      visit?.admissionDetails?.roomNumber?.toLowerCase().includes(q)
    );
  });

  const daysSince = (date) => {
    if (!date) return "—";
    const diff = Math.floor((Date.now() - new Date(date)) / 86400000);
    return diff === 0 ? "Today" : `${diff} day${diff > 1 ? "s" : ""}`;
  };

  return (
    <div style={{ padding: 28, fontFamily: "'Inter',sans-serif", minHeight: "100vh", background: "#f8faff" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)", borderRadius: 14, padding: 12 }}>
            <BedDouble color="#fff" size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: "#0f172a", margin: 0 }}>In-Patient Management</h1>
            <p style={{ color: "#64748b", fontSize: 13, margin: "4px 0 0" }}>{patients.length} patient{patients.length !== 1 ? "s" : ""} currently admitted</p>
          </div>
        </div>
        <button onClick={fetchIP}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "9px 16px", fontSize: 13, color: "#475569", cursor: "pointer", fontWeight: 600 }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </motion.div>

      {/* Summary cards */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 28 }}>
        {[
          { label: "ICU",     ward: "ICU",     color: "#ef4444", bg: "#fef2f2" },
          { label: "General", ward: "General", color: "#3b82f6", bg: "#eff6ff" },
          { label: "Private", ward: "Private", color: "#22c55e", bg: "#f0fdf4" },
        ].map(c => {
          const count = patients.filter(p => p.visit?.admissionDetails?.ward === c.ward).length;
          return (
            <div key={c.ward} style={{ background: c.bg, borderRadius: 14, padding: "18px 22px", borderLeft: `4px solid ${c.color}` }}>
              <p style={{ color: c.color, fontWeight: 700, fontSize: 28, margin: 0 }}>{count}</p>
              <p style={{ color: "#64748b", fontSize: 13, margin: "4px 0 0" }}>{c.label} Ward</p>
            </div>
          );
        })}
      </motion.div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 20, maxWidth: 380 }}>
        <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patient, ward, room…"
          style={{ width: "100%", padding: "10px 12px 10px 36px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none", background: "#fff", boxSizing: "border-box" }} />
      </div>

      {/* Table */}
      <motion.div variants={stagger} initial="hidden" animate="visible"
        style={{ background: "#fff", borderRadius: 18, boxShadow: "0 2px 16px rgba(0,0,0,0.07)", overflow: "hidden" }}>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#f8faff" }}>
            <tr>
              {["Patient", "Visit ID", "Ward", "Room", "Bed", "Attending Doctor", "Admitted", "Days", "Actions"].map(h => (
                <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b", borderBottom: "1.5px solid #e5e7eb", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} style={{ textAlign: "center", padding: 48, color: "#94a3b8" }}>Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: "center", padding: 64, color: "#94a3b8" }}>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>🛏️</div>
                  <p>No admitted patients found</p>
                </td>
              </tr>
            ) : filtered.map(({ visit, patient }, i) => {
              const ad = visit?.admissionDetails || {};
              const ws = WARD_STYLES[ad.ward] || WARD_STYLES.General;
              return (
                <motion.tr key={visit._id} variants={row} style={{ borderBottom: "1px solid #f1f5f9", background: i % 2 === 0 ? "#fff" : "#fafbff" }}>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13 }}>
                        {patient?.name?.charAt(0) || "P"}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: "#0f172a", fontSize: 14 }}>{patient?.name || "—"}</div>
                        <div style={{ fontSize: 12, color: "#94a3b8" }}>{patient?.patient_id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "#475569", fontWeight: 600 }}>{visit.visit_id}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ background: ws.bg, color: ws.text, borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 5 }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: ws.dot }} />
                      {ad.ward || "—"}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "#475569" }}>{ad.roomNumber || "—"}</td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "#475569" }}>{ad.bedNumber || "—"}</td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "#475569" }}>{ad.attendingDoctor || "—"}</td>
                  <td style={{ padding: "14px 16px", fontSize: 12, color: "#64748b" }}>
                    {ad.admissionDate ? new Date(ad.admissionDate).toLocaleDateString("en-IN") : "—"}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ background: "#fef3c7", color: "#92400e", borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>
                      {daysSince(ad.admissionDate)}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => navigate(`/visit/${visit.visit_id}`)}
                        style={{ display: "flex", alignItems: "center", gap: 4, background: "#eff6ff", color: "#2563eb", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                        <Eye size={12} /> View
                      </button>
                      <button onClick={() => navigate(`/discharge/${visit.visit_id}`)}
                        style={{ display: "flex", alignItems: "center", gap: 4, background: "#fef2f2", color: "#dc2626", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                        <LogOut size={12} /> Discharge
                      </button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}
