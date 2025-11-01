

//  RegisterPage;
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

// 🔹 Modales reutilizables
import ModalConfirm from "../components/ModalConfirm";
import ModalProcessing from "../components/ModalProcessign";
import ModalResult from "../components/ModalResult";

// 🔹 Estilos
import "../styles/RegistroU.css";

const API_URL = "http://localhost:3000";

const RegisterPage: React.FC = () => {
  // 🔹 Estados del formulario
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");

  // 🔹 Estados de proceso y modales
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [resultModal, setResultModal] = useState<{
    visible: boolean;
    message: string;
    type: "success" | "error" | null;
  }>({
    visible: false,
    message: "",
    type: null,
  });

  const navigate = useNavigate();
  const { token, role: userRole } = useAuth();

  // --- Confirmación de registro ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Solo los administradores pueden crear usuarios
    if (userRole !== "admin") {
      setResultModal({
        visible: true,
        message: "Solo los administradores pueden crear usuarios.",
        type: "error",
      });
      return;
    }

    // Mostrar modal de confirmación
    setConfirmVisible(true);
  };

  // --- Confirmar acción ---
  const confirmRegister = async () => {
    setConfirmVisible(false);
    setIsProcessing(true);

    try {
      await axios.post(
        `${API_URL}/api/auth/register`,
        { username, password, role },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Éxito
      setResultModal({
        visible: true,
        message: "¡Usuario creado exitosamente!",
        type: "success",
      });

      // Redirigir después de 2 segundos
      setTimeout(() => navigate("/admin"), 2000);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setResultModal({
          visible: true,
          message: err.response.data.message || "Error al registrar usuario.",
          type: "error",
        });
      } else {
        setResultModal({
          visible: true,
          message: "Error de conexión con el servidor.",
          type: "error",
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const cancelRegister = () => setConfirmVisible(false);
  const closeResultModal = () =>
    setResultModal({ visible: false, message: "", type: null });

  return (
    <div className="form-container">
      <h2 className="form-title">Registrar Nuevo Usuario</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Usuario:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Contraseña:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Rol:</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "user" | "admin")}
          >
            <option value="user">Usuario</option>
            <option value="admin">Administrador</option>
          </select>
        </div>

        <button type="submit" className="btn-primary">
          Crear Usuario
        </button>
      </form>

      {/* --- MODALES --- */}
      <ModalProcessing visible={isProcessing} />

      <ModalConfirm
        visible={confirmVisible}
        title="Confirmar registro"
        message={`¿Estás seguro de registrar el usuario "${username}" con rol "${role}"?`}
        onConfirm={confirmRegister}
        onCancel={cancelRegister}
        confirmLabel="Sí, registrar"
        cancelLabel="Cancelar"
      />

      <ModalResult
        visible={resultModal.visible}
        type={resultModal.type}
        message={resultModal.message}
        onClose={closeResultModal}
      />
    </div>
  );
};

export default RegisterPage;
