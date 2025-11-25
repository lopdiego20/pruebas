import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Form, Button } from "react-bootstrap";
import LogoBogota from "../images/Bogota_Logo.png";
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading('Verificando credenciales');

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/auth/signin`, {
        email,
        password,
      });

      const { token, user } = res.data;
      const role = user.role;


      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("user", JSON.stringify(user));

      toast.success(`Bienvenido ${user.name || user.role}`, {
        id: loadingToast,
        description: 'Inicio de sesión exitoso'
      });


      navigate('/dashboard');
    } catch (err) {
      const mensajeServidor =
        err.response?.data?.message || "Error desconocido del servidor";

      // Error handling sin exponer detalles en consola
      toast.error('Error al iniciar sesión', {
        id: loadingToast,
        description: mensajeServidor
      });
    }
  };

  return (
    <div style={styles.pageContainer}>


      <div style={styles.formContainer}>
        {/* Imagen a la izquierda */}

        <div style={styles.imageWrapper}>
          <img src={LogoBogota} alt="Imagen de ejemplo" style={styles.image} />
        </div>
        {/* Formulario a la derecha */}
        <div style={styles.formWrapper}>
          {/* Usando la fuente League Spartan */}
          <h2 style={styles.title} className="custom-font">
            ¡Bienvenido de nuevo!
          </h2>
          <Form style={styles.form} onSubmit={handleSubmit}>
            <Form.Group
              className="mb-3"
              controlId="formBasicEmail"
              style={styles.formGroup}
            >
              {/* <Form.Label style={styles.label}>Email</Form.Label> */}
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ingrese su email"
                style={styles.input}
              />
            </Form.Group>
            <Form.Group
              className="mb-3"
              controlId="formBasicPassword"
              style={styles.formGroup}
            >
              {/* <Form.Label style={styles.label}>Contraseña</Form.Label> */}
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingrese su contraseña"
                style={styles.input}
              />
            </Form.Group>

            <Button className="custom-font" type="submit" style={styles.button}>
              INICIAR SESION
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh", //  altura total de la pantalla
    width: "100vw", // ancho total de la pantalla
    backgroundColor: "#fdf5f7",
  },

  formContainer: {
    display: "flex",
    flexDirection: "row", // Cambiar a fila para imagen a la izquierda y formulario a la derecha
    alignItems: "center",
    gap: "40px", // Espacio entre el formulario y la imagen
  },
  formWrapper: {
    padding: "70px",
    maxWidth: "600px",
    fontFamily: "Arial, sans-serif",
    borderRadius: "8px",
  },
  title: {
    textAlign: "center",
    color: "#000000",
    marginBottom: "20px",
    fontFamily: "League Spartan, sans-serif",
    fontWeight: "600", // Aplicando la fuente aquí
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  label: {
    fontWeight: "bold",
    color: "#333",
  },
  input: {
    padding: "10px",
    borderRadius: "4px",
    border: "2px solid #000000",
    textAlign: "center", // Centrar el texto del placeholder
  },
  button: {
    padding: "10px",
    backgroundColor: "#9bb3e8",
    color: "#000000",
    border: "none",
    borderRadius: "50px",
    cursor: "pointer",
    width: "200px",
    marginLeft: "5%",
    fontFamily: "League Spartan, sans-serif",
    fontWeight: "500",
  },
  imageWrapper: {
    width: "300px", // Ajusta el tamaño de la imagen
  },
  image: {
    width: "100%", // La imagen ocupa el espacio disponible
    height: "auto", // Mantiene las proporciones
    borderRadius: "8px", // Opcional: redondear bordes de la imagen
  },
};
