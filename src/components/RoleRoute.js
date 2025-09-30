import React from 'react';
import {Navigate} from 'react-router-dom';
import  ROLES  from '../config/rolesConfig';

const RoleRouter = ({children, allowedRoles, userRole}) => {
    return allowedRoles.includes(userRole) ? children : <Navigate to = "/unauthorized"/>;
};

export default RoleRouter;