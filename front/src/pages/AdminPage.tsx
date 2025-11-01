// //  AdminPage;
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { Link } from "react-router-dom";

// 🔹 Importar los modales reutilizables
import ModalProcessing from "../components/ModalProcessign";
import ModalConfirm from "../components/ModalConfirm";
import ModalResult from "../components/ModalResult";

import "../styles/Usuarios.css"; // Mantienes tus estilos previos

interface UserData {
  id: string;
  username: string;
  role: "user" | "admin";
}

const API_URL = "http://localhost:3000";
const AUTO_CLOSE_TIME = 5; // segundos para cierre automático del modal

const AdminPage: React.FC = () => {
  const { token, logout } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🔹 Estados para modales
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    visible: boolean;
    user: UserData | null;
    newRole: "user" | "admin";
  }>({
    visible: false,
    user: null,
    newRole: "user",
  });

  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    visible: boolean;
    user: UserData | null;
  }>({
    visible: false,
    user: null,
  });

  const [resultModal, setResultModal] = useState<{
    visible: boolean;
    message: string;
    type: "success" | "error" | null;
  }>({
    visible: false,
    message: "",
    type: null,
  });

  const [countdown, setCountdown] = useState(AUTO_CLOSE_TIME);

  // 🔹 Cerrar modal de resultado manualmente
  const closeResultModal = useCallback(
    () => setResultModal({ visible: false, message: "", type: null }),
    []
  );

  // 🔹 Cargar usuarios
  useEffect(() => {
    const fetchUsers = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get(`${API_URL}/api/auth/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(
          res.data.users.map((u: any) => ({
            username: u.username,
            role: u.role,
            id: u._id || u.id,
          }))
        );
      } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
          if (err.response.status === 403 || err.response.status === 401) {
            logout();
            return;
          }
          setError(err.response.data?.message || "Error al cargar usuarios.");
        } else {
          setError("Error de conexión desconocido.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [token, logout]);

  // 🔹 Control del temporizador para cerrar el modal de resultado
  useEffect(() => {
    let timer: number | undefined;
    let interval: number | undefined;

    if (resultModal.visible && (resultModal.type === "success" || resultModal.type === "error")) {
      setCountdown(AUTO_CLOSE_TIME);

      interval = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);

      timer = setTimeout(() => {
        closeResultModal();
        clearInterval(interval);
      }, AUTO_CLOSE_TIME * 1000);
    }

    return () => {
      if (timer) clearTimeout(timer);
      if (interval) clearInterval(interval);
    };
  }, [resultModal.visible, resultModal.type, closeResultModal]);

  // --- 🔹 Cambio de rol ---
  const openRoleModal = (user: UserData, role: "user" | "admin") => {
    setConfirmModal({
      visible: true,
      user,
      newRole: role,
    });
  };

  const cancelRoleChange = () =>
    setConfirmModal({ visible: false, user: null, newRole: "user" });

  const confirmRoleChange = async () => {
    if (!confirmModal.user) return;

    setConfirmModal((prev) => ({ ...prev, visible: false }));
    setIsProcessing(true);

    const userToUpdate = confirmModal.user;
    const roleToSet = confirmModal.newRole;

    try {
      await axios.put(
        `${API_URL}/api/auth/users/${userToUpdate.id}`,
        { role: roleToSet },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUsers((prev) =>
        prev.map((u) => (u.id === userToUpdate.id ? { ...u, role: roleToSet } : u))
      );

      setResultModal({
        visible: true,
        message: `Rol de ${userToUpdate.username} actualizado a ${roleToSet} con éxito!`,
        type: "success",
      });
    } catch (err) {
      let msg = "Error desconocido al actualizar.";
      if (axios.isAxiosError(err) && err.response) {
        msg = err.response.data?.message || "Error al actualizar el rol.";
      }

      setResultModal({ visible: true, message: msg, type: "error" });
    } finally {
      setIsProcessing(false);
      setConfirmModal({ visible: false, user: null, newRole: "user" });
    }
  };

  // --- 🔹 Eliminación ---
  const openDeleteModal = (user: UserData) => {
    setDeleteConfirmModal({ visible: true, user });
  };

  const cancelDelete = () =>
    setDeleteConfirmModal({ visible: false, user: null });

  const confirmDelete = async () => {
    if (!deleteConfirmModal.user) return;

    setDeleteConfirmModal((prev) => ({ ...prev, visible: false }));
    setIsProcessing(true);

    const userToDelete = deleteConfirmModal.user;

    try {
      await axios.delete(`${API_URL}/api/auth/users/${userToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));

      setResultModal({
        visible: true,
        message: `Usuario ${userToDelete.username} eliminado con éxito!`,
        type: "success",
      });
    } catch (err) {
      let msg = "Error desconocido al eliminar.";
      if (axios.isAxiosError(err) && err.response) {
        msg = err.response.data?.message || "Error al eliminar el usuario.";
      }

      setResultModal({ visible: true, message: msg, type: "error" });
    } finally {
      setIsProcessing(false);
      setDeleteConfirmModal({ visible: false, user: null });
    }
  };

  // 🔹 ID actual del usuario
  const currentUserId = token ? JSON.parse(atob(token.split(".")[1])).id : null;

  if (loading) return <div className="admin-loading">Cargando datos...</div>;
  if (error) return <div className="admin-error">Error: {error}</div>;

  return (
    <div className="admin-container">
      <div className="admin-card">
        <h2>Panel de Administración de Usuarios</h2>
        <p>Usuarios registrados: <strong>{users.length}</strong></p>
        <p className="admin-subtitle">
          Solo visible para usuarios con rol <b>admin</b>.
        </p>

        <ul className="admin-user-list">
          {users.map((user) => (
            <li key={String(user.id)} className="admin-user-item">
              <div className="admin-user-info">
                <strong>{user.username}</strong>
                <span className={`role-badge ${user.role}`}>
                  {user.role === "admin" ? "Admin" : "User"}
                </span>
              </div>

              <div className="admin-controls">
                {/* Selector de Rol */}
                <div className="admin-role-control">
                  <label htmlFor={`role-select-${user.id}`}>Rol:</label>
                  <select
                    id={`role-select-${user.id}`}
                    value={user.role}
                    onChange={(e) =>
                      openRoleModal(user, e.target.value as "user" | "admin")
                    }
                    className="role-select"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {/* Botón de Eliminar */}
                <button
                  className="btn btn-delete"
                  onClick={() => openDeleteModal(user)}
                  disabled={user.id === currentUserId}
                  title={
                    user.id === currentUserId
                      ? "No puedes eliminar tu propia cuenta"
                      : `Eliminar a ${user.username}`
                  }
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>

        <div className="admin-footer">
          <Link to="/" className="admin-link">
            Star Plus
          </Link>
        </div>
      </div>

      {/* 🔹 Modales Reutilizables */}
      <ModalProcessing visible={isProcessing} />

      <ModalConfirm
        visible={confirmModal.visible}
        title="Confirmar cambio de rol"
        message={`¿Estás seguro de cambiar el rol de ${confirmModal.user?.username} a ${confirmModal.newRole}?`}
        onConfirm={confirmRoleChange}
        onCancel={cancelRoleChange}
      />

      <ModalConfirm
        visible={deleteConfirmModal.visible}
        title="Confirmar eliminación"
        message={`¿Está seguro de eliminar al usuario ${deleteConfirmModal.user?.username}? Esta acción no se puede deshacer.`}
        confirmLabel="Sí, eliminar"
        cancelLabel="Cancelar"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        type="delete"
      />

      <ModalResult
        visible={resultModal.visible}
        type={resultModal.type}
        message={resultModal.message}
        countdown={countdown}
        onClose={closeResultModal}
      />
    </div>
  );
};

export default AdminPage;
