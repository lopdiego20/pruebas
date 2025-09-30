// src/pages/view_admin/Documentos/GestionDocumental.jsx
import React, { useEffect, useState } from 'react';
import { Table, Spinner, Button, Card, Badge, Accordion } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Header from '../../../components/Header/Header';
import api from '../../../services/api';
import config from '../../../config/api';
import './GestionDocumental.css';

const GestionDocumental = () => {
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const navigate = useNavigate();

  // Verificar autenticación al cargar el componente
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token) {
      toast.error('Sesión expirada');
      navigate('/');
      return;
    }
    
    if (role && role.toLowerCase() !== 'admin') {
      toast.error('No tienes permisos para acceder a esta sección');
      navigate('/');
      return;
    }
  }, [navigate]);

  // Función para obtener documentos (reutilizable)
  const fetchDocumentos = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const res = await api.get('/Documents');
      
      if (res.data.success) {
        setDocumentos(res.data.data);
        if (isRefresh) {
          toast.success('Documentos actualizados correctamente');
        }
      } else {
        toast.error('Error al cargar documentos');
        setDocumentos([]);
      }
    } catch (err) {
      console.error('Error al obtener los documentos:', err);
      toast.error('Error al cargar las gestiones documentales', {
        description: err.response?.data?.message || 'Error en el servidor'
      });
      setDocumentos([]);
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchDocumentos();
  }, []);

  const documentFields = [
    { name: 'filing_letter', label: 'Carta de Radicación' },
    { name: 'certificate_of_compliance', label: 'Certificado de Cumplimiento' },
    { name: 'signed_certificate_of_compliance', label: 'Certificado Firmado' },
    { name: 'activity_report', label: 'Reporte de Actividad' },
    { name: 'tax_quality_certificate', label: 'Certificado Tributario' },
    { name: 'social_security', label: 'Seguridad Social' },
    { name: 'rut', label: 'RUT' },
    { name: 'rit', label: 'RIT' },
    { name: 'Trainings', label: 'Capacitaciones' },
    { name: 'initiation_record', label: 'Acta de Inicio' },
    { name: 'account_certification', label: 'Certificación Bancaria' }
  ];

  const toggleRowExpand = (docId) => {
    setExpandedRow(expandedRow === docId ? null : docId);
  };

  // Función para contar documentos disponibles
  const countAvailableDocuments = (doc) => {
    return documentFields.filter(field => doc[field.name]).length;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Activo':
      case 'activo':
      case true:
        return <Badge bg="success">Activo</Badge>;
      case 'Inactivo':
      case 'inactivo':
      case false:
        return <Badge bg="secondary">Inactivo</Badge>;
      case 'Pendiente':
      case 'pendiente':
        return <Badge bg="warning">Pendiente</Badge>;
      case 'En proceso':
      case 'en_proceso':
        return <Badge bg="info">En Proceso</Badge>;
      default:
        return <Badge bg="light" text="dark">{status || 'Sin estado'}</Badge>;
    }
  };

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <Header />
      
      <div className="container-fluid py-4 px-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="mb-0 fw-bold text-primary">
              <i className="bi bi-archive me-2"></i>
              Gestión Documental
            </h2>
            <p className="text-muted mb-0 mt-1">
              Administra y consulta las gestiones documentales del sistema
            </p>
          </div>
          <div className="d-flex gap-2">
            <Button 
              variant="outline-primary" 
              onClick={() => fetchDocumentos(true)}
              disabled={refreshing}
            >
              <i className={`bi bi-arrow-clockwise me-2 ${refreshing ? 'spin' : ''}`}></i>
              {refreshing ? 'Actualizando...' : 'Actualizar'}
            </Button>
            {/* <Button variant="primary" onClick={() => navigate('/admin/documentos/nuevo')}>
              <i className="bi bi-plus-circle me-2"></i>
              Nueva Gestión
            </Button> */}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted">Cargando gestiones documentales...</p>
          </div>
        ) : documentos.length === 0 ? (
          <Card className="text-center py-5 shadow-sm border-0">
            <Card.Body>
              <i className="bi bi-folder-x text-muted" style={{ fontSize: '3rem' }}></i>
              <h5 className="mt-3 text-muted">No hay gestiones documentales</h5>
              <p className="text-muted">Crea tu primera gestión haciendo clic en el botón "Nueva Gestión"</p>
            </Card.Body>
          </Card>
        ) : (
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white border-bottom">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0 text-dark">
                  <i className="bi bi-table me-2"></i>
                  Listado de Gestiones Documentales
                </h5>
                <Badge bg="primary" className="fs-6">
                  {documentos.length} registro{documentos.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="ps-4">Descripción</th>
                      <th>Estado</th>
                      <th>Retención</th>
                      <th>Versión</th>
                      <th>Documentos</th>
                      <th>Fecha</th>
                      <th className="pe-4">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documentos.map((doc) => (
                      <React.Fragment key={doc._id}>
                        <tr>
                          <td className="ps-4">
                            <div className="fw-semibold">{doc.description}</div>
                            <small className="text-muted">{doc.ip}</small>
                          </td>
                          <td>{getStatusBadge(doc.state)}</td>
                          <td>
                            <Badge bg="info">{doc.retention_time} años</Badge>
                          </td>
                          <td>
                            <Badge bg="light" text="dark">v{doc.version}</Badge>
                          </td>
                          <td>
                            <Badge bg="secondary" className="me-1">
                              {countAvailableDocuments(doc)}/{documentFields.length}
                            </Badge>
                            <small className="text-muted">archivos</small>
                          </td>
                          <td>
                            {new Date(doc.creation_date).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </td>
                          <td className="pe-4">
                            <Button
                              size="sm"
                              variant={expandedRow === doc._id ? 'info' : 'outline-info'}
                              onClick={() => toggleRowExpand(doc._id)}
                              disabled={countAvailableDocuments(doc) === 0}
                            >
                              <i className={`bi bi-${expandedRow === doc._id ? 'chevron-up' : 'chevron-down'} me-1`}></i>
                              {expandedRow === doc._id ? 'Ocultar' : 'Ver PDFs'}
                            </Button>
                          </td>
                        </tr>
                        {expandedRow === doc._id && (
                          <tr>
                            <td colSpan="7" className="p-0">
                              <div className="p-4 bg-light border-top">
                                <div className="mb-3">
                                  <h6 className="text-primary mb-3">
                                    <i className="bi bi-folder-open me-2"></i>
                                    Documentos Disponibles ({countAvailableDocuments(doc)} de {documentFields.length})
                                  </h6>
                                </div>
                                
                                {countAvailableDocuments(doc) === 0 ? (
                                  <div className="text-center py-3">
                                    <i className="bi bi-file-earmark-x text-muted" style={{ fontSize: '2rem' }}></i>
                                    <p className="text-muted mt-2">No hay documentos disponibles para esta gestión</p>
                                  </div>
                                ) : (
                                  <div className="row g-3">
                                    {documentFields.map((field) => (
                                      doc[field.name] && (
                                        <div className="col-md-6 col-lg-4" key={field.name}>
                                          <Card className="h-100 border-0 shadow-sm hover-shadow">
                                            <Card.Body className="p-3">
                                              <div className="d-flex align-items-start">
                                                <div className="flex-shrink-0">
                                                  <i className="bi bi-file-earmark-pdf text-danger fs-3 me-3"></i>
                                                </div>
                                                <div className="flex-grow-1">
                                                  <h6 className="mb-2 fw-semibold text-dark">{field.label}</h6>
                                                  <p className="text-muted small mb-3">Documento PDF disponible</p>
                                                  <div className="d-flex gap-2">
                                                    <a
                                                      href={`${config.API_BASE_URL.replace('/api', '')}/${doc[field.name].replace('\\', '/')}`}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      className="btn btn-sm btn-outline-primary"
                                                    >
                                                      <i className="bi bi-download me-1"></i>Descargar
                                                    </a>
                                                    <a
                                                      href={`${config.API_BASE_URL.replace('/api', '')}/${doc[field.name].replace('\\', '/')}`}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      className="btn btn-sm btn-outline-secondary"
                                                    >
                                                      <i className="bi bi-eye me-1"></i>Ver
                                                    </a>
                                                  </div>
                                                </div>
                                              </div>
                                            </Card.Body>
                                          </Card>
                                        </div>
                                      )
                                    ))}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        )}
      </div>
    </div>
  );
};

export default GestionDocumental;