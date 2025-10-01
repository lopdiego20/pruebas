// src/pages/DashboardDocumentos.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Table, Modal, Form, Card, Badge, Spinner, Accordion } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Header from '../../../components/Header/Header';
import { usePermissions } from '../../../hooks/usePermissions';

const DashboardDocumentos = () => {
  const permissions = usePermissions();
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([fetchDocumentos(), fetchUsuarios()]);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const fetchDocumentos = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/Documents', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDocumentos(res.data.data);
    } catch (error) {
      console.error('Error al obtener documentos:', error);
      toast.error('Error al cargar documentos');
    }
  };

  const fetchUsuarios = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/Users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsuarios(res.data.data);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      toast.error('Error al cargar usuarios');
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

      await axios.delete(`http://localhost:3000/api/Documents/${usuarioCreador._id}`, {
        headers: { Authorization: `Bearer ${token}` },
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
        await axios.put(`http://localhost:3000/api/Documents/${user_contract}`, form, {
          headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
        });
        toast.success('Gestión documental actualizada');
      } else {
        await axios.post(`http://localhost:3000/api/Documents/${user_contract}`, form, {
          headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
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
      <Header />
      
      <div className="container-fluid py-4 px-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0 fw-bold text-primary">
            <i className="bi bi-folder me-2"></i>
            Gestión Documental
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
              <h5 className="mt-3 text-muted">No hay gestiones documentales</h5>
              <p className="text-muted">Crea tu primera gestión haciendo clic en el botón "Agregar Gestión"</p>
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
    </div>
  );
};

export default DashboardDocumentos;