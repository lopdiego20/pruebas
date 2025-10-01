// src/pages/DashboardData.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Table, Form, Modal, Accordion, Spinner, Card, Badge } from 'react-bootstrap';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import Header from '../../../components/Header/Header';
import { usePermissions } from '../../../hooks/usePermissions';

const DashboardData = () => {
  const permissions = usePermissions();
  const [dataList, setDataList] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState('');
  const [detalleVisible, setDetalleVisible] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      await fetchDocumentos();
      await fetchData();
      setLoading(false);
    };
    fetchAll();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/Data', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDataList(res.data.data);
    } catch (error) {
      console.error('Error al obtener Data:', error);
      toast.error('Error al cargar los datos');
    }
  };

  const fetchDocumentos = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/Documents', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDocumentos(res.data.data);
    } catch (error) {
      console.error('Error al obtener documentos:', error);
      toast.error('Error al cargar los documentos');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      toast.loading('Ejecutando análisis...');
      await axios.post(
        'http://localhost:3000/api/Data',
        { document_management: selectedDocId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Comparación ejecutada con éxito');
      fetchData();
      setShowModal(false);
    } catch (error) {
      console.error(error);
      toast.error('Error al ejecutar comparación');
    }
  };

  const eliminarData = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta comparación?')) return;
    try {
      await axios.delete(`http://localhost:3000/api/Data/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Comparación eliminada');
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error('Error al eliminar comparación');
    }
  };

  const agruparPorDocumento = () => {
    const agrupado = {};
    dataList.forEach((item) => {
      const docId = item.document_management;
      if (!agrupado[docId]) agrupado[docId] = [];
      agrupado[docId].push(item);
    });
    return agrupado;
  };

  const exportarPDF = (datos, docName) => {
    const doc = new jsPDF();
    doc.text(`Resultados de comparación - ${docName}`, 10, 10);

    let startY = 20;

    datos.forEach((item) => {
      const data = Object.entries(item)
        .filter(([k]) => !['_id', '__v', 'createdAt', 'updatedAt', 'document_management'])
        .map(([k, v]) => [k, String(v)]);

      autoTable(doc, {
        startY,
        head: [['Campo', 'Valor']],
        body: data,
        styles: {
          cellPadding: 5,
          fontSize: 10,
          valign: 'middle'
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        }
      });

      startY = doc.lastAutoTable.finalY + 10;
    });

    doc.save(`comparacion_${docName}.pdf`);
  };

  const exportarExcel = (datos, docName) => {
    const hoja = datos.map((item) => {
      const obj = {};
      Object.entries(item).forEach(([key, value]) => {
        if (!['_id', '__v', 'createdAt', 'updatedAt', 'document_management'].includes(key)) {
          obj[key] = value;
        }
      });
      return obj;
    });
    const ws = XLSX.utils.json_to_sheet(hoja);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Comparacion');
    XLSX.writeFile(wb, `comparacion_${docName}.xlsx`);
  };

  const exportarExcelCompleto = () => {
    const hoja = dataList.map((item) => {
      const obj = {};
      Object.entries(item).forEach(([key, value]) => {
        if (!['_id', '__v', 'createdAt', 'updatedAt'].includes(key)) {
          obj[key] = value;
        }
      });
      return obj;
    });

    const ws = XLSX.utils.json_to_sheet(hoja);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Todas las Comparaciones');
    XLSX.writeFile(wb, `todas_comparaciones.xlsx`);
  };

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <Header />
      
      <div className="container-fluid py-4 px-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0 fw-bold text-primary">
            <i className="bi bi-file-earmark-diff me-2"></i>
            Comparaciones por Documentos
          </h2>
          <div>
            <Button variant="outline-primary" className="me-2" onClick={exportarExcelCompleto}>
              <i className="bi bi-file-excel me-2"></i>Exportar Todo
            </Button>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              <i className="bi bi-plus-circle me-2"></i>Nueva Comparación
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted">Cargando datos...</p>
          </div>
        ) : dataList.length === 0 ? (
          <Card className="text-center py-5 shadow-sm border-0">
            <Card.Body>
              <i className="bi bi-folder-x text-muted" style={{ fontSize: '3rem' }}></i>
              <h5 className="mt-3 text-muted">No hay comparaciones disponibles</h5>
              <p className="text-muted">Crea tu primera comparación haciendo clic en el botón "Nueva Comparación"</p>
            </Card.Body>
          </Card>
        ) : (
          Object.entries(agruparPorDocumento()).map(([docId, comparaciones]) => {
            const doc = documentos.find((d) => d._id === docId);
            const docName = doc?.description || docId;
            
            return (
              <Card key={docId} className="mb-4 shadow-sm border-0">
                <Card.Header className="bg-white border-0">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="fw-bold mb-0">
                      <i className="bi bi-file-earmark-text text-primary me-2"></i>
                      {docName}
                      <Badge bg="light" text="primary" className="ms-2">
                        {comparaciones.length} análisis
                      </Badge>
                    </h5>
                    <div>
                      <Button 
                        variant="outline-danger" 
                        size="sm" 
                        className="me-2"
                        onClick={() => exportarPDF(comparaciones, docName)}
                      >
                        <i className="bi bi-file-pdf me-1"></i>PDF
                      </Button>
                      <Button 
                        variant="outline-success" 
                        size="sm"
                        onClick={() => exportarExcel(comparaciones, docName)}
                      >
                        <i className="bi bi-file-excel me-1"></i>Excel
                      </Button>
                    </div>
                  </div>
                </Card.Header>
                <Card.Body className="p-0">
                  <div className="table-responsive">
                    <Table hover className="mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th style={{ width: '40%' }}>Archivo PDF</th>
                          <th style={{ width: '30%' }}>Fecha Comparación</th>
                          <th style={{ width: '30%' }}>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {comparaciones.map((item) => (
                          <React.Fragment key={item._id}>
                            <tr>
                              <td>
                                <i className="bi bi-file-earmark-pdf text-danger me-2"></i>
                                {item.archivo_pdf}
                              </td>
                              <td>
                                <Badge bg="light" text="dark">
                                  {new Date(item.fecha_comparacion).toLocaleString()}
                                </Badge>
                              </td>
                              <td>
                                <div className="d-flex gap-2">
                                  <Button
                                    size="sm"
                                    variant={detalleVisible === item._id ? 'info' : 'outline-info'}
                                    onClick={() =>
                                      setDetalleVisible(detalleVisible === item._id ? null : item._id)
                                    }
                                  >
                                    <i className={`bi bi-${detalleVisible === item._id ? 'chevron-up' : 'chevron-down'} me-1`}></i>
                                    {detalleVisible === item._id ? 'Ocultar' : 'Detalles'}
                                  </Button>
                                  {permissions.canDelete.data && (
                                    <Button
                                      size="sm"
                                      variant="outline-danger"
                                      onClick={() => eliminarData(item._id)}
                                    >
                                      <i className="bi bi-trash me-1"></i>Eliminar
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                            {detalleVisible === item._id && (
                              <tr>
                                <td colSpan="3">
                                  <Accordion defaultActiveKey="0">
                                    <Accordion.Item eventKey="0" className="border-0">
                                      <Accordion.Header className="bg-light">
                                        <span className="fw-bold">Detalles del Análisis</span>
                                      </Accordion.Header>
                                      <Accordion.Body className="p-0">
                                        {Object.keys(item).filter(k => !['_id', '__v', 'createdAt', 'updatedAt', 'document_management', 'archivo_pdf', 'fecha_comparacion'].includes(k)).length > 0 ? (
                                          <Table bordered hover className="mb-0">
                                            <thead className="bg-light">
                                              <tr>
                                                <th style={{ width: '40%' }}>Campo</th>
                                                <th style={{ width: '60%' }}>Valor</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {Object.entries(item).map(([key, value]) => {
                                                if ([
                                                  '_id', '__v', 'createdAt', 'updatedAt', 'document_management', 'archivo_pdf', 'fecha_comparacion'
                                                ].includes(key)) return null;
                                                return (
                                                  <tr key={key}>
                                                    <td className="fw-semibold">{key}</td>
                                                    <td>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</td>
                                                  </tr>
                                                );
                                              })}
                                            </tbody>
                                          </Table>
                                        ) : (
                                          <div className="text-center py-3 text-muted">
                                            No se encontraron detalles disponibles
                                          </div>
                                        )}
                                      </Accordion.Body>
                                    </Accordion.Item>
                                  </Accordion>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            );
          })
        )}
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title>
            <i className="bi bi-file-earmark-plus text-primary me-2"></i>
            Nueva Comparación
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">Seleccionar Documento</Form.Label>
              <Form.Select
                value={selectedDocId}
                onChange={(e) => setSelectedDocId(e.target.value)}
                required
                className="py-2"
              >
                <option value="">Seleccione un documento...</option>
                {documentos.map((doc) => (
                  <option key={doc._id} value={doc._id}>
                    {doc.description || doc._id}
                  </option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">
                Seleccione el documento que desea analizar
              </Form.Text>
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="light" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit">
                <i className="bi bi-play-circle me-2"></i>
                Ejecutar Análisis
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default DashboardData;