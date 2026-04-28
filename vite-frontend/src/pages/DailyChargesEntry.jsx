import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import { motion } from "framer-motion";
import { PlusCircle, ChevronLeft, Trash2 } from "lucide-react";

const CHARGE_TYPES = ["Room", "ICU", "Nursing", "Medicine", "Lab", "Radiology", "Other"];
const CHARGE_COLORS = {
  Room: "#3b82f6", ICU: "#ef4444", Nursing: "#8b5cf6",
  Medicine: "#10b981", Lab: "#f59e0b", Radiology: "#0ea5e9", Other: "#64748b"
};

export default function DailyChargesEntry() {
  const { visit_id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({ chargeType: "Room", amount: "", date: new Date().toISOString().slice(0, 10), note: "" });
  const [charges, setCharges] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchCharges(); }, [visit_id]);

  const fetchCharges = async () => {
    try {
      const res = await API.get(`/api/visits/${visit_id}`);
      setCharges(res.data.visit?.dailyCharges || []);
    } catch (err) { console.error(err); }
  };

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) { alert("Enter a valid amount"); return; }
    setLoading(true);
    try {
      const res = await API.post(`/api/visits/${visit_id}/daily-charges`, { ...form, amount: Number(form.amount) });
      setCharges(res.data.dailyCharges || []);
      setForm({ chargeType: "Room", amount: "", date: new Date().toISOString().slice(0, 10), note: "" });
    } catch (err) { alert("Error adding charge ❌"); }
    finally { setLoading(false); }
  };

  const total = charges.reduce((s, c) => s + (c.amount || 0), 0);

  return (
    <div style={{ minHeight: "100vh", background: "#f8faff", padding: 28, fontFamily: "'Inter',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <button onClick={() => navigate(`/visit/${visit_id}`)}
          style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "8px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: "#475569", fontSize: 13, fontWeight: 600 }}>
          <ChevronLeft size={14} /> Back to Visit
        </button>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", margin: 0 }}>Daily Charges</h1>
          <p style={{ color: "#64748b", fontSize: 13, margin: "3px 0 0" }}>Visit: {visit_id}</p>
        </div>
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: "400px 1fr", gap: 24, maxWidth: 1100 }}>

        {/* Form */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          style={{ background: "#fff", borderRadius: 18, padding: 28, boxShadow: "0 2px 16px rgba(0,0,0,0.07)", height: "fit-content" }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 20px" }}>Add Charge</h2>

          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Charge type buttons */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>Charge Type</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {CHARGE_TYPES.map(t => {
                  const active = form.chargeType === t;
                  const c = CHARGE_COLORS[t];
                  return (
                    <button type="button" key={t} onClick={() => setForm({ ...form, chargeType: t })}
                      style={{ padding: "6px 14px", borderRadius: 20, border: `2px solid ${active ? c : "#e5e7eb"}`, background: active ? `${c}18` : "#f9fafb", color: active ? c : "#6b7280", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Amount (₹)</label>
              <input type="number" name="amount" value={form.amount} onChange={handle} placeholder="0.00" min="0" step="0.01" required
                style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Date</label>
              <input type="date" name="date" value={form.date} onChange={handle}
                style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Note (optional)</label>
              <input name="note" value={form.note} onChange={handle} placeholder="e.g. Night shift nursing"
                style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
            </div>

            <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              style={{ padding: "13px 0", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#7c3aed,#4f46e5)", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <PlusCircle size={16} /> {loading ? "Adding…" : "Add Charge"}
            </motion.button>
          </form>
        </motion.div>

        {/* Charges Table */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          style={{ background: "#fff", borderRadius: 18, boxShadow: "0 2px 16px rgba(0,0,0,0.07)", overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1.5px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>All Charges ({charges.length})</h2>
            <span style={{ background: "#f0fdf4", color: "#15803d", fontWeight: 700, fontSize: 15, padding: "4px 14px", borderRadius: 20 }}>
              Total: ₹{total.toLocaleString()}
            </span>
          </div>

          {charges.length === 0 ? (
            <div style={{ textAlign: "center", padding: 64, color: "#94a3b8" }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>💳</div>
              <p>No charges added yet</p>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ background: "#f8faff" }}>
                <tr>
                  {["Date", "Type", "Note", "Amount"].map(h => (
                    <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b", borderBottom: "1.5px solid #e5e7eb" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {charges.map((c, i) => {
                  const col = CHARGE_COLORS[c.chargeType] || "#64748b";
                  return (
                    <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                      style={{ borderBottom: "1px solid #f1f5f9", background: i % 2 === 0 ? "#fff" : "#fafbff" }}>
                      <td style={{ padding: "14px 20px", fontSize: 13, color: "#475569" }}>
                        {c.date ? new Date(c.date).toLocaleDateString("en-IN") : "—"}
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <span style={{ background: `${col}18`, color: col, borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>
                          {c.chargeType}
                        </span>
                      </td>
                      <td style={{ padding: "14px 20px", fontSize: 13, color: "#64748b" }}>{c.note || "—"}</td>
                      <td style={{ padding: "14px 20px", fontSize: 14, fontWeight: 600, color: "#0f172a" }}>₹{c.amount}</td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </motion.div>
      </div>
    </div>
  );
}
