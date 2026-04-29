import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

function Layout() {
const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="flex h-screen">

      {/* ✅ ROLE BASED SIDEBAR */}
      {user && <Sidebar />}

      <div className="flex-1 flex flex-col">

        {/* ✅ TOP NAVBAR */}
        <Navbar />

        {/* MAIN CONTENT */}
        <div className="p-6 bg-gray-100 flex-1 overflow-y-auto">
          <Outlet />
        </div>

      </div>
    </div>
  );
}

export default Layout;