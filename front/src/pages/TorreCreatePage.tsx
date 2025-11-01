import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import type { TorreCreateData } from '../types/TorreD';

// 🔹 Modales reutilizables
import ModalConfirm from "../components/ModalConfirm";
import ModalProcessing from "../components/ModalProcessign";
import ModalResult from "../components/ModalResult";

import '../styles/TorreForm.css';

const API_URL = 'http://localhost:3000/api/torres';
const AUTO_CLOSE_TIME = 5; // segundos para cerrar automáticamente el modal de resultado

const initialTorreState: TorreCreateData = {
  nombre: '',
  ubicacion: '',
  estado: 'Activo'
};

const TorreCreatePage: React.FC = () => {
  const { token, isAuthenticated } = useAuth();
  const [torreData, setTorreData] = useState<TorreCreateData>(initialTorreState);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
  
  // 🔹 Manejo de inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setTorreData(prev => ({ ...prev, [id]: value }));
  };

  // 🔹 Abrir modal de confirmación
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated || !token) {
      setError('Debes iniciar sesión para crear una torre.');
      return;
    }

    if (!torreData.nombre || !torreData.ubicacion) {
      setError('El Nombre y la Ubicación son campos obligatorios.');
      return;
    }

    setConfirmVisible(true);
  };

  // 🔹 Confirmar registro y enviar POST
  const handleConfirmRegister = async () => {
    setConfirmVisible(false);
    setIsProcessing(true);
    setError('');
    setMessage('');

    try {
      await axios.post(API_URL, torreData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      setResultModal({
        visible: true,
        message: '✅ ¡Torre creada exitosamente!',
        type: 'success',
      });

      setTorreData(initialTorreState);
    } catch (err) {
      setResultModal({
        visible: true,
        message: '❌ Error al crear la torre.',
        type: 'error',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // 🔹 Cancelar confirmación
  const handleCancelRegister = () => {
    setConfirmVisible(false);
  };

  // 🔹 Cerrar modal de resultado
  const closeResultModal = useCallback(() => {
    setResultModal({ visible: false, message: '', type: null });
  }, []);

  // 🔹 Control del temporizador para cerrar el modal de resultado
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
  }, [resultModal.visible, resultModal.type, closeResultModal]);

  return (
    <div className="form-container">
      <h2>Crear Nueva Torre</h2>

      {message && <div className="alert success">{message}</div>}
      {error && <div className="alert error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="nombre">Nombre de la Torre</label>
          <input
            id="nombre"
            type="text"
            value={torreData.nombre}
            onChange={handleChange}
            placeholder="Ej. Torre Central"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="ubicacion">Ubicación</label>
          <input
            id="ubicacion"
            type="text"
            value={torreData.ubicacion}
            onChange={handleChange}
            placeholder="Ej. Ciudad de Guatemala"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="estado">Estado</label>
          <select id="estado" value={torreData.estado} onChange={handleChange}>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Creando...' : 'Crear Torre'}
        </button>
      </form>

      {/* --- MODALES --- */}
      <ModalProcessing visible={isProcessing} />

      <ModalConfirm
        visible={confirmVisible}
        title="Confirmar registro"
        message={`¿Estás seguro de registrar la Torre "${torreData.nombre}" ubicada en "${torreData.ubicacion}"?`}
        onConfirm={handleConfirmRegister}
        onCancel={handleCancelRegister}
        confirmLabel="Sí, registrar"
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

export default TorreCreatePage;
