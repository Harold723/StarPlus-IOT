import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { TorreData, TorreCreateData } from '../types/TorreD';
//import del modal
import ModalConfirm from "../components/ModalConfirm";
import ModalProcessing from "../components/ModalProcessign";
import ModalResult from "../components/ModalResult";
import '../styles/EditTorre.css';

const API_URL = 'http://localhost:3000/api/torres';
const AUTO_CLOSE_TIME = 5;

const TorreEditPage: React.FC = () => {
  const { torreId } = useParams<{ torreId: string }>();
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();

  const [torreData, setTorreData] = useState<TorreCreateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<boolean>(false);

  const [resultModal, setResultModal] = useState<{ 
    visible: boolean; message: string; type: "success" | "error" | null; 
  }>({ visible: false, message: '', type: null });
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [countdown, setCountdown] = useState(AUTO_CLOSE_TIME);

  const initialTorreState: TorreCreateData = {
    nombre: '',
    ubicacion: '',
    estado: 'Activo',
  };

  // ------------------- Cargar datos de torre -------------------
  useEffect(() => {
    if (!isAuthenticated || !token || !torreId) {
      setLoading(false);
      setResultModal({ visible: true, message: 'Autenticación o ID de torre faltante.', type: 'error' });
      return;
    }

    const fetchTorre = async () => {
      try {
        const response = await axios.get<TorreData>(`${API_URL}/${torreId}`, { headers: { Authorization: `Bearer ${token}` } });
        setTorreData({
          nombre: response.data.nombre,
          ubicacion: response.data.ubicacion,
          estado: response.data.estado || 'Activo',
        });
      } catch {
        setResultModal({ visible: true, message: 'No se pudo cargar la torre. Verifique el ID.', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchTorre();
  }, [torreId, isAuthenticated, token]);

  // ------------------- Manejo de inputs -------------------
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!torreData) return;
    const { id, value } = e.target;
    setTorreData(prev => ({ ...(prev as TorreCreateData), [id]: value }));
  };

  // ------------------- Guardar cambios (PUT) -------------------
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!torreData || !torreId) return;
    if (!torreData.nombre || !torreData.ubicacion) {
      setResultModal({ visible: true, message: 'Nombre y Ubicación son obligatorios.', type: 'error' });
      return;
    }

    setIsProcessing(true);
    try {
      await axios.put(`${API_URL}/${torreId}`, torreData, { headers: { Authorization: `Bearer ${token}` } });
      setResultModal({ visible: true, message: '✅ ¡Torre actualizada exitosamente!', type: 'success' });
    } catch {
      setResultModal({ visible: true, message: '❌ Error al actualizar la torre. Verifica tu rol.', type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  // ------------------- Eliminar torre -------------------
  const handleDeleteClick = () => setConfirmVisible(true);

  const handleConfirmDelete = async () => {
    if (!torreId || !token) return;
    setConfirmVisible(false);
    setIsProcessing(true);

    try {
      await axios.delete(`${API_URL}/${torreId}`, { headers: { Authorization: `Bearer ${token}` } });
      setResultModal({ visible: true, message: '🗑️ Torre eliminada. Redirigiendo...', type: 'success' });
      setTimeout(() => navigate('/torres'), 2000);
    } catch {
      setResultModal({ visible: true, message: '❌ Error al eliminar la torre. Verifica tu rol.', type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelDelete = () => setConfirmVisible(false);
  const closeResultModal = () => setResultModal({ visible: false, message: '', type: null });

  // ------------------- Temporizador modal resultado -------------------
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let interval: ReturnType<typeof setInterval>;

    if (resultModal.visible) {
      setCountdown(AUTO_CLOSE_TIME);

      interval = setInterval(() => setCountdown(prev => (prev > 0 ? prev - 1 : 0)), 1000);
      timer = setTimeout(() => closeResultModal(), AUTO_CLOSE_TIME * 1000);
    }

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [resultModal.visible]);

  if (loading) return <div className="center">Cargando datos de la torre...</div>;
  if (!torreData) return <div className="center">Torre no encontrada.</div>;

    // // ----------------- Renderizado -------------------
  return (
    <div className="torre-edit-container">
      <div className="torre-edit-card">
        <h2>Editar Torre: {torreData.nombre}</h2>
        <p>ID: {torreId}</p>

        <form onSubmit={handleUpdate} className="torre-form">
          <div>
            <label htmlFor="nombre">Nombre:</label>
            <input id="nombre" type="text" value={torreData.nombre} onChange={handleChange} required />
          </div>
          <div>
            <label htmlFor="ubicacion">Ubicación:</label>
            <input id="ubicacion" type="text" value={torreData.ubicacion} onChange={handleChange} required />
          </div>
          <div>
            <label htmlFor="estado">Estado:</label>
            <select id="estado" value={torreData.estado} onChange={handleChange} required>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>

          <button type="submit" className="torre-btn torre-btn-primary" disabled={isProcessing}>
            {isProcessing ? 'Actualizando...' : 'Guardar Cambios'}
          </button>
        </form>

        <button className="torre-btn torre-btn-danger" onClick={handleDeleteClick} disabled={isProcessing}>
          {isProcessing ? 'Procesando...' : 'Eliminar Torre Permanentemente'}
        </button>
      </div>

      {/* --- MODALES --- */}
      <ModalProcessing visible={isProcessing} />
      <ModalConfirm
        visible={confirmVisible}
        title="Confirmar eliminación"
        message={`¿Desea eliminar la torre "${torreData.nombre}"?`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmLabel="Sí, eliminar"
        cancelLabel="Cancelar"
      />
      <ModalResult
        visible={resultModal.visible}
        message={resultModal.message}
        type={resultModal.type}
        countdown={countdown}
        onClose={closeResultModal}
      />
    </div>
  );
};

export default TorreEditPage;
