// src/pages/DashboardDocumentos.jsx
import React, { useEffect, useState } from 'react';
import { Button, Table, Modal, Form, Card, Badge, Spinner, Accordion } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Header from '../../../components/Header/Header';
import api from '../../../services/api';
import '../../../App.css'; // Para la animación spin
import { usePermissions } from '../../../hooks/usePermissions';

const DashboardDocumentos = () => {
  const permissions = usePermissions();
  const [documentos, setDocumentos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [stats, setStats] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [selectedDocumentType, setSelectedDocumentType] = useState('');
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

    if (role && !['admin', 'funcionario', 'contratista'].includes(role.toLowerCase())) {
      toast.error('No tienes permisos para acceder a esta sección');
      navigate('/');
      return;
    }
  }, [navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchDocumentos(), fetchUsuarios(), fetchStats()]);
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
      await Promise.all([fetchDocumentos(), fetchUsuarios(), fetchStats()]);
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
      const role = localStorage.getItem('role')?.toLowerCase();
      let url = '/Documents';

      if (role === 'contratista') {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user?._id) {
          try {
            // Obtener el ID del contratista asociado al usuario logueado
            const resContractors = await api.get('/Users/Contractor?state=true');
            if (resContractors.data.success) {
              const myContractor = resContractors.data.data.find(c => c.user?._id === user._id);
              if (myContractor) {
                url = `/Documents/${myContractor._id}`;
              } else {
                console.warn('No se encontró perfil de contratista para el usuario actual');
                setDocumentos([]);
                return;
              }
            }
          } catch (err) {
            console.error('Error al obtener información del contratista:', err);
            setDocumentos([]);
            return;
          }
        }
      }

      const res = await api.get(url);

      if (res.data.success) {
        // Asegurarse de que sea un array
        const docs = Array.isArray(res.data.data) ? res.data.data : [res.data.data];
        setDocumentos(docs);
        console.log('Documentos cargados:', docs);
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

  const fetchStats = async () => {
    try {
      const res = await api.get('/Documents/stats');
      if (res.data.success) {
        setStats(res.data.data);
        console.log('Stats cargados:', res.data.data);
      }
    } catch (error) {
      console.error('Error al obtener stats:', error);
    }
  };

  const eliminarDocumento = async (documento) => {
    console.log('=== DEBUG ELIMINAR COMPLETO ===');
    console.log('documento completo:', documento);
    console.log('documento.userContract:', documento.userContract);
    console.log('typeof documento.userContract:', typeof documento.userContract);

    if (!window.confirm('¿Estás seguro de eliminar toda esta gestión documental? Esta acción eliminará todos los documentos asociados.')) return;

    try {
      const loadingToast = toast.loading('Eliminando gestión documental completa...');

      // Asegurar que obtenemos el ID correcto
      let contractId;
      if (typeof documento.userContract === 'object' && documento.userContract !== null) {
        contractId = documento.userContract._id || documento.userContract.id || documento.userContract;
      } else {
        contractId = documento.userContract;
      }

      console.log('contractId final a enviar:', contractId);
      console.log('URL final:', `/Documents/${contractId}`);

      await api.delete(`/Documents/${contractId}`);

      toast.success('Gestión documental eliminada exitosamente', {
        id: loadingToast
      });

      // Recargar la lista de documentos
      fetchDocumentos();
    } catch (error) {
      console.error('Error al eliminar gestión documental:', error);
      toast.error('Error al eliminar gestión documental', {
        description: error.response?.data?.message || 'Error en el servidor'
      });
    }
  };

  // Nueva función para eliminar documento específico
  const eliminarDocumentoEspecifico = async (userContract, tipoDocumento) => {
    if (!window.confirm(`¿Estás seguro de eliminar el documento "${tipoDocumento}"?`)) return;

    try {
      const loadingToast = toast.loading(`Eliminando ${tipoDocumento}...`);

      // Asegurar que userContract es un string (ID)
      const contractId = typeof userContract === 'object' ? userContract._id || userContract.id : userContract;

      await api.delete(`/Documents/${contractId}/${tipoDocumento}`);

      toast.success('Documento específico eliminado exitosamente', {
        id: loadingToast
      });

      // Recargar la lista de documentos
      fetchDocumentos();
    } catch (error) {
      console.error('Error al eliminar documento específico:', error);
      toast.error('Error al eliminar documento específico', {
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

    // Auto-seleccionar si es contratista
    let initialUserContract = '';
    if (permissions.isContratista) {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const myContractor = usuarios.find(u => u.user?._id === user?._id);
        if (myContractor) {
          initialUserContract = myContractor._id;
        }
      } catch (error) {
        console.error('Error al obtener usuario local:', error);
      }
    }

    setFormData({
      description: '',
      state: 'Activo',
      retention_time: '5',
      version: 1,
      ip: window.location.hostname,
      user_contrac: initialUserContract,
      _id_gestion: ''
    });
    setFiles({});
    setShowModal(true);
  };

  const abrirModalEliminarEspecifico = (documento) => {
    setSelectedDocument(documento);
    setSelectedDocumentType('');
    setShowDeleteModal(true);
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

        {stats && (
          <div className="row mb-4">
            {Object.entries(stats).map(([key, value]) => (
              <div className="col-md-3 mb-3" key={key}>
                <Card className="border-0 shadow-sm h-100">
                  <Card.Body>
                    <h6 className="text-muted text-uppercase small fw-bold mb-2">
                      {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim()}
                    </h6>
                    <h3 className="fw-bold text-primary mb-0">{value}</h3>
                  </Card.Body>
                </Card>
              </div>
            ))}
          </div>
        )}

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
                      <th style={{ width: '25%' }}>Contratista</th>
                      <th style={{ width: '25%' }}>Descripción</th>
                      <th style={{ width: '12%' }}>Estado</th>
                      <th style={{ width: '10%' }}>Retención</th>
                      <th style={{ width: '8%' }}>Versión</th>
                      <th style={{ width: '20%' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documentos.map((doc) => {
                      // Encontrar contractor y user
                      let contractor = null;
                      let user = null;

                      // Si userContract es un objeto (ya viene poblado del backend)
                      if (doc.userContract && typeof doc.userContract === 'object') {
                        contractor = doc.userContract;
                        user = contractor.user;
                      }
                      // Si userContract es un ID (string), buscar en la lista de usuarios
                      else if (doc.userContract && typeof doc.userContract === 'string') {
                        contractor = usuarios.find((c) => c._id === doc.userContract);
                        user = contractor?.user;
                      }
                      // Intentar con contractorId si existe
                      else if (doc.contractorId) {
                        contractor = usuarios.find((c) => c._id === doc.contractorId);
                        user = contractor?.user;
                      }

                      return (
                        <React.Fragment key={doc._id}>
                          <tr>
                            <td>
                              <div className="d-flex align-items-center">
                                <i className="bi bi-person-circle me-2 text-primary"></i>
                                <div>
                                  <div className="fw-medium">
                                    {user ? `${user.firstName || user.firsName || ''} ${user.lastName || ''}`.trim() || 'Sin nombre' : 'Sin nombre'}
                                  </div>
                                  <small className="text-muted">{user?.email || 'Sin email'}</small>
                                </div>
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
                              <div className="d-flex gap-1 flex-wrap">
                                {permissions.canEdit.documents && (
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => abrirModalEditar(doc)}
                                  >
                                    <i className="bi bi-pencil-square"></i>
                                    <span className="d-none d-md-inline ms-1">Editar</span>
                                  </Button>
                                )}
                                {permissions.canDelete.documents && (
                                  <Button
                                    variant="outline-warning"
                                    size="sm"
                                    onClick={() => abrirModalEliminarEspecifico(doc)}
                                    title="Eliminar documento específico"
                                  >
                                    <i className="bi bi-file-minus"></i>
                                    <span className="d-none d-lg-inline ms-1">Doc</span>
                                  </Button>
                                )}
                                {permissions.canDelete.documents && (
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => eliminarDocumento(doc)}
                                    title="Eliminar gestión completa"
                                  >
                                    <i className="bi bi-trash"></i>
                                    <span className="d-none d-lg-inline ms-1">Todo</span>
                                  </Button>
                                )}
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
                disabled={permissions.isContratista}
              >
                <option value="">Seleccione un usuario contratista</option>
                {usuarios.map((contractor) => (
                  <option key={contractor._id} value={contractor._id}>
                    {contractor.user?.firstName || contractor.user?.firsName || ''} {contractor.user?.lastName || ''} - {contractor.user?.email}
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

      {/* Modal para eliminar documento específico */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton className="border-0 bg-light">
          <Modal.Title>
            <i className="bi bi-file-minus text-warning me-2"></i>
            Eliminar Documento Específico
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="alert alert-warning">
            <i className="bi bi-exclamation-triangle me-2"></i>
            <strong>Atención:</strong> Esta acción eliminará únicamente el documento seleccionado, no toda la gestión documental.
          </div>

          {selectedDocument && (
            <Card className="mb-3 bg-light border-0">
              <Card.Body className="py-2">
                <div className="row">
                  <div className="col-12">
                    <small className="text-muted">Gestión Documental:</small>
                    <p className="mb-1 fw-semibold">{selectedDocument.description}</p>
                  </div>
                  <div className="col-12">
                    <small className="text-muted">Contratista:</small>
                    <p className="mb-0 fw-semibold">{
                      (() => {
                        const contractor = usuarios.find((c) => c._id === selectedDocument.userContract);
                        const user = contractor?.user;
                        return user ? `${user.firstName || user.firsName || ''} ${user.lastName || ''}`.trim() || 'Sin nombre' : 'Sin nombre';
                      })()
                    }</p>
                  </div>
                </div>
              </Card.Body>
            </Card>
          )}

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Seleccionar documento a eliminar *</Form.Label>
            <Form.Select
              value={selectedDocumentType}
              onChange={(e) => setSelectedDocumentType(e.target.value)}
              required
            >
              <option value="">Seleccione un documento...</option>
              <option value="filingLetter">Carta de Radicación</option>
              <option value="certificateOfCompliance">Certificado de Cumplimiento</option>
              <option value="signedCertificateOfCompliance">Certificado de Cumplimiento Firmado</option>
              <option value="activityReport">Reporte de Actividad</option>
              <option value="taxQualityCertificate">Certificado de Calidad Tributaria</option>
              <option value="socialSecurity">Seguridad Social</option>
              <option value="rut">RUT</option>
              <option value="rit">RIT</option>
              <option value="trainings">Capacitaciones</option>
              <option value="initiationRecord">Acta de Inicio</option>
              <option value="accountCertification">Certificación Bancaria</option>
            </Form.Select>
          </Form.Group>

          <div className="d-flex justify-content-end gap-2">
            <Button variant="light" onClick={() => setShowDeleteModal(false)}>
              Cancelar
            </Button>
            <Button
              variant="warning"
              onClick={() => {
                if (selectedDocumentType) {
                  eliminarDocumentoEspecifico(selectedDocument.userContract, selectedDocumentType);
                  setShowDeleteModal(false);
                } else {
                  toast.error('Por favor selecciona un documento');
                }
              }}
              disabled={!selectedDocumentType}
            >
              <i className="bi bi-file-minus me-2"></i>
              Eliminar Documento
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default DashboardDocumentos;