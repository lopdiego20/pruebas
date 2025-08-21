import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
// Ruta del admin
import AdminDashboard from "./pages/AdminDashboard";
// Usuarios
import User_Admin from "./pages/view_admin/User/Admin/User_Admin";
import User_Contract from "./pages/view_admin/User/Contract/User_Contract";
import User_Funcionary from "./pages/view_admin/User/Funcionary/User_Funcionary";

// Gestion_Documental
import DashboardPage from "./pages/view_admin/Document/DashboardPage";
import GestionDocumental from "./pages/view_admin/Document/GestionDocumental";

import Data from "./pages/view_admin/Data/Data"

// Funcione para las alertas
import { Toaster } from "sonner";

// Contratos
import Contracts from "./pages/view_admin/Contract/Contracts";

function App() {
  return (
    // Funcion para las alertas

    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Login />} />
        {/* Users */}
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/AdminUser" element={<User_Admin />} />
        <Route path="/ContractUser" element={<User_Contract />} />
        <Route path="/FuncionaryUser" element={<User_Funcionary />} />
        {/* Contrato */}
        <Route path="/Contracts" element={<Contracts />} />
        {/* Gestion_Documental */}
        <Route path="/Document" element={<DashboardPage />} />
         <Route path="/DocumentAll" element={<GestionDocumental />} />
        {/* Data */}
        <Route path="/Data" element={<Data />} />
       
      </Routes>
    </Router>
  );
}

export default App;
