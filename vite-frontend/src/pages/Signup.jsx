import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import { motion, AnimatePresence } from "framer-motion";

const ROLES = [
  { id: "doctor",  label: "Doctor",  icon: "🩺", desc: "Manage patients, visits & appointments" },
  { id: "patient", label: "Patient", icon: "🏥", desc: "Book appointments & view your records" },
];

const SPECIALIZATIONS = [
  "General Physician", "Cardiologist", "Neurologist", "Orthopedic",
  "Pediatrician", "Dermatologist", "ENT", "Ophthalmologist",
  "Gynecologist", "Psychiatrist", "Surgeon", "Other"
];

const GENDERS = ["Male", "Female", "Other"];

export default function Signup() {
  const navigate = useNavigate();
  const [role, setRole]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "", email: "", password: "", confirm: "",
    specialization: "", age: "", gender: "", phone: ""
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");

    if (form.password !== form.confirm) {
      setError("Passwords don't match"); return;
    }
    if (form.password.length < 4) {
      setError("Password must be at least 4 characters"); return;
    }

    setLoading(true);
    try {
      const endpoint = role === "doctor" ? "/api/register/doctor" : "/api/register/patient";
      const payload  = role === "doctor"
        ? { name: form.name, email: form.email, password: form.password, specialization: form.specialization }
        : { name: form.name, email: form.email, password: form.password, age: form.age, gender: form.gender, phone: form.phone };

      await API.post(endpoint, payload);
      setSuccess(`${role === "doctor" ? "Doctor" : "Patient"} account created! Redirecting to login…`);
      setTimeout(() => navigate("/login"), 1800);
    } catch (err) {
      setError(err.response?.data?.msg || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%)",
      display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter',sans-serif", padding: 24
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: "#fff", borderRadius: 24, padding: "40px 44px", width: "100%", maxWidth: 520, boxShadow: "0 32px 80px rgba(0,0,0,0.4)" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🏥</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", margin: 0 }}>Create Account</h1>
          <p style={{ color: "#94a3b8", fontSize: 14, marginTop: 6 }}>Join the hospital management system</p>
        </div>

        {/* Role Selector */}
        {!role && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p style={{ textAlign: "center", fontWeight: 600, color: "#475569", marginBottom: 16 }}>I am a…</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {ROLES.map(r => (
                <motion.button key={r.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setRole(r.id)}
                  style={{ background: "#f8faff", border: "2px solid #e5e7eb", borderRadius: 16, padding: "20px 16px", cursor: "pointer", textAlign: "center", transition: "all 0.2s" }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>{r.icon}</div>
                  <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 16 }}>{r.label}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{r.desc}</div>
                </motion.button>
              ))}
            </div>
            <p style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "#94a3b8" }}>
              Already have an account?{" "}
              <Link to="/login" style={{ color: "#6366f1", fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
            </p>
          </motion.div>
        )}

        {/* Form */}
        {role && (
          <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Role badge + back */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ background: role === "doctor" ? "#dbeafe" : "#dcfce7", color: role === "doctor" ? "#1d4ed8" : "#15803d", borderRadius: 20, padding: "4px 14px", fontSize: 13, fontWeight: 600 }}>
                {role === "doctor" ? "🩺 Doctor" : "🏥 Patient"}
              </span>
              <button type="button" onClick={() => { setRole(""); setError(""); }}
                style={{ background: "none", border: "none", color: "#94a3b8", fontSize: 13, cursor: "pointer" }}>
                ← Change
              </button>
            </div>

            {/* Common fields */}
            <InputField label="Full Name" placeholder="Dr. John Smith" value={form.name} onChange={v => set("name", v)} required />
            <InputField label="Email" type="email" placeholder="you@hospital.com" value={form.email} onChange={v => set("email", v)} required />
            <InputField label="Password" type="password" placeholder="Min. 4 characters" value={form.password} onChange={v => set("password", v)} required />
            <InputField label="Confirm Password" type="password" placeholder="Repeat password" value={form.confirm} onChange={v => set("confirm", v)} required />

            {/* Doctor-specific */}
            {role === "doctor" && (
              <div>
                <label style={labelStyle}>Specialization</label>
                <select value={form.specialization} onChange={e => set("specialization", e.target.value)} style={inputStyle} required>
                  <option value="">Select specialization…</option>
                  {SPECIALIZATIONS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            )}

            {/* Patient-specific */}
            {role === "patient" && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <InputField label="Age" type="number" placeholder="25" value={form.age} onChange={v => set("age", v)} required min="1" max="120" />
                  <div>
                    <label style={labelStyle}>Gender</label>
                    <select value={form.gender} onChange={e => set("gender", e.target.value)} style={inputStyle} required>
                      <option value="">Select…</option>
                      {GENDERS.map(g => <option key={g}>{g}</option>)}
                    </select>
                  </div>
                </div>
                <InputField label="Phone" type="tel" placeholder="+91 9999999999" value={form.phone} onChange={v => set("phone", v)} />
              </>
            )}

            {/* Error / Success */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ padding: "10px 14px", background: "#fee2e2", color: "#b91c1c", borderRadius: 10, fontSize: 13, fontWeight: 500 }}>
                  ❌ {error}
                </motion.div>
              )}
              {success && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  style={{ padding: "10px 14px", background: "#dcfce7", color: "#15803d", borderRadius: 10, fontSize: 13, fontWeight: 500 }}>
                  ✅ {success}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", border: "none", borderRadius: 12, padding: "14px", fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 4 }}>
              {loading ? "Creating account…" : `Create ${role === "doctor" ? "Doctor" : "Patient"} Account`}
            </motion.button>

            <p style={{ textAlign: "center", fontSize: 14, color: "#94a3b8", marginTop: 4 }}>
              Already have an account?{" "}
              <Link to="/login" style={{ color: "#6366f1", fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
            </p>
          </motion.form>
        )}
      </motion.div>
    </div>
  );
}

const labelStyle = { display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 5 };
const inputStyle  = { width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" };

function InputField({ label, type = "text", placeholder, value, onChange, required, min, max }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input type={type} placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)} required={required}
        min={min} max={max}
        style={inputStyle} />
    </div>
  );
}
