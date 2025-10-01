import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Badge, ListGroup, Button, Spinner } from 'react-bootstrap';
import { 
  PersonFill, 
  FileEarmarkTextFill, 
  BarChartFill,
  ArrowRightShort,
  ClockHistory,
  CheckCircleFill,
  ExclamationTriangleFill,
  FileEarmarkPdf
} from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import api from '../../services/api';
import { toast } from 'sonner';

// Obtener el nombre del usuario logueado
const userName = (() => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.firsName || user?.firstName || "Contratista";
  } catch {
    return localStorage.getItem("firsName") || "Contratista";
  }
})();

const ContratistaDashboard = () => {
  const [stats, setStats] = useState({
    totalDocuments: 0,
    completedDocuments: 0,
    pendingDocuments: 0,
    totalAnalysis: 0
  });
  const [contractInfo, setContractInfo] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token || role.toLowerCase() !== 'contratista') {
      navigate('/');
    }
    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Obtener información del usuario contratista logueado
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?._id;

      if (!userId) {
        toast.error('No se pudo obtener información del usuario');
        return;
      }

      // Obtener datos del dashboard en paralelo
      const [documentsRes, dataRes, contractorRes] = await Promise.all([
        api.get('/Documents').catch(() => ({ data: { data: [] } })),
        api.get('/Data').catch(() => ({ data: { data: [] } })),
        api.get(`/Users/Contractor`).catch(() => ({ data: { data: [] } }))
      ]);

      // Filtrar documentos y análisis del contratista actual
      const userDocuments = documentsRes.data.data.filter(doc => 
        doc.userContract === userId || doc.user_create === userId
      );
      
      const userAnalysis = dataRes.data.data.filter(analysis => 
        userDocuments.some(doc => doc._id === analysis.document_management)
      );

      // Obtener información del contrato del contratista
      const contractorInfo = contractorRes.data.data.find(contractor => 
        contractor.user?._id === userId
      );

      // Calcular estadísticas
      const totalDocs = userDocuments.length;
      const completedDocs = userDocuments.filter(doc => doc.state === true).length;
      const pendingDocs = totalDocs - completedDocs;

      setStats({
        totalDocuments: totalDocs,
        completedDocuments: completedDocs,
        pendingDocuments: pendingDocs,
        totalAnalysis: userAnalysis.length
      });

      setContractInfo(contractorInfo);

      // Actividades recientes (simular hasta que tengamos endpoint específico)
      const activities = [
        { 
          id: 1, 
          type: 'document', 
          message: `${totalDocs > 0 ? 'Documentos gestionados' : 'Sin documentos'}`, 
          time: 'Hoy',
          status: totalDocs > 0 ? 'success' : 'warning'
        },
        { 
          id: 2, 
          type: 'analysis', 
          message: `${userAnalysis.length} análisis realizados`, 
          time: 'Esta semana',
          status: userAnalysis.length > 0 ? 'success' : 'info'
        },
        { 
          id: 3, 
          type: 'contract', 
          message: contractorInfo?.contract ? 'Contrato asignado' : 'Sin contrato asignado', 
          time: 'Estado actual',
          status: contractorInfo?.contract ? 'success' : 'warning'
        }
      ];

      setRecentActivities(activities);

    } catch (err) {
      console.error('Error al cargar datos del dashboard:', err);
      toast.error('Error al cargar datos del dashboard', {
        description: err.response?.data?.message || 'Error del servidor'
      });
    } finally {
      setLoading(false);
    }
  };

  const cerrarSesion = () => {
    localStorage.clear();
    navigate('/');
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
        <Header />
        <Container fluid className="py-4">
          <div className="text-center">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted">Cargando dashboard...</p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <Header />
      
      <Container fluid className="px-4 py-4">
        <Row className="g-4 mb-4">
          <Col>
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <h2 className="mb-0 fw-bold">
                  👋 Hola, {userName}
                </h2>
                <span className="badge bg-info ms-3">Contratista</span>
              </div>
              <Button variant="outline-danger" onClick={cerrarSesion}>
                <i className="bi bi-box-arrow-right me-2"></i>
                Cerrar Sesión
              </Button>
            </div>
            <p className="text-muted mb-0 mt-1">
              Bienvenido a tu panel de control
            </p>
          </Col>
        </Row>

        {/* Información del Contrato */}
        {contractInfo && (
          <Row className="g-4 mb-4">
            <Col>
              <Card className="border-0 shadow-sm">
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div className="bg-info bg-opacity-10 p-3 rounded-circle me-3">
                      <FileEarmarkTextFill size={24} className="text-info" />
                    </div>
                    <div className="flex-grow-1">
                      <h5 className="mb-1">Contrato Asignado</h5>
                      <p className="text-muted mb-0">
                        {contractInfo.contract ? (
                          <span className="text-success">
                            <CheckCircleFill className="me-1" />
                            Contrato activo - ID: {contractInfo.contract}
                          </span>
                        ) : (
                          <span className="text-warning">
                            <ExclamationTriangleFill className="me-1" />
                            Sin contrato asignado
                          </span>
                        )}
                      </p>
                    </div>
                    {contractInfo.contract && (
                      <Button 
                        variant="outline-info" 
                        onClick={() => navigate('/contratista/contratos')}
                      >
                        Ver Detalles
                      </Button>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Estadísticas principales */}
        <Row className="g-4 mb-4">
          <Col md={3}>
            <Card className="border-0 shadow-sm h-100 hover-scale">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                    <FileEarmarkTextFill size={24} className="text-primary" />
                  </div>
                  <div>
                    <Card.Title className="fw-semibold mb-1">Documentos</Card.Title>
                    <Card.Text className="text-muted small">
                      {stats.totalDocuments} total
                      <br />
                      {stats.completedDocuments} completados
                    </Card.Text>
                  </div>
                  <Badge bg="primary" className="ms-auto">
                    {stats.totalDocuments}
                  </Badge>
                </div>
              </Card.Body>
              <Card.Footer className="bg-transparent border-0 py-3">
                <button 
                  onClick={() => navigate('/contratista/documentos')}
                  className="btn btn-link text-primary text-decoration-none small fw-semibold p-0"
                >
                  Gestionar documentos <ArrowRightShort size={18} />
                </button>
              </Card.Footer>
            </Card>
          </Col>

          <Col md={3}>
            <Card className="border-0 shadow-sm h-100 hover-scale">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="bg-warning bg-opacity-10 p-3 rounded-circle me-3">
                    <ClockHistory size={24} className="text-warning" />
                  </div>
                  <div>
                    <Card.Title className="fw-semibold mb-1">Pendientes</Card.Title>
                    <Card.Text className="text-muted small">
                      {stats.pendingDocuments} documentos
                      <br />
                      Por completar
                    </Card.Text>
                  </div>
                  <Badge bg="warning" className="ms-auto">
                    {stats.pendingDocuments}
                  </Badge>
                </div>
              </Card.Body>
              <Card.Footer className="bg-transparent border-0 py-3">
                <button 
                  onClick={() => navigate('/contratista/documentos')}
                  className="btn btn-link text-warning text-decoration-none small fw-semibold p-0"
                >
                  Ver pendientes <ArrowRightShort size={18} />
                </button>
              </Card.Footer>
            </Card>
          </Col>

          <Col md={3}>
            <Card className="border-0 shadow-sm h-100 hover-scale">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="bg-success bg-opacity-10 p-3 rounded-circle me-3">
                    <BarChartFill size={24} className="text-success" />
                  </div>
                  <div>
                    <Card.Title className="fw-semibold mb-1">Análisis</Card.Title>
                    <Card.Text className="text-muted small">
                      {stats.totalAnalysis} realizados
                      <br />
                      Comparaciones de datos
                    </Card.Text>
                  </div>
                  <Badge bg="success" className="ms-auto">
                    {stats.totalAnalysis}
                  </Badge>
                </div>
              </Card.Body>
              <Card.Footer className="bg-transparent border-0 py-3">
                <button 
                  onClick={() => navigate('/contratista/datos')}
                  className="btn btn-link text-success text-decoration-none small fw-semibold p-0"
                >
                  Ver análisis <ArrowRightShort size={18} />
                </button>
              </Card.Footer>
            </Card>
          </Col>

          <Col md={3}>
            <Card className="border-0 shadow-sm h-100 hover-scale">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="bg-info bg-opacity-10 p-3 rounded-circle me-3">
                    <PersonFill size={24} className="text-info" />
                  </div>
                  <div>
                    <Card.Title className="fw-semibold mb-1">Mi Perfil</Card.Title>
                    <Card.Text className="text-muted small">
                      Información personal
                      <br />
                      y configuración
                    </Card.Text>
                  </div>
                  <Badge bg="info" className="ms-auto">
                    Activo
                  </Badge>
                </div>
              </Card.Body>
              <Card.Footer className="bg-transparent border-0 py-3">
                <button 
                  onClick={() => navigate('/contratista/usuarios/contratistas')}
                  className="btn btn-link text-info text-decoration-none small fw-semibold p-0"
                >
                  Ver perfil <ArrowRightShort size={18} />
                </button>
              </Card.Footer>
            </Card>
          </Col>
        </Row>

        {/* Accesos rápidos y actividad reciente */}
        <Row className="g-4">
          <Col xl={8}>
            <Card className="shadow-sm border-0 rounded-3 h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <Card.Title className="fw-semibold mb-0">Accesos Rápidos</Card.Title>
                </div>
                
                <Row className="g-3">
                  <Col md={6}>
                    <Card className="border h-100 hover-scale" style={{ cursor: 'pointer' }} onClick={() => navigate('/contratista/documentos')}>
                      <Card.Body className="text-center py-4">
                        <FileEarmarkPdf size={32} className="text-primary mb-3" />
                        <h6 className="fw-semibold">Gestión Documental</h6>
                        <p className="text-muted small mb-0">Subir y gestionar documentos</p>
                      </Card.Body>
                    </Card>
                  </Col>
                  
                  <Col md={6}>
                    <Card className="border h-100 hover-scale" style={{ cursor: 'pointer' }} onClick={() => navigate('/contratista/datos')}>
                      <Card.Body className="text-center py-4">
                        <BarChartFill size={32} className="text-success mb-3" />
                        <h6 className="fw-semibold">Análisis de Datos</h6>
                        <p className="text-muted small mb-0">Comparar y analizar información</p>
                      </Card.Body>
                    </Card>
                  </Col>
                  
                  <Col md={6}>
                    <Card className="border h-100 hover-scale" style={{ cursor: 'pointer' }} onClick={() => navigate('/contratista/contratos')}>
                      <Card.Body className="text-center py-4">
                        <FileEarmarkTextFill size={32} className="text-info mb-3" />
                        <h6 className="fw-semibold">Ver Contratos</h6>
                        <p className="text-muted small mb-0">Consultar contratos asignados</p>
                      </Card.Body>
                    </Card>
                  </Col>
                  
                  <Col md={6}>
                    <Card className="border h-100 hover-scale" style={{ cursor: 'pointer' }} onClick={() => navigate('/contratista/usuarios/admin')}>
                      <Card.Body className="text-center py-4">
                        <PersonFill size={32} className="text-secondary mb-3" />
                        <h6 className="fw-semibold">Ver Usuarios</h6>
                        <p className="text-muted small mb-0">Consultar información de usuarios</p>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>

          <Col xl={4}>
            <Card className="shadow-sm border-0 rounded-3 h-100">
              <Card.Body>
                <Card.Title className="fw-semibold mb-4">Actividad Reciente</Card.Title>
                <ListGroup variant="flush">
                  {recentActivities.map((activity) => (
                    <ListGroup.Item key={activity.id} className="border-0 px-0">
                      <div className="d-flex align-items-start">
                        <div className={`me-3 mt-1`}>
                          {activity.type === 'document' && <FileEarmarkTextFill size={16} className={`text-${activity.status}`} />}
                          {activity.type === 'analysis' && <BarChartFill size={16} className={`text-${activity.status}`} />}
                          {activity.type === 'contract' && <FileEarmarkTextFill size={16} className={`text-${activity.status}`} />}
                        </div>
                        <div className="flex-grow-1">
                          <p className="mb-1 small fw-medium">{activity.message}</p>
                          <small className="text-muted">{activity.time}</small>
                        </div>
                        <Badge bg={activity.status} className="ms-2">
                          {activity.status === 'success' ? '✓' : activity.status === 'warning' ? '⚠' : 'ℹ'}
                        </Badge>
                      </div>
                    </ListGroup.Item>
                  ))}
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
          transform: translateY(-2px);
        }
        .badge {
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};

export default ContratistaDashboard;