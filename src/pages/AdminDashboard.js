import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Badge, Dropdown, ListGroup, Modal, Form, Button, Table, Spinner } from 'react-bootstrap';
import { 
  PersonFill, 
  FileEarmarkTextFill, 
  ExclamationTriangleFill,
  ArrowRightShort,
  PlusCircleFill,
  FileEarmarkPlusFill,
  GearFill,
  ArrowClockwise
} from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header/Header';
import '../App.css';

// Al inicio del componente, obtener el nombre correcto
const userName = localStorage.getItem("firsName");

export default function AdminDashboard() {
  const [showModal, setShowModal] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [showContractsModal, setShowContractsModal] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [allContracts, setAllContracts] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [formData, setFormData] = useState({
    firsName: '',
    lastname: '',
    idcard: '',
    telephone: '',
    email: '',
    password: '',
    role: '',
    state: true,
    post: '',
    // Campos adicionales para contratista
    contractId: '',
    residentialAddress: '',
    institutionalEmail: '',
    EconomicaActivityNumber: ''
  });
  const [showContractorFields, setShowContractorFields] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [contractData, setContractData] = useState({
    typeofcontract: '',
    startDate: '',
    endDate: '',
    contractNumber: '',
    periodValue: '',
    totalValue: '',
    objectiveContract: ''
  });
  const [userStats, setUserStats] = useState({
    'Total de usuarios': 0,
    'Usuarios activos': 0,
    'Usuarios inactivos': 0,
    'Admins': 0,
    'Funcionarios': 0,
    'Contratistas': 0
  });
  const [contractStats, setContractStats] = useState({
    'Total de contratos': 0,
    'Contratos activos': 0,
    'Contratos inactivos': 0,
    'Contratos vinculados': 0,
    'Contratos no vinculados': 0,
    'Contratos expirados': 0
  });
  const [activeContracts, setActiveContracts] = useState([]);
  const [loadingContracts, setLoadingContracts] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token || role.toLowerCase() !== 'admin') {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/Users/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setUserStats(data.data);
        }
      } catch (error) {
        console.error('Error al obtener estadísticas:', error);
      }
    };

    const fetchContractStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/Contracts/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setContractStats(data.data);
        }
      } catch (error) {
        console.error('Error al obtener estadísticas de contratos:', error);
      }
    };

    const fetchActiveContracts = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/Contracts?WithContractor=true`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-access-token': token
          }
        });
        const data = await response.json();
        if (data.success) {
          setActiveContracts(data.data);
        }
      } catch (error) {
        console.error('Error al obtener contratos activos:', error);
      }
    };

    fetchUserStats();
    fetchContractStats();
    fetchActiveContracts();
  }, []);

  // Función para obtener todos los usuarios
  const fetchAllUsers = async () => {
    setLoadingUsers(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/Users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setAllUsers(data.data);
      }
    } catch (error) {
      console.error('Error al obtener todos los usuarios:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Función para obtener todos los contratos
  const fetchAllContracts = async () => {
    setLoadingContracts(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/Contracts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-access-token': token
        }
      });
      const data = await response.json();
      if (data.success) {
        setAllContracts(data.data);
      }
    } catch (error) {
      console.error('Error al obtener todos los contratos:', error);
    } finally {
      setLoadingContracts(false);
    }
  };

  // Función para obtener contratos activos disponibles
  const fetchActiveContracts = async () => {
    setLoadingContracts(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/Contracts?WithContractor=false`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-access-token': token
        }
      });
      
      const data = await response.json();
      console.log('Contratos recibidos:', data); // Para depuración
      
      if (data.success) {
        // Filtramos solo los contratos activos y sin contratista asignado
        const availableContracts = data.data.filter(contract => 
          contract.state === true && !contract.contractor
        );
        setActiveContracts(availableContracts);
        console.log('Contratos activos disponibles:', availableContracts);
      } else {
        console.error('Error al obtener contratos:', data.message);
        setActiveContracts([]);
      }
    } catch (error) {
      console.error('Error al obtener contratos activos:', error);
      setActiveContracts([]);
    } finally {
      setLoadingContracts(false);
    }
  };

  // Cargar contratos al montar el componente
  useEffect(() => {
    fetchActiveContracts();
  }, []);

  const cerrarSesion = () => {
    localStorage.clear();
    navigate('/');
  };

  const handleCreateUser = () => {
    setShowModal(true);
  };

  const handleShowAllUsers = () => {
    setShowUsersModal(true);
    fetchAllUsers();
  };

  const handleShowAllContracts = () => {
    setShowContractsModal(true);
    fetchAllContracts();
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    
    if (name === 'role') {
      setShowContractorFields(value === 'contratista');
    }
  };

  const handleContractInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setContractData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/Users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        alert('Usuario creado exitosamente');
        setShowModal(false);
        // Limpiar formulario
        setFormData({
          firsName: '',
          lastname: '',
          idcard: '',
          telephone: '',
          email: '',
          password: '',
          role: '',
          state: true,
          post: '',
          contractId: '',
          residentialAddress: '',
          institutionalEmail: '',
          EconomicaActivityNumber: ''
        });
        // Refrescar la lista de contratos si se creó un contratista
        if (formData.role === 'contratista') {
          fetchActiveContracts();
        }
      } else {
        alert(data.message || 'Error al crear usuario');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al conectar con el servidor');
    }
  };

  const handleCreateContract = async (e) => {
    e.preventDefault();

    const formattedData = {
      typeofcontract: contractData.typeofcontract,
      startDate: contractData.startDate,
      endDate: contractData.endDate,
      contractNumber: contractData.contractNumber,
      periodValue: Number(contractData.periodValue),
      totalValue: Number(contractData.totalValue),
      objectiveContract: contractData.objectiveContract,
      state: true
    };

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('No hay token de autenticación');
        return;
      }

      // Usar la ruta correcta según el backend
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/Contracts/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-access-token': token // Asegurarnos de enviar ambos headers como requiere el backend
        },
        body: JSON.stringify(formattedData)
      });

      console.log('Estado de la respuesta:', response.status);
      const data = await response.json();
      console.log('Datos de respuesta:', data);

      if (response.ok) {
        alert('Contrato creado exitosamente');
        setShowContractModal(false);
        setContractData({
          typeofcontract: '',
          startDate: '',
          endDate: '',
          contractNumber: '',
          periodValue: '',
          totalValue: '',
          objectiveContract: ''
        });
        // Refrescar la lista de contratos disponibles
        fetchActiveContracts();
      } else {
        throw new Error(data.message || 'Error en la creación del contrato');
      }
    } catch (error) {
      console.error('Error completo:', error);
      alert(`Error: ${error.message}`);
    }
  };

  return (
   <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
  <Header />
  
  <Container fluid className="px-4 py-4">
    <Row className="g-4 mb-4">
      <Col>
        <div className="d-flex align-items-center">
          <h2 className="mb-0 fw-bold">
            👋 Hola, {userName || "Administrador"}
          </h2>
          <span className="badge bg-primary ms-3">Admin</span>
        </div>
        <p className="text-muted mb-0">Aquí puedes monitorear el estado del sistema y gestionar los recursos.</p>
      </Col>
    </Row>

    {/* Cards de estadísticas */}
    <Row className="g-4 mb-5">
      <Col xl={6} md={6}>
        <Card className="shadow-sm border-0 rounded-3 h-100 hover-scale">
          <Card.Body className="p-4">
            <div className="d-flex align-items-center">
              <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                <PersonFill size={24} className="text-primary" />
              </div>
              <div className="flex-grow-1">
                <Card.Title className="fw-semibold mb-1">Usuarios Registrados</Card.Title>
                <Card.Text className="text-muted small">
                  {userStats['Total de usuarios']} usuarios totales
                  <br />
                  {userStats['Usuarios activos']} activos
                </Card.Text>
              </div>
              <Badge bg="primary" className="stats-badge">
                <div className="d-flex flex-column align-items-center">
                  <small>{userStats['Admins']} Administradores</small>
                  <small>{userStats['Funcionarios']} Funionarios</small>
                  <small>{userStats['Contratistas']} Contratistas</small>
                </div>
              </Badge>
            </div>
          </Card.Body>
          <Card.Footer className="bg-transparent border-0 py-3">
            <button 
              onClick={handleShowAllUsers}
              className="btn btn-link text-primary text-decoration-none small fw-semibold p-0"
            >
              Ver todos los usuarios <ArrowRightShort size={18} />
            </button>
          </Card.Footer>
        </Card>
      </Col>

      <Col xl={6} md={6}>
        <Card className="shadow-sm border-0 rounded-3 h-100 hover-scale">
          <Card.Body className="p-4">
            <div className="d-flex align-items-center">
              <div className="bg-success bg-opacity-10 p-3 rounded-circle me-3">
                <FileEarmarkTextFill size={24} className="text-success" />
              </div>
              <div>
                <Card.Title className="fw-semibold mb-1">Contratos Activos</Card.Title>
                <Card.Text className="text-muted small">
                  {contractStats['Total de contratos']} contratos totales
                  <br />
                  {contractStats['Contratos activos']} activos
                </Card.Text>
              </div>
              <Badge bg="success" className="ms-auto">
                {contractStats['Contratos vinculados']} vinc | {contractStats['Contratos no vinculados']} no vinc
              </Badge>
            </div>
          </Card.Body>
          <Card.Footer className="bg-transparent border-0 py-3">
            <button 
              onClick={handleShowAllContracts}
              className="btn btn-link text-success text-decoration-none small fw-semibold p-0"
            >
              Gestionar contratos <ArrowRightShort size={18} />
            </button>
          </Card.Footer>
        </Card>
      </Col>
    </Row>

    {/* Sección adicional con gráficos o más información */}
    <Row className="g-4">
      <Col xl={8}>
        <Card className="shadow-sm border-0 rounded-3 h-100">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <Card.Title className="fw-semibold mb-0">Actividad Reciente</Card.Title>
              <Dropdown>
                <Dropdown.Toggle variant="light" size="sm" id="dropdown-activity">
                  Esta semana
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item>Hoy</Dropdown.Item>
                  <Dropdown.Item>Esta semana</Dropdown.Item>
                  <Dropdown.Item>Este mes</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
            {/* Aquí iría un gráfico o tabla de actividad */}
            <div className="bg-light rounded-2 p-5 text-center text-muted">
              [Gráfico de actividad se mostraría aquí]
            </div>
          </Card.Body>
        </Card>
      </Col>
      
      <Col xl={4}>
        <Card className="shadow-sm border-0 rounded-3 h-100">
          <Card.Body>
            <Card.Title className="fw-semibold mb-4">Acciones Rápidas</Card.Title>
            <ListGroup variant="flush">
              <ListGroup.Item 
                action 
                className="d-flex align-items-center py-3 border-0"
                onClick={handleCreateUser}
              >
                <PlusCircleFill className="text-primary me-3" />
                <span>Crear nuevo usuario</span>
              </ListGroup.Item>
              <ListGroup.Item 
  action 
  className="d-flex align-items-center py-3 border-0"
  onClick={() => setShowContractModal(true)}
>
  <FileEarmarkPlusFill className="text-success me-3" />
  <span>Crear nuevo contrato</span>
</ListGroup.Item>
              <ListGroup.Item action className="d-flex align-items-center py-3 border-0">
                <GearFill className="text-secondary me-3" />
                <span>Configuración del sistema</span>
              </ListGroup.Item>
            </ListGroup>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </Container>

  {/* Modal para crear nuevo usuario */}
  <Modal show={showModal} onHide={handleCloseModal} size="lg">
    <Modal.Header closeButton>
      <Modal.Title>Crear Nuevo Usuario</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                name="firsName"
                value={formData.firsName}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Apellido</Form.Label>
              <Form.Control
                type="text"
                name="lastname"
                value={formData.lastname}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Cédula</Form.Label>
              <Form.Control
                type="text"
                name="idcard"
                value={formData.idcard}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Teléfono</Form.Label>
              <Form.Control
                type="text"
                name="telephone"
                value={formData.telephone}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Cargo</Form.Label>
          <Form.Control
            type="text"
            name="post"
            value={formData.post}
            onChange={handleInputChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Rol</Form.Label>
          <Form.Select
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            required
          >
            <option value="">Seleccionar Rol</option>
            <option value="admin">Administrador</option>
            <option value="funcionario">Funcionario</option>
            <option value="contratista">Contratista</option>
          </Form.Select>
        </Form.Group>

        {showContractorFields && (
          <>
            <Form.Group className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Form.Label className="mb-0">Contrato Asignado *</Form.Label>
                <Button 
                  variant="outline-secondary" 
                  size="sm" 
                  onClick={fetchActiveContracts}
                  disabled={loadingContracts}
                >
                  <ArrowClockwise className={loadingContracts ? 'spin' : ''} />
                  {loadingContracts ? ' Cargando...' : ' Actualizar'}
                </Button>
              </div>
              <Form.Select
                name="contractId"
                value={formData.contractId}
                onChange={handleInputChange}
                required={formData.role === 'contratista'}
                disabled={loadingContracts}
              >
                <option value="">
                  {loadingContracts ? 'Cargando contratos...' : 'Seleccione un contrato disponible'}
                </option>
                {activeContracts && activeContracts.length > 0 ? (
                  activeContracts.map(contract => (
                    <option key={contract._id} value={contract._id}>
                      Contrato N° {contract.contractNumber} - {contract.typeofcontract} 
                      {contract.objectiveContract && ` - ${contract.objectiveContract.substring(0, 50)}...`}
                    </option>
                  ))
                ) : (
                  !loadingContracts && <option value="" disabled>No hay contratos disponibles</option>
                )}
              </Form.Select>
              <Form.Text className="text-muted">
                Solo se muestran contratos activos sin contratista asignado
                {activeContracts && activeContracts.length > 0 && (
                  <span className="text-success"> • {activeContracts.length} contrato(s) disponible(s)</span>
                )}
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Dirección Residencial</Form.Label>
              <Form.Control
                type="text"
                name="residentialAddress"
                value={formData.residentialAddress}
                onChange={handleInputChange}
                required={formData.role === 'contratista'}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email Institucional</Form.Label>
              <Form.Control
                type="email"
                name="institutionalEmail"
                value={formData.institutionalEmail}
                onChange={handleInputChange}
                required={formData.role === 'contratista'}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Número de Actividad Económica</Form.Label>
              <Form.Control
                type="text"
                name="EconomicaActivityNumber"
                value={formData.EconomicaActivityNumber}
                onChange={handleInputChange}
                required={formData.role === 'contratista'}
              />
            </Form.Group>
          </>
        )}

        <Form.Group className="mb-3">
          <Form.Label>Contraseña</Form.Label>
          <Form.Control
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
        </Form.Group>

        <div className="text-end">
          <Button variant="secondary" onClick={() => setShowModal(false)} className="me-2">
            Cancelar
          </Button>
          <Button variant="primary" type="submit">
            Crear Usuario
          </Button>
        </div>
      </Form>
    </Modal.Body>
  </Modal>

  {/* Modal para crear nuevo contrato */}
  <Modal show={showContractModal} onHide={() => setShowContractModal(false)} size="lg">
    <Modal.Header closeButton>
      <Modal.Title>Crear Nuevo Contrato</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <Form onSubmit={handleCreateContract}>
        <Form.Group className="mb-3">
          <Form.Label>Tipo de Contrato *</Form.Label>
          <Form.Select
            name="typeofcontract"
            value={contractData.typeofcontract}
            onChange={handleContractInputChange}
            required
          >
            <option value="">Seleccione un tipo de contrato</option>
            <option value="Presentacion de servicios">Presentación de servicios</option>
            <option value="Termino fijo">Término fijo</option>
            <option value="Termino indefinido">Término indefinido</option>
            <option value="Obra o labor">Obra o labor</option>
            <option value="Aprendizaje">Aprendizaje</option>
            <option value="Ocasional o transitorio">Ocasional o transitorio</option>
          </Form.Select>
        </Form.Group>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Fecha de Inicio *</Form.Label>
              <Form.Control
                type="date"
                name="startDate"
                value={contractData.startDate}
                onChange={handleContractInputChange}
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Fecha de Finalización *</Form.Label>
              <Form.Control
                type="date"
                name="endDate"
                value={contractData.endDate}
                onChange={handleContractInputChange}
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label>Número de Contrato *</Form.Label>
          <Form.Control
            type="text"
            name="contractNumber"
            value={contractData.contractNumber}
            onChange={handleContractInputChange}
            required
          />
        </Form.Group>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Valor del Periodo *</Form.Label>
              <Form.Control
                type="number"
                name="periodValue"
                value={contractData.periodValue}
                onChange={handleContractInputChange}
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Valor Total *</Form.Label>
              <Form.Control
                type="number"
                name="totalValue"
                value={contractData.totalValue}
                onChange={handleContractInputChange}
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label>Objetivo del Contrato *</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="objectiveContract"
            value={contractData.objectiveContract}
            onChange={handleContractInputChange}
            required
          />
        </Form.Group>
        <div className="text-end mt-4">
          <Button variant="secondary" onClick={() => setShowContractModal(false)} className="me-2">
            Cancelar
          </Button>
          <Button variant="primary" type="submit">
            Crear Contrato
          </Button>
        </div>
      </Form>
    </Modal.Body>
  </Modal>

  {/* Modal para ver todos los usuarios */}
  <Modal show={showUsersModal} onHide={() => setShowUsersModal(false)} size="xl" centered>
    <Modal.Header closeButton>
      <Modal.Title>
        <PersonFill className="me-2 text-primary" />
        Todos los Usuarios del Sistema
      </Modal.Title>
    </Modal.Header>
    <Modal.Body>
      {loadingUsers ? (
        <div className="text-center py-4">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Cargando usuarios...</p>
        </div>
      ) : (
        <div className="table-responsive">
          <Table hover className="mb-0">
            <thead className="bg-light">
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Cargo</th>
                <th>Estado</th>
                <th>Cédula</th>
                <th>Teléfono</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    No hay usuarios registrados
                  </td>
                </tr>
              ) : (
                allUsers.map((user) => (
                  <tr key={user._id}>
                    <td className="fw-medium">
                      {user.firsName || user.firstName || ''} {user.lastName || user.lastname || ''}
                    </td>
                    <td>{user.email || '-'}</td>
                    <td>
                      <Badge 
                        bg={
                          user.role === 'admin' ? 'primary' : 
                          user.role === 'funcionario' ? 'success' : 
                          user.role === 'contratista' ? 'info' : 'secondary'
                        }
                        className="text-capitalize"
                      >
                        {user.role || 'Sin rol'}
                      </Badge>
                    </td>
                    <td>{user.post || '-'}</td>
                    <td>
                      <Badge bg={user.state === true ? 'success' : 'danger'}>
                        {user.state === true ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td>{user.idcard || '-'}</td>
                    <td>{user.telephone || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      )}
    </Modal.Body>
    <Modal.Footer className="d-flex justify-content-between">
      <div className="text-muted">
        <small>
          Total: {allUsers.length} usuarios | 
          Activos: {allUsers.filter(u => u.state === true).length} | 
          Inactivos: {allUsers.filter(u => u.state === false).length}
        </small>
      </div>
      <Button variant="secondary" onClick={() => setShowUsersModal(false)}>
        Cerrar
      </Button>
    </Modal.Footer>
  </Modal>

  {/* Modal para ver todos los contratos */}
  <Modal show={showContractsModal} onHide={() => setShowContractsModal(false)} size="xl" centered>
    <Modal.Header closeButton>
      <Modal.Title>
        <FileEarmarkTextFill className="me-2 text-success" />
        Gestión de Contratos
      </Modal.Title>
    </Modal.Header>
    <Modal.Body>
      {loadingContracts ? (
        <div className="text-center py-4">
          <Spinner animation="border" variant="success" />
          <p className="mt-2 text-muted">Cargando contratos...</p>
        </div>
      ) : (
        <div className="table-responsive">
          <Table hover className="mb-0">
            <thead className="bg-light">
              <tr>
                <th>N° Contrato</th>
                <th>Tipo</th>
                <th>Fecha Inicio</th>
                <th>Fecha Fin</th>
                <th>Valor Total</th>
                <th>Estado</th>
                <th>Contratista</th>
                <th>Objetivo</th>
              </tr>
            </thead>
            <tbody>
              {allContracts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted">
                    No hay contratos registrados
                  </td>
                </tr>
              ) : (
                allContracts.map((contract) => {
                  const isExpired = new Date(contract.endDate) < new Date();
                  const hasContractor = contract.contractor;
                  
                  return (
                    <tr key={contract._id}>
                      <td className="fw-medium">{contract.contractNumber}</td>
                      <td>
                        <small className="text-muted">{contract.typeofcontract}</small>
                      </td>
                      <td>
                        <small>{new Date(contract.startDate).toLocaleDateString()}</small>
                      </td>
                      <td>
                        <small className={isExpired ? 'text-danger' : ''}>
                          {new Date(contract.endDate).toLocaleDateString()}
                          {isExpired && <span className="ms-1">⚠️</span>}
                        </small>
                      </td>
                      <td>
                        <small className="fw-medium">
                          ${contract.totalValue?.toLocaleString() || '0'}
                        </small>
                      </td>
                      <td>
                        <div className="d-flex flex-column gap-1">
                          <Badge bg={contract.state === true ? 'success' : 'danger'} className="small">
                            {contract.state === true ? 'Activo' : 'Inactivo'}
                          </Badge>
                          {isExpired && (
                            <Badge bg="warning" className="small">
                              Expirado
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td>
                        {hasContractor ? (
                          <div>
                            <Badge bg="info" className="small mb-1">
                              Asignado
                            </Badge>
                            <br />
                            <small className="text-muted">
                              {contract.contractor?.user?.firsName || contract.contractor?.user?.firstName || ''} {contract.contractor?.user?.lastName || ''}
                            </small>
                          </div>
                        ) : (
                          <Badge bg="secondary" className="small">
                            Sin asignar
                          </Badge>
                        )}
                      </td>
                      <td>
                        <small className="text-muted" title={contract.objectiveContract}>
                          {contract.objectiveContract?.length > 50 
                            ? `${contract.objectiveContract.substring(0, 50)}...` 
                            : contract.objectiveContract || '-'
                          }
                        </small>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </div>
      )}
    </Modal.Body>
    <Modal.Footer className="d-flex justify-content-between">
      <div className="text-muted">
        <small>
          Total: {allContracts.length} contratos | 
          Activos: {allContracts.filter(c => c.state === true).length} | 
          Inactivos: {allContracts.filter(c => c.state === false).length} | 
          Con contratista: {allContracts.filter(c => c.contractor).length} | 
          Expirados: {allContracts.filter(c => new Date(c.endDate) < new Date()).length}
        </small>
      </div>
      <Button variant="secondary" onClick={() => setShowContractsModal(false)}>
        Cerrar
      </Button>
    </Modal.Footer>
  </Modal>

  {/* Estilos adicionales */}
  <style>{`
    .hover-scale {
      transition: transform 0.2s ease;
    }
    .hover-scale:hover {
      transform: translateY(-5px);
    }
    .badge {
      font-weight: 500;
    }
    .stats-badge {
      min-width: 80px;
      padding: 8px;
      font-size: 0.85rem;
      white-space: normal;
      text-align: center;
    }
    .stats-badge small {
      display: block;
      line-height: 1.2;
    }
  `}</style>
</div>
  );
}
