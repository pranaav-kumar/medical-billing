import React, { useState, useEffect } from "react";
import API from "../services/api";
import { motion, AnimatePresence } from "framer-motion";

const CAT_COLORS = {
  Medicine:    { bg: "#f0f4ff", border: "#818cf8", dot: "#6366f1" },
  Equipment:   { bg: "#f0fdf4", border: "#86efac", dot: "#22c55e" },
  Consumable:  { bg: "#fff7ed", border: "#fdba74", dot: "#f97316" },
  General:     { bg: "#f8faff", border: "#cbd5e1", dot: "#64748b" },
};

const EMPTY = { name: "", category: "General", quantity: 1, unit: "units", minStock: 10, supplier: "", notes: "" };

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  const [requests, setRequests] = useState([]);
  const [tab, setTab] = useState("items");
  const [form, setForm] = useState({ ...EMPTY });
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    const [inv, req] = await Promise.all([
      API.get("/api/inventory").then(r => r.data).catch(() => []),
      API.get("/api/inventory-requests").then(r => r.data).catch(() => [])
    ]);
    setItems(inv);
    setRequests(req);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) {
        await API.put(`/api/inventory/${editId}`, form);
      } else {
        await API.post("/api/inventory", form);
      }
      setForm({ ...EMPTY });
      setEditId(null);
      setShowForm(false);
      fetchAll();
    } catch { alert("Error saving item"); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this item?")) return;
    await API.delete(`/api/inventory/${id}`);
    fetchAll();
  };

  const startEdit = (item) => {
    setForm({ name: item.name, category: item.category, quantity: item.quantity, unit: item.unit, minStock: item.minStock, supplier: item.supplier || "", notes: item.notes || "" });
    setEditId(item._id);
    setShowForm(true);
  };

  const handleApprove = async (id) => {
    await API.put(`/api/inventory-requests/${id}/approve`);
    fetchAll();
  };
  const handleReject = async (id) => {
    await API.put(`/api/inventory-requests/${id}/reject`);
    fetchAll();
  };

  const filtered = items.filter(i => i.name?.toLowerCase().includes(search.toLowerCase()) || i.category?.toLowerCase().includes(search.toLowerCase()));
  const pendingReqs = requests.filter(r => r.status === "Pending");

  const inp = { width: "100%", padding: "9px 12px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", background: "#f8faff", boxSizing: "border-box" };
  const lbl = { fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" };

  return (
    <div style={{ fontFamily: "'Inter',sans-serif", background: "#f0f4ff", minHeight: "100vh", padding: "28px 24px" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1e293b", margin: 0 }}>📦 Inventory Management</h1>
          <p style={{ color: "#94a3b8", fontSize: 13, marginTop: 4 }}>{items.length} items · {pendingReqs.length} pending requests</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ ...EMPTY }); }}
          style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", border: "none", borderRadius: 12, padding: "11px 22px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
          {showForm ? "✕ Cancel" : "+ Add Item"}
        </button>
      </div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSave}
            style={{ background: "#fff", borderRadius: 18, padding: 24, marginBottom: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", overflow: "hidden" }}>
            <h3 style={{ margin: "0 0 18px", fontWeight: 700, color: "#1e293b" }}>{editId ? "✏️ Edit Item" : "➕ Add New Item"}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
              <div><label style={lbl}>Item Name *</label><input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Paracetamol 500mg" style={inp} /></div>
              <div><label style={lbl}>Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={{ ...inp, cursor: "pointer" }}>
                  {["Medicine", "Equipment", "Consumable", "General"].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div><label style={lbl}>Quantity</label><input type="number" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: Number(e.target.value) }))} min={0} style={inp} /></div>
              <div><label style={lbl}>Unit</label><input value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} placeholder="tablets, bottles…" style={inp} /></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 2fr", gap: 14, marginBottom: 18 }}>
              <div><label style={lbl}>Min Stock Alert</label><input type="number" value={form.minStock} onChange={e => setForm(f => ({ ...f, minStock: Number(e.target.value) }))} min={0} style={inp} /></div>
              <div><label style={lbl}>Supplier</label><input value={form.supplier} onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))} placeholder="Supplier name" style={inp} /></div>
              <div><label style={lbl}>Notes</label><input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional notes" style={inp} /></div>
            </div>
            <button type="submit" disabled={loading}
              style={{ background: loading ? "#94a3b8" : "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", border: "none", borderRadius: 10, padding: "11px 28px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}>
              {loading ? "Saving…" : (editId ? "Update Item" : "Add to Inventory")}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[{ id: "items", label: `📦 Inventory (${items.length})` }, { id: "requests", label: `📋 Requests (${pendingReqs.length})` }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 600, fontSize: 13, cursor: "pointer",
              background: tab === t.id ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "#fff",
              color: tab === t.id ? "#fff" : "#64748b", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* INVENTORY ITEMS */}
      {tab === "items" && (
        <div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search by name or category…"
            style={{ ...inp, marginBottom: 16, background: "#fff", padding: "12px 16px", fontSize: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }} />

          {/* Low stock warning */}
          {items.filter(i => i.quantity <= i.minStock).length > 0 && (
            <div style={{ background: "#fff7ed", border: "1.5px solid #fdba74", borderRadius: 12, padding: "12px 18px", marginBottom: 16, color: "#92400e", fontWeight: 600, fontSize: 13 }}>
              ⚠️ {items.filter(i => i.quantity <= i.minStock).length} item(s) are at or below minimum stock level.
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16 }}>
            {filtered.map(item => {
              const cc = CAT_COLORS[item.category] || CAT_COLORS.General;
              const isLow = item.quantity <= (item.minStock || 10);
              return (
                <motion.div key={item._id} whileHover={{ y: -3, boxShadow: "0 10px 28px rgba(0,0,0,0.1)" }}
                  style={{ background: cc.bg, borderRadius: 16, padding: 20, border: `2px solid ${cc.border}`, transition: "all 0.2s", position: "relative" }}>
                  {isLow && (
                    <span style={{ position: "absolute", top: 14, right: 14, background: "#fee2e2", color: "#ef4444", fontSize: 11, fontWeight: 700, borderRadius: 20, padding: "2px 10px" }}>Low Stock</span>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: cc.dot }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>{item.category}</span>
                  </div>
                  <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700, color: "#1e293b" }}>{item.name}</h3>
                  <p style={{ margin: "0 0 4px", fontSize: 13, color: "#64748b" }}>
                    <strong style={{ fontSize: 20, color: isLow ? "#ef4444" : "#1e293b" }}>{item.quantity}</strong> {item.unit}
                  </p>
                  {item.supplier && <p style={{ margin: "4px 0 0", fontSize: 12, color: "#94a3b8" }}>Supplier: {item.supplier}</p>}
                  <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                    <button onClick={() => startEdit(item)}
                      style={{ flex: 1, background: "#fff", border: `1.5px solid ${cc.border}`, borderRadius: 8, padding: "7px", fontSize: 12, fontWeight: 700, cursor: "pointer", color: "#475569" }}>
                      ✏️ Edit
                    </button>
                    <button onClick={() => handleDelete(item._id)}
                      style={{ flex: 1, background: "#fee2e2", border: "none", borderRadius: 8, padding: "7px", fontSize: 12, fontWeight: 700, cursor: "pointer", color: "#ef4444" }}>
                      🗑 Delete
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
          {filtered.length === 0 && <div style={{ textAlign: "center", padding: 48, color: "#94a3b8" }}>No inventory items found.</div>}
        </div>
      )}

      {/* REQUESTS */}
      {tab === "requests" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {requests.length === 0 && <div style={{ textAlign: "center", padding: 48, color: "#94a3b8" }}>No inventory requests yet.</div>}
          {requests.map(r => (
            <motion.div key={r._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ background: "#fff", borderRadius: 16, padding: "18px 22px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div>
                <p style={{ fontWeight: 700, color: "#1e293b", margin: "0 0 4px", fontSize: 15 }}>{r.item_name}</p>
                <p style={{ color: "#64748b", fontSize: 12, margin: "0 0 2px" }}>
                  {r.quantity} {r.unit} · {r.category} · by Dr. {r.doctor_name}
                </p>
                {r.reason && <p style={{ color: "#94a3b8", fontSize: 12, margin: 0, fontStyle: "italic" }}>{r.reason}</p>}
                <p style={{ color: "#94a3b8", fontSize: 11, margin: "4px 0 0" }}>{new Date(r.createdAt).toLocaleDateString("en-IN")}</p>
              </div>
              {r.status === "Pending" ? (
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => handleApprove(r._id)}
                    style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)", color: "#fff", border: "none", borderRadius: 10, padding: "9px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                    ✅ Approve & Add
                  </button>
                  <button onClick={() => handleReject(r._id)}
                    style={{ background: "#fee2e2", color: "#ef4444", border: "none", borderRadius: 10, padding: "9px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                    ✕ Reject
                  </button>
                </div>
              ) : (
                <span style={{
                  background: r.status === "Approved" ? "#dcfce7" : "#fee2e2",
                  color: r.status === "Approved" ? "#15803d" : "#b91c1c",
                  borderRadius: 20, padding: "6px 16px", fontSize: 13, fontWeight: 700
                }}>{r.status}</span>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
