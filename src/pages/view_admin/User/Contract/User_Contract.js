import React, { useEffect, useState } from "react";
import {
  Table,
  Container,
  Spinner,
  Alert,
  Card,
  Button,
  Modal,
  Form,
  Row,
  Col,
} from "react-bootstrap";
import Header from "../../../../components/Header/Header";
import "./User_Contract.css";
import { toast } from "sonner";

// Api
import api from "../../../../services/api"
import { usePermissions } from "../../../../hooks/usePermissions";

export default function User_Contract() {
  const permissions = usePermissions();
  // Varibale para traer todos los usuario contratista de la api
  const [usuariosC, setUsuariosC] = useState([]);

  // Varible de carga
  const [cargando, setCargando] = useState(true);

  // Manejo de errores
  const [error, setError] = useState("");

  // Varable contratos
  const [contratos, setContratos] = useState([]);
  // Manejo del modal
  const [mostrarModal, setMostrarModal] = useState(false);

  // Funciones para editar el modal
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idEditando, setIdEditando] = useState(null);

  // Datos del formulario iniciales
  const [form, setForm] = useState({
    firsName: "",
    lastName: "",
    idcard: "",
    telephone: "",
    email: "",
    password: "",
    role: "contratista",
    post: "",
    state: true,
    contractId: "",
    residentialAddress: "",
    institutionalEmail: "",
    EconomicaActivityNumber: "",
  });

  // Obtener todos los usuario del api
  const obtenerUsuarios = async () => {
    try {
      // Usar el endpoint específico para contratistas
      const res = await api.get(`/Users/Contractor?state=true`);
      if (res.data.success) {
        setUsuariosC(res.data.data);
      } else {
        setError("No se pudieron cargar los usuarios");
      }
    } catch (err) {
      console.error('Error al obtener usuarios:', err);
      setError(err.response?.data?.message || 'Error al cargar usuarios');
      toast.error("Error al cargar los usuario", {
        description: err.response?.data?.message || "Error en el servidor",
      });
    } finally {
      setCargando(false);
    }
  };

  // Obtener los contratos
  const obtenerContratos = async () => {
    try {
      const res = await api.get(`/Contracts?WithContractor=false`);
      setContratos(res.data.data);
    } catch (err) {
      console.log("Error al cargar los contratos", err);
      toast.error('Error al cargar los contratos', { description: err?.response?.data?.message || 'Error en el servidor' });
    }
  };

  // Renderizar el componente
  useEffect(() => {
    obtenerContratos();
    obtenerUsuarios();

  }, []);

  // Capturar los campos del formulario cuando el usuario escriba
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Crear le usuario
  const crearUsuario = async () => {
    try {
      const res = await api.post(`/Users`, form);
      setMostrarModal(false);
      setForm({
        firsName: "",
        lastName: "",
        idcard: "",
        telephone: "",
        email: "",
        password: "",
        role: "contratista",
        post: "",
        state: true,
        contractId: "",
        residentialAddress: "",
        institutionalEmail: "",
        EconomicaActivityNumber: "",
      });
      obtenerUsuarios();
      toast.success(`Usuario exitosamente creado`, {
        description: res?.data?.message || "Usuario creado exitosamente",
      });
    } catch (err) {
      toast.error(`Error al crear un usuario`, {
        description: err.response?.data?.message || "Error desconocido",
      });
    }
  };
  // ... tres puntos sirven para hacer una copia

  // Actualizar usuario
  const actualizarUsuario = async () => {
    const messageUserPut = toast.loading("Espere un poquito");
    try {
      const datosActualizados = { ...form };

      // Eliminar campos vacíos, nulos o indefinidos para no enviarlos
      Object.keys(datosActualizados).forEach((key) => {
        if (
          datosActualizados[key] === "" ||
          datosActualizados[key] === null ||
          datosActualizados[key] === undefined
        ) {
          delete datosActualizados[key];
        }
      });

      const res = await api.put(
        `/Users/${idEditando}`,
        datosActualizados
      );
      setMostrarModal(false);
      setModoEdicion(false);
      setIdEditando(null);
      obtenerUsuarios();
      toast.success("Usuario editado exitosamente", {
        id: messageUserPut,
        description: res.data?.message || "Cambios guardados con éxito",
      });
    } catch (err) {
      toast.error("Error al editar un usuario", {
        id: messageUserPut,
        description: err.response?.data?.message || "Erro del servidor",
      });
    }
  };

  // Borrar usuario
  const eliminarUsuario = async (id) => {
    const confirmar = window.confirm(
      "¿Seguro que quieres eliminar este Usuario contratista"
    );
    if (!confirmar) return;
    try {
      const res = await api.delete(`/Users/${id}`);
      obtenerUsuarios();
      toast.success('Usuario eliminado exitosamente', { description: res.data?.message } || 'Usuario eliminado')
    } catch (err) {
      toast.error('No se puedo eliminar el usuairo', { description: err?.response?.data?.message || 'No se pudo eliminar el usuario' })
    }
  };
  // Abril modal para crear Uusario
  const abrirModalCrearUsuario = () => {
    setForm({
      firsName: "",
      lastName: "",
      idcard: "",
      telephone: "",
      email: "",
      password: "",
      role: "contratista",
      post: "",
      state: true,
      contractId: "",
      residentialAddress: "",
      institutionalEmail: "",
      EconomicaActivityNumber: "",
    });
    setModoEdicion(false);
    setIdEditando(null);
    setMostrarModal(true);
  };

  // Abril el modal para editarlo
  const abrirModalEditar = (user) => {
    setForm({
      firsName: "",
      lastName: "",
      idcard: "",
      telephone: "",
      email: "",
      password: "",
      role: "contratista",
      post: "",
      state: "",
      contractId: "",
      residentialAddress: "",
      institutionalEmail: "",
      EconomicaActivityNumber: "",
    });
    setIdEditando(user.user?._id);
    setModoEdicion(true);
    setMostrarModal(true);
  };
  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      {/* Encabezado */}
      <Header />

      <Container className="py-4">
        <Card className="border-0 shadow-sm rounded-lg overflow-hidden">
          <Card.Body className="p-0">
            {/* Header del card */}
            <div className="d-flex justify-content-between align-items-center p-4 border-bottom">
              <div className="d-flex align-items-center">
                <h3 className="mb-0 fw-semibold text-gray-800">
                  <i className="bi bi-people-fill me-2 text-primary"></i>
                  Listado de Usuarios Contratistas
                </h3>
                <span className="badge bg-primary-soft text-primary ms-3">
                  {usuariosC.length} registros
                </span>
              </div>
              <Button
                variant="primary"
                onClick={abrirModalCrearUsuario}
                className="d-flex align-items-center"
              >
                <i className="bi bi-plus-lg me-2"></i>
                Agregar Contratista
              </Button>
            </div>

            {/* Contenido */}
            {cargando ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2 text-muted">Cargando usuarios...</p>
              </div>
            ) : error ? (
              <Alert variant="danger" className="m-4">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {error}
              </Alert>
            ) : (
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="ps-4">Nombre</th>
                      <th>Apellido</th>
                      <th>Cédula</th>
                      <th>Teléfono</th>
                      <th>Email</th>
                      <th>Rol</th>
                      <th>Cargo</th>

                      <th className="pe-4 text-end">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuariosC.map((contractor) => (
                      <tr key={contractor._id} className="align-middle">
                        <td className="ps-4 fw-medium">{contractor.user?.firsName || "-"}</td>
                        <td>{contractor.user?.lastName || "-"}</td>
                        <td>{contractor.user?.idcard || "-"}</td>
                        <td>{contractor.user?.telephone || "-"}</td>
                        <td>
                          <a
                            href={`mailto:${contractor.user?.email}`}
                            className="text-primary"
                          >
                            {contractor.user?.email || "-"}
                          </a>
                        </td>
                        <td>
                          <span className="badge bg-secondary bg-opacity-10 text-secondary">
                            {contractor.user?.role || "contratista"}
                          </span>
                        </td>
                        <td>{contractor.user?.post || "-"}</td>

                        <td className="pe-4">
                          <div className="d-flex justify-content-end gap-2">
                            {permissions.canEdit.users && (
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => abrirModalEditar(contractor)}
                                className="d-flex align-items-center"
                              >
                                <i className="bi bi-pencil-square me-1"></i>
                                Editar
                              </Button>
                            )}
                            {permissions.canDelete.users && (
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => eliminarUsuario(contractor.user?._id)}
                                className="d-flex align-items-center"
                              >
                                <i className="bi bi-trash me-1"></i>
                                Eliminar
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>

      {/* Modal */}
      <Modal
        show={mostrarModal}
        onHide={() => setMostrarModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-semibold">
            {modoEdicion ? "Editar Usuario" : "Registrar Nuevo Usuario"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-0">
          <Form>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group controlId="firsName">
                  <Form.Label>Nombre</Form.Label>
                  <Form.Control
                    name="firsName"
                    value={form.firsName}
                    onChange={handleChange}
                    required
                    placeholder="Ingrese el nombre"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="lastName">
                  <Form.Label>Apellido</Form.Label>
                  <Form.Control
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    required
                    placeholder="Ingrese el apellido"
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="idcard">
                  <Form.Label>Cédula</Form.Label>
                  <Form.Control
                    name="idcard"
                    value={form.idcard}
                    onChange={handleChange}
                    placeholder="Ingrese la cédula"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="telephone">
                  <Form.Label>Teléfono</Form.Label>
                  <Form.Control
                    name="telephone"
                    value={form.telephone}
                    onChange={handleChange}
                    placeholder="Ingrese el teléfono"
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="email">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Ingrese el email"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="password">
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder={
                      modoEdicion
                        ? "Dejar vacío para no cambiar"
                        : "Ingrese contraseña"
                    }
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="post">
                  <Form.Label>Cargo</Form.Label>
                  <Form.Control
                    name="post"
                    value={form.post}
                    onChange={handleChange}
                    placeholder="Ingrese el cargo"
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="contractId">
                  <Form.Label>Contrato *</Form.Label>
                  <Form.Select
                    name="contractId"
                    value={form.contractId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccione un contrato</option>
                    {contratos.map((contrato) => (
                      <option key={contrato._id} value={contrato._id}>
                        {contrato.contractNumber || `Contrato #${contrato._id.slice(-4)}`}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Text className="text-muted">
                    Solo se muestran contratos sin vincular
                  </Form.Text>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="residentialAddress">
                  <Form.Label>Dirección Residencial *</Form.Label>
                  <Form.Control
                    name="residentialAddress"
                    value={form.residentialAddress}
                    onChange={handleChange}
                    required={!modoEdicion}
                    placeholder="Ingrese la dirección residencial"
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="institutionalEmail">
                  <Form.Label>Email Institucional *</Form.Label>
                  <Form.Control
                    type="email"
                    name="institutionalEmail"
                    value={form.institutionalEmail}
                    onChange={handleChange}
                    required={!modoEdicion}
                    placeholder="Ingrese el email institucional"
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="EconomicaActivityNumber">
                  <Form.Label>Número de Actividad Económica *</Form.Label>
                  <Form.Control
                    name="EconomicaActivityNumber"
                    value={form.EconomicaActivityNumber}
                    onChange={handleChange}
                    required={!modoEdicion}
                    placeholder="Ingrese el número de actividad económica"
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="role">
                  <Form.Label>Rol</Form.Label>
                  <Form.Control
                    name="role"
                    value="Contratista"
                    disabled
                    readOnly
                    className="bg-light"
                  />
                  <Form.Text className="text-muted">
                    El rol de contratista está predeterminado
                  </Form.Text>
                </Form.Group>
              </Col>


            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="light" onClick={() => setMostrarModal(false)}>
            Cancelar
          </Button>
          <Button
            variant={modoEdicion ? "warning" : "primary"}
            onClick={modoEdicion ? actualizarUsuario : crearUsuario}
            className="d-flex align-items-center"
          >
            <i
              className={`bi ${modoEdicion ? "bi-arrow-repeat" : "bi-save"
                } me-2`}
            ></i>
            {modoEdicion ? "Actualizar" : "Guardar"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
