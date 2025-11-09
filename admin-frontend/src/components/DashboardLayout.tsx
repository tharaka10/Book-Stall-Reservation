import { Outlet } from "react-router-dom";
// Let's try a more explicit relative path
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function DashboardLayout() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {/* Outlet renders the matched child route (e.g., DashboardPage) */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}