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
import "./User_Funcionary.css";
import { toast } from "sonner";
// Api
import api from '../../../../services/api'
import { usePermissions } from "../../../../hooks/usePermissions";

export default function User_Funcionary() {
  const permissions = usePermissions();
  // Varibale para traer todos los usuario contratista de la api
  const [usuariosf, setUsuariosF] = useState([]);

  // Varible de carga
  const [cargando, setCargando] = useState(true);

  // Manejo de errores
  const [error, setError] = useState("");

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
    role: "funcionario",
    post: "",
    state: true,
  });

  // Obtener todos los usuario del api
  const obtenerUsuarios = async () => {
    try {
      // Usar el endpoint específico para funcionarios
      const res = await api.get(`/Users/Funcionary?state=true`);
      if (res.data.success) {
        setUsuariosF(res.data.data || []);
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

  // Renderizar el componente
  useEffect(() => {
    obtenerUsuarios();
  }, []);

  // Capturar los campos del formulario cuando el usuario escriba
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Crear le usuario
  const crearUsuario = async () => {
    const loadingUser = toast.loading("Espere un momentos");
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
        role: "funcionario",
        post: "",
        state: true,
      });
      obtenerUsuarios();
      toast.success("Usuario creado exitosamente", {
        id: loadingUser,
        description:
          res?.data?.message || "Usuario funcionario creado exitosamente",
      });
    } catch (err) {
      toast.error("Error al crear usuario", {
        id: loadingUser,
        description: err.response?.data?.message || "Error en el servidor",
      });
    }
  };
  // ... tres puntos sirven para hacer una copia

  // Actualizar usuario
  const actualizarUsuario = async () => {
    const loadingUserUpdate = toast.loading("Cargando....");
    try {
      const datosActualizados = { ...form };
      if (!form.password) {
        delete datosActualizados.password;
      }

      const res = await api.put(
        `/Users/${idEditando}`,
        datosActualizados
      );
      setMostrarModal(false);
      setModoEdicion(false);
      setIdEditando(null);
      obtenerUsuarios();
      toast.success("Usuario actualizado exitosamente", {
        id: loadingUserUpdate,
        description:
          res?.data?.message ||
          "Usuario funcionario actualizando exitosamente ",
      });
    } catch (err) {
      toast.error("Error al actualizar el usuario", {
        id: loadingUserUpdate,
        description: err.response?.data?.message || "Error del servidor",
      });
    }
  };

  // Borrar usuario
  const eliminarUsuario = async (id) => {
    const confirmar = window.confirm(
      "¿Seguro que quieres eliminar este Usuario contratista"
    );
    if (!confirmar) return;

    const loadingUserDeletep = toast.loading("Cargando...");
    try {
      const res = await api.delete(`/Users/${id}`);
      obtenerUsuarios();
      toast.success("Usuario eliminado", {
        id: loadingUserDeletep,
        description: res?.data?.message,
      });
    } catch (err) {
      toast.error("Error al eliminar el usuario", {
        id: loadingUserDeletep,
        description: err?.response?.data?.message || "Erro en el servidor",
      });
    }
  };

  // Abril el modal para editarlo
  const abrirModalEditar = (funcionario) => {
    setForm({
      firsName: funcionario.user?.firsName || "",
      lastName: funcionario.user?.lastName || "",
      idcard: funcionario.user?.idcard || "",
      telephone: funcionario.user?.telephone || "",
      email: funcionario.user?.email || "",
      password: "",
      role: "funcionario",
      post: funcionario.user?.post || "",
      state: funcionario.user?.state || true,
    });
    setIdEditando(funcionario.user?._id);
    setModoEdicion(true);
    setMostrarModal(true);
  };

  // Abril e modal para crear
  const abrirModalCrearUsuario = () => {
    setForm({
      firsName: "",
      lastName: "",
      idcard: "",
      telephone: "",
      email: "",
      password: "",
      role: "funcionario",
      post: "",
      state: true,
    });
    setModoEdicion(false);
    setIdEditando(null);
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
                  <i className="bi bi-person-vcard-fill me-2 text-primary"></i>
                  Listado de Usuarios Funcionarios
                </h3>
                <span className="badge bg-primary-soft text-primary ms-3">
                  {usuariosf.length} registros
                </span>
              </div>
              <Button
                variant="primary"
                onClick={abrirModalCrearUsuario}
                className="d-flex align-items-center"
              >
                <i className="bi bi-plus-lg me-2"></i>
                Agregar Funcionario
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
            ) : usuariosf.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-people text-muted" style={{ fontSize: '3rem' }}></i>
                <p className="mt-3 text-muted fw-medium">No hay funcionarios registrados</p>
                <p className="text-muted small">Haz clic en "Agregar Funcionario" para crear uno nuevo.</p>
              </div>
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
                      <th>Estado</th>
                      <th className="pe-4 text-end">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuariosf.map((funcionario) => (
                      <tr key={funcionario._id} className="align-middle">
                        <td className="ps-4 fw-medium">{funcionario.user?.firsName || "-"}</td>
                        <td>{funcionario.user?.lastName || "-"}</td>
                        <td>{funcionario.user?.idcard || "-"}</td>
                        <td>{funcionario.user?.telephone || "-"}</td>
                        <td>
                          <a
                            href={`mailto:${funcionario.user?.email}`}
                            className="text-primary"
                          >
                            {funcionario.user?.email || "-"}
                          </a>
                        </td>
                        <td>
                          <span className="badge bg-secondary bg-opacity-10 text-secondary">
                            {funcionario.user?.role || "funcionario"}
                          </span>
                        </td>
                        <td>{funcionario.user?.post || "-"}</td>
                        <td>
                          <span
                            className={`badge ${funcionario.user?.state === true
                              ? "bg-success bg-opacity-10 text-success"
                              : "bg-danger bg-opacity-10 text-danger"
                              }`}
                          >
                            {funcionario.user?.state ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="pe-4">
                          <div className="d-flex justify-content-end gap-2">
                            {permissions.canEdit.users && (
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => abrirModalEditar(funcionario)}
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
                                onClick={() => eliminarUsuario(funcionario.user?._id)}
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
            {modoEdicion ? "Editar Usuario" : "Registrar Nuevo Funcionario"}
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
                <Form.Group controlId="role">
                  <Form.Label>Rol</Form.Label>
                  <Form.Control
                    name="role"
                    value="Funcionario"
                    disabled
                    readOnly
                    className="bg-light"
                  />
                  <Form.Text className="text-muted">
                    El rol de funcionario está predeterminado
                  </Form.Text>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="state">
                  <Form.Label>Estado</Form.Label>
                  <Form.Select
                    name="state"
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value === 'true' })}
                    disabled={!modoEdicion}
                    className={!modoEdicion ? "bg-light" : ""}
                  >
                    <option value={true}>Activo</option>
                    <option value={false}>Inactivo</option>
                  </Form.Select>
                  {!modoEdicion && (
                    <Form.Text className="text-muted">
                      Los nuevos funcionarios se crean como activos
                    </Form.Text>
                  )}
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
