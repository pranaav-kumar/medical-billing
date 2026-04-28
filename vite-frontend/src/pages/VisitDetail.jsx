import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import { motion } from "framer-motion";
import {
  BedDouble, PlusCircle, ChevronLeft, FileText,
  Stethoscope, CreditCard, LogOut, Check, RefreshCw
} from "lucide-react";

const WARD_STYLES = {
  ICU:     { bg: "#fee2e2", border: "#fecaca", text: "#b91c1c", dot: "#ef4444", label: "🔴 ICU" },
  General: { bg: "#dbeafe", border: "#bfdbfe", text: "#1d4ed8", dot: "#3b82f6", label: "🔵 General" },
  Private: { bg: "#dcfce7", border: "#bbf7d0", text: "#15803d", dot: "#22c55e", label: "🟢 Private" },
};

const CODE_TYPES = ["CPT", "CDT", "ICD", "Custom"];
const CHARGE_TYPES = ["Room", "ICU", "Nursing", "Medicine", "Lab", "Radiology", "Other"];

const TIMELINE_STEPS = [
  { key: "admitted",    label: "Admitted",    icon: "🏥" },
  { key: "treatment",  label: "Treatment",   icon: "💉" },
  { key: "charges",    label: "Charged",     icon: "💳" },
  { key: "discharged", label: "Discharged",  icon: "🏠" },
];

export default function VisitDetail() {
  const { visit_id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loadingAction, setLoadingAction] = useState("");

  // Treatment form
  const [tForm, setTForm] = useState({ date: new Date().toISOString().slice(0, 10), codeType: "CPT", code: "", description: "", cost: "" });
  // Daily charge form
  const [cForm, setCForm] = useState({ chargeType: "Room", amount: "", date: new Date().toISOString().slice(0, 10), note: "" });

  useEffect(() => { fetchData(); }, [visit_id]);

  const fetchData = async () => {
    try {
      const res = await API.get(`/api/visits/${visit_id}`);
      setData(res.data);
    } catch (err) { console.error(err); }
  };

  const addTreatment = async e => {
    e.preventDefault();
    if (!tForm.description || !tForm.cost) return;
    setLoadingAction("treatment");
    try {
      await API.post(`/api/visits/${visit_id}/ip-treatments`, { ...tForm, cost: Number(tForm.cost) });
      setTForm({ date: new Date().toISOString().slice(0, 10), codeType: "CPT", code: "", description: "", cost: "" });
      fetchData();
    } catch (err) { alert("Error ❌"); }
    finally { setLoadingAction(""); }
  };

  const addCharge = async e => {
    e.preventDefault();
    if (!cForm.amount || Number(cForm.amount) <= 0) return;
    setLoadingAction("charge");
    try {
      await API.post(`/api/visits/${visit_id}/daily-charges`, { ...cForm, amount: Number(cForm.amount) });
      setCForm({ chargeType: "Room", amount: "", date: new Date().toISOString().slice(0, 10), note: "" });
      fetchData();
    } catch (err) { alert("Error ❌"); }
    finally { setLoadingAction(""); }
  };

  if (!data) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: "#94a3b8", fontFamily: "'Inter',sans-serif" }}>
      <RefreshCw size={24} style={{ animation: "spin 1s linear infinite", marginRight: 10 }} /> Loading visit…
    </div>
  );

  const { visit, patient } = data;
  const ad  = visit?.admissionDetails || {};
  const ws  = WARD_STYLES[ad.ward] || WARD_STYLES.General;
  const dis = visit?.dischargeDetails || {};
  const ipT = visit?.ipTreatments || [];
  const dC  = visit?.dailyCharges || [];
  const treatTotal  = ipT.reduce((s, t) => s + (t.cost || 0), 0);
  const chargeTotal = dC.reduce((s, c)  => s + (c.amount || 0), 0);
  const grandTotal  = treatTotal + chargeTotal;

  // Timeline step detection
  const stepDone = {
    admitted:   !!visit?.admitted,
    treatment:  ipT.length > 0,
    charges:    dC.length > 0,
    discharged: !!dis?.discharged,
  };

  const tabs = [
    { id: "overview",   label: "Overview",        icon: <BedDouble size={14} /> },
    { id: "treatments", label: `Treatments (${ipT.length})`, icon: <Stethoscope size={14} /> },
    { id: "charges",    label: `Daily Charges (${dC.length})`, icon: <CreditCard size={14} /> },
    { id: "discharge",  label: "Discharge Summary", icon: <FileText size={14} /> },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f8faff", fontFamily: "'Inter',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Top bar */}
      <div style={{ background: "#fff", borderBottom: "1.5px solid #e5e7eb", padding: "16px 28px", display: "flex", alignItems: "center", gap: 16 }}>
        <button onClick={() => navigate(-1)}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "#f1f5f9", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 13, color: "#475569", fontWeight: 600, cursor: "pointer" }}>
          <ChevronLeft size={14} /> Back
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", margin: 0 }}>
            Visit Detail — {visit.visit_id}
          </h1>
          <p style={{ color: "#64748b", fontSize: 13, margin: "2px 0 0" }}>
            {patient?.name} · {patient?.patient_id}
          </p>
        </div>

        {/* Status badge */}
        {visit?.admitted ? (
          dis?.discharged ? (
            <span style={{ background: "#f1f5f9", color: "#475569", borderRadius: 20, padding: "5px 14px", fontWeight: 600, fontSize: 13 }}>✅ Discharged</span>
          ) : (
            <span style={{ background: ws.bg, color: ws.text, borderRadius: 20, padding: "5px 14px", fontWeight: 600, fontSize: 13, display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: ws.dot, animation: "pulse 1.5s infinite" }} />
              Admitted · {ad.ward}
            </span>
          )
        ) : (
          <span style={{ background: "#dbeafe", color: "#1d4ed8", borderRadius: 20, padding: "5px 14px", fontWeight: 600, fontSize: 13 }}>Out-Patient</span>
        )}

        {/* Quick actions */}
        <div style={{ display: "flex", gap: 8 }}>
          {visit?.admitted && !dis?.discharged && (
            <>
              <button onClick={() => navigate(`/daily-charges/${visit_id}`)}
                style={{ display: "flex", alignItems: "center", gap: 6, background: "#7c3aed", border: "none", borderRadius: 8, padding: "8px 14px", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                <CreditCard size={13} /> Add Charges
              </button>
              <button onClick={() => navigate(`/discharge/${visit_id}`)}
                style={{ display: "flex", alignItems: "center", gap: 6, background: "#ef4444", border: "none", borderRadius: 8, padding: "8px 14px", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                <LogOut size={13} /> Discharge
              </button>
            </>
          )}
          <button onClick={() => navigate(`/billing/${visit_id}`)}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "#0f172a", border: "none", borderRadius: 8, padding: "8px 14px", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            <FileText size={13} /> View Bill
          </button>
        </div>
      </div>

      <div style={{ padding: 28 }}>

        {/* Timeline */}
        {visit?.admitted && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: "#fff", borderRadius: 16, padding: "20px 28px", marginBottom: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {TIMELINE_STEPS.map((step, i) => {
              const done = stepDone[step.key];
              const isLast = i === TIMELINE_STEPS.length - 1;
              return (
                <div key={step.key} style={{ display: "flex", alignItems: "center", flex: isLast ? 0 : 1 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: done ? "linear-gradient(135deg,#22c55e,#16a34a)" : "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, border: done ? "none" : "2px dashed #d1d5db", transition: "all 0.3s" }}>
                      {done ? <Check color="#fff" size={18} /> : step.icon}
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: done ? "#16a34a" : "#94a3b8" }}>{step.label}</span>
                  </div>
                  {!isLast && (
                    <div style={{ flex: 1, height: 2, background: stepDone[TIMELINE_STEPS[i + 1].key] ? "#22c55e" : "#e5e7eb", margin: "0 8px 16px", borderRadius: 2, transition: "background 0.3s" }} />
                  )}
                </div>
              );
            })}
          </motion.div>
        )}

        {/* Stats row */}
        {visit?.admitted && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
            {[
              { label: "Ward",        value: ad.ward || "—",          color: ws.text, bg: ws.bg },
              { label: "Room / Bed",  value: `${ad.roomNumber || "—"} / ${ad.bedNumber || "—"}`, color: "#0f172a", bg: "#f8faff" },
              { label: "IP Treatments Total", value: `₹${treatTotal.toLocaleString()}`,    color: "#7c3aed", bg: "#f5f3ff" },
              { label: "Daily Charges Total", value: `₹${chargeTotal.toLocaleString()}`,   color: "#0ea5e9", bg: "#f0f9ff" },
            ].map(c => (
              <motion.div key={c.label} whileHover={{ y: -2 }}
                style={{ background: c.bg, borderRadius: 14, padding: "16px 20px", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
                <p style={{ color: "#64748b", fontSize: 12, fontWeight: 500, margin: "0 0 6px" }}>{c.label}</p>
                <p style={{ color: c.color, fontSize: 22, fontWeight: 700, margin: 0 }}>{c.value}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, background: "#f1f5f9", borderRadius: 12, padding: 4, marginBottom: 24, width: "fit-content" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all 0.2s",
                background: activeTab === t.id ? "#fff" : "transparent",
                color: activeTab === t.id ? "#0f172a" : "#64748b",
                boxShadow: activeTab === t.id ? "0 1px 6px rgba(0,0,0,0.1)" : "none" }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Tab: Overview */}
        {activeTab === "overview" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

            {/* Patient Info */}
            <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <h3 style={{ fontWeight: 700, color: "#0f172a", margin: "0 0 16px", fontSize: 16 }}>👤 Patient Info</h3>
              {[
                { l: "Name",    v: patient?.name },
                { l: "ID",      v: patient?.patient_id },
                { l: "Age",     v: patient?.age },
                { l: "Gender",  v: patient?.gender },
                { l: "Phone",   v: patient?.phone },
              ].map(r => (
                <div key={r.l} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f5f9", fontSize: 14 }}>
                  <span style={{ color: "#64748b", fontWeight: 500 }}>{r.l}</span>
                  <span style={{ color: "#0f172a", fontWeight: 600 }}>{r.v || "—"}</span>
                </div>
              ))}
            </div>

            {/* Admission Info */}
            {visit?.admitted && (
              <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <h3 style={{ fontWeight: 700, color: "#0f172a", margin: "0 0 16px", fontSize: 16 }}>🏥 Admission Info</h3>
                {[
                  { l: "Ward",              v: ad.ward, badge: true },
                  { l: "Room",              v: ad.roomNumber },
                  { l: "Bed",               v: ad.bedNumber },
                  { l: "Attending Doctor",  v: ad.attendingDoctor },
                  { l: "Admitted On",       v: ad.admissionDate ? new Date(ad.admissionDate).toLocaleDateString("en-IN") : "—" },
                ].map(r => (
                  <div key={r.l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f1f5f9", fontSize: 14 }}>
                    <span style={{ color: "#64748b", fontWeight: 500 }}>{r.l}</span>
                    {r.badge && r.v ? (
                      <span style={{ background: ws.bg, color: ws.text, borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>{r.v}</span>
                    ) : (
                      <span style={{ color: "#0f172a", fontWeight: 600 }}>{r.v || "—"}</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* OP Diagnosis */}
            {(data.diagnosis || []).length > 0 && (
              <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <h3 style={{ fontWeight: 700, color: "#0f172a", margin: "0 0 16px", fontSize: 16 }}>🧾 Diagnosis (ICD)</h3>
                {data.diagnosis.map((d, i) => (
                  <div key={i} style={{ padding: "8px 0", borderBottom: "1px solid #f1f5f9", fontSize: 14, color: "#475569" }}>
                    <strong style={{ color: "#0f172a" }}>{d.code}</strong> — {d.description}
                  </div>
                ))}
              </div>
            )}

            {/* Bill summary */}
            <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <h3 style={{ fontWeight: 700, color: "#0f172a", margin: "0 0 16px", fontSize: 16 }}>💰 Bill Summary</h3>
              {[
                { l: "IP Treatments",  v: `₹${treatTotal.toLocaleString()}` },
                { l: "Daily Charges",  v: `₹${chargeTotal.toLocaleString()}` },
                { l: "Tax (5%)",       v: `₹${(grandTotal * 0.05).toFixed(2)}` },
              ].map(r => (
                <div key={r.l} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f5f9", fontSize: 14 }}>
                  <span style={{ color: "#64748b" }}>{r.l}</span>
                  <span style={{ color: "#0f172a", fontWeight: 600 }}>{r.v}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0 0", fontSize: 18, fontWeight: 700 }}>
                <span style={{ color: "#0f172a" }}>Grand Total</span>
                <span style={{ color: "#22c55e" }}>₹{(grandTotal * 1.05).toFixed(2)}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab: IP Treatments */}
        {activeTab === "treatments" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Add form */}
            {visit?.admitted && !dis?.discharged && (
              <div style={{ background: "#fff", borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <h3 style={{ fontWeight: 700, color: "#0f172a", margin: "0 0 16px", fontSize: 16 }}>➕ Add Treatment</h3>
                <form onSubmit={addTreatment} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr auto", gap: 12, alignItems: "end" }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4 }}>Date</label>
                    <input type="date" value={tForm.date} onChange={e => setTForm({ ...tForm, date: e.target.value })}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4 }}>Code Type</label>
                    <select value={tForm.codeType} onChange={e => setTForm({ ...tForm, codeType: e.target.value })}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 13, outline: "none", boxSizing: "border-box" }}>
                      {CODE_TYPES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4 }}>Code</label>
                    <input placeholder="e.g. CPT-001" value={tForm.code} onChange={e => setTForm({ ...tForm, code: e.target.value })}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4 }}>Description</label>
                    <input placeholder="e.g. IV Antibiotics" value={tForm.description} onChange={e => setTForm({ ...tForm, description: e.target.value })} required
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4 }}>Cost (₹)</label>
                    <input type="number" placeholder="0" value={tForm.cost} onChange={e => setTForm({ ...tForm, cost: e.target.value })} required min="0"
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                  </div>
                  <button type="submit" disabled={loadingAction === "treatment"}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 8, border: "none", background: "#7c3aed", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                    <PlusCircle size={14} /> Add
                  </button>
                </form>
              </div>
            )}

            {/* Table */}
            <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div style={{ padding: "18px 24px", borderBottom: "1.5px solid #e5e7eb", display: "flex", justifyContent: "space-between" }}>
                <h3 style={{ fontWeight: 700, color: "#0f172a", margin: 0, fontSize: 16 }}>All IP Treatments</h3>
                <span style={{ background: "#f5f3ff", color: "#7c3aed", fontWeight: 700, padding: "3px 12px", borderRadius: 20, fontSize: 13 }}>₹{treatTotal.toLocaleString()}</span>
              </div>
              {ipT.length === 0 ? (
                <div style={{ textAlign: "center", padding: 48, color: "#94a3b8" }}>💉 No treatments added yet</div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead style={{ background: "#f8faff" }}>
                    <tr>
                      {["Date", "Code Type", "Code", "Description", "Cost"].map(h => (
                        <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b", borderBottom: "1.5px solid #e5e7eb" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ipT.map((t, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #f1f5f9", background: i % 2 === 0 ? "#fff" : "#fafbff" }}>
                        <td style={{ padding: "13px 20px", fontSize: 13, color: "#475569" }}>{t.date ? new Date(t.date).toLocaleDateString("en-IN") : "—"}</td>
                        <td style={{ padding: "13px 20px" }}><span style={{ background: "#ede9fe", color: "#7c3aed", borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>{t.codeType}</span></td>
                        <td style={{ padding: "13px 20px", fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{t.code || "—"}</td>
                        <td style={{ padding: "13px 20px", fontSize: 13, color: "#475569" }}>{t.description}</td>
                        <td style={{ padding: "13px 20px", fontSize: 14, fontWeight: 700, color: "#7c3aed" }}>₹{t.cost}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </motion.div>
        )}

        {/* Tab: Daily Charges */}
        {activeTab === "charges" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {visit?.admitted && !dis?.discharged && (
              <div style={{ background: "#fff", borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <h3 style={{ fontWeight: 700, color: "#0f172a", margin: "0 0 16px", fontSize: 16 }}>➕ Add Daily Charge</h3>
                <form onSubmit={addCharge} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr auto", gap: 12, alignItems: "end" }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4 }}>Type</label>
                    <select value={cForm.chargeType} onChange={e => setCForm({ ...cForm, chargeType: e.target.value })}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 13, outline: "none" }}>
                      {CHARGE_TYPES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4 }}>Amount (₹)</label>
                    <input type="number" placeholder="0" value={cForm.amount} onChange={e => setCForm({ ...cForm, amount: e.target.value })} required min="0"
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4 }}>Date</label>
                    <input type="date" value={cForm.date} onChange={e => setCForm({ ...cForm, date: e.target.value })}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4 }}>Note</label>
                    <input placeholder="Optional note" value={cForm.note} onChange={e => setCForm({ ...cForm, note: e.target.value })}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                  </div>
                  <button type="submit" disabled={loadingAction === "charge"}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 8, border: "none", background: "#0ea5e9", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                    <PlusCircle size={14} /> Add
                  </button>
                </form>
              </div>
            )}

            <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div style={{ padding: "18px 24px", borderBottom: "1.5px solid #e5e7eb", display: "flex", justifyContent: "space-between" }}>
                <h3 style={{ fontWeight: 700, color: "#0f172a", margin: 0, fontSize: 16 }}>All Daily Charges</h3>
                <span style={{ background: "#f0f9ff", color: "#0ea5e9", fontWeight: 700, padding: "3px 12px", borderRadius: 20, fontSize: 13 }}>₹{chargeTotal.toLocaleString()}</span>
              </div>
              {dC.length === 0 ? (
                <div style={{ textAlign: "center", padding: 48, color: "#94a3b8" }}>💳 No charges added yet</div>
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
                    {dC.map((c, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #f1f5f9", background: i % 2 === 0 ? "#fff" : "#fafbff" }}>
                        <td style={{ padding: "13px 20px", fontSize: 13, color: "#475569" }}>{c.date ? new Date(c.date).toLocaleDateString("en-IN") : "—"}</td>
                        <td style={{ padding: "13px 20px" }}><span style={{ background: "#e0f2fe", color: "#0369a1", borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>{c.chargeType}</span></td>
                        <td style={{ padding: "13px 20px", fontSize: 13, color: "#64748b" }}>{c.note || "—"}</td>
                        <td style={{ padding: "13px 20px", fontSize: 14, fontWeight: 700, color: "#0ea5e9" }}>₹{c.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </motion.div>
        )}

        {/* Tab: Discharge Summary */}
        {activeTab === "discharge" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {dis?.discharged ? (
              <div style={{ background: "#fff", borderRadius: 16, padding: 32, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", maxWidth: 700 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                  <div style={{ background: "#dcfce7", borderRadius: "50%", padding: 10 }}><Check color="#22c55e" size={22} /></div>
                  <div>
                    <h2 style={{ fontWeight: 700, color: "#0f172a", margin: 0 }}>Patient Discharged</h2>
                    <p style={{ color: "#64748b", fontSize: 13, margin: "3px 0 0" }}>
                      {dis.dischargeDate ? new Date(dis.dischargeDate).toLocaleDateString("en-IN", { dateStyle: "full" }) : ""}
                    </p>
                  </div>
                </div>
                <div style={{ display: "grid", gap: 16 }}>
                  {[
                    { label: "Final Diagnosis", value: dis.finalDiagnosis },
                    { label: "Discharge Summary", value: dis.summary },
                  ].map(f => (
                    <div key={f.label} style={{ padding: 18, background: "#f8faff", borderRadius: 12 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: "#64748b", margin: "0 0 6px" }}>{f.label}</p>
                      <p style={{ fontSize: 15, color: "#0f172a", margin: 0, lineHeight: 1.6 }}>{f.value || "—"}</p>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
                  <button onClick={() => navigate(`/billing/${visit_id}`)}
                    style={{ background: "#0f172a", color: "#fff", border: "none", borderRadius: 10, padding: "11px 20px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                    View Final Bill
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ background: "#fff", borderRadius: 16, padding: 48, textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🏥</div>
                <h3 style={{ color: "#0f172a", fontWeight: 700, fontSize: 18 }}>Patient Not Yet Discharged</h3>
                <p style={{ color: "#94a3b8" }}>Use the Discharge button when the patient is ready to leave.</p>
                {visit?.admitted && (
                  <button onClick={() => navigate(`/discharge/${visit_id}`)}
                    style={{ marginTop: 16, background: "#ef4444", color: "#fff", border: "none", borderRadius: 10, padding: "12px 28px", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
                    Discharge Patient
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
