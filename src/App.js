import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from "./pages/Login";
// Ruta del admin
import AdminDashboard from "./pages/AdminDashboard";
import FuncionaryDashboard from "./pages/view_funcionario/FuncionarioDashboard";
import ContratistaDashboard from "./pages/view_contratista/ContratistaDashboard";
// Usuarios
import UserAdmin from "./pages/view_admin/User/Admin/User_Admin";
import UserContract from "./pages/view_admin/User/Contract/User_Contract";
import UserFuncionary from "./pages/view_admin/User/Funcionary/User_Funcionary";

// Gestion_Documental
import DashboardPage from "./pages/view_admin/Document/DashboardPage";

import Data from "./pages/view_admin/Data/Data"

// Funcione para las alertas
import { Toaster } from "sonner";

// Contratos
import Contracts from "./pages/view_admin/Contract/Contracts";
import RoleRouter from "./components/RoleRoute";
import { ROLES } from './constants/roles';
import AdminComponent from './components/AdminComponent';
import FuncionarioComponent from './components/FuncionarioComponent';
import Usuarios from './components/Usuarios';

//temporal
const userRole = 'funcionario';

function DashboardSelector() {
  const role = localStorage.getItem("role");
  if (role === "admin") return <AdminDashboard />;
  if (role === "funcionario") return <FuncionaryDashboard />;
  if (role === "contratista") return <ContratistaDashboard />;
  // Puedes agregar más roles aquí
  return <div>No autorizado</div>;
}

function App() {
  const { user } = useAuth();

  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          {/* Redirigir la ruta raíz al login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          {/* Dashboard dinámico según rol */}
          <Route path="/dashboard" element={<DashboardSelector />} />
          {/* Users */}
          <Route path="/AdminUser" element={<UserAdmin />} />
          <Route path="/ContractUser" element={<UserContract />} />
          <Route path="/FuncionaryUser" element={<UserFuncionary />} />
          {/* Contrato */}
          <Route path="/Contracts" element={<Contracts />} />
          {/* Gestion_Documental */}
          <Route path="/Document" element={<DashboardPage />} />
          <Route path="/AllDocuments" element={<DashboardPage />} />
          {/* Data */}
          <Route path="/Data" element={<Data />} />
          {/*rutas nuevas diego*/}
          <Route 
        path = "/usuarios"
        element = {
          <RoleRouter allowedRoles = {[ROLES.ADMIN, ROLES.FUNCIONARIO]} userRole={userRole}>
            <Usuarios />
          </RoleRouter>
        }
        />
          {user && user.role === ROLES.ADMIN && <AdminComponent />}
          {user && user.role === ROLES.FUNCIONARIO && <FuncionarioComponent />}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
