import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import ClientProfile from "../pages/ClientProfile";
import RegisterClient from "../pages/RegisterClient";
import Rewards from "../pages/Rewards";
import ClientView from "../pages/Clients";
import RegisterTransaction from "../pages/Registertransaction";
import Stock from "../pages/Stock";
import Scan from "../pages/Scan";
import Panel from "../pages/Panel";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/client/:phone" element={<RequireAuth><ClientProfile /></RequireAuth>} />  {/* ← cambiado */}
        <Route path="/register-client" element={<RequireAuth><RegisterClient /></RequireAuth>} />
        <Route path="/rewards" element={<RequireAuth><Rewards /></RequireAuth>} />
        <Route path="/stock" element={<RequireAuth><Stock /></RequireAuth>} />
        <Route path="/scan" element={<RequireAuth><Scan /></RequireAuth>} />
        <Route path="/panel" element={<RequireAuth><Panel /></RequireAuth>} />
        <Route path="/client-view" element={<RequireAuth><ClientView /></RequireAuth>} />
        <Route path="/register-transaction" element={<RequireAuth><RegisterTransaction /></RequireAuth>} />
        <Route path="/register-transaction/:clientId" element={<RequireAuth><RegisterTransaction /></RequireAuth>} />
      </Routes>
    </BrowserRouter>
  );
}

function RequireAuth({ children }: { children: ReactNode }) {
  const location = useLocation();
  const emp = typeof window !== "undefined" ? localStorage.getItem("employee") : null;
  if (!emp) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}