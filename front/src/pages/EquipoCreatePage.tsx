

// export default EquipoCreatePage;
import React, { useState, useEffect, useCallback  } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; 
import type { EquipoCreateData } from '../types/EquipoD'; 

// 🔹 Modales reutilizables
import ModalConfirm from "../components/ModalConfirm";
import ModalProcessing from "../components/ModalProcessign";
import ModalResult from "../components/ModalResult";
import '../styles/EquipoForm.css'; 

const API_URL = 'http://localhost:3000/api/equipos';
const AUTO_CLOSE_TIME = 5; // segundos para cerrar automáticamente el modal de resultado

const initialEquipoState: EquipoCreateData = {
    Nombre: '',
    tipo: '',
    Precio: 0, 
    estado: 'Activo'
};

const EquipoCreatePage: React.FC = () => {
    const { token, isAuthenticated } = useAuth();
    const [equipoData, setEquipoData] = useState<EquipoCreateData>(initialEquipoState);
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
    setEquipoData(prev => ({ ...prev, [id]: value }));
  };

  // 🔹 Abrir modal de confirmación
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated || !token) {
      setError('Debes iniciar sesión para crear una torre.');
      return;
    }

    if (!equipoData.Nombre || !equipoData.Precio) {
      setError('El Nombre y el precio son campos obligatorios.');
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
      await axios.post(API_URL, equipoData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      setResultModal({
        visible: true,
        message: '✅ ¡Equipo creado exitosamente!',
        type: 'success',
      });

      setEquipoData(initialEquipoState);
    } catch (err) {
      setResultModal({
        visible: true,
        message: '❌ Error al crear el equipo.',
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
        // 👈 Usamos la clase CSS 'form-container' como contenedor principal
        <div className="form-container">
            <h2>Crear Nuevo Equipo</h2>
            
            {/* 👈 Usamos las clases 'alert success' o 'alert error' */}
            {message && <div className="alert success">{message}</div>}
            {error && <div className="alert error">{error}</div>}
            
            <form onSubmit={handleSubmit}>
                
                {/* 👈 Usamos la clase CSS 'form-group' para cada campo */}
                <div className="form-group">
                    <label htmlFor="Nombre">Nombre del Equipo</label>
                    <input
                        id="Nombre"
                        type="text"
                        value={equipoData.Nombre}
                        onChange={handleChange}
                        placeholder="Ej. Sensor de Humedad DHT22"
                        required
                        // ❌ Eliminamos el 'style' en línea
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="Precio">Precio de Adquisición</label>
                    <input
                        id="Precio"
                        type="number" 
                        value={equipoData.Precio.toString()}
                        onChange={handleChange}
                        required
                        min="1"
                        placeholder="Ej. 15.50"
                        // ❌ Eliminamos el 'style' en línea
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="tipo">Tipo de Equipo</label>
                    <select
                        id="tipo"
                        value={equipoData.tipo}
                        onChange={handleChange}
                        required
                        // ❌ Eliminamos el 'style' en línea
                    >
                        <option value="">-- Seleccione un tipo --</option>
                        <option value="Sensor">Sensor</option>
                        <option value="Microcontrolador">Microcontrolador</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="estado">Estado</label>
                    <select
                        id="estado"
                        value={equipoData.estado}
                        onChange={handleChange}
                        required
                        // ❌ Eliminamos el 'style' en línea
                    >
                        <option value="Activo">Activo</option>
                        <option value="Inactivo">Inactivo</option>
                    </select>
                </div>
                
                {/* 👈 El botón toma el estilo automáticamente */}
                <button type="submit" disabled={loading}>
                    {loading ? 'Creando...' : 'Crear Equipo'}
                </button>
            </form>
            
      {/* --- MODALES --- */}
      <ModalProcessing visible={isProcessing} />

      <ModalConfirm
        visible={confirmVisible}
        title="Confirmar registro"
        message={`¿Estás seguro de registrar el Equipo "${equipoData.Nombre}" ubicada en "${equipoData.Precio}"?`}
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

export default EquipoCreatePage;