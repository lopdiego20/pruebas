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
    state: "",
  });
  // obtener contratos de la api - filtrados para contratistas
  const obtenerCotratos = async () => {
    try {
      setCargando(true);
      setError("");
      
      // Obtener información del usuario actual
      const user = JSON.parse(localStorage.getItem("user"));
      const userRole = localStorage.getItem('role');
      const userId = user?._id;

      console.log('Usuario actual:', { userId, userRole });

      if (userRole === 'contratista') {
        // Para contratistas: obtener información del contratista y su contrato asociado
        if (!userId) {
          setError('No se pudo obtener información del usuario');
          return;
        }

        console.log('Obteniendo información de contratistas...');
        // Obtener información del contratista para encontrar su contrato asociado
        const contractorRes = await api.get(`/Users/Contractor`);
        console.log('Respuesta de contratistas:', contractorRes.data);

        const contractorInfo = contractorRes.data.data.find(contractor => 
          contractor.user?._id === userId
        );

        console.log('Información del contratista encontrada:', contractorInfo);

        if (contractorInfo && contractorInfo.contract) {
          // Si tiene contrato asociado, mostrarlo en un array
          console.log('Contrato asociado encontrado:', contractorInfo.contract);
          setContracts([contractorInfo.contract]);
          toast.success('Contrato cargado exitosamente');
        } else {
          // Si no tiene contrato asociado, mostrar array vacío
          setContracts([]);
          setError('No tienes un contrato asignado');
          console.log('No se encontró contrato asociado para el usuario');
        }
      } else {
        // Para admin y funcionarios: obtener todos los contratos
        console.log('Obteniendo todos los contratos para admin/funcionario...');
        const res = await api.get(`/Contracts`);
        setContracts(res.data.data);
        console.log('Contratos obtenidos para admin/funcionario:', res.data.data);
      }

    } catch (err) {
      console.error('Error al obtener contratos:', err);
      
      if (err.response?.status === 404) {
        // Si es un contratista sin contrato asignado
        setContracts([]);
        setError('No tienes un contrato asignado');
      } else {
        setError(`Error al cargar los contratos: ${err.response?.data?.message || err.message}`);
        toast.error("Error al cargar los contratos", {
          description: err.response?.data?.message || "Error en el servidor",
        });
      }
    } finally {
      setCargando(false);
    }
  };
  // Cargar apenas llegue a la pagina
  useEffect(() => {
    obtenerCotratos();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const crearContrato = async () => {
    // Verificar permisos antes de crear
    if (!permissions.canCreate.contracts) {
      toast.error("No tienes permisos para crear contratos");
      return;
    }

    const loadingContract = toast.loading("Cargando...");
    try {
      const res = await api.post(`/Contracts`, form);
      setMostrarModal(false);
      setForm({
        typeofcontract: "",
        startDate: "",
        endDate: "",
        contractNumber: "",
        state: "",
      });
      toast.success("Contracto creado exitosamente", {
        id: loadingContract,
        description: res?.data?.message,
      });
      obtenerCotratos();
    } catch (err) {
      toast.error("Error al crear un contrato", {
        id: loadingContract,
        description: err?.response?.data?.message || "No tienes permisos para esta acción",
      });
    }
  };
  // Modal para crear
  const abrirModalCrearContrato = () => {
    // Verificar permisos antes de abrir modal
    if (!permissions.canCreate.contracts) {
      toast.error("No tienes permisos para crear contratos");
      return;
    }

    setForm({
      typeofcontract: "",
      startDate: "",
      endDate: "",
      contractNumber: "",
      state: "",
    });
    setModoEdicion(false);
    setIdContrato(null);
    setMostrarModal(true);
  };

  //   Modal editar
  const abrirModalEditar = (contract) => {
    // Verificar permisos antes de abrir modal de edición
    if (!permissions.canEdit.contracts) {
      toast.error("No tienes permisos para editar contratos");
      return;
    }

    setForm({
      typeofcontract: contract.typeofcontract,
      startDate: contract.startDate,
      endDate: contract.endDate,
      contractNumber: contract.contractNumber,
      state: contract.state,
    });
    setIdContrato(contract._id);
    setModoEdicion(true);
    setMostrarModal(true);
  };

  //   Actualizar contratos
  const actualizarContratos = async () => {
    // Verificar permisos antes de actualizar
    if (!permissions.canEdit.contracts) {
      toast.error("No tienes permisos para editar contratos");
      return;
    }

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
        description: err?.response?.data?.message || "No tienes permisos para esta acción",
      });
    }
  };

  //   Borrar contratos
  const eliminarContrato = async (idContrato) => {
    // Verificar permisos antes de eliminar
    if (!permissions.canDelete.contracts) {
      toast.error("No tienes permisos para eliminar contratos");
      return;
    }

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
        description: err?.response?.data?.message || "No tienes permisos para esta acción",
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
                  {localStorage.getItem('role') === 'contratista' ? 'Mi Contrato' : 'Listado de Contratos'}
                </h3>
                <span className="badge bg-primary-soft text-primary ms-3">
                  {contracts.length} {contracts.length === 1 ? 'contrato' : 'registros'}
                </span>
              </div>

              {permissions.canCreate.contracts && (
                <Button
                  variant="primary"
                  onClick={abrirModalCrearContrato}
                  className="d-flex align-items-center"
                >
                  <i className="bi bi-plus-lg me-2"></i>
                  Agregar Contrato
                </Button>
              )}
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
            ) : contracts.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-file-earmark-text display-1 text-muted mb-3"></i>
                <h4 className="text-muted">No tienes contratos asignados</h4>
                <p className="text-muted">
                  Actualmente no tienes ningún contrato asociado a tu cuenta.
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="ps-4">Tipo de contrato</th>
                      <th>Fecha inicio</th>
                      <th>Fecha fin</th>
                      <th># Contrato</th>
                      <th>Valor Total</th>
                      <th>Estado</th>
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
                          {contract.startDate ? new Date(contract.startDate).toLocaleDateString() : 'No disponible'}
                        </td>
                        <td>
                          {contract.endDate ? new Date(contract.endDate).toLocaleDateString() : 'No disponible'}
                        </td>
                        <td>
                          <span className="badge bg-secondary bg-opacity-10 text-secondary">
                            #{contract.contractNumber}
                          </span>
                        </td>
                        <td className="fw-medium">
                          {contract.totalValue ? 
                            new Intl.NumberFormat('es-CO', {
                              style: 'currency',
                              currency: 'COP',
                              minimumFractionDigits: 0
                            }).format(contract.totalValue) : 
                            'No disponible'
                          }
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              (contract.state === true || contract.state === "Activo")
                                ? "bg-success bg-opacity-10 text-success"
                                : "bg-danger bg-opacity-10 text-danger"
                            }`}
                          >
                            {contract.state === true ? "Activo" : 
                             contract.state === false ? "Inactivo" : 
                             contract.state || "No disponible"}
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
              <Form.Label>Tipo de Contrato</Form.Label>
              <Form.Select
                name="typeofcontract"
                value={form.typeofcontract || ""}
                onChange={handleChange}
                className="form-select-lg"
              >
                <option value="">Seleccione el tipo de contrato</option>
                <option value="Contrato termino fijo">
                  Contrato término fijo
                </option>
                <option value="Contrato indefinodo">Contrato indefinido</option>
                <option value="Contrato obra labor">Contrato obra labor</option>
              </Form.Select>
            </Form.Group>

            <Row className="g-3">
              <Col md={6}>
                <Form.Group controlId="startDate">
                  <Form.Label>Fecha de Inicio</Form.Label>
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
                  <Form.Label>Fecha de Fin</Form.Label>
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
              <Form.Label>Número de Contrato</Form.Label>
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

            <Form.Group className="mb-3">
              <Form.Label>Estado</Form.Label>
              <Form.Select
                name="state"
                value={form.state || ""}
                onChange={handleChange}
                required
                className="form-select-lg"
              >
                <option value="">Seleccionar estado</option>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="light" onClick={() => setMostrarModal(false)}>
            Cancelar
          </Button>
          {((modoEdicion && permissions.canEdit.contracts) || (!modoEdicion && permissions.canCreate.contracts)) && (
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
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
}
