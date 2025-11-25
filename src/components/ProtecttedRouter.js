import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import React from 'react';

const ProtectedRoute = ({ children, allowedRoles, disableDelete = false }) => {
  const role = localStorage.getItem('role');
  const token = localStorage.getItem('token');

  if (!token) return <Navigate to="/" />;
  if (!allowedRoles.includes(role)) return <Navigate to="/unauthorized" />;

  // Si el rol es funcionario o contratista, deshabilitamos la eliminación
  if (disableDelete && ['funcionario', 'contratista'].includes(role)) {
    // Modificar el children para deshabilitar botones de eliminación
    const modifiedChildren = React.Children.map(children, child => {
      return React.cloneElement(child, { disableDelete: true });
    });
    return modifiedChildren;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
  disableDelete: PropTypes.bool
};

export default ProtectedRoute;