import React, { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

function Login() {
  const [form, setForm] = useState({});
  const navigate = useNavigate();

const handleLogin = async () => {
  try {
    const res = await API.post("/login", form);

    const user = res.data.user;

    // ✅ STORE USER
    localStorage.setItem("user", JSON.stringify(user));

    // ✅ FORCE REFRESH → React re-reads localStorage
    window.location.href = "/redirect";

  } catch (err) {
    alert("Login failed");
  }
};

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Login</h2>

      <input
        placeholder="Email"
        onChange={(e) =>
          setForm({ ...form, email: e.target.value })
        }
        className="border p-2 w-full mb-2"
      />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) =>
          setForm({ ...form, password: e.target.value })
        }
        className="border p-2 w-full mb-4"
      />

      <button
        onClick={handleLogin}
        className="bg-blue-600 text-white w-full p-2 rounded"
      >
        Login
      </button>
    </div>
  );
}

export default Login;