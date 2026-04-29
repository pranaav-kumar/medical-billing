import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home, Users, FileText, Calendar, BedDouble,
  Package, ClipboardList, Pill, LayoutDashboard, LogOut
} from "lucide-react";

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  let menu = [];

  if (user?.role === "admin") {
    menu = [
      { name: "Dashboard",    path: "/dashboard",   icon: <Home size={18} /> },
      { name: "Patients",     path: "/patients",    icon: <Users size={18} /> },
      { name: "Add Patient",  path: "/add-patient", icon: <Users size={18} /> },
      { name: "IP Patients",  path: "/ip-patients", icon: <BedDouble size={18} /> },
      { name: "Claims",       path: "/claims",      icon: <FileText size={18} /> },
      { name: "Inventory",    path: "/inventory",   icon: <Package size={18} /> },
    ];
  }

  if (user?.role === "doctor") {
    menu = [
      { name: "Dashboard",          path: "/doctor-dashboard",   icon: <LayoutDashboard size={18} /> },
      { name: "Appointments",       path: "/appointments",       icon: <Calendar size={18} /> },
      { name: "Patients",           path: "/patients",           icon: <Users size={18} /> },
      { name: "Add Patient",        path: "/add-patient",        icon: <Users size={18} /> },
      { name: "IP Patients",        path: "/ip-patients",        icon: <BedDouble size={18} /> },
      { name: "Write Prescription", path: "/write-prescription", icon: <Pill size={18} /> },
      { name: "Request Inventory",  path: "/request-inventory",  icon: <ClipboardList size={18} /> },
    ];
  }

  if (user?.role === "patient") {
    menu = [
      { name: "My Dashboard",    path: "/patient-dashboard", icon: <LayoutDashboard size={18} /> },
      { name: "Book Appointment",path: "/appointment",       icon: <Calendar size={18} /> },
    ];
  }

  return (
    <div style={{
      width: 240, minHeight: "100vh", background: "linear-gradient(180deg,#1e293b,#0f172a)",
      display: "flex", flexDirection: "column", fontFamily: "'Inter',sans-serif"
    }}>
      {/* Logo */}
      <div style={{ padding: "24px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <h1 style={{ color: "#fff", fontSize: 16, fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>
          MedSystem
        </h1>
        <p style={{ color: "#64748b", fontSize: 11, margin: "4px 0 0" }}>{user?.name} · {user?.role}</p>
      </div>

      {/* Nav Links */}
      <nav style={{ flex: 1, padding: "12px 10px" }}>
        {menu.map((item, i) => {
          const active = location.pathname === item.path;
          return (
            <Link key={i} to={item.path}
              style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                borderRadius: 10, marginBottom: 4, textDecoration: "none", fontSize: 13, fontWeight: 600,
                background: active ? "rgba(99,102,241,0.25)" : "transparent",
                color: active ? "#a5b4fc" : "#94a3b8",
                borderLeft: active ? "3px solid #6366f1" : "3px solid transparent",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
            >
              {item.icon}
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: "12px 10px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <button onClick={handleLogout}
          style={{
            display: "flex", alignItems: "center", gap: 10, width: "100%",
            padding: "10px 12px", borderRadius: 10, border: "none", background: "transparent",
            color: "#f87171", fontSize: 13, fontWeight: 600, cursor: "pointer", textAlign: "left"
          }}>
          <LogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;