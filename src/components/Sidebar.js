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
// import logo from '../assets/logo.png'; // 🧠 Asegúrate que esta ruta sea correcta

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [contractorOpen, setContractorOpen] = useState(false);
  const [documentOpen, setDocumentOpen] = useState(false)

  const navigate = useNavigate();

  const toggleMenu = () => setOpen(!open);

  const cerrarSesion = () => {
    localStorage.clear();
    navigate("/");
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

          {/* Gestión de Usuario */}
          <div className="menu-item" onClick={() => setUserOpen(!userOpen)}>
            <FaUsers /> Gestión de Usuario{" "}
            {userOpen ? <FaChevronUp /> : <FaChevronDown />}
          </div>
          {userOpen && (
            <div className="submenu">
              <Link to="/AdminUser" onClick={toggleMenu}>
                <FaUserShield /> Admins
              </Link>
              <Link to="/FuncionaryUser" onClick={toggleMenu}>
                <FaUserFriends /> Funcionarios
              </Link>
              <Link to="/ContractUser" onClick={toggleMenu}>
                <FaUserTie /> Contratistas
              </Link>
            </div>
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
          <Link to="/reporte" onClick={toggleMenu}>
            <FaFileAlt /> Reporte
          </Link>

          <div
            onClick={() => {
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
