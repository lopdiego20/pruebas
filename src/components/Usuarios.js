import React from 'react';

const Usuarios = () => {
  return (
    <div className="container">
      <h2>Lista de Usuarios</h2>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
            </tr>
          </thead>
          <tbody>
            {/* Add table content here */}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Usuarios;