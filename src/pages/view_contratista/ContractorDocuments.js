import React, { useEffect, useState } from 'react';
import { Container, Card, Table, Badge, Button, Modal, Form } from 'react-bootstrap';
import Header from '../../../components/Header/Header';
import { toast } from 'sonner';
import api from '../../../services/api';

export default function ContractorDocuments() {
  const [documents, setDocuments] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentType, setDocumentType] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await api.get('/documents/contractor');
      setDocuments(res.data);
      setLoading(false);
    } catch (err) {
      toast.error('Error al cargar documentos', {
        description: err.response?.data?.message || 'Error del servidor'
      });
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile || !documentType) {
      toast.error('Por favor seleccione un archivo y tipo de documento');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('type', documentType);

    try {
      await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setShowUploadModal(false);
      setSelectedFile(null);
      setDocumentType('');
      fetchDocuments();
      
      toast.success('Documento subido exitosamente');
    } catch (err) {
      toast.error('Error al subir documento', {
        description: err.response?.data?.message || 'Error del servidor'
      });
    }
  };

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <Header />
      
      <Container fluid className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold text-primary mb-0">
            <i className="bi bi-file-earmark-text me-2"></i>
            Mis Documentos
          </h2>
          <Button variant="primary" onClick={() => setShowUploadModal(true)}>
            <i className="bi bi-cloud-upload me-2"></i>
            Subir Documento
          </Button>
        </div>

        <Card className="border-0 shadow-sm">
          <Card.Body>
            <Table hover responsive>
              <thead className="bg-light">
                <tr>
                  <th>Tipo de Documento</th>
                  <th>Fecha de Subida</th>
                  <th>Estado</th>
                  <th>Observaciones</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc._id}>
                    <td>{doc.type}</td>
                    <td>{new Date(doc.uploadDate).toLocaleDateString()}</td>
                    <td>
                      <Badge bg={
                        doc.status === 'Aprobado' ? 'success' : 
                        doc.status === 'Pendiente' ? 'warning' : 'danger'
                      }>
                        {doc.status}
                      </Badge>
                    </td>
                    <td>{doc.observations || '-'}</td>
                    <td>
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        href={doc.fileUrl}
                        target="_blank"
                      >
                        <i className="bi bi-download me-1"></i>
                        Descargar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>

        {/* Modal de Subida */}
        <Modal show={showUploadModal} onHide={() => setShowUploadModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Subir Nuevo Documento</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleFileUpload}>
              <Form.Group className="mb-3">
                <Form.Label>Tipo de Documento</Form.Label>
                <Form.Select 
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  required
                >
                  <option value="">Seleccione un tipo...</option>
                  <option value="Certificado">Certificado</option>
                  <option value="Informe">Informe</option>
                  <option value="Contrato">Contrato</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Archivo</Form.Label>
                <Form.Control
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  required
                />
              </Form.Group>

              <div className="d-flex justify-content-end gap-2">
                <Button variant="secondary" onClick={() => setShowUploadModal(false)}>
                  Cancelar
                </Button>
                <Button variant="primary" type="submit">
                  Subir Documento
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </Container>
    </div>
  );
}