import React from 'react';
import Sidebar from '../Sidebar';
import { useNavigate } from 'react-router-dom';
import { Container, Navbar, Nav } from 'react-bootstrap';
import { Cpu, Power } from 'react-bootstrap-icons';
import './Header.css'

export default function Header() {
    const navigate = useNavigate();

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
                        <Nav.Link 
                            onClick={cerrarSesion}
                            className="logout-link"
                        >
                            <Power size={16} className="me-1" />
                            Salir
                        </Nav.Link>
                    </Nav>
                </Container>
            </Navbar>

        
        </div>
    )
}