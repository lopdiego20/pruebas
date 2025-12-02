import { useMemo } from 'react';

/**
 * Hook personalizado para manejar permisos basados en roles
 * Basado en las rutas del backend para determinar qué acciones puede realizar cada rol
 */
export const usePermissions = () => {
  const userRole = localStorage.getItem('role')?.toLowerCase();

  const permissions = useMemo(() => {
    const canDelete = {
      // Permisos de eliminación basados en las rutas del backend
      users: userRole === 'admin', // Solo admin puede eliminar usuarios
      contracts: userRole === 'admin', // Solo admin puede eliminar contratos
      documents: userRole === 'admin' || userRole === 'funcionario', // Admin y funcionario pueden eliminar documentos
      data: userRole === 'admin' // Solo admin puede eliminar datos de análisis
    };

    const canEdit = {
      // Permisos de edición
      users: userRole === 'admin' || userRole === 'funcionario', // Admin y funcionario pueden editar usuarios
      contracts: userRole === 'admin', // Solo admin puede editar contratos (PUT)
      documents: userRole === 'admin' || userRole === 'funcionario' || userRole === 'contratista', // Todos pueden editar documentos
      data: userRole === 'admin' || userRole === 'funcionario' // Admin y funcionario pueden editar datos
    };

    const canCreate = {
      // Permisos de creación
      users: true, // Todos pueden crear usuarios (sin verificación en ruta)
      contracts: userRole === 'admin' || userRole === 'funcionario', // Admin y funcionario pueden crear contratos
      documents: userRole === 'admin' || userRole === 'funcionario' || userRole === 'contratista', // Todos pueden crear documentos
      data: true // Todos pueden crear análisis
    };

    const canView = {
      // Permisos de visualización
      users: userRole === 'admin' || userRole === 'funcionario', // Admin y funcionario pueden ver todos los usuarios
      contracts: userRole === 'admin' || userRole === 'funcionario', // Admin y funcionario pueden ver todos los contratos
      documents: userRole === 'admin' || userRole === 'funcionario' || userRole === 'contratista', // Admin, funcionario y contratista pueden ver todos los documentos
      data: userRole === 'admin' || userRole === 'funcionario' // Admin y funcionario pueden ver todos los análisis
    };

    return {
      canDelete,
      canEdit,
      canCreate,
      canView,
      userRole,
      isAdmin: userRole === 'admin',
      isFuncionario: userRole === 'funcionario',
      isContratista: userRole === 'contratista'
    };
  }, [userRole]);

  return permissions;
};

/**
 * Hook para verificar si un usuario tiene permiso específico
 * @param {string} action - Acción a verificar (delete, edit, create, view)
 * @param {string} resource - Recurso sobre el que actuar (users, contracts, documents, data)
 * @returns {boolean} - true si tiene permiso, false si no
 */
export const useHasPermission = (action, resource) => {
  const permissions = usePermissions();

  const permissionGroup = permissions?.[`can${action.charAt(0).toUpperCase() + action.slice(1)}`];
  return permissionGroup?.[resource] || false;
};

export default usePermissions;