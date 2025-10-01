// src/pages/view_admin/Documentos/GestionDocumental.jsx
import React, { useEffect, useState } from 'react';
import { Table, Spinner, Button, Card, Badge, Accordion } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Header from '../../../components/Header/Header';
import api from '../../../services/api';

const GestionDocumental = () => {
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchDocumentos = async () => {
      try {
        setLoading(true);
        const res = await api.get('/Documents');
        setDocumentos(res.data.data);
      } catch (err) {
        console.error('Error al obtener los documentos:', err);
        toast.error('Error al cargar las gestiones documentales');
      } finally {
        setLoading(false);
      }
    };
    fetchDocumentos();
  }, [token]);

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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Activo':
        return <Badge bg="success">{status}</Badge>;
      case 'Inactivo':
        return <Badge bg="secondary">{status}</Badge>;
      default:
        return <Badge bg="warning">{status || 'Sin estado'}</Badge>;
    }
  };

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <Header />
      
      <div className="container-fluid py-4 px-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0 fw-bold text-primary">
            <i className="bi bi-archive me-2"></i>
            Gestión Documental
          </h2>
          {/* <Button variant="primary" onClick={() => navigate('/admin/documentos/nuevo')}>
            <i className="bi bi-plus-circle me-2"></i>
            Nueva Gestión
          </Button> */}
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
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th>Descripción</th>
                      <th>Estado</th>
                      <th>Retención</th>
                      <th>Versión</th>
                      <th>Fecha</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documentos.map((doc) => (
                      <React.Fragment key={doc._id}>
                        <tr>
                          <td>
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
                            {new Date(doc.creation_date).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </td>
                          <td>
                            <Button
                              size="sm"
                              variant={expandedRow === doc._id ? 'info' : 'outline-info'}
                              onClick={() => toggleRowExpand(doc._id)}
                            >
                              <i className={`bi bi-${expandedRow === doc._id ? 'chevron-up' : 'chevron-down'} me-1`}></i>
                              {expandedRow === doc._id ? 'Ocultar' : 'Ver PDFs'}
                            </Button>
                          </td>
                        </tr>
                        {expandedRow === doc._id && (
                          <tr>
                            <td colSpan="6" className="p-0">
                              <Accordion defaultActiveKey="0" className="border-0">
                                <Accordion.Item eventKey="0" className="border-0">
                                  <Accordion.Body className="p-3 bg-light">
                                    <div className="row">
                                      {documentFields.map((field) => (
                                        doc[field.name] && (
                                          <div className="col-md-4 mb-3" key={field.name}>
                                            <Card className="h-100 border-0 shadow-sm">
                                              <Card.Body className="p-3">
                                                <div className="d-flex align-items-center">
                                                  <i className="bi bi-file-earmark-pdf text-danger fs-4 me-3"></i>
                                                  <div>
                                                    <h6 className="mb-1 fw-semibold">{field.label}</h6>
                                                    <a
                                                      href={`${process.env.REACT_APP_API_BASE_URL?.replace('/api', '') || 'http://192.168.10.15:5000'}/${doc[field.name].replace('\\', '/')}`}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      className="btn btn-sm btn-outline-primary"
                                                    >
                                                      <i className="bi bi-download me-1"></i>Descargar
                                                    </a>
                                                  </div>
                                                </div>
                                              </Card.Body>
                                            </Card>
                                          </div>
                                        )
                                      ))}
                                    </div>
                                  </Accordion.Body>
                                </Accordion.Item>
                              </Accordion>
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