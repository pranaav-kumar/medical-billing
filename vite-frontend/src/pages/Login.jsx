import React, { useState } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [form, setForm]     = useState({});
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await API.post("/api/login", form);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      window.location.href = "/redirect";
    } catch (err) {
      setError(err.response?.data?.msg || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => { if (e.key === "Enter") handleLogin(); };

  return (
    <div style={{
      minHeight: "100vh", background: "linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%)",
      display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter',sans-serif"
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <div style={{ background: "#fff", borderRadius: 24, padding: "40px 44px", width: "100%", maxWidth: 420, boxShadow: "0 32px 80px rgba(0,0,0,0.4)" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🏥</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", margin: 0 }}>Hospital System</h1>
          <p style={{ color: "#94a3b8", fontSize: 14, marginTop: 6 }}>Sign in to your account</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <input
            placeholder="Email address"
            type="email"
            onChange={e => setForm({ ...form, email: e.target.value })}
            onKeyDown={handleKeyDown}
            style={{ padding: "12px 16px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none" }}
          />
          <input
            type="password"
            placeholder="Password"
            onChange={e => setForm({ ...form, password: e.target.value })}
            onKeyDown={handleKeyDown}
            style={{ padding: "12px 16px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none" }}
          />

          {error && (
            <div style={{ padding: "10px 14px", background: "#fee2e2", color: "#b91c1c", borderRadius: 10, fontSize: 13 }}>
              ❌ {error}
            </div>
          )}

          <button onClick={handleLogin} disabled={loading}
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", border: "none", borderRadius: 12, padding: "14px", fontSize: 15, fontWeight: 700, cursor: "pointer", opacity: loading ? 0.7 : 1 }}>
            {loading ? "Signing in…" : "Sign In"}
          </button>

          <p style={{ textAlign: "center", fontSize: 14, color: "#94a3b8", marginTop: 4 }}>
            Don't have an account?{" "}
            <Link to="/signup" style={{ color: "#6366f1", fontWeight: 600, textDecoration: "none" }}>
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;