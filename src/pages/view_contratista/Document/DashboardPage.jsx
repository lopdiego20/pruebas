// src/pages/DashboardDocumentos.jsx
import React, { useEffect, useState } from 'react';
import { Button, Table, Modal, Form, Card, Badge, Spinner, Accordion } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Header from '../../../components/Header/Header';
import api from '../../../services/api';

const DashboardDocumentos = () => {
  const [documentos, setDocumentos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formData, setFormData] = useState({
    _id: '',
    description: '',
    state: '',
    retention_time: '',
    version: 1,
    ip: window.location.hostname,
    user_contrac: '',
    _id_gestion: ''
  });
  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeAccordion, setActiveAccordion] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Debug: Verificar datos de autenticación al cargar el componente
  useEffect(() => {
    console.log('=== DEBUG DASHBOARD DOCUMENTOS ===');
    console.log('Token:', token ? 'Presente' : 'No encontrado');
    console.log('Usuario:', user);
    console.log('ID del usuario:', user?._id);
    console.log('===================================');
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      // Validar que tengamos token antes de hacer la llamada
      if (!token) {
        toast.error('No hay token de autenticación');
        setLoading(false);
        return;
      }

      console.log('Cargando datos sin verificar rol');

      try {
        await Promise.all([fetchDocumentos(), fetchUsuarios()]);
      } catch (error) {
        console.error('Error loading data:', error);
        
        if (error.response?.status === 401) {
          toast.error('Token de autenticación inválido o expirado');
        } else if (error.response?.status === 403) {
          toast.error('No tienes permisos para acceder a esta sección');
        } else {
          toast.error(`Error al cargar datos: ${error.response?.data?.message || error.message}`);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const fetchDocumentos = async () => {
    try {
      console.log('=== INICIO fetchDocumentos ===');
      console.log('Accediendo directamente sin verificar rol');
      console.log('Usuario completo:', user);
      console.log('User ID:', user?._id);
      
      // Acceso directo sin verificar rol - usar siempre la ruta de contratista
      console.log('✅ Usando ruta específica sin verificación de rol');
      await fetchDocumentosContratista();
      
    } catch (error) {
      console.error('❌ Error al obtener documentos:', error);
      console.error('❌ URL que falló:', error.config?.url);
      console.error('❌ Método:', error.config?.method);
      console.error('❌ Headers:', error.config?.headers);
      
      if (error.response?.status === 401) {
        toast.error('Token inválido al obtener documentos');
      } else if (error.response?.status === 403) {
        toast.warning(`No tienes permisos para acceder a: ${error.config?.url}`);
        console.error('❌ Respuesta 403:', error.response?.data);
        // Establecer array vacío sin mostrar error
        setDocumentos([]);
      } else {
        toast.error(`Error al cargar documentos: ${error.response?.data?.message || error.message}`);
      }
      
      // No lanzar error, establecer array vacío
      setDocumentos([]);
    }
  };

  const fetchDocumentosContratista = async () => {
    try {
      console.log('=== INICIO fetchDocumentosContratista ===');
      console.log('Obteniendo documentos específicos para contratista...');
      
      // Verificar datos del usuario de manera más robusta
      const userFromStorage = localStorage.getItem('user');
      console.log('Raw user from localStorage:', userFromStorage);
      
      let parsedUser;
      try {
        parsedUser = JSON.parse(userFromStorage || '{}');
      } catch (parseError) {
        console.error('❌ Error parsing user data:', parseError);
        toast.error('Error al leer datos del usuario');
        setDocumentos([]);
        return;
      }
      
      console.log('Parsed user:', parsedUser);
      console.log('User _id:', parsedUser._id);
      console.log('User id (sin underscore):', parsedUser.id);
      
      // Intentar con _id primero, luego con id
      const userId = parsedUser._id || parsedUser.id;
      
      console.log('Usuario desde localStorage:', parsedUser);
      console.log('UserID extraído final:', userId);
      console.log('Tipo de userId:', typeof userId);
      
      if (!userId) {
        console.error('❌ No se encontró ID de usuario ni _id ni id');
        toast.warning('No se pudo obtener información del usuario');
        setDocumentos([]);
        return;
      }

      // Usar la ruta específica para contratistas: /Documents/:userContract
      const url = `/Documents/${userId}`;
      console.log('🚀 Consultando URL específica:', url);
      console.log('🚀 PUNTO CRÍTICO: A punto de hacer api.get()');
      
      const res = await api.get(url);
      console.log('✅ Respuesta exitosa:', res.data);
      console.log('✅ Status:', res.status);
      
      if (res.data && res.data.data) {
        // Si hay documentos, mostrarlos
        const documentos = Array.isArray(res.data.data) ? res.data.data : [res.data.data];
        setDocumentos(documentos);
        toast.success(`Se cargaron ${documentos.length} documento(s) exitosamente`);
        console.log('✅ Documentos configurados:', documentos);
      } else {
        // Si no hay documentos
        setDocumentos([]);
        toast.info('No tienes documentos de gestión asociados');
        console.log('ℹ️ No hay documentos en la respuesta');
      }
    } catch (error) {
      console.error('❌ Error específico para contratista:', error);
      console.error('❌ URL que falló:', error.config?.url);
      console.error('❌ Datos del error:', error.response?.data);
      console.error('❌ Status del error:', error.response?.status);
      
      if (error.response?.status === 401) {
        toast.error('Token de autenticación inválido para contratista');
      } else if (error.response?.status === 403) {
        toast.warning(`Sin permisos para: ${error.config?.url}`);
        console.error('❌ Mensaje del backend:', error.response?.data?.mesaage || error.response?.data?.message);
      } else if (error.response?.status === 404) {
        // No hay documentos para este contratista
        setDocumentos([]);
        toast.info('No tienes documentos de gestión creados aún');
      } else {
        toast.error(`Error al cargar documentos: ${error.response?.data?.message || error.message}`);
      }
      
      setDocumentos([]);
    }
  };

  const fetchUsuarios = async () => {
    try {
      console.log('Obteniendo usuarios contratistas...');
      
      // Obtener directamente usuarios contratistas
      const res = await api.get('/Users/Contractor?state=true');
      console.log('Contractors cargados:', res.data.data);
      setUsuarios(res.data.data || []);
      
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      
      if (error.response?.status === 401) {
        toast.error('Token inválido al obtener usuarios');
      } else if (error.response?.status === 403) {
        toast.warning('Configurando usuario actual como fallback');
        setUsuarios([user]); // Usar el usuario del localStorage
      } else {
        toast.error(`Error al cargar usuarios: ${error.response?.data?.message || error.message}`);
      }
      
      // Usar el usuario actual como fallback
      setUsuarios([user]);
    }
  };

  const eliminarDocumento = async (documento) => {
    if (!window.confirm('¿Estás seguro de eliminar esta gestión documental?')) return;

    try {
      const usuarioCreador = usuarios.find((u) => u._id === documento.user_create);

      if (!usuarioCreador) {
        toast.error('No se encontró el usuario creador');
        return;
      }

      await api.delete(`/Documents/${usuarioCreador._id}`, {
        data: { _id: documento._id }
      });

      toast.success('Gestión documental eliminada con éxito');
      fetchDocumentos();
    } catch (error) {
      console.error(error);
      toast.error('Error al eliminar la gestión documental');
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
      state: '', 
      retention_time: '', 
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
      user_contrac: doc.user_contrac
    });
    setFiles({});
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData();
    const user_contract = formData.user_contrac;

    form.append('description', formData.description);
    form.append('state', formData.state || 'Activo');
    form.append('retention_time', formData.retention_time || 20);
    form.append('version', formData.version);
    form.append('ip', window.location.hostname);
    if (modoEdicion) form.append('_id', formData._id_gestion);

    const fileFields = [
      'filing_letter',
      'certificate_of_compliance',
      'signed_certificate_of_compliance',
      'activity_report',
      'tax_quality_certificate',
      'social_security',
      'rut',
      'rit',
      'Trainings',
      'initiation_record',
      'account_certification',
    ];
    
    fileFields.forEach((field) => {
      if (files[field]) form.append(field, files[field]);
    });

    try {
      toast.loading(modoEdicion ? 'Actualizando gestión...' : 'Creando gestión...');
      
      if (modoEdicion) {
        await api.put(`/Documents/${user_contract}`, form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Gestión documental actualizada');
      } else {
        await api.post(`/Documents/${user_contract}`, form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Gestión documental creada');
      }
      
      setShowModal(false);
      fetchDocumentos();
    } catch (error) {
      console.error(error);
      toast.error('Error al guardar la gestión documental');
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
      {/* Verificación de autenticación antes de mostrar el Header */}
      {!token ? (
        <div className="container-fluid py-4 px-4">
          <div className="alert alert-danger" role="alert">
            <i className="bi bi-exclamation-triangle me-2"></i>
            <strong>Error de Autenticación:</strong> No se encontraron datos de sesión válidos.
            <div className="mt-2">
              <small>Token: {token ? 'Presente' : 'No encontrado'}</small>
            </div>
          </div>
        </div>
      ) : (
        <>
          <Header />
          
          <div className="container-fluid py-4 px-4">
            <div className="alert alert-info mb-4" role="alert">
              <i className="bi bi-info-circle me-2"></i>
              <strong>Gestión Documental:</strong> Accediendo a documentos de gestión. 
              Puedes ver y gestionar los documentos disponibles.
            </div>
            
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="mb-0 fw-bold text-primary">
                <i className="bi bi-folder me-2"></i>
                Mi Gestión Documental
              </h2>
              <Button variant="primary" onClick={abrirModalCrear}>
                <i className="bi bi-plus-circle me-2"></i>
                Agregar Gestión
              </Button>
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
              <h5 className="mt-3 text-muted">
                No tienes gestiones documentales disponibles
              </h5>
              <p className="text-muted">
                No tienes documentos de gestión creados. Los administradores pueden crear documentos de gestión para tu cuenta.
              </p>
            </Card.Body>
          </Card>
        ) : (
          <Card className="shadow-sm border-0">
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
                      const user = usuarios.find((u) => u._id === doc.user_contrac);
                      return (
                        <React.Fragment key={doc._id}>
                          <tr>
                            <td>
                              <div className="d-flex align-items-center">
                                <i className="bi bi-person-circle me-2 text-primary"></i>
                                {user?.name || 'Sin nombre'}
                              </div>
                            </td>
                            <td>{doc.description}</td>
                            <td>
                              <Badge bg={doc.state === 'Activo' ? 'success' : 'secondary'}>
                                {doc.state}
                              </Badge>
                            </td>
                            <td>{doc.retention_time} años</td>
                            <td>
                              <Badge bg="info">v{doc.version}</Badge>
                            </td>
                            <td>
                              <div className="d-flex gap-2">
                                {permissions.canEdit.documents && (
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => abrirModalEditar(doc)}
                                  >
                                    <i className="bi bi-pencil-square me-1"></i>Editar
                                  </Button>
                                )}
                                {permissions.canDelete.documents && (
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => eliminarDocumento(doc)}
                                  >
                                    <i className="bi bi-trash me-1"></i>Eliminar
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
              <Form.Label className="fw-semibold">Usuario Contratista</Form.Label>
              <Form.Select 
                name="user_contrac" 
                value={formData.user_contrac} 
                onChange={handleInputChange} 
                required
                className="py-2"
              >
                <option value="">Seleccione un usuario</option>
                {usuarios
                  .filter((u) => u.role === 'contratista')
                  .map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name}
                    </option>
                  ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Descripción</Form.Label>
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
                  <Form.Label className="fw-semibold">Estado</Form.Label>
                  <Form.Select 
                    name="state" 
                    value={formData.state} 
                    onChange={handleInputChange}
                    className="py-2"
                  >
                    <option value="">Selecciona un estado</option>
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Tiempo de Retención (años)</Form.Label>
                  <Form.Control
                    type="number"
                    name="retention_time"
                    value={formData.retention_time}
                    onChange={handleInputChange}
                    placeholder="Ej: 20"
                  />
                </Form.Group>
              </div>
            </div>

            <Accordion activeKey={activeAccordion} onSelect={setActiveAccordion} className="mb-4">
              <Accordion.Item eventKey="0" className="border-0">
                <Accordion.Header className="bg-light">
                  <span className="fw-semibold">Documentos Adjuntos</span>
                </Accordion.Header>
                <Accordion.Body className="p-0 pt-3">
                  <div className="row">
                    {documentFields.map((field) => (
                      <div className="col-md-6 mb-3" key={field.name}>
                        <Form.Group>
                          <Form.Label>{field.label}</Form.Label>
                          <Form.Control 
                            type="file" 
                            name={field.name} 
                            onChange={handleFileChange} 
                            className="py-2"
                          />
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
        </>
      )}
    </div>
  );
};

export default DashboardDocumentos;