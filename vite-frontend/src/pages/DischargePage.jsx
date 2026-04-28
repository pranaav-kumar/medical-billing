import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import { motion } from "framer-motion";
import { LogOut, ChevronLeft, Calendar, FileText, Stethoscope, CheckCircle } from "lucide-react";

const WARD_STYLES = {
  ICU:     { bg: "#fee2e2", text: "#b91c1c", dot: "#ef4444" },
  General: { bg: "#dbeafe", text: "#1d4ed8", dot: "#3b82f6" },
  Private: { bg: "#dcfce7", text: "#15803d", dot: "#22c55e" },
};

export default function DischargePage() {
  const { visit_id } = useParams();
  const navigate     = useNavigate();

  const [visitData, setVisitData] = useState(null);
  const [form, setForm] = useState({
    dischargeDate:  new Date().toISOString().slice(0, 10),
    finalDiagnosis: "",
    summary:        "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => { fetchVisit(); }, [visit_id]);

  const fetchVisit = async () => {
    try {
      const res = await API.get(`/api/visits/${visit_id}`);
      setVisitData(res.data);
    } catch (err) { console.error(err); }
  };

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post(`/api/visits/${visit_id}/discharge`, form);
      setSuccess(true);
      setTimeout(() => navigate(`/billing/${visit_id}`), 1500);
    } catch (err) {
      alert("Error discharging patient ❌");
    } finally {
      setLoading(false);
    }
  };

  const treatTotal  = (visitData?.visit?.ipTreatments  || []).reduce((s, t) => s + (t.cost   || 0), 0);
  const chargeTotal = (visitData?.visit?.dailyCharges   || []).reduce((s, c) => s + (c.amount || 0), 0);
  const grand       = treatTotal + chargeTotal;
  const tax         = grand * 0.05;
  const finalTotal  = grand + tax;

  const ad = visitData?.visit?.admissionDetails || {};
  const ws = WARD_STYLES[ad.ward] || WARD_STYLES.General;

  const admDate = ad.admissionDate ? new Date(ad.admissionDate) : null;
  const disDate = form.dischargeDate ? new Date(form.dischargeDate) : new Date();
  const days = admDate ? Math.max(1, Math.ceil((disDate - admDate) / 86400000)) : 0;

  return (
    <div style={{ minHeight: "100vh", background: "#f8faff", padding: 28, fontFamily: "'Inter',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <button onClick={() => navigate(-1)} style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "8px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: "#475569", fontSize: 13, fontWeight: 600 }}>
          <ChevronLeft size={14} /> Back
        </button>
        <div style={{ background: "linear-gradient(135deg,#ef4444,#dc2626)", borderRadius: 12, padding: 10 }}>
          <LogOut color="#fff" size={20} />
        </div>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", margin: 0 }}>Discharge Patient</h1>
          <p style={{ color: "#64748b", fontSize: 13, margin: "3px 0 0" }}>Visit: {visit_id}</p>
        </div>
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, maxWidth: 1100 }}>

        {/* Left: Form */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          style={{ background: "#fff", borderRadius: 18, padding: 32, boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>

          {success && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ background: "#dcfce7", border: "1px solid #22c55e", borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 10, marginBottom: 24, color: "#15803d", fontWeight: 600 }}>
              <CheckCircle size={18} /> Discharged! Redirecting to bill…
            </motion.div>
          )}

          {ad.ward && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24, padding: "12px 16px", borderRadius: 12, background: ws.bg }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: ws.dot }} />
              <span style={{ color: ws.text, fontWeight: 600, fontSize: 14 }}>
                {ad.ward} Ward · Room {ad.roomNumber} · Bed {ad.bedNumber}
              </span>
              {days > 0 && <span style={{ marginLeft: "auto", background: "#fef3c7", color: "#92400e", borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>{days} day stay</span>}
            </div>
          )}

          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
                <Calendar size={13} style={{ verticalAlign: "middle", marginRight: 6 }} />Discharge Date
              </label>
              <input type="date" name="dischargeDate" value={form.dischargeDate} onChange={handle} required
                style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
                <Stethoscope size={13} style={{ verticalAlign: "middle", marginRight: 6 }} />Final Diagnosis
              </label>
              <input name="finalDiagnosis" value={form.finalDiagnosis} onChange={handle} placeholder="e.g. Acute appendicitis, resolved" required
                style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
                <FileText size={13} style={{ verticalAlign: "middle", marginRight: 6 }} />Discharge Summary
              </label>
              <textarea name="summary" value={form.summary} onChange={handle} rows={6}
                placeholder="Patient condition on discharge, instructions, follow-up plan…" required
                style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }} />
            </div>

            <motion.button type="submit" disabled={loading || success}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              style={{ padding: "14px 0", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#ef4444,#dc2626)", color: "#fff", fontWeight: 700, fontSize: 16, cursor: "pointer" }}>
              {loading ? "Processing…" : "🏥 Discharge & Generate Bill"}
            </motion.button>
          </form>
        </motion.div>

        {/* Right: Cost Summary */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          <div style={{ background: "#fff", borderRadius: 18, padding: 24, boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
            <h3 style={{ fontWeight: 700, color: "#0f172a", margin: "0 0 18px", fontSize: 16 }}>Bill Preview</h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "IP Treatments",  value: treatTotal },
                { label: "Daily Charges",  value: chargeTotal },
                { label: "Tax (5%)",       value: tax },
              ].map(r => (
                <div key={r.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#475569" }}>
                  <span>{r.label}</span>
                  <span>₹{r.value.toFixed(2)}</span>
                </div>
              ))}
              <div style={{ borderTop: "2px solid #e5e7eb", marginTop: 8, paddingTop: 10, display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 18, color: "#0f172a" }}>
                <span>Total</span>
                <span style={{ color: "#22c55e" }}>₹{finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* IP Treatments summary */}
          {(visitData?.visit?.ipTreatments || []).length > 0 && (
            <div style={{ background: "#fff", borderRadius: 18, padding: 20, boxShadow: "0 2px 16px rgba(0,0,0,0.07)", maxHeight: 200, overflowY: "auto" }}>
              <h4 style={{ fontWeight: 700, color: "#374151", margin: "0 0 12px", fontSize: 14 }}>IP Treatments ({visitData.visit.ipTreatments.length})</h4>
              {visitData.visit.ipTreatments.map((t, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "6px 0", borderBottom: "1px solid #f1f5f9", color: "#475569" }}>
                  <span>{t.description || t.code}</span>
                  <span style={{ fontWeight: 600 }}>₹{t.cost}</span>
                </div>
              ))}
            </div>
          )}

          {/* Daily Charges summary */}
          {(visitData?.visit?.dailyCharges || []).length > 0 && (
            <div style={{ background: "#fff", borderRadius: 18, padding: 20, boxShadow: "0 2px 16px rgba(0,0,0,0.07)", maxHeight: 200, overflowY: "auto" }}>
              <h4 style={{ fontWeight: 700, color: "#374151", margin: "0 0 12px", fontSize: 14 }}>Daily Charges ({visitData.visit.dailyCharges.length})</h4>
              {visitData.visit.dailyCharges.map((c, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "6px 0", borderBottom: "1px solid #f1f5f9", color: "#475569" }}>
                  <span>{c.chargeType} {c.note ? `(${c.note})` : ""}</span>
                  <span style={{ fontWeight: 600 }}>₹{c.amount}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
