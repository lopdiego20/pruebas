// src/pages/DashboardDocumentos.jsx
import React, { useEffect, useState } from 'react';
import { Button, Table, Modal, Form, Card, Badge, Spinner, Accordion } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Header from '../../../components/Header/Header';
import api from '../../../services/api';
import '../../../App.css'; // Para la animación spin

const DashboardDocumentos = () => {
  const [documentos, setDocumentos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [formData, setFormData] = useState({
    _id: '',
    description: '',
    state: 'Activo',
    retention_time: '5',
    version: 1,
    ip: window.location.hostname,
    user_contrac: '',
    _id_gestion: ''
  });
  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeAccordion, setActiveAccordion] = useState(null);
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
    
    if (role && !['admin', 'funcionario'].includes(role.toLowerCase())) {
      toast.error('No tienes permisos para acceder a esta sección');
      navigate('/');
      return;
    }
  }, [navigate]);

  const fetchData = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchDocumentos(), fetchUsuarios()]);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        toast.error('Error al cargar los datos iniciales');
      } finally {
        setLoading(false);
      }
    };

  // Función para refrescar datos
  const refreshData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchDocumentos(), fetchUsuarios()]);
      toast.success('Datos actualizados correctamente');
    } catch (error) {
      toast.error('Error al actualizar datos');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchDocumentos = async () => {
    try {
      const res = await api.get('/Documents');
      
      if (res.data.success) {
        setDocumentos(res.data.data);
        console.log('Documentos cargados:', res.data.data);
      } else {
        toast.error('Error al cargar documentos');
        setDocumentos([]);
      }
    } catch (error) {
      console.error('Error al obtener documentos:', error);
      toast.error('Error al cargar documentos', {
        description: error.response?.data?.message || 'Error en el servidor'
      });
      setDocumentos([]);
    }
  };

  const fetchUsuarios = async () => {
    try {
      const res = await api.get('/Users/Contractor?state=true');
      
      if (res.data.success) {
        setUsuarios(res.data.data);
        console.log('Contractors cargados:', res.data.data);
      } else {
        toast.error('Error al cargar contractors');
        setUsuarios([]);
      }
    } catch (error) {
      console.error('Error al obtener contractors:', error);
      toast.error('Error al cargar contractors', {
        description: error.response?.data?.message || 'Error en el servidor'
      });
      setUsuarios([]);
    }
  };

    const eliminarDocumento = async (documento) => {
    if (!window.confirm('¿Estás seguro de eliminar esta gestión documental?')) return;

    try {
      // Buscar el contractor asociado al documento
      const contractor = usuarios.find((c) => c._id === documento.userContract);

      if (!contractor) {
        toast.error('No se encontró el contractor asociado al documento');
        return;
      }

      const loadingToast = toast.loading('Eliminando documento...');

      await api.delete(`/Documents/${contractor._id}`);
      
      toast.success('Documento eliminado exitosamente', {
        id: loadingToast
      });
      
      // Recargar la lista de documentos
      fetchDocumentos();
    } catch (error) {
      console.error('Error al eliminar documento:', error);
      toast.error('Error al eliminar documento', {
        description: error.response?.data?.message || 'Error en el servidor'
      });
    }
  };

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    setFiles((prev) => ({ ...prev, [e.target.name]: e.target.files[0] }));
  };

  const abrirModalCrear = () => {
    setModoEdicion(false);
    setFormData({ 
      description: '', 
      state: 'Activo', 
      retention_time: '5', 
      version: 1, 
      ip: window.location.hostname, 
      user_contrac: '', 
      _id_gestion: '' 
    });
    setFiles({});
    setShowModal(true);
  };

  const abrirModalEditar = (doc) => {
    setModoEdicion(true);
    setFormData({ 
      ...doc, 
      version: doc.version + 1, 
      _id_gestion: doc._id,
      user_contrac: doc.userContract // Corregir el nombre del campo
    });
    setFiles({});
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.user_contrac) {
      toast.error('Por favor selecciona un usuario contratista');
      return;
    }

    const form = new FormData();
    const user_contract = formData.user_contrac;

    // Datos básicos
    form.append('description', formData.description);
    form.append('state', formData.state === 'Activo' ? true : false);
    form.append('retentionTime', formData.retention_time || '5');
    form.append('ip', window.location.hostname);
    
    if (modoEdicion) {
      form.append('_id_gestion', formData._id_gestion);
    }

    // Archivos requeridos según el backend
    const fileFields = [
      'filingLetter',
      'certificateOfCompliance', 
      'signedCertificateOfCompliance',
      'activityReport',
      'taxQualityCertificate',
      'socialSecurity',
      'rut',
      'rit',
      'trainings',
      'initiationRecord',
      'accountCertification',
    ];
    
    // Mapear nombres del frontend al backend
    const fieldMapping = {
      'filing_letter': 'filingLetter',
      'certificate_of_compliance': 'certificateOfCompliance',
      'signed_certificate_of_compliance': 'signedCertificateOfCompliance',
      'activity_report': 'activityReport',
      'tax_quality_certificate': 'taxQualityCertificate',
      'social_security': 'socialSecurity',
      'rut': 'rut',
      'rit': 'rit',
      'Trainings': 'trainings',
      'initiation_record': 'initiationRecord',
      'account_certification': 'accountCertification',
    };

    // Agregar archivos al FormData
    Object.keys(files).forEach((fieldName) => {
      if (files[fieldName]) {
        const backendFieldName = fieldMapping[fieldName] || fieldName;
        form.append(backendFieldName, files[fieldName]);
      }
    });

    // Validar archivos requeridos para crear (no para editar)
    if (!modoEdicion) {
      const missingFiles = fileFields.filter(field => {
        const frontendField = Object.keys(fieldMapping).find(key => fieldMapping[key] === field);
        return !files[frontendField];
      });

      if (missingFiles.length > 0) {
        toast.error('Faltan archivos requeridos', {
          description: `Archivos faltantes: ${missingFiles.join(', ')}`
        });
        return;
      }
    }

    try {
      const loadingToast = toast.loading(modoEdicion ? 'Actualizando documento...' : 'Creando documento...');
      
      let response;
      if (modoEdicion) {
        response = await api.put(`/Documents/${user_contract}`, form, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        response = await api.post(`/Documents/${user_contract}`, form, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (response.data.success) {
        toast.success(modoEdicion ? 'Documento actualizado exitosamente' : 'Documento creado exitosamente', {
          id: loadingToast
        });
        
        setShowModal(false);
        setFormData({
          description: '', 
          state: 'Activo', 
          retention_time: '5', 
          version: 1, 
          ip: window.location.hostname, 
          user_contrac: '', 
          _id_gestion: '' 
        });
        setFiles({});
        
        // Recargar datos
        fetchDocumentos();
      } else {
        toast.error('Error en la respuesta del servidor', {
          id: loadingToast
        });
      }
    } catch (error) {
      console.error('Error al procesar documento:', error);
      toast.error(modoEdicion ? 'Error al actualizar documento' : 'Error al crear documento', {
        description: error.response?.data?.message || 'Error en el servidor'
      });
    }
  };

  const documentFields = [
    { name: 'filing_letter', label: 'Carta de Radicación' },
    { name: 'certificate_of_compliance', label: 'Certificado de Cumplimiento' },
    { name: 'signed_certificate_of_compliance', label: 'Certificado de Cumplimiento Firmado' },
    { name: 'activity_report', label: 'Reporte de Actividad' },
    { name: 'tax_quality_certificate', label: 'Certificado de Calidad Tributaria' },
    { name: 'social_security', label: 'Seguridad Social' },
    { name: 'rut', label: 'RUT' },
    { name: 'rit', label: 'RIT' },
    { name: 'Trainings', label: 'Capacitaciones' },
    { name: 'initiation_record', label: 'Acta de Inicio' },
    { name: 'account_certification', label: 'Certificación Bancaria' }
  ];

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <Header />
      
      <div className="container-fluid py-4 px-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="mb-0 fw-bold text-primary">
              <i className="bi bi-folder me-2"></i>
              Gestión Documental
            </h2>
            <p className="text-muted mb-0 mt-1">
              Administra y crea gestiones documentales del sistema
            </p>
          </div>
          <div className="d-flex gap-2">
            <Button 
              variant="outline-primary" 
              onClick={refreshData}
              disabled={refreshing}
            >
              <i className={`bi bi-arrow-clockwise me-2 ${refreshing ? 'spin' : ''}`}></i>
              {refreshing ? 'Actualizando...' : 'Actualizar'}
            </Button>
            <Button variant="primary" onClick={abrirModalCrear}>
              <i className="bi bi-plus-circle me-2"></i>
              Agregar Gestión
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted">Cargando documentos...</p>
          </div>
        ) : documentos.length === 0 ? (
          <Card className="text-center py-5 shadow-sm border-0">
            <Card.Body>
              <i className="bi bi-folder-x text-muted" style={{ fontSize: '3rem' }}></i>
              <h5 className="mt-3 text-muted">No hay gestiones documentales</h5>
              <p className="text-muted">Crea tu primera gestión haciendo clic en el botón "Agregar Gestión"</p>
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
                      <th>Usuario</th>
                      <th>Descripción</th>
                      <th>Estado</th>
                      <th>Retención</th>
                      <th>Versión</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documentos.map((doc) => {
                      // Encontrar contractor usando userContract
                      const contractor = usuarios.find((c) => c._id === doc.userContract);
                      const user = contractor?.user;
                      return (
                        <React.Fragment key={doc._id}>
                          <tr>
                            <td>
                              <div className="d-flex align-items-center">
                                <i className="bi bi-person-circle me-2 text-primary"></i>
                                {user ? `${user.firsName || user.firstName || ''} ${user.lastName || ''}`.trim() : 'Sin nombre'}
                              </div>
                            </td>
                            <td>{doc.description}</td>
                            <td>
                              <Badge bg={doc.state === true ? 'success' : 'secondary'}>
                                {doc.state === true ? 'Activo' : 'Inactivo'}
                              </Badge>
                            </td>
                            <td>{doc.retentionTime} años</td>
                            <td>
                              <Badge bg="info">v{doc.version}</Badge>
                            </td>
                            <td>
                              <div className="d-flex gap-2">
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => abrirModalEditar(doc)}
                                >
                                  <i className="bi bi-pencil-square me-1"></i>Editar
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => eliminarDocumento(doc)}
                                >
                                  <i className="bi bi-trash me-1"></i>Eliminar
                                </Button>
                              </div>
                            </td>
                          </tr>
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        )}
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton className="border-0 bg-light">
          <Modal.Title>
            <i className={`bi ${modoEdicion ? 'bi-pencil-square' : 'bi-plus-circle'} text-primary me-2`}></i>
            {modoEdicion ? 'Editar' : 'Nueva'} Gestión Documental
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Usuario Contratista *</Form.Label>
              <Form.Select 
                name="user_contrac" 
                value={formData.user_contrac} 
                onChange={handleInputChange} 
                required
                className="py-2"
              >
                <option value="">Seleccione un usuario contratista</option>
                {usuarios.map((contractor) => (
                  <option key={contractor._id} value={contractor._id}>
                    {contractor.user?.firsName || contractor.user?.firstName || ''} {contractor.user?.lastName || ''} - {contractor.user?.email}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Descripción *</Form.Label>
              <Form.Control
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                placeholder="Ingrese la descripción del documento"
              />
            </Form.Group>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Estado *</Form.Label>
                  <Form.Select 
                    name="state" 
                    value={formData.state} 
                    onChange={handleInputChange}
                    className="py-2"
                    required
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Tiempo de Retención (años) *</Form.Label>
                  <Form.Control
                    type="number"
                    name="retention_time"
                    value={formData.retention_time}
                    onChange={handleInputChange}
                    placeholder="Ej: 5"
                    min="1"
                    max="50"
                    required
                  />
                </Form.Group>
              </div>
            </div>

            <Accordion activeKey={activeAccordion} onSelect={setActiveAccordion} className="mb-4">
              <Accordion.Item eventKey="0" className="border-0">
                <Accordion.Header className="bg-light">
                  <span className="fw-semibold">
                    <i className="bi bi-paperclip me-2"></i>
                    Documentos Adjuntos {!modoEdicion && <span className="text-danger">*</span>}
                  </span>
                </Accordion.Header>
                <Accordion.Body className="pt-3">
                  {!modoEdicion && (
                    <div className="alert alert-info mb-3">
                      <i className="bi bi-info-circle me-2"></i>
                      <strong>Todos los documentos son obligatorios</strong> para crear una nueva gestión documental.
                    </div>
                  )}
                  <div className="row">
                    {documentFields.map((field) => (
                      <div className="col-md-6 mb-3" key={field.name}>
                        <Form.Group>
                          <Form.Label>
                            {field.label}
                            {!modoEdicion && <span className="text-danger"> *</span>}
                          </Form.Label>
                          <Form.Control 
                            type="file" 
                            name={field.name} 
                            onChange={handleFileChange} 
                            className="py-2"
                            accept=".pdf"
                            required={!modoEdicion}
                          />
                          <Form.Text className="text-muted">
                            Solo archivos PDF
                          </Form.Text>
                        </Form.Group>
                      </div>
                    ))}
                  </div>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="light" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit">
                <i className={`bi ${modoEdicion ? 'bi-check-circle' : 'bi-save'} me-2`}></i>
                {modoEdicion ? 'Actualizar' : 'Guardar'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default DashboardDocumentos;