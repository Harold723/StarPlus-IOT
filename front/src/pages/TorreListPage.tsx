import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; 
import { useAuth } from '../context/AuthContext'; 
import type { TorreData } from '../types/TorreD'; 

// 🔹 Modales reutilizables
import ModalConfirm from "../components/ModalConfirm";
import ModalProcessing from "../components/ModalProcessign";
import ModalResult from "../components/ModalResult";

import '../styles/TorreList.css'; 

const API_URL = 'http://localhost:3000/api/torres';
const AUTO_CLOSE_TIME = 5;

const TorreListPage: React.FC = () => {
  const [torres, setTorres] = useState<TorreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{id: string, nombre: string} | null>(null);

  const { token, isAuthenticated, role } = useAuth(); 
  const isAdmin = role === 'admin'; 

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
  const [countdown, setCountdown] = useState(AUTO_CLOSE_TIME);

  // ------------------- CARGA DE TORRES -------------------
  const fetchTorres = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setError('Autenticación requerida.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get<TorreData[]>(API_URL, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setTorres(response.data);
      setError('');
    } catch (err: any) {
      setError('Error al cargar las torres.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    fetchTorres();
  }, [fetchTorres]);

  // ------------------- ELIMINAR TORRE -------------------
  const handleDeleteClick = (id: string, nombre: string) => {
    setDeleteTarget({ id, nombre });
    setConfirmVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !token) return;
    setConfirmVisible(false);
    setIsProcessing(true);

    try {
      await axios.delete(`${API_URL}/${deleteTarget.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setTorres(prev => prev.filter(t => t._id !== deleteTarget.id));

      setResultModal({ visible: true, message: `✅ Torre "${deleteTarget.nombre}" eliminada.`, type: 'success' });
    } catch {
      setResultModal({ visible: true, message: '❌ Error al eliminar. Verifica tu rol (debe ser admin).', type: 'error' });
    } finally {
      setIsProcessing(false);
      setDeleteTarget(null);
    }
  };

  const handleCancelDelete = () => {
    setConfirmVisible(false);
    setDeleteTarget(null);
  };

  const closeResultModal = () => setResultModal({ visible: false, message: '', type: null });

  // ------------------- Temporizador para cerrar modal resultado -------------------
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let interval: ReturnType<typeof setInterval>;

    if (resultModal.visible && (resultModal.type === "success" || resultModal.type === "error")) {
      setCountdown(AUTO_CLOSE_TIME);

      interval = setInterval(() => {
        setCountdown(prev => (prev > 0 ? prev - 1 : 0));
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

  if (loading) return <div className="center">Cargando torres...</div>;
  if (error) return <div className="alert error">{error}</div>;
  if (torres.length === 0) return <div className="center">No hay torres registradas.</div>;
  // ------------------- RENDER -------------------
  return (
    <div className="torre-list-container">
      <h2>Listado de Torres</h2>

      <ul className="torre-list">
        {torres.map((t) => (
          <li key={t._id} className="torre-card">
            <div className="torre-info">
              <strong>{t.nombre}</strong>
              <p>📍 {t.ubicacion}</p>
              <span className={`estado ${t.estado === 'Activo' ? 'activo' : 'inactivo'}`}>{t.estado}</span>
            </div>

            {isAdmin && (
              <div className="torre-actions">
                <Link to={`/torres/editar/${t._id}`} className="btn edit">Editar</Link>
                <button
                  onClick={() => handleDeleteClick(t._id, t.nombre)}
                  className="btn delete"
                >
                  Eliminar
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* --- MODALES --- */}
      <ModalProcessing visible={isProcessing} />

      <ModalConfirm
        visible={confirmVisible}
        title="Confirmar eliminación"
        message={`¿Estás seguro de eliminar la Torre "${deleteTarget?.nombre}"?`}
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

export default TorreListPage;
