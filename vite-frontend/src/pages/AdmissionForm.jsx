import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import { motion } from "framer-motion";
import { BedDouble, User, MapPin, Calendar, ChevronLeft, CheckCircle } from "lucide-react";

const WARD_STYLES = {
  ICU:     { bg: "#fee2e2", border: "#ef4444", text: "#b91c1c", dot: "#ef4444" },
  General: { bg: "#dbeafe", border: "#3b82f6", text: "#1d4ed8", dot: "#3b82f6" },
  Private: { bg: "#dcfce7", border: "#22c55e", text: "#15803d", dot: "#22c55e" },
};

export default function AdmissionForm() {
  const { visit_id } = useParams();
  const navigate    = useNavigate();

  const [form, setForm] = useState({
    admissionDate:   new Date().toISOString().slice(0, 10),
    ward:            "General",
    roomNumber:      "",
    bedNumber:       "",
    attendingDoctor: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [patientName, setPatientName] = useState("");

  useEffect(() => {
    API.get(`/api/visits/${visit_id}`)
      .then(r => setPatientName(r.data.patient?.name || visit_id))
      .catch(() => {});
  }, [visit_id]);

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post(`/api/visits/${visit_id}/admit`, form);
      setSuccess(true);
      setTimeout(() => navigate(`/visit/${visit_id}`), 1400);
    } catch (err) {
      alert("Error admitting patient ❌");
    } finally {
      setLoading(false);
    }
  };

  const ws = WARD_STYLES[form.ward] || WARD_STYLES.General;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#f0f9ff,#e0f2fe)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'Inter',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: "#fff", borderRadius: 20, boxShadow: "0 20px 60px rgba(0,0,0,0.12)", width: "100%", maxWidth: 540, overflow: "hidden" }}>

        {/* Header */}
        <div style={{ background: "linear-gradient(135deg,#0ea5e9,#2563eb)", padding: "28px 32px" }}>
          <button onClick={() => navigate(-1)} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 8, color: "#fff", padding: "6px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 13, marginBottom: 16 }}>
            <ChevronLeft size={14} /> Back
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 12, padding: 10 }}><BedDouble color="#fff" size={24} /></div>
            <div>
              <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 700, margin: 0 }}>Admit Patient</h1>
              <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, margin: "4px 0 0" }}>{patientName || visit_id}</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={submit} style={{ padding: 32 }}>
          {success && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              style={{ background: "#dcfce7", border: "1px solid #22c55e", borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 10, marginBottom: 24, color: "#15803d", fontWeight: 600 }}>
              <CheckCircle size={18} /> Patient admitted! Redirecting…
            </motion.div>
          )}

          {/* Ward */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Ward</label>
            <div style={{ display: "flex", gap: 10 }}>
              {["ICU", "General", "Private"].map(w => {
                const s = WARD_STYLES[w];
                const active = form.ward === w;
                return (
                  <button type="button" key={w}
                    onClick={() => setForm({ ...form, ward: w })}
                    style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: `2px solid ${active ? s.border : "#e5e7eb"}`, background: active ? s.bg : "#f9fafb", color: active ? s.text : "#6b7280", fontWeight: 600, fontSize: 14, cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: active ? s.dot : "#d1d5db" }} />
                    {w}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grid fields */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            {[
              { label: "Room Number", name: "roomNumber",  icon: <MapPin size={14} />,  placeholder: "e.g. 204" },
              { label: "Bed Number",  name: "bedNumber",   icon: <BedDouble size={14} />, placeholder: "e.g. B-2" },
            ].map(f => (
              <div key={f.name}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
                  {f.label}
                </label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }}>{f.icon}</span>
                  <input name={f.name} value={form[f.name]} onChange={handle} placeholder={f.placeholder} required
                    style={{ width: "100%", padding: "10px 10px 10px 32px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Attending Doctor</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }}><User size={14} /></span>
              <input name="attendingDoctor" value={form.attendingDoctor} onChange={handle} placeholder="Dr. Name" required
                style={{ width: "100%", padding: "10px 10px 10px 32px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Admission Date</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }}><Calendar size={14} /></span>
              <input type="date" name="admissionDate" value={form.admissionDate} onChange={handle} required
                style={{ width: "100%", padding: "10px 10px 10px 32px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
            </div>
          </div>

          {/* Ward preview badge */}
          <div style={{ marginBottom: 24, padding: "12px 16px", borderRadius: 10, background: ws.bg, border: `1px solid ${ws.border}` }}>
            <span style={{ fontSize: 13, color: ws.text, fontWeight: 600 }}>
              🏥 {form.ward} Ward · Room {form.roomNumber || "—"} · Bed {form.bedNumber || "—"}
              {form.attendingDoctor ? ` · Dr. ${form.attendingDoctor}` : ""}
            </span>
          </div>

          <motion.button type="submit" disabled={loading || success}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            style={{ width: "100%", padding: "14px 0", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#0ea5e9,#2563eb)", color: "#fff", fontWeight: 700, fontSize: 16, cursor: "pointer" }}>
            {loading ? "Admitting…" : "✅ Confirm Admission"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
