/* global globalThis */
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUsers,
  FaUserTie,
  FaUserShield,
  FaUserFriends,
  FaFileContract,
  FaFolderOpen,
  FaChartBar,
  FaCheckCircle,
  FaSignOutAlt,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { IoDocument } from "react-icons/io5"
import "./Sidebar.css";

import { Cpu } from 'react-bootstrap-icons';
import { ROLES } from '../config/rolesConfig';

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [contractorOpen, setContractorOpen] = useState(false);
  const [documentOpen, setDocumentOpen] = useState(false)

  const navigate = useNavigate();

  // Obtener el rol del usuario
  const userRole = localStorage.getItem('role') || ROLES.CONTRATISTA;



  const toggleMenu = () => {

    setOpen(!open);
  };

  const cerrarSesion = () => {


    // Confirmar antes de cerrar sesión
    if (typeof globalThis !== "undefined" && globalThis.confirm('¿Estás seguro de que quieres cerrar sesión?')) {

      localStorage.clear();
      navigate("/");
    } else {

    }
  }

  return (
    <>
      <button
        className="hamburger-icon"
        onClick={toggleMenu}
        aria-label="Abrir menú de navegación"
        aria-expanded={open}
        aria-controls="sidebar-menu"
      >
        <Cpu size={20} />
      </button>

      <button
        className={`sidebar-overlay ${open ? "show" : ""}`}
        onClick={toggleMenu}
        aria-label="Cerrar menú"
        style={{ border: 'none', padding: 0 }} // Inline style to ensure reset for now, or rely on CSS
      ></button>

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
              <button
                className="menu-item"
                onClick={() => setUserOpen(!userOpen)}
              >
                <FaUsers /> Gestión de Usuario{" "}
                {userOpen ? <FaChevronUp /> : <FaChevronDown />}
              </button>
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
          <Link to="/Contracts" onClick={() => setContractorOpen(!contractorOpen)}>
            <FaFileContract /> Contratos
          </Link>

          {/* Gestion documental */}

          <button
            className="menu-item"
            onClick={() => setDocumentOpen(!documentOpen)}
          >
            <FaFolderOpen /> Gestión Documental
            {documentOpen ? <FaChevronUp /> : <FaChevronDown />}
          </button>
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

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();

              toggleMenu();
              cerrarSesion();
            }}
            className="logout"
          >
            <FaSignOutAlt /> Cerrar sesión
          </button>
        </nav>
      </div>
    </>
  );
}
