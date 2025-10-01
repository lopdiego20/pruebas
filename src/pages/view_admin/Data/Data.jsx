// src/pages/DashboardData.jsx
import React, { useEffect, useState } from 'react';
import { Button, Table, Form, Modal, Spinner, Card, Badge } from 'react-bootstrap';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import Header from '../../../components/Header/Header';
import api from '../../../services/api';

const DashboardData = () => {
  const [dataList, setDataList] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState('');
  const [detalleVisible, setDetalleVisible] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchDocumentos(), fetchData()]);
      } catch (error) {
        console.error('Error al cargar datos iniciales:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Función para refrescar datos
  const refreshData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchDocumentos(), fetchData()]);
      toast.success('Datos actualizados correctamente');
    } catch (error) {
      toast.error('Error al actualizar datos');
    } finally {
      setRefreshing(false);
    }
  };

  const fetchData = async () => {
    try {
      const res = await api.get('/Data');
      if (res.data.success) {
        setDataList(res.data.data);
      }
    } catch (error) {
      console.error('Error al obtener Data:', error);
      toast.error('Error al cargar los análisis', {
        description: error.response?.data?.message || 'Error en el servidor'
      });
    }
  };

  const fetchDocumentos = async () => {
    try {
      const res = await api.get('/Documents');
      if (res.data.success) {
        setDocumentos(res.data.data);
      }
    } catch (error) {
      console.error('Error al obtener documentos:', error);
      toast.error('Error al cargar los documentos', {
        description: error.response?.data?.message || 'Error en el servidor'
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedDocId) {
      toast.error('Por favor selecciona un documento para analizar');
      return;
    }

    setAnalyzing(true);
    let loadingToast;
    try {
      loadingToast = toast.loading('Ejecutando análisis de documentos...', {
        description: 'Este proceso puede tomar varios minutos'
      });
      
      await api.post(`/Data/${selectedDocId}`);
      
      toast.success('Análisis ejecutado con éxito', {
        id: loadingToast,
        description: 'Los resultados están listos para revisar'
      });
      
      // Recargar datos después del análisis
      await fetchData();
      setShowModal(false);
      setSelectedDocId('');
    } catch (error) {
      console.error('Error al ejecutar análisis:', error);
      
      // Cerrar el toast de loading y mostrar error
      toast.error('Error al ejecutar el análisis', {
        id: loadingToast,
        description: error.response?.data?.message || 'Error en el servidor'
      });
    } finally {
      setAnalyzing(false);
    }
  };

  // Nueva función para actualizar un documento específico
  const actualizarDocumento = async (managementId, field) => {
    let loadingToast;
    try {
      loadingToast = toast.loading(`Actualizando ${field}...`);
      
      await api.put(`/Data/${managementId}/${field}`);
      
      toast.success('Documento actualizado exitosamente', {
        id: loadingToast,
        description: `El análisis de ${field} se ha actualizado`
      });
      
      // Recargar la lista
      await fetchData();
    } catch (error) {
      console.error('Error al actualizar documento:', error);
      
      toast.error('Error al actualizar el documento', {
        id: loadingToast,
        description: error.response?.data?.message || 'Error en el servidor'
      });
    }
  };

  // Nueva función para cambiar el estado de un documento específico
  const toggleEstadoDocumento = async (managementId, field) => {
    let loadingToast;
    try {
      loadingToast = toast.loading(`Cambiando estado de ${field}...`);
      
      await api.patch(`/Data/${managementId}/${field}/toggle`);
      
      toast.success('Estado actualizado exitosamente', {
        id: loadingToast,
        description: `El estado de ${field} se ha cambiado`
      });
      
      // Recargar la lista
      await fetchData();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      
      toast.error('Error al cambiar el estado', {
        id: loadingToast,
        description: error.response?.data?.message || 'Error en el servidor'
      });
    }
  };

  const agruparPorDocumento = () => {
    const agrupado = {};
    
    dataList.forEach((item) => {
      // Usar el contractorId para agrupar los análisis
      const contractorId = item.contractorId;
      if (!agrupado[contractorId]) {
        agrupado[contractorId] = [];
      }
      agrupado[contractorId].push(item);
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
      
      <style jsx>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      
      <div className="container-fluid py-4 px-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0 fw-bold text-primary">
            <i className="bi bi-file-earmark-diff me-2"></i>
            Análisis de Documentos
          </h2>
          <div className="d-flex gap-2">
            <Button 
              variant="outline-primary" 
              onClick={refreshData}
              disabled={refreshing}
            >
              <i className={`bi bi-arrow-clockwise me-2 ${refreshing ? 'spin' : ''}`}></i>
              {refreshing ? 'Actualizando...' : 'Actualizar'}
            </Button>
            <Button variant="outline-primary" onClick={exportarExcelCompleto}>
              <i className="bi bi-file-excel me-2"></i>Exportar Todo
            </Button>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              <i className="bi bi-plus-circle me-2"></i>Nuevo Análisis
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
              <i className="bi bi-graph-down text-muted" style={{ fontSize: '3rem' }}></i>
              <h5 className="mt-3 text-muted">No hay análisis disponibles</h5>
              <p className="text-muted">Crea tu primer análisis de documentos haciendo clic en el botón "Nuevo Análisis"</p>
              <Button variant="primary" onClick={() => setShowModal(true)} className="mt-2">
                <i className="bi bi-plus-circle me-2"></i>Crear Primer Análisis
              </Button>
            </Card.Body>
          </Card>
        ) : (
          <>
            {/* Panel de información */}
            <Card className="mb-4 shadow-sm border-0">
              <Card.Body className="bg-light">
                <div className="row align-items-center">
                  <div className="col-md-8">
                    <h6 className="fw-bold text-primary mb-2">
                      <i className="bi bi-info-circle me-2"></i>
                      Gestión de Análisis de Documentos
                    </h6>
                    <p className="mb-0 text-muted small">
                      Aquí puedes ver todos los análisis realizados, actualizar documentos específicos y cambiar estados.
                    </p>
                  </div>
                  <div className="col-md-4 text-md-end">
                    <Badge bg="info" className="me-2">
                      {dataList.length} análisis totales
                    </Badge>
                    <Badge bg="secondary">
                      {Object.keys(agruparPorDocumento()).length} contractors
                    </Badge>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* Lista de análisis agrupados */}
            {Object.entries(agruparPorDocumento()).map(([contractorId, analisis]) => {
              // Buscar información del contractor
              const contractorInfo = analisis[0]; // Tomar el primer análisis para obtener info del contractor
              const contractorName = `Contractor ${contractorId.slice(-8)}`; // Mostrar últimos 8 chars del ID
              
              return (
                <Card key={contractorId} className="mb-4 shadow-sm border-0">
                  <Card.Header className="bg-white border-0">
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="fw-bold mb-0">
                        <i className="bi bi-person-badge text-primary me-2"></i>
                        {contractorName}
                        <Badge bg="light" text="primary" className="ms-2">
                          {analisis.length} análisis disponibles
                        </Badge>
                      </h5>
                      <div>
                        <Button 
                          variant="outline-danger" 
                          size="sm" 
                          className="me-2"
                          onClick={() => exportarPDF(analisis, contractorName)}
                        >
                          <i className="bi bi-file-pdf me-1"></i>PDF
                        </Button>
                        <Button 
                          variant="outline-success" 
                          size="sm"
                          onClick={() => exportarExcel(analisis, contractorName)}
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
                            <th style={{ width: '25%' }}>Documento</th>
                            <th style={{ width: '15%' }}>Estado</th>
                            <th style={{ width: '30%' }}>Descripción</th>
                            <th style={{ width: '30%' }}>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analisis.map((item) => {
                            // Mostrar cada campo del análisis
                            const documentFields = [
                              'certificateOfCompliance', 'signedCertificateOfCompliance',
                              'activityReport', 'taxQualityCertificate', 'socialSecurity', 'rut', 'rit',
                              'trainings', 'initiationRecord', 'accountCertification'
                            ];
                            
                            return documentFields.map(field => {
                              // Solo mostrar si el campo existe y tiene datos reales
                              if (!item[field] || !item[field].description || item[field].description.includes('prueba') || item[field].description.includes('test')) return null;
                              
                              // Obtener el managementId del primer subesquema que tenga documentManagement
                              const managementId = item[field]?.documentManagement || item.documentManagement;
                              
                              return (
                                <React.Fragment key={`${item._id}-${field}`}>
                                  <tr>
                                    <td>
                                      <i className="bi bi-file-earmark-text text-primary me-2"></i>
                                      {field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                    </td>
                                    <td>
                                      <Badge bg={item[field].status ? 'success' : 'warning'}>
                                        {item[field].status ? 'Aprobado' : 'Pendiente'}
                                      </Badge>
                                    </td>
                                    <td>
                                      <span className="text-muted">
                                        {item[field].description || 'Sin descripción'}
                                      </span>
                                    </td>
                                    <td>
                                      <div className="d-flex gap-1 flex-wrap">
                                        <Button
                                          size="sm"
                                          variant={detalleVisible === `${item._id}-${field}` ? 'info' : 'outline-info'}
                                          onClick={() =>
                                            setDetalleVisible(detalleVisible === `${item._id}-${field}` ? null : `${item._id}-${field}`)
                                          }
                                        >
                                          <i className={`bi bi-${detalleVisible === `${item._id}-${field}` ? 'chevron-up' : 'chevron-down'} me-1`}></i>
                                          {detalleVisible === `${item._id}-${field}` ? 'Ocultar' : 'Ver'}
                                        </Button>
                                        
                                        {managementId && (
                                          <>
                                            <Button
                                              size="sm"
                                              variant="outline-warning"
                                              onClick={() => actualizarDocumento(managementId, field)}
                                              title="Actualizar documento"
                                            >
                                              <i className="bi bi-arrow-clockwise"></i>
                                            </Button>
                                            
                                            <Button
                                              size="sm"
                                              variant={item[field].status ? 'outline-secondary' : 'outline-success'}
                                              onClick={() => toggleEstadoDocumento(managementId, field)}
                                              title={item[field].status ? 'Marcar como pendiente' : 'Marcar como aprobado'}
                                            >
                                              <i className={`bi bi-${item[field].status ? 'pause-circle' : 'check-circle'}`}></i>
                                              <span className="ms-1 d-none d-md-inline">
                                                {item[field].status ? 'Pendiente' : 'Aprobar'}
                                              </span>
                                            </Button>
                                          </>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                  {detalleVisible === `${item._id}-${field}` && (
                                    <tr>
                                      <td colSpan="4">
                                        <div className="p-3 bg-light border-start border-primary border-4">
                                          <h6 className="fw-bold mb-3 text-primary">
                                            <i className="bi bi-info-circle me-2"></i>
                                            Detalles del Análisis - {field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                          </h6>
                                          <div className="row">
                                            <div className="col-md-6">
                                              <div className="mb-3">
                                                <strong className="text-dark">Usuario Comparación:</strong>
                                                <p className="mb-0 text-muted">{item[field].usercomparasion || 'No especificado'}</p>
                                              </div>
                                            </div>
                                            <div className="col-md-6">
                                              <div className="mb-3">
                                                <strong className="text-dark">Fecha de Creación:</strong>
                                                <p className="mb-0 text-muted">{new Date(item.createdAt).toLocaleString()}</p>
                                              </div>
                                            </div>
                                            <div className="col-md-6">
                                              <div className="mb-3">
                                                <strong className="text-dark">ID de Gestión:</strong>
                                                <p className="mb-0 text-muted font-monospace">{item[field]?.documentManagement || 'No disponible'}</p>
                                              </div>
                                            </div>
                                            <div className="col-md-6">
                                              <div className="mb-3">
                                                <strong className="text-dark">Estado Actual:</strong>
                                                <p className="mb-0">
                                                  <Badge bg={item[field].status ? 'success' : 'warning'}>
                                                    {item[field].status ? 'Aprobado ✓' : 'Pendiente ⏳'}
                                                  </Badge>
                                                </p>
                                              </div>
                                            </div>
                                            <div className="col-12">
                                              <div className="mb-3">
                                                <strong className="text-dark">Descripción Completa:</strong>
                                                <p className="mb-0 text-muted">{item[field].description || 'Sin descripción disponible'}</p>
                                              </div>
                                            </div>
                                          </div>
                                          
                                          {/* Leyenda de acciones */}
                                          <div className="mt-3 pt-3 border-top">
                                            <h6 className="fw-bold text-secondary mb-2">Acciones disponibles:</h6>
                                            <div className="d-flex flex-wrap gap-3">
                                              <span className="badge bg-light text-dark">
                                                <i className="bi bi-arrow-clockwise me-1"></i> Actualizar documento
                                              </span>
                                              <span className="badge bg-light text-dark">
                                                <i className="bi bi-check-circle me-1"></i> Aprobar/Marcar pendiente
                                              </span>
                                              <span className="badge bg-light text-dark">
                                                <i className="bi bi-eye me-1"></i> Ver detalles completos
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                </React.Fragment>
                              );
                            }).filter(Boolean);
                          })}
                        </tbody>
                      </Table>
                    </div>
                  </Card.Body>
                </Card>
              );
            })}
          </>
        )}
      </div>

      <Modal 
        show={showModal} 
        onHide={analyzing ? undefined : () => setShowModal(false)} 
        centered
        backdrop={analyzing ? 'static' : true}
        keyboard={!analyzing}
      >
        <Modal.Header closeButton={!analyzing} className="border-0">
          <Modal.Title>
            <i className="bi bi-file-earmark-plus text-primary me-2"></i>
            Nuevo Análisis de Documentos
            {analyzing && (
              <Badge bg="warning" className="ms-2">
                <Spinner size="sm" className="me-1" />
                En proceso
              </Badge>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">Seleccionar Gestión Documental *</Form.Label>
              <Form.Select
                value={selectedDocId}
                onChange={(e) => setSelectedDocId(e.target.value)}
                required
                className="py-2"
              >
                <option value="">Seleccione una gestión documental...</option>
                {documentos.map((doc) => (
                  <option key={doc._id} value={doc._id}>
                    {doc.description || `Gestión ${doc._id.slice(-8)}`}
                  </option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">
                Seleccione la gestión documental que desea analizar. Este proceso comparará todos los documentos asociados.
              </Form.Text>
            </Form.Group>
            
            <div className="alert alert-info">
              <i className="bi bi-info-circle me-2"></i>
              <strong>Proceso de Análisis:</strong>
              <ul className="mb-0 mt-2">
                <li>Se analizarán todos los documentos PDF asociados</li>
                <li>Se compararán con los datos del contrato</li>
                <li>El proceso puede tomar varios minutos</li>
              </ul>
            </div>
            
            <div className="d-flex justify-content-end gap-2">
              <Button 
                variant="light" 
                onClick={() => setShowModal(false)}
                disabled={analyzing}
              >
                Cancelar
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                disabled={analyzing}
              >
                {analyzing ? (
                  <>
                    <Spinner 
                      as="span" 
                      animation="border" 
                      size="sm" 
                      role="status" 
                      aria-hidden="true" 
                      className="me-2"
                    />
                    Analizando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-play-circle me-2"></i>
                    Ejecutar Análisis
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default DashboardData;