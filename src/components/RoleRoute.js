import React from 'react';
import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';

const RoleRouter = ({ children, allowedRoles, userRole }) => {
  return allowedRoles.includes(userRole)
    ? children
    : <Navigate to="/unauthorized" />;
};

RoleRouter.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
  userRole: PropTypes.string.isRequired,
};

export default RoleRouter;