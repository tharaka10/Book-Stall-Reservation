import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  const token = localStorage.getItem("token");

  // If token exists, render the nested routes (which will be DashboardLayout)
  // Otherwise, redirect to the login page
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}