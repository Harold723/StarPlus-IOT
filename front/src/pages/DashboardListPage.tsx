import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import type { DashboardData } from '../types/DashboardD';

// 🔹 Modales reutilizables
import ModalConfirm from "../components/ModalConfirm";
import ModalProcessing from "../components/ModalProcessign";
import ModalResult from "../components/ModalResult";

// Estilos
import '../styles/ListDash.css'; 

const API_BASE = 'http://localhost:3000/api'; 
const AUTO_CLOSE_TIME = 5;

const DashboardListPage: React.FC = () => {
  const { token, role } = useAuth();
  const isAdmin = role === 'admin';

  const [buttons, setButtons] = useState<DashboardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔹 Estados de proceso y modales
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; nombre: string } | null>(null);
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
  const [countdown, setCountdown] = useState(AUTO_CLOSE_TIME);

  // ------------------- CARGAR DASHBOARDS -------------------
  const fetchButtons = useCallback(async () => {
    if (!token) {
      setError("No autenticado. Por favor, inicie sesión.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API_BASE}/dashboard/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setButtons(response.data);
      setError(null);
    } catch (err: any) {
      console.error("Error al obtener Card Buttons:", err);
      setError(
        err.response?.data?.message || 
        `Error al obtener botones: ${err.message}. ¿Servidor en ejecución?`
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchButtons();
  }, [fetchButtons]);

  // ------------------- ELIMINAR DASHBOARD -------------------
  const handleDeleteClick = (id: string, nombre: string) => {
    setDeleteTarget({ id, nombre });
    setConfirmVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !token) return;
    setConfirmVisible(false);
    setIsProcessing(true);

    try {
      await axios.delete(`${API_BASE}/dashboard/${deleteTarget.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setButtons((prev) => prev.filter((b) => b._id !== deleteTarget.id));

      setResultModal({
        visible: true,
        message: `✅ Dashboard "${deleteTarget.nombre}" eliminado correctamente.`,
        type: "success",
      });
    } catch {
      setResultModal({
        visible: true,
        message: "❌ Error al eliminar el Dashboard. Verifica tu rol (debe ser admin).",
        type: "error",
      });
    } finally {
      setIsProcessing(false);
      setDeleteTarget(null);
    }
  };

  const handleCancelDelete = () => {
    setConfirmVisible(false);
    setDeleteTarget(null);
  };

  const closeResultModal = () =>
    setResultModal({ visible: false, message: "", type: null });

  // ------------------- AUTO-CIERRE DEL MODAL DE RESULTADO -------------------
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let interval: ReturnType<typeof setInterval>;

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
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [resultModal.visible, resultModal.type]);

  // ------------------- RENDER -------------------
  if (loading) return <div className="loading-message">Cargando Dashboards...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="dashboard-list-page">
      <h2>Lista de Dashboards</h2>

      {isAdmin && (
        <Link to="/dashboard/crear" className="create-button">
          + Crear Nuevo Dashboard
        </Link>
      )}

      {buttons.length === 0 ? (
        <p>No se encontraron Dashboards. {isAdmin ? "Crea uno para empezar." : ""}</p>
      ) : (
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Equipos</th>
              {isAdmin && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {buttons.map((button) => (
              <tr key={button._id}>
                <td>{button.label}</td>
                <td>
                  {button.torreId ? "Torre" : ""}
                  {button.servidorId ? "Servidor" : ""}
                  {!button.torreId && !button.servidorId ? "Ninguna" : ""}
                </td>
                <td>
                  {button.equipoIds && button.equipoIds.length > 0
                    ? `${button.equipoIds.length} IDs`
                    : "N/A"}
                </td>
                {isAdmin && (
                  <td>
                    <Link to={`/dashboard/editar/${button._id}`} className="action-link">
                      Editar
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(button._id, button.label)}
                      className="delete-button"
                    >
                      Eliminar
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* --- MODALES --- */}
      <ModalProcessing visible={isProcessing} />

      <ModalConfirm
        visible={confirmVisible}
        title="Confirmar eliminación"
        message={`¿Estás seguro de eliminar el Dashboard "${deleteTarget?.nombre}"?`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmLabel="Sí, eliminar"
        cancelLabel="Cancelar"
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

export default DashboardListPage;
