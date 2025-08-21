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
import axios from "axios";
import Header from "../../../../components/Header/Header";
import "./User_Contract.css";
import { toast } from "sonner";

// Api
import api from "../../../../services/api"

export default function User_Contract() {
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
    name: "",
    lastname: "",
    idcard: "",
    telephone: "",
    email: "",
    password: "",
    role: "contratista",
    post: "",
    state: "Activo",
    contractId: "",
  });

  // Obtener todos los usuario del api
  const obtenerUsuarios = async () => {
    try {
      const res = await api.get(`/Users`);
      setUsuariosC(res.data.data);
    } catch (err) {
       toast.error("Error al cargar los usuario", {
              description:
                err.response?.data?.message || "Error en el  en el servidor",
            });


    } finally {
      setCargando(false);
    }
  };

  // Obtener los contratos
  const obtenerContratos = async () => {
    try {
      const res = await api.get(`/Contracts`);
      setContratos(res.data.data);
    } catch (err) {
      console.log("Error al cargar los contratos", error);
      toast.error('Error al cargar los usaurio',{description:error?.response?.data?.message});
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
        name: "",
        lastname: "",
        idcard: "",
        telephone: "",
        email: "",
        password: "",
        role: "contratista",
        post: "",
        state: "Activo",
        contractId: "",
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
      toast.success('Usuario eliminado exitosamente',{description:res.data?.message} || 'Usuario eliminado')
    } catch (err) {
      toast.error('No se puedo eliminar el usuairo',{description:err?.response?.data?.message || 'No se pudo eliminar el usuario'})
    }
  };
  // Abril modal para crear Uusario
  const abrirModalCrearUsuario = () => {
    setForm({
      name: "",
      lastname: "",
      idcard: "",
      telephone: "",
      email: "",
      password: "",
      role: "contratista",
      post: "",
      state: "Activo",
      contractId: "",
    });
    setModoEdicion(false);
    setIdEditando(null);
    setMostrarModal(true);
  };

  // Abril el modal para editarlo
  const abrirModalEditar = (user) => {
    setForm({
      name: user.name,
      lastname: user.lastname,
      idcard: user.idcard,
      telephone: user.telephone,
      email: user.email,
      password: "",
      post: user.post,
      state: user.state,
      contractId: user.contractId?._id || "",
    });
    setIdEditando(user._id);
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
                  {
                    usuariosC.filter((user) => user.role === "contratista")
                      .length
                  }{" "}
                  registros
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
                      <th>Estado</th>
                      <th className="pe-4 text-end">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuariosC
                      .filter((user) => user.role === "contratista")
                      .map((user) => (
                        <tr key={user._id} className="align-middle">
                          <td className="ps-4 fw-medium">{user.name}</td>
                          <td>{user.lastname}</td>
                          <td>{user.idcard || "-"}</td>
                          <td>{user.telephone || "-"}</td>
                          <td>
                            <a
                              href={`mailto:${user.email}`}
                              className="text-primary"
                            >
                              {user.email}
                            </a>
                          </td>
                          <td>
                            <span className="badge bg-secondary bg-opacity-10 text-secondary">
                              {user.role}
                            </span>
                          </td>
                          <td>{user.post || "-"}</td>
                          <td>
                            <span
                              className={`badge ${
                                user.state === "Activo"
                                  ? "bg-success bg-opacity-10 text-success"
                                  : "bg-danger bg-opacity-10 text-danger"
                              }`}
                            >
                              {user.state}
                            </span>
                          </td>
                          <td className="pe-4">
                            <div className="d-flex justify-content-end gap-2">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => abrirModalEditar(user)}
                                className="d-flex align-items-center"
                              >
                                <i className="bi bi-pencil-square me-1"></i>
                                Editar
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => eliminarUsuario(user._id)}
                                className="d-flex align-items-center"
                              >
                                <i className="bi bi-trash me-1"></i>
                                Eliminar
                              </Button>
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
                <Form.Group controlId="name">
                  <Form.Label>Nombre</Form.Label>
                  <Form.Control
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="Ingrese el nombre"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="lastname">
                  <Form.Label>Apellido</Form.Label>
                  <Form.Control
                    name="lastname"
                    value={form.lastname}
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
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="contractId">
                  <Form.Label>Contrato</Form.Label>
                  <Form.Select
                    name="contractId"
                    value={form.contractId}
                    onChange={handleChange}
                  >
                    <option value="">Seleccione un contrato</option>
                    {contratos.map((contrato) => (
                      <option key={contrato._id} value={contrato._id}>
                        {contrato.contractNumber ||
                          `Contrato #${contrato._id.slice(-4)}`}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="state">
                  <Form.Label>Estado</Form.Label>
                  <Form.Select
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </Form.Select>
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
              className={`bi ${
                modoEdicion ? "bi-arrow-repeat" : "bi-save"
              } me-2`}
            ></i>
            {modoEdicion ? "Actualizar" : "Guardar"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
