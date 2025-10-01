import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Badge, Table, Button, Spinner } from 'react-bootstrap';
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
import { toast } from 'sonner';
import api from '../../services/api';

// Obtener el nombre del usuario logueado
const userName = (() => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.firsName || user?.firstName || "Funcionario";
  } catch {
    return localStorage.getItem("firsName") || "Funcionario";
  }
})();

export default function FuncionarioDashboard() {
  const [stats, setStats] = useState({
    totalContractors: 0,
    activeDocuments: 0,
    pendingDocuments: 0,
    totalDocuments: 0,
    totalAnalysis: 0,
    totalUsers: 0
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token || role.toLowerCase() !== 'funcionario') {
      navigate('/');
    }
    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Obtener datos de las APIs existentes
      const [documentsRes, dataRes, usersRes] = await Promise.all([
        api.get('/Documents').catch(() => ({ data: { data: [] } })),
        api.get('/Data').catch(() => ({ data: { data: [] } })),
        api.get('/Users').catch(() => ({ data: { data: [] } }))
      ]);

      const documents = documentsRes.data.data || [];
      const dataAnalysis = dataRes.data.data || [];
      const users = usersRes.data.data || [];

      // Calcular estadísticas
      const totalDocs = documents.length;
      const activeDocs = documents.filter(doc => doc.state === true || doc.state === 'Activo').length;
      const pendingDocs = totalDocs - activeDocs;
      const contractors = users.filter(user => user.role === 'contratista').length;
      const totalUsersCount = users.length;

      setStats({
        totalContractors: contractors,
        activeDocuments: activeDocs,
        pendingDocuments: pendingDocs,
        totalDocuments: totalDocs,
        totalAnalysis: dataAnalysis.length,
        totalUsers: totalUsersCount
      });

      // Actividades recientes simuladas con datos reales
      const activities = [
        { 
          id: 1, 
          contractorName: contractors > 0 ? `${contractors} contratistas` : 'Sin contratistas', 
          action: 'Registro en sistema', 
          documentType: 'Usuario',
          status: contractors > 0 ? 'Activo' : 'Pendiente',
          date: new Date().toISOString()
        },
        { 
          id: 2, 
          contractorName: 'Sistema', 
          action: 'Documentos gestionados', 
          documentType: `${totalDocs} documentos`,
          status: activeDocs > 0 ? 'Aprobado' : 'Pendiente',
          date: new Date().toISOString()
        },
        { 
          id: 3, 
          contractorName: 'Análisis', 
          action: 'Comparaciones realizadas', 
          documentType: `${dataAnalysis.length} análisis`,
          status: dataAnalysis.length > 0 ? 'Completado' : 'Pendiente',
          date: new Date().toISOString()
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
                <span className="badge bg-success ms-3">Funcionario</span>
              </div>
              <Button variant="outline-danger" onClick={cerrarSesion}>
                <i className="bi bi-box-arrow-right me-2"></i>
                Cerrar Sesión
              </Button>
            </div>
            <p className="text-muted mb-0 mt-1">
              Bienvenido a tu panel de gestión
            </p>
          </Col>
        </Row>

        {/* Estadísticas principales */}
        <Row className="g-4 mb-4">
          <Col md={3}>
            <Card className="border-0 shadow-sm h-100 hover-scale">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                    <PersonFill size={24} className="text-primary" />
                  </div>
                  <div>
                    <Card.Title className="fw-semibold mb-1">Contratistas</Card.Title>
                    <Card.Text className="text-muted small">
                      {stats.totalContractors} registrados
                      <br />
                      En el sistema
                    </Card.Text>
                  </div>
                  <Badge bg="primary" className="ms-auto">
                    {stats.totalContractors}
                  </Badge>
                </div>
              </Card.Body>
              <Card.Footer className="bg-transparent border-0 py-3">
                <button 
                  onClick={() => navigate('/funcionario/usuarios/contratistas')}
                  className="btn btn-link text-primary text-decoration-none small fw-semibold p-0"
                >
                  Ver contratistas <ArrowRightShort size={18} />
                </button>
              </Card.Footer>
            </Card>
          </Col>

          <Col md={3}>
            <Card className="border-0 shadow-sm h-100 hover-scale">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="bg-success bg-opacity-10 p-3 rounded-circle me-3">
                    <FileEarmarkTextFill size={24} className="text-success" />
                  </div>
                  <div>
                    <Card.Title className="fw-semibold mb-1">Documentos</Card.Title>
                    <Card.Text className="text-muted small">
                      {stats.totalDocuments} total
                      <br />
                      {stats.activeDocuments} activos
                    </Card.Text>
                  </div>
                  <Badge bg="success" className="ms-auto">
                    {stats.activeDocuments}
                  </Badge>
                </div>
              </Card.Body>
              <Card.Footer className="bg-transparent border-0 py-3">
                <button 
                  onClick={() => navigate('/funcionario/documentos')}
                  className="btn btn-link text-success text-decoration-none small fw-semibold p-0"
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
                      Por revisar
                    </Card.Text>
                  </div>
                  <Badge bg="warning" className="ms-auto">
                    {stats.pendingDocuments}
                  </Badge>
                </div>
              </Card.Body>
              <Card.Footer className="bg-transparent border-0 py-3">
                <button 
                  onClick={() => navigate('/funcionario/documentos')}
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
                  <div className="bg-info bg-opacity-10 p-3 rounded-circle me-3">
                    <BarChartFill size={24} className="text-info" />
                  </div>
                  <div>
                    <Card.Title className="fw-semibold mb-1">Análisis</Card.Title>
                    <Card.Text className="text-muted small">
                      {stats.totalAnalysis} realizados
                      <br />
                      Comparaciones de datos
                    </Card.Text>
                  </div>
                  <Badge bg="info" className="ms-auto">
                    {stats.totalAnalysis}
                  </Badge>
                </div>
              </Card.Body>
              <Card.Footer className="bg-transparent border-0 py-3">
                <button 
                  onClick={() => navigate('/funcionario/datos')}
                  className="btn btn-link text-info text-decoration-none small fw-semibold p-0"
                >
                  Ver análisis <ArrowRightShort size={18} />
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
                    <Card className="border h-100 hover-scale" style={{ cursor: 'pointer' }} onClick={() => navigate('/funcionario/documentos')}>
                      <Card.Body className="text-center py-4">
                        <FileEarmarkPdf size={32} className="text-primary mb-3" />
                        <h6 className="fw-semibold">Gestión Documental</h6>
                        <p className="text-muted small mb-0">Revisar y gestionar documentos</p>
                      </Card.Body>
                    </Card>
                  </Col>
                  
                  <Col md={6}>
                    <Card className="border h-100 hover-scale" style={{ cursor: 'pointer' }} onClick={() => navigate('/funcionario/usuarios')}>
                      <Card.Body className="text-center py-4">
                        <PersonFill size={32} className="text-success mb-3" />
                        <h6 className="fw-semibold">Gestión de Usuarios</h6>
                        <p className="text-muted small mb-0">Administrar contratistas</p>
                      </Card.Body>
                    </Card>
                  </Col>
                  
                  <Col md={6}>
                    <Card className="border h-100 hover-scale" style={{ cursor: 'pointer' }} onClick={() => navigate('/funcionario/datos')}>
                      <Card.Body className="text-center py-4">
                        <BarChartFill size={32} className="text-info mb-3" />
                        <h6 className="fw-semibold">Análisis de Datos</h6>
                        <p className="text-muted small mb-0">Comparar y analizar información</p>
                      </Card.Body>
                    </Card>
                  </Col>
                  
                  <Col md={6}>
                    <Card className="border h-100 hover-scale" style={{ cursor: 'pointer' }} onClick={() => navigate('/funcionario/contratos')}>
                      <Card.Body className="text-center py-4">
                        <FileEarmarkTextFill size={32} className="text-secondary mb-3" />
                        <h6 className="fw-semibold">Ver Contratos</h6>
                        <p className="text-muted small mb-0">Consultar contratos del sistema</p>
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
                <Card.Title className="fw-semibold mb-4">Actividades Recientes</Card.Title>
                <Table hover responsive className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th>Elemento</th>
                      <th>Acción</th>
                      <th>Estado</th>
                      <th>Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActivities.map((activity) => (
                      <tr key={activity.id}>
                        <td className="small">{activity.contractorName}</td>
                        <td className="small">{activity.action}</td>
                        <td>
                          <Badge 
                            bg={
                              activity.status === 'Aprobado' || activity.status === 'Activo' || activity.status === 'Completado' 
                                ? 'success' 
                                : 'warning'
                            }
                            className="small"
                          >
                            {activity.status}
                          </Badge>
                        </td>
                        <td className="small">{new Date(activity.date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
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
}