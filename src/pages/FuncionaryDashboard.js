import React,{useEffect} from 'react';
import { Container, Row, Col, Card, Badge, Dropdown, ListGroup } from 'react-bootstrap';
import { 
  PersonFill, 
  FileEarmarkTextFill, 
  ExclamationTriangleFill,
  ArrowRightShort,
  PlusCircleFill,
  FileEarmarkPlusFill,
  GearFill
} from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header/Header';


export default function FuncionaryDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token || role.toLowerCase() !== 'funcionario') {
      navigate('/');
    }
  }, [navigate]);

  const cerrarSesion = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
   <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
  <Header />
  
  <Container fluid className="px-4 py-4">
    <Row className="g-4 mb-4">
      <Col>
        <div className="d-flex align-items-center">
          <h2 className="mb-0 fw-bold">👋 Hola, Funcionario</h2>
          <span className="badge bg-primary ms-3">Funcionario</span>
        </div>
        <p className="text-muted mb-0">Aquí puedes monitorear el estado del sistema y gestionar los recursos.</p>
      </Col>
    </Row>

    {/* Cards de estadísticas */}
    <Row className="g-4 mb-5">
      <Col xl={4} md={6}>
        <Card className="shadow-sm border-0 rounded-3 h-100 hover-scale">
          <Card.Body className="p-4">
            <div className="d-flex align-items-center">
              <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                <PersonFill size={24} className="text-primary" />
              </div>
              <div>
                <Card.Title className="fw-semibold mb-1">Usuarios Registrados</Card.Title>
                <Card.Text className="text-muted small">12 usuarios activos en el sistema</Card.Text>
              </div>
              <Badge bg="primary" className="ms-auto">+3 hoy</Badge>
            </div>
          </Card.Body>
          <Card.Footer className="bg-transparent border-0 py-3">
            <a href="#" className="text-primary text-decoration-none small fw-semibold">
              Ver todos los usuarios <ArrowRightShort size={18} />
            </a>
          </Card.Footer>
        </Card>
      </Col>

      <Col xl={4} md={6}>
        <Card className="shadow-sm border-0 rounded-3 h-100 hover-scale">
          <Card.Body className="p-4">
            <div className="d-flex align-items-center">
              <div className="bg-success bg-opacity-10 p-3 rounded-circle me-3">
                <FileEarmarkTextFill size={24} className="text-success" />
              </div>
              <div>
                <Card.Title className="fw-semibold mb-1">Contratos Activos</Card.Title>
                <Card.Text className="text-muted small">5 contratos actualmente en curso</Card.Text>
              </div>
              <Badge bg="success" className="ms-auto">+1 hoy</Badge>
            </div>
          </Card.Body>
          <Card.Footer className="bg-transparent border-0 py-3">
            <a href="#" className="text-success text-decoration-none small fw-semibold">
              Gestionar contratos <ArrowRightShort size={18} />
            </a>
          </Card.Footer>
        </Card>
      </Col>

      <Col xl={4} md={6}>
        <Card className="shadow-sm border-0 rounded-3 h-100 hover-scale">
          <Card.Body className="p-4">
            <div className="d-flex align-items-center">
              <div className="bg-warning bg-opacity-10 p-3 rounded-circle me-3">
                <ExclamationTriangleFill size={24} className="text-warning" />
              </div>
              <div>
                <Card.Title className="fw-semibold mb-1">Alertas del Sistema</Card.Title>
                <Card.Text className="text-muted small">2 alertas pendientes por revisar</Card.Text>
              </div>
              <Badge bg="warning" className="ms-auto">Urgente</Badge>
            </div>
          </Card.Body>
          <Card.Footer className="bg-transparent border-0 py-3">
            <a href="#" className="text-warning text-decoration-none small fw-semibold">
              Revisar alertas <ArrowRightShort size={18} />
            </a>
          </Card.Footer>
        </Card>
      </Col>
    </Row>

    {/* Sección adicional con gráficos o más información */}
    <Row className="g-4">
      <Col xl={8}>
        <Card className="shadow-sm border-0 rounded-3 h-100">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <Card.Title className="fw-semibold mb-0">Actividad Reciente</Card.Title>
              <Dropdown>
                <Dropdown.Toggle variant="light" size="sm" id="dropdown-activity">
                  Esta semana
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item>Hoy</Dropdown.Item>
                  <Dropdown.Item>Esta semana</Dropdown.Item>
                  <Dropdown.Item>Este mes</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
            {/* Aquí iría un gráfico o tabla de actividad */}
            <div className="bg-light rounded-2 p-5 text-center text-muted">
              [Gráfico de actividad se mostraría aquí]
            </div>
          </Card.Body>
        </Card>
      </Col>
      
      <Col xl={4}>
        <Card className="shadow-sm border-0 rounded-3 h-100">
          <Card.Body>
            <Card.Title className="fw-semibold mb-4">Acciones Rápidas</Card.Title>
            <ListGroup variant="flush">
              <ListGroup.Item action className="d-flex align-items-center py-3 border-0">
                <PlusCircleFill className="text-primary me-3" />
                <span>Crear nuevo usuario</span>
              </ListGroup.Item>
              <ListGroup.Item action className="d-flex align-items-center py-3 border-0">
                <FileEarmarkPlusFill className="text-success me-3" />
                <span>Generar reporte</span>
              </ListGroup.Item>
              <ListGroup.Item action className="d-flex align-items-center py-3 border-0">
                <GearFill className="text-secondary me-3" />
                <span>Configuración del sistema</span>
              </ListGroup.Item>
            </ListGroup>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </Container>

  {/* Estilos adicionales */}
  <style>{`
    .hover-scale {
      transition: transform 0.2s ease;
    }
    .hover-scale:hover {
      transform: translateY(-5px);
    }
    .badge {
      font-weight: 500;
    }
  `}</style>
</div>
  );
}
