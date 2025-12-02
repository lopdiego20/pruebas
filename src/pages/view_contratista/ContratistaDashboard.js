import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Table } from 'react-bootstrap';
import {
  PersonFill,
  FileEarmarkTextFill,
  BarChartFill,
  ArrowRightShort,
  ClockHistory,
  CheckCircleFill,
  ExclamationTriangleFill,
  FileEarmarkPdf,
  CalendarEvent,
  CurrencyDollar,
  InfoCircle,
  EnvelopeFill,
  TelephoneFill,
  HouseFill,
  CreditCardFill
} from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import api from '../../services/api';
import { toast } from 'sonner';

// Estilos para las animaciones
const hoverStyles = `
  .hover-scale {
    transition: transform 0.2s ease-in-out;
  }
  .hover-scale:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0,0,0,0.1) !important;
  }
  .bg-primary-soft {
    background-color: rgba(13, 110, 253, 0.1);
  }
  .contract-details-enter {
    animation: slideDown 0.3s ease-out;
  }
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .table td {
    padding: 12px 16px;
    border-bottom: 1px solid #e9ecef;
  }
  .table tbody tr:last-child td {
    border-bottom: none;
  }
`;

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
  const [loading, setLoading] = useState(true);
  const [showContractDetails, setShowContractDetails] = useState(false);
  const [showProfileDetails, setShowProfileDetails] = useState(false);
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
      const promises = [
        api.get('/Documents').catch(() => ({ data: { data: [] } })),
        api.get('/Data').catch(() => ({ data: { data: [] } })),
        api.get(`/Users/Contractor`).catch(() => ({ data: { data: [] } }))
      ];

      // Solo obtener contratos si el usuario tiene permisos para verlos
      const userRole = localStorage.getItem('role')?.toLowerCase();
      if (userRole === 'admin' || userRole === 'funcionario') {
        promises.push(api.get('/Contracts').catch(() => ({ data: { data: [] } })));
      }

      const results = await Promise.all(promises);
      const [documentsRes, dataRes, contractorRes, contractsRes] = results;

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

    } catch (err) {
      console.error('Error al cargar datos del dashboard:', err);
      toast.error('Error al cargar datos del dashboard', {
        description: err.response?.data?.message || 'Error del servidor'
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleContractDetails = () => {
    setShowContractDetails(!showContractDetails);
  };

  const toggleProfileDetails = () => {
    setShowProfileDetails(!showProfileDetails);

    // Debug: mostrar los datos del usuario en consola
    if (!showProfileDetails) {
      console.log('=== DEBUG: Datos del usuario ===');
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        console.log('User completo:', user);
        console.log('Propiedades disponibles:', Object.keys(user || {}));
        console.log('firstName:', user?.firstName);
        console.log('firsName (error tipográfico):', user?.firsName);
        console.log('lastName:', user?.lastName);
        console.log('email:', user?.email);
        console.log('identificationNumber:', user?.identificationNumber);
        console.log('identificationType:', user?.identificationType);
        console.log('phone:', user?.phone);
        console.log('address:', user?.address);
        console.log('state:', user?.state);
        console.log('createdAt:', user?.createdAt);
      } catch (error) {
        console.log('Error al parsear user:', error);
      }
      console.log('=== Fin DEBUG ===');
    }
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
      {/* Agregar estilos CSS */}
      <style>{hoverStyles}</style>

      <Header />

      <Container fluid className="px-4 py-4">
        <Row className="g-4 mb-4">
          <Col>
            <div className="d-flex align-items-center">
              <div className="d-flex align-items-center">
                <h2 className="mb-0 fw-bold">
                  👋 Hola, {userName}
                </h2>
                <span className="badge bg-info ms-3">Contratista</span>
              </div>
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
                      <div className="text-muted mb-0">
                        {contractInfo.contract ? (
                          <div>
                            <span className="text-success">
                              <CheckCircleFill className="me-1" />
                              Contrato #{contractInfo.contract.contractNumber || contractInfo.contract._id}
                            </span>
                            <br />
                            <small className="text-muted">
                              Tipo: {contractInfo.contract.typeofcontract || 'No especificado'}
                            </small>
                          </div>
                        ) : (
                          <span className="text-warning">
                            <ExclamationTriangleFill className="me-1" />
                            Sin contrato asignado
                          </span>
                        )}
                      </div>
                    </div>
                    {contractInfo.contract && (
                      <Button
                        variant="outline-info"
                        onClick={toggleContractDetails}
                      >
                        {showContractDetails ? 'Ocultar Detalles' : 'Ver Detalles'}
                      </Button>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Tabla de Detalles del Contrato */}
        {showContractDetails && contractInfo && contractInfo.contract && (
          <Row className="g-4 mb-4 contract-details-enter">
            <Col>
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-light border-bottom">
                  <h5 className="mb-0 fw-semibold text-dark">
                    <FileEarmarkTextFill className="me-2 text-info" />
                    Detalles del Contrato
                  </h5>
                </Card.Header>
                <Card.Body className="p-0">
                  <Table responsive striped hover className="mb-0">
                    <tbody>
                      <tr>
                        <td className="fw-semibold text-muted" style={{ width: '30%' }}>Número de Contrato</td>
                        <td>#{contractInfo.contract.contractNumber || 'No especificado'}</td>
                      </tr>
                      <tr>
                        <td className="fw-semibold text-muted">Tipo de Contrato</td>
                        <td>{contractInfo.contract.typeofcontract || 'No especificado'}</td>
                      </tr>
                      <tr>
                        <td className="fw-semibold text-muted">Fecha de Inicio</td>
                        <td>
                          {contractInfo.contract.startDate
                            ? new Date(contractInfo.contract.startDate).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                            : 'No especificada'
                          }
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-semibold text-muted">Fecha de Finalización</td>
                        <td>
                          {contractInfo.contract.endDate
                            ? new Date(contractInfo.contract.endDate).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                            : 'No especificada'
                          }
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-semibold text-muted">Estado</td>
                        <td>
                          <Badge bg={contractInfo.contract.state ? 'success' : 'danger'}>
                            {contractInfo.contract.state ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-semibold text-muted">Valor del Período</td>
                        <td>
                          {contractInfo.contract.periodValue
                            ? `$${parseInt(contractInfo.contract.periodValue).toLocaleString('es-ES')}`
                            : 'No especificado'
                          }
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-semibold text-muted">Valor Total</td>
                        <td>
                          {contractInfo.contract.totalValue
                            ? `$${parseInt(contractInfo.contract.totalValue).toLocaleString('es-ES')}`
                            : 'No especificado'
                          }
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-semibold text-muted">Objetivo del Contrato</td>
                        <td style={{ whiteSpace: 'pre-wrap' }}>
                          {contractInfo.contract.objectiveContract || 'No especificado'}
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-semibold text-muted">Extensión</td>
                        <td>
                          <Badge bg={contractInfo.contract.extension ? 'warning' : 'secondary'}>
                            {contractInfo.contract.extension ? 'Sí' : 'No'}
                          </Badge>
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-semibold text-muted">Adición</td>
                        <td>
                          <Badge bg={contractInfo.contract.addiction ? 'warning' : 'secondary'}>
                            {contractInfo.contract.addiction ? 'Sí' : 'No'}
                          </Badge>
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-semibold text-muted">Suspensión</td>
                        <td>
                          <Badge bg={contractInfo.contract.suspension ? 'danger' : 'secondary'}>
                            {contractInfo.contract.suspension ? 'Sí' : 'No'}
                          </Badge>
                        </td>
                      </tr>
                    </tbody>
                  </Table>
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
                  onClick={() => navigate('/Document')}
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
                  onClick={() => navigate('/Document')}
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
                  onClick={() => navigate('/Data')}
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
                  onClick={toggleProfileDetails}
                  className="btn btn-link text-info text-decoration-none small fw-semibold p-0"
                >
                  {showProfileDetails ? 'Ocultar perfil' : 'Ver perfil'} <ArrowRightShort size={18} />
                </button>
              </Card.Footer>
            </Card>
          </Col>
        </Row>

        {/* Tabla de Detalles del Perfil */}
        {showProfileDetails && (
          <Row className="g-4 mb-4 contract-details-enter">
            <Col>
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-light border-bottom">
                  <h5 className="mb-0 fw-semibold text-dark">
                    <PersonFill className="me-2 text-info" />
                    Información del Perfil
                  </h5>
                </Card.Header>
                <Card.Body className="p-0">
                  <Table responsive striped hover className="mb-0">
                    <tbody>
                      <tr>
                        <td className="fw-semibold text-muted" style={{ width: '30%' }}>
                          <PersonFill className="me-2 text-primary" />
                          Nombre Completo
                        </td>
                        <td>
                          {(() => {
                            try {
                              const user = JSON.parse(localStorage.getItem("user"));
                              const firstName = user?.firsName || user?.firstName || '';
                              const lastName = user?.lastName || '';
                              return `${firstName} ${lastName}`.trim() || 'No especificado';
                            } catch {
                              return 'No especificado';
                            }
                          })()}
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-semibold text-muted">
                          <EnvelopeFill className="me-2 text-success" />
                          Correo Electrónico
                        </td>
                        <td>
                          {(() => {
                            try {
                              const user = JSON.parse(localStorage.getItem("user"));
                              return user?.email || 'No especificado';
                            } catch {
                              return 'No especificado';
                            }
                          })()}
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-semibold text-muted">
                          <CreditCardFill className="me-2 text-warning" />
                          Número de Identificación
                        </td>
                        <td>
                          {(() => {
                            try {
                              const user = JSON.parse(localStorage.getItem("user"));
                              return user?.idcard || 'No especificado';
                            } catch {
                              return 'No especificado';
                            }
                          })()}
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-semibold text-muted">
                          <InfoCircle className="me-2 text-info" />
                          Cargo
                        </td>
                        <td>
                          {(() => {
                            try {
                              const user = JSON.parse(localStorage.getItem("user"));
                              return user?.post || 'No especificado';
                            } catch {
                              return 'No especificado';
                            }
                          })()}
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-semibold text-muted">
                          <TelephoneFill className="me-2 text-secondary" />
                          Teléfono
                        </td>
                        <td>
                          {(() => {
                            try {
                              const user = JSON.parse(localStorage.getItem("user"));
                              return user?.telephone || 'No especificado';
                            } catch {
                              return 'No especificado';
                            }
                          })()}
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-semibold text-muted">
                          <PersonFill className="me-2 text-primary" />
                          Rol
                        </td>
                        <td>
                          <Badge bg="info">
                            {localStorage.getItem('role') || 'No especificado'}
                          </Badge>
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-semibold text-muted">
                          <CheckCircleFill className="me-2 text-success" />
                          Estado
                        </td>
                        <td>
                          {(() => {
                            try {
                              const user = JSON.parse(localStorage.getItem("user"));
                              return (
                                <Badge bg={user?.state ? 'success' : 'danger'}>
                                  {user?.state ? 'Activo' : 'Inactivo'}
                                </Badge>
                              );
                            } catch {
                              return <Badge bg="secondary">No especificado</Badge>;
                            }
                          })()}
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-semibold text-muted">
                          <CalendarEvent className="me-2 text-warning" />
                          Fecha de Creación
                        </td>
                        <td>
                          {(() => {
                            try {
                              const user = JSON.parse(localStorage.getItem("user"));
                              return user?.createdAt
                                ? new Date(user.createdAt).toLocaleDateString('es-ES', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                                : 'No especificada';
                            } catch {
                              return 'No especificada';
                            }
                          })()}
                        </td>
                      </tr>
                      {contractInfo && (
                        <tr>
                          <td className="fw-semibold text-muted">
                            <FileEarmarkTextFill className="me-2 text-info" />
                            Contrato Asignado
                          </td>
                          <td>
                            {contractInfo.contract ? (
                              <Badge bg="success">
                                Sí - #{contractInfo.contract.contractNumber || contractInfo.contract._id}
                              </Badge>
                            ) : (
                              <Badge bg="warning">
                                Sin contrato asignado
                              </Badge>
                            )}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Mensaje informativo de permisos */}
        <Row className="g-4 mb-4">
          <Col>
            <Card className="border-warning border-2 bg-light">
              <Card.Body className="py-3">
                <div className="d-flex align-items-center">
                  <div className="bg-warning bg-opacity-10 p-2 rounded-circle me-3">
                    <ExclamationTriangleFill size={20} className="text-warning" />
                  </div>
                  <div>
                    <h6 className="mb-1 fw-semibold text-dark">Información de Permisos</h6>
                    <p className="mb-0 text-muted small">
                      Como contratista, puedes <strong>consultar</strong> contratos y gestionar tus documentos,
                      pero no puedes crear, editar o eliminar contratos.
                      Para realizar esas acciones, contacta con un administrador o funcionario.
                    </p>
                  </div>
                </div>
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