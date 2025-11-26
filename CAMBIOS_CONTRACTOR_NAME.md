# Modificaciones para mostrar el nombre del contratista en Data.jsx

## Cambios necesarios:

### 1. Agregar estado para usuarios (línea 155, después de `const [documentos, setDocumentos] = useState([]);`):
```jsx
const [usuarios, setUsuarios] = useState([]); // Lista de contratistas
```

### 2. Agregar función fetchUsuarios (después de fetchDocumentos, línea 213):
```jsx
const fetchUsuarios = async () => {
  try {
    const res = await api.get('/Users/Contractor?state=true');
    if (res.data.success) {
      setUsuarios(res.data.data);
    }
  } catch (error) {
    console.error('Error al obtener contratistas:', error);
    toast.error('Error al cargar contratistas', {
      description: error.response?.data?.message || 'Error en el servidor'
    });
  }
};
```

### 3. Modificar useEffect para incluir fetchUsuarios (línea 167):
```jsx
await Promise.all([fetchDocumentos(), fetchData(), fetchUsuarios()]);
```

### 4. Modificar refreshData para incluir fetchUsuarios (línea 181):
```jsx
await Promise.all([fetchDocumentos(), fetchData(), fetchUsuarios()]);
```

### 5. Modificar el renderizado de contractor cards (buscar donde dice "Contractor d3a7f61f"):
En la función que renderiza las tarjetas, cambiar:
```jsx
const contractorName = `Contractor ${contractorId.slice(-8)}`;
```

Por:
```jsx
// Buscar el contratista en la lista de usuarios
const contractor = usuarios.find((c) => c._id === contractorId);
const user = contractor?.user;

// Generar nombre para mostrar
const contractorName = user 
  ? `${user.firstName || user.firsName || ''} ${user.lastName || ''}`.trim() || `Contractor ${contractorId.slice(-8)}`
  : `Contractor ${contractorId.slice(-8)}`;
```

### 6. Agregar email del contratista en el header de la card:
Después del nombre del contratista, agregar:
```jsx
{user?.email && (
  <small className="text-muted ms-2 fw-normal" style={{ fontSize: '0.75rem' }}>
    ({user.email})
  </small>
)}
```

## Resultado esperado:
En lugar de mostrar "Contractor d3a7f61f", se mostrará:
- "Juan Pérez (juan.perez@example.com)" si el contratista existe
- "Contractor d3a7f61f" si no se encuentra el contratista
