import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Badge, Table } from 'react-bootstrap';
import Header from '../../components/Header/Header';
import { toast } from 'sonner';
import api from '../../services/api';

export default function FuncionarioDashboard() {
  const [stats, setStats] = useState({
    totalContractors: 0,
    activeDocuments: 0,
    pendingDocuments: 0
  });

  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, activitiesRes] = await Promise.all([
          api.get('/stats/funcionario'),
          api.get('/activities/recent')
        ]);
        
        setStats(statsRes.data);
        setRecentActivities(activitiesRes.data);
      } catch (err) {
        toast.error('Error al cargar datos del dashboard', {
          description: err.response?.data?.message || 'Error del servidor'
        });
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <Header />
      
      <Container fluid className="py-4">
        <Row className="g-4 mb-4">
          <Col md={12}>
            <h2 className="fw-bold text-primary mb-0">
              <i className="bi bi-speedometer2 me-2"></i>
              Panel de Control - Funcionario
            </h2>
            <p className="text-muted">Bienvenido al panel de gestión</p>
          </Col>
        </Row>

        <Row className="g-4 mb-4">
          <Col md={4}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="bg-primary bg-opacity-10 p-3 rounded">
                    <i className="bi bi-people text-primary fs-4"></i>
                  </div>
                  <div className="ms-3">
                    <h6 className="mb-1 text-muted">Contratistas</h6>
                    <h3 className="mb-0 fw-bold">{stats.totalContractors}</h3>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="bg-success bg-opacity-10 p-3 rounded">
                    <i className="bi bi-file-text text-success fs-4"></i>
                  </div>
                  <div className="ms-3">
                    <h6 className="mb-1 text-muted">Documentos Activos</h6>
                    <h3 className="mb-0 fw-bold">{stats.activeDocuments}</h3>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="bg-warning bg-opacity-10 p-3 rounded">
                    <i className="bi bi-clock-history text-warning fs-4"></i>
                  </div>
                  <div className="ms-3">
                    <h6 className="mb-1 text-muted">Pendientes</h6>
                    <h3 className="mb-0 fw-bold">{stats.pendingDocuments}</h3>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Card className="border-0 shadow-sm">
          <Card.Body>
            <h5 className="fw-bold mb-4">Actividades Recientes</h5>
            <Table hover responsive>
              <thead className="bg-light">
                <tr>
                  <th>Contratista</th>
                  <th>Acción</th>
                  <th>Documento</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {recentActivities.map((activity, index) => (
                  <tr key={index}>
                    <td>{activity.contractorName}</td>
                    <td>{activity.action}</td>
                    <td>{activity.documentType}</td>
                    <td>
                      <Badge bg={activity.status === 'Aprobado' ? 'success' : 'warning'}>
                        {activity.status}
                      </Badge>
                    </td>
                    <td>{new Date(activity.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}