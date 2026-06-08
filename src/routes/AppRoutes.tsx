import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import ClientProfile from "../pages/ClientProfile";
import RegisterClient from "../pages/RegisterClient";
import Rewards from "../pages/Rewards";
import ClientView from "../pages/Clients";
import RegisterTransaction from "../pages/Registertransaction";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/client/:phone" element={<ClientProfile />} />  {/* ← cambiado */}
        <Route path="/register-client" element={<RegisterClient />} />
        <Route path="/rewards" element={<Rewards />} />
        <Route path="/client-view" element={<ClientView />} />
        <Route path="/register-transaction" element={<RegisterTransaction />} />
        <Route path="/register-transaction/:clientId" element={<RegisterTransaction />} />
      </Routes>
    </BrowserRouter>
  );
}