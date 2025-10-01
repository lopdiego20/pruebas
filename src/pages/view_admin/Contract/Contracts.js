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
import "./Contracts.css";
import api from "../../../services/api";
import Header from "../../../components/Header/Header";
import { toast } from "sonner";
import { usePermissions } from "../../../hooks/usePermissions";

export default function Contracts() {
  const [contracts, setContracts] = useState([]);
  const permissions = usePermissions();
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  // Funciones para editar el modal
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idContrato, setIdContrato] = useState(null);
  const [form, setForm] = useState({
    typeofcontract: "",
    startDate: "",
    endDate: "",
    contractNumber: "",
    periodValue: "",
    totalValue: "",
    objectiveContract: "",
    state: true,
    extension: false,
    addiction: false,
    suspension: false,
  });
  // obtener usuarios de la api
  const obtenerCotratos = async () => {
    try {
      const res = await api.get(`/Contracts`);

      setContracts(res.data.data);
      console.log(res.data.data);
    } catch (err) {
      toast.error("Erros al cargar los usuario", {
        description:
          err.response?.data?.message || "Error en el  en el servidor",
      });
    } finally {
      setCargando(false);
    }
  };
  // Cargar apenas llegue a la pagina
  useEffect(() => {
    obtenerCotratos();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Convertir el estado a booleano
    if (name === 'state') {
      setForm({ ...form, [name]: value === 'true' });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const crearContrato = async () => {
    const loadingContract = toast.loading("Cargando...");
    try {
      const res = await api.post(`/Contracts`, form);
      setMostrarModal(false);
      setForm({
        typeofcontract: "",
        startDate: "",
        endDate: "",
        contractNumber: "",
        periodValue: "",
        totalValue: "",
        objectiveContract: "",
        state: true,
        extension: false,
        addiction: false,
        suspension: false,
      });
      toast.success("Contracto creado exitosamente", {
        id: loadingContract,
        description: res?.data?.message,
      });
      obtenerCotratos();
    } catch (err) {
      toast.error("Error al crear un contrato", {
        id: loadingContract,
        description: err?.response?.data?.message,
      });
    }
  };
  // Modal para crear
  const abrirModalCrearContrato = () => {
    setForm({
      typeofcontract: "",
      startDate: "",
      endDate: "",
      contractNumber: "",
      periodValue: "",
      totalValue: "",
      objectiveContract: "",
      state: true,
      extension: false,
      addiction: false,
      suspension: false,
    });
    setModoEdicion(false);
    setIdContrato(null);
    setMostrarModal(true);
  };

  //   Modal editar
  const abrirModalEditar = (contract) => {
    setForm({
      typeofcontract: contract.typeofcontract,
      startDate: contract.startDate,
      endDate: contract.endDate,
      contractNumber: contract.contractNumber,
      state: contract.state,
      periodValue: contract.periodValue,
      totalValue: contract.totalValue,
      objectiveContract: contract.objectiveContract,
      extension: contract.extension || false,
      addiction: contract.addiction || false,
      suspension: contract.suspension || false,
    });
    setIdContrato(contract._id);
    setModoEdicion(true);
    setMostrarModal(true);
  };

  //   Actualizar contratos
  const actualizarContratos = async () => {
    const contractUpdate = toast.loading("Cargandoooo");
    try {
      const datosActualizados = { ...form };
      const res = await api.put(`/Contracts/${idContrato}`, datosActualizados);
      setMostrarModal(false);
      setModoEdicion(false);
      setIdContrato(null);
      obtenerCotratos();
      toast.success("Contrato actualizado", {
        id: contractUpdate,
        description: res?.data?.message || "Contrato actualizado exitosamente",
      });
    } catch (err) {
      toast.error("Error al actualizar el contrato", {
        id: contractUpdate,
        description: err?.response?.data?.message || "Error en el servidor",
      });
    }
  };

  //   Borrar contratos
  const eliminarContrato = async (idContrato) => {
    const confirmar = window.confirm("¿Quieres eliminar este contrato?");
    if (!confirmar) return;
    const loadingContractDelete = toast.loading("Cargando...");
    try {
      const res = await api.delete(`/Contracts/${idContrato}`);
      obtenerCotratos();
      toast.success("Contrato eliminado exitosamente", {
        id: loadingContractDelete,
        description: res?.data?.message || "Contracto eliminado",
      });
    } catch (err) {
      toast.error("Error al eliminar el contrato", {
        id: loadingContractDelete,
        description:
          error?.response?.data?.message || "Error al eliminar el contratro",
      });
    }
  };
  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <Header />

      <Container className="py-4">
        <Card className="border-0 shadow-sm rounded-lg overflow-hidden">
          <Card.Body className="p-0">
            {/* Header del card */}
            <div className="d-flex justify-content-between align-items-center p-4 border-bottom">
              <div className="d-flex align-items-center">
                <h3 className="mb-0 fw-semibold text-gray-800">
                  <i className="bi bi-file-earmark-text-fill me-2 text-primary"></i>
                  Listado de Contratos
                </h3>
                <span className="badge bg-primary-soft text-primary ms-3">
                  {contracts.length} registros
                </span>
              </div>

              <Button
                variant="primary"
                onClick={abrirModalCrearContrato}
                className="d-flex align-items-center"
              >
                <i className="bi bi-plus-lg me-2"></i>
                Agregar Contrato
              </Button>
            </div>

            {/* Contenido */}
            {cargando ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2 text-muted">Cargando contratos...</p>
              </div>
            ) : error ? (
              <Alert variant="danger" className="m-4">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {error}
              </Alert>
            ) : (
              <div className="table-responsive" style={{ overflowX: 'auto' }}>
                <Table hover className="mb-0" style={{ minWidth: '1200px' }}>
                  <thead className="bg-light">
                    <tr>
                      <th className="ps-4">Tipo de contrato</th>
                      <th>Fecha inicio</th>
                      <th>Fecha fin</th>
                      <th># Contrato</th>
                      <th>Estado</th>
                      <th>Valor período</th>
                      <th>Valor total</th>
                      <th>Objetivo</th>
                      <th>Extensión</th>
                      <th>Adición</th>
                      <th>Suspensión</th>
                      <th className="pe-4 text-end">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contracts.map((contract) => (
                      <tr key={contract._id} className="align-middle">
                        <td className="ps-4 fw-medium">
                          {contract.typeofcontract}
                        </td>
                        <td>
                          {new Date(contract.startDate).toLocaleDateString()}
                        </td>
                        <td>
                          {new Date(contract.endDate).toLocaleDateString()}
                        </td>
                        <td>
                          <span className="badge bg-secondary bg-opacity-10 text-secondary">
                            #{contract.contractNumber}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              contract.state === true
                                ? "bg-success bg-opacity-10 text-success"
                                : "bg-danger bg-opacity-10 text-danger"
                            }`}
                          >
                            {contract.state ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                        <td className="text-end text-currency">
                          ${Number(contract.periodValue).toLocaleString()}
                        </td>
                        <td className="text-end text-currency">
                          ${Number(contract.totalValue).toLocaleString()}
                        </td>
                        <td>
                          <div className="text-truncate" style={{ maxWidth: "200px" }} title={contract.objectiveContract}>
                            {contract.objectiveContract}
                          </div>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              contract.extension
                                ? "bg-info bg-opacity-10 text-info"
                                : "bg-light text-muted"
                            }`}
                          >
                            {contract.extension ? "Sí" : "No"}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              contract.addiction
                                ? "bg-warning bg-opacity-10 text-warning"
                                : "bg-light text-muted"
                            }`}
                          >
                            {contract.addiction ? "Sí" : "No"}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              contract.suspension
                                ? "bg-danger bg-opacity-10 text-danger"
                                : "bg-light text-muted"
                            }`}
                          >
                            {contract.suspension ? "Sí" : "No"}
                          </span>
                        </td>
                        <td className="pe-4">
                          <div className="d-flex justify-content-end gap-2">
                            {permissions.canEdit.contracts && (
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => abrirModalEditar(contract)}
                                className="d-flex align-items-center"
                              >
                                <i className="bi bi-pencil-square me-1"></i>
                                Editar
                              </Button>
                            )}
                            {permissions.canDelete.contracts && (
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => eliminarContrato(contract._id)}
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
            <i
              className={`bi ${
                modoEdicion ? "bi-pencil-square" : "bi-file-earmark-plus"
              } me-2`}
            ></i>
            {modoEdicion ? "Editar Contrato" : "Crear Nuevo Contrato"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-0">
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Tipo de Contrato *</Form.Label>
              <Form.Select
                name="typeofcontract"
                value={form.typeofcontract || ""}
                onChange={handleChange}
                className="form-select-lg"
                required
              >
                <option value="">Seleccione el tipo de contrato</option>
                <option value="Presentacion de servicios">Presentación de servicios</option>
                <option value="Termino fijo">Término fijo</option>
                <option value="Termino indefinido">Término indefinido</option>
                <option value="Obra o labor">Obra o labor</option>
                <option value="Aprendizaje">Aprendizaje</option>
                <option value="Ocasional o transitorio">Ocasional o transitorio</option>
              </Form.Select>
            </Form.Group>

            <Row className="g-3 mb-3">
              <Col md={6}>
                <Form.Group controlId="startDate">
                  <Form.Label>Fecha de Inicio *</Form.Label>
                  <Form.Control
                    type="date"
                    name="startDate"
                    value={form.startDate?.substring(0, 10) || ""}
                    onChange={handleChange}
                    required
                    className="form-control-lg"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="endDate">
                  <Form.Label>Fecha de Fin *</Form.Label>
                  <Form.Control
                    type="date"
                    name="endDate"
                    value={form.endDate?.substring(0, 10) || ""}
                    onChange={handleChange}
                    required
                    className="form-control-lg"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Número de Contrato *</Form.Label>
              <Form.Control
                type="number"
                name="contractNumber"
                value={form.contractNumber || ""}
                onChange={handleChange}
                placeholder="Ej: 123"
                required
                className="form-control-lg"
              />
            </Form.Group>

            <Row className="g-3 mb-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Valor del Período *</Form.Label>
                  <Form.Control
                    type="number"
                    name="periodValue"
                    value={form.periodValue || ""}
                    onChange={handleChange}
                    placeholder="Ej: 1000000"
                    required
                    className="form-control-lg"
                  />
                  <Form.Text className="text-muted">
                    Valor en pesos colombianos
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Valor Total *</Form.Label>
                  <Form.Control
                    type="number"
                    name="totalValue"
                    value={form.totalValue || ""}
                    onChange={handleChange}
                    placeholder="Ej: 12000000"
                    required
                    className="form-control-lg"
                  />
                  <Form.Text className="text-muted">
                    Valor total del contrato
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Objetivo del Contrato *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="objectiveContract"
                value={form.objectiveContract || ""}
                onChange={handleChange}
                placeholder="Describe el objetivo y alcance del contrato..."
                required
                className="form-control-lg"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Estado *</Form.Label>
              <Form.Select
                name="state"
                value={form.state?.toString() || "true"}
                onChange={handleChange}
                required
                className="form-select-lg"
              >
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </Form.Select>
            </Form.Group>

            {/* Campos adicionales opcionales */}
            <div className="border-top pt-3 mt-3">
              <h6 className="text-muted mb-3">Campos Adicionales (Opcionales)</h6>
              
              <Row className="g-3">
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <div className="form-check form-switch">
                      <Form.Check
                        type="switch"
                        id="extension"
                        name="extension"
                        checked={form.extension || false}
                        onChange={(e) => setForm({...form, extension: e.target.checked})}
                        label="Extensión"
                        className="form-check-lg"
                      />
                      <Form.Text className="text-muted d-block">
                        ¿Tiene extensión de tiempo?
                      </Form.Text>
                    </div>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <div className="form-check form-switch">
                      <Form.Check
                        type="switch"
                        id="addiction"
                        name="addiction"
                        checked={form.addiction || false}
                        onChange={(e) => setForm({...form, addiction: e.target.checked})}
                        label="Adición"
                        className="form-check-lg"
                      />
                      <Form.Text className="text-muted d-block">
                        ¿Tiene adición presupuestal?
                      </Form.Text>
                    </div>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <div className="form-check form-switch">
                      <Form.Check
                        type="switch"
                        id="suspension"
                        name="suspension"
                        checked={form.suspension || false}
                        onChange={(e) => setForm({...form, suspension: e.target.checked})}
                        label="Suspensión"
                        className="form-check-lg"
                      />
                      <Form.Text className="text-muted d-block">
                        ¿Está suspendido?
                      </Form.Text>
                    </div>
                  </Form.Group>
                </Col>
              </Row>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="light" onClick={() => setMostrarModal(false)}>
            Cancelar
          </Button>
          <Button
            variant={modoEdicion ? "warning" : "primary"}
            onClick={modoEdicion ? actualizarContratos : crearContrato}
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
