import React, { useState, useEffect } from "react";
import API from "../services/api";
import { motion } from "framer-motion";

export default function RequestInventoryPage() {
  const doctor = JSON.parse(localStorage.getItem("user") || "{}");
  const [form, setForm] = useState({ item_name: "", category: "Medicine", quantity: 1, unit: "units", reason: "", doctor_name: doctor.name || "", doctor_id: doctor._id || "" });
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    const data = await API.get("/api/inventory-requests").then(r => r.data).catch(() => []);
    setMyRequests(data.filter(r => r.doctor_id === doctor._id || r.doctor_name === doctor.name));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/api/inventory-requests", form);
      setSaved(true);
      setForm(f => ({ ...f, item_name: "", quantity: 1, unit: "units", reason: "" }));
      fetchRequests();
      setTimeout(() => setSaved(false), 4000);
    } catch { alert("Failed to submit request"); }
    finally { setLoading(false); }
  };

  const inp = { width: "100%", padding: "9px 12px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", background: "#f8faff", boxSizing: "border-box" };
  const lbl = { fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" };

  const statusStyle = {
    Pending:  { bg: "#fef9c3", color: "#854d0e" },
    Approved: { bg: "#dcfce7", color: "#15803d" },
    Rejected: { bg: "#fee2e2", color: "#b91c1c" },
  };

  return (
    <div style={{ fontFamily: "'Inter',sans-serif", background: "#f0f4ff", minHeight: "100vh", padding: "28px 24px" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1e293b", margin: 0 }}>📋 Request Inventory Item</h1>
        <p style={{ color: "#94a3b8", fontSize: 13, marginTop: 5 }}>Submit a request to admin for inventory replenishment or new items</p>
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 24, alignItems: "start" }}>
        {/* Request Form */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {saved && (
            <div style={{ background: "#dcfce7", border: "1.5px solid #86efac", borderRadius: 12, padding: "12px 16px", marginBottom: 16, color: "#15803d", fontWeight: 700, fontSize: 13 }}>
              ✅ Request submitted! Waiting for admin approval.
            </div>
          )}
          <form onSubmit={handleSubmit}
            style={{ background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 4px 20px rgba(0,0,0,0.07)" }}>
            <h3 style={{ margin: "0 0 20px", fontWeight: 700, color: "#1e293b" }}>New Request</h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div><label style={lbl}>Item Name *</label><input required value={form.item_name} onChange={e => setForm(f => ({ ...f, item_name: e.target.value }))} placeholder="e.g. Surgical Gloves" style={inp} /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div><label style={lbl}>Quantity</label><input type="number" min={1} value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: Number(e.target.value) }))} style={inp} /></div>
                <div><label style={lbl}>Unit</label><input value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} placeholder="boxes, pieces…" style={inp} /></div>
              </div>
              <div><label style={lbl}>Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={{ ...inp, cursor: "pointer" }}>
                  {["Medicine","Equipment","Consumable","General"].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div><label style={lbl}>Reason / Justification</label>
                <textarea value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} placeholder="Why is this item needed?" rows={3} style={{ ...inp, resize: "vertical" }} />
              </div>
            </div>

            <button type="submit" disabled={loading}
              style={{ background: loading ? "#94a3b8" : "linear-gradient(135deg,#3b82f6,#6366f1)", color: "#fff", border: "none", borderRadius: 12, padding: "13px", fontWeight: 700, fontSize: 14, cursor: loading ? "not-allowed" : "pointer", width: "100%", marginTop: 20 }}>
              {loading ? "Submitting…" : "📤 Submit Request to Admin"}
            </button>
          </form>
        </motion.div>

        {/* My Requests */}
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", marginBottom: 14 }}>My Requests</h3>
          {myRequests.length === 0 ? (
            <div style={{ background: "#fff", borderRadius: 18, padding: 36, textAlign: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", color: "#94a3b8" }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>📭</div>
              <p style={{ margin: 0, fontWeight: 600 }}>No requests submitted yet</p>
            </div>
          ) : myRequests.map(r => {
            const ss = statusStyle[r.status] || statusStyle.Pending;
            return (
              <motion.div key={r._id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                style={{ background: "#fff", borderRadius: 14, padding: "16px 20px", marginBottom: 12, boxShadow: "0 2px 10px rgba(0,0,0,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <div>
                  <p style={{ fontWeight: 700, color: "#1e293b", margin: "0 0 3px", fontSize: 14 }}>{r.item_name}</p>
                  <p style={{ color: "#64748b", fontSize: 12, margin: "0 0 2px" }}>{r.quantity} {r.unit} · {r.category}</p>
                  {r.reason && <p style={{ color: "#94a3b8", fontSize: 12, margin: 0, fontStyle: "italic" }}>{r.reason}</p>}
                  <p style={{ color: "#94a3b8", fontSize: 11, margin: "4px 0 0" }}>{new Date(r.createdAt).toLocaleDateString("en-IN")}</p>
                </div>
                <span style={{ background: ss.bg, color: ss.color, borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>{r.status}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
