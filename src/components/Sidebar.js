import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaBars,
  FaUsers,
  FaUserTie,
  FaUserShield,
  FaUserFriends,
  FaFileContract,
  FaFolderOpen,
  FaDatabase,
  FaMoneyCheckAlt,
  FaChartBar,
  FaCheckCircle,
  FaFileAlt,
  FaSignOutAlt,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { IoDocument,IoDocuments  } from "react-icons/io5"
import "./Sidebar.css";

import { Cpu, Power } from 'react-bootstrap-icons';
import { ROLES } from '../config/rolesConfig';
// import logo from '../assets/logo.png'; // 🧠 Asegúrate que esta ruta sea correcta

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [contractorOpen, setContractorOpen] = useState(false);
  const [documentOpen, setDocumentOpen] = useState(false)

  const navigate = useNavigate();
  
  // Obtener el rol del usuario
  const userRole = localStorage.getItem('role') || ROLES.CONTRATISTA;
  
  // Debug: Verificar rol del usuario
  console.log('👤 [SIDEBAR] Rol del usuario:', userRole);
  console.log('👤 [SIDEBAR] ROLES disponibles:', ROLES);

  const toggleMenu = () => {
    console.log('🔧 [SIDEBAR] toggleMenu llamado, estado actual:', open);
    setOpen(!open);
  };

  const cerrarSesion = () => {
    console.log('🚨 [SIDEBAR] cerrarSesion() fue llamado!');
    console.log('🚨 [SIDEBAR] Stack trace:', new Error().stack);
    
    // Confirmar antes de cerrar sesión
    if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      console.log('🚨 [SIDEBAR] Usuario confirmó cerrar sesión');
      localStorage.clear();
      navigate("/");
    } else {
      console.log('🚨 [SIDEBAR] Usuario canceló cerrar sesión');
    }
  };

  return (
    <>
      <div className="hamburger-icon" onClick={toggleMenu}>
        <Cpu size={20} className="navbar-icon" style={{ marginBottom: "25px", marginLeft: "4px" }} />
      </div>

      <div
        className={`sidebar-overlay ${open ? "show" : ""}`}
        onClick={toggleMenu}
      ></div>

      <div className={`sidebar-menu ${open ? "open" : ""}`}>
        <div className="sidebar-header">
          {/* <img src={logo} alt="Logo ADCU" className="sidebar-logo" /> */}
          <h4>ADCU</h4>
        </div>

        <nav>
          {/* Dashboard */}
          <Link to="/dashboard" onClick={toggleMenu}>
            <FaChartBar /> Dashboard
          </Link>

          {/* Gestión de Usuario - Solo para Admin y Funcionario */}
          {(userRole === ROLES.ADMIN || userRole === ROLES.FUNCIONARIO) && (
            <>
              <div className="menu-item" onClick={() => setUserOpen(!userOpen)}>
                <FaUsers /> Gestión de Usuario{" "}
                {userOpen ? <FaChevronUp /> : <FaChevronDown />}
              </div>
              {userOpen && (
                <div className="submenu">
                  {/* Admins - Solo para Admin */}
                  {userRole === ROLES.ADMIN && (
                    <Link to="/AdminUser" onClick={toggleMenu}>
                      <FaUserShield /> Admins
                    </Link>
                  )}
                  <Link to="/FuncionaryUser" onClick={toggleMenu}>
                    <FaUserFriends /> Funcionarios
                  </Link>
                  <Link to="/ContractUser" onClick={toggleMenu}>
                    <FaUserTie /> Contratistas
                  </Link>
                </div>
              )}
            </>
          )}

          {/* Gestion de contratos */}
          <Link to="/Contracts" onClick={toggleMenu}>
            <FaFileContract /> Contratos
          </Link>

          {/* Gestion documental */}

          <div className="menu-item" onClick={() => setDocumentOpen(!documentOpen)}>
            <FaFolderOpen /> Gestión Documental
            {documentOpen ? <FaChevronUp /> : <FaChevronDown />}
          </div>
          {documentOpen && (
            <div className="submenu">
              <Link to="/Document" onClick={toggleMenu}>
                <IoDocument /> Gestión Documental
              </Link>
            </div>
          )}



          {/* Otros */}
          <Link to="/Data" onClick={toggleMenu}>
            <FaCheckCircle /> Comparacion
          </Link>
          {/* <Link to="/reporte" onClick={toggleMenu}>
            <FaFileAlt /> Reporte
          </Link> */}

          <div
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('🚨 [SIDEBAR] Click en botón cerrar sesión');
              toggleMenu();
              cerrarSesion();
            }}
            className="logout"
          >
            <FaSignOutAlt /> Cerrar sesión
          </div>
        </nav>
      </div>
    </>
  );
}
