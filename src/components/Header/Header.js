import React from 'react';
import Sidebar from '../Sidebar';
import { useNavigate } from 'react-router-dom';
import { Container, Navbar, Nav } from 'react-bootstrap';
import { Cpu, Power } from 'react-bootstrap-icons';
import './Header.css'
import {ROLES} from '../../config/rolesConfig';

export default function Header() {
    const navigate = useNavigate();
    //simula el rol 
    const userRole = localStorage.getItem('role') || ROLES.CONTRATISTA;


    const cerrarSesion = () => {
        localStorage.clear();
        navigate('/');
    };

    return (
        <div>
            <Sidebar />
            <Navbar expand="lg" className="smooth-navbar">
                <Container fluid>
                    <Navbar.Brand className="d-flex align-items-center">
                        <div className="navbar-icon-container">
                            
                            {/* <Cpu size={20} className="navbar-icon" /> */}
                        </div>
                        <span className="navbar-title">ADCU</span>
                    </Navbar.Brand>
                    
                   <Nav className="ms-auto">
                    {userRole === ROLES.ADMIN &&(
                        <>
                        <Nav.Link href = "/admin">Admin</Nav.Link>
                        <Nav.Link href = "/usuarios">Funcionario</Nav.Link>
                        <Nav.Link href = "/contratos">Contratista</Nav.Link>
                        </>
                    )}
                    {userRole === ROLES.FUNCIONARIO && (
                        <>
                        <Nav.Link href = "/funcionario">Panel funcionario</Nav.Link>
                        <Nav.Link href = "/usuarios">Usuarios</Nav.Link>
                        <Nav.Link href = "/contratos">Contratos</Nav.Link>
                        </>
                    )}
                    {userRole === ROLES.CONTRATISTA &&(
                        <>
                        <Nav.Link href = "/contratista">Panel contratista</Nav.Link>
                        <Nav.Link href = "/documentos">Documentos</Nav.Link>
                        </>
                    )}
                    <Nav.Link onClick={cerrarSesion} className="logout-link">
                        <Power size ={16} className="me-1"/>
                        Salir
                        </Nav.Link> 
                   </Nav>
                </Container>
            </Navbar>

        
        </div>
    )
}