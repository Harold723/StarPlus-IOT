
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; 
import type { ServidorCreateData } from '../types/ServidorD'; 
// 🔹 Modales reutilizables
import ModalConfirm from "../components/ModalConfirm";
import ModalProcessing from "../components/ModalProcessign";
import ModalResult from "../components/ModalResult";

import '../styles/ServidorForm.css'; 

const API_URL = 'http://localhost:3000/api/servidores';
const AUTO_CLOSE_TIME = 5; // segundos para cerrar automáticamente el modal de resultado

// Estado inicial
const initialServidorState: ServidorCreateData = {
    nombre: '', 
    ubicacion: '',
    estado: 'Activo'
};

const ServidorCreatePage: React.FC = () => {
    const { token, isAuthenticated } = useAuth();
    
    const [servidorData, setServidorData] = useState<ServidorCreateData>(initialServidorState);
    
    // Estado de la interfaz
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

    // // Handler genérico
    // const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    //     const { id, value } = e.target;
        
    //     setServidorData(prev => ({
    //         ...prev,
    //         [id]: value
    //     }));
    //     setMessage('');
    //     setError('');
    // };

    // const handleSubmit = async (e: React.FormEvent) => {
    //     e.preventDefault();
        
    //     if (!isAuthenticated || !token) {
    //          setError('Debes iniciar sesión para crear un servidor.');
    //          return;
    //     }

    //     if (!servidorData.nombre || !servidorData.ubicacion ) {
    //         setError('El Nombre y la Ubicación son campos obligatorios.');
    //         return;
    //     }

    //     setLoading(true);
    //     setMessage('');
    //     setError('');

    //     try {
    //         await axios.post(
    //             API_URL, 
    //             servidorData, 
    //             {
    //                 headers: {
    //                     'Content-Type': 'application/json',
    //                     'Authorization': `Bearer ${token}` 
    //                 },
    //             }
    //         );
            
    //         setMessage('✅ ¡Servidor creado exitosamente!');
            
    //         // Limpiar formulario para el siguiente registro
    //         setServidorData(initialServidorState); 

    //     } catch (err) {
    //         if (axios.isAxiosError(err) && err.response) {
    //             // Captura el error de validación 400 o el de índice duplicado (ej. 409)
    //             setError(err.response.data.message || 'Error al crear el servidor.');
    //         } else {
    //             setError('Error de conexión con el servidor.');
    //         }
    //     } finally {
    //         setLoading(false);
    //     }
    // };
 // 🔹 Manejo de inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setServidorData(prev => ({ ...prev, [id]: value }));
  };

  // 🔹 Abrir modal de confirmación
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated || !token) {
      setError('Debes iniciar sesión para crear una torre.');
      return;
    }

    if (!servidorData.nombre || !servidorData.ubicacion) {
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
      await axios.post(API_URL, servidorData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      setResultModal({
        visible: true,
        message: '✅ ¡Servidor creado exitosamente!',
        type: 'success',
      });

      setServidorData(initialServidorState);
    } catch (err) {
      setResultModal({
        visible: true,
        message: '❌ Error al crear el servidor.',
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
        // 🚨 Contenedor principal para centrar la tarjeta
        <div className="page-container"> 
            {/* 🚨 Tarjeta del formulario */}
            <div className="form-card">
                <h2>Crear Nuevo Servidor</h2>
            
                {/* 🚨 Mensajes con estilos de FormStyles.css */}
                {message && <div className="message-success">{message}</div>}
                {error && <div className="message-error">{error}</div>}
                
                {/* 🚨 Formulario con estilos 'form-group' */}
                <form onSubmit={handleSubmit} className="form-group">
                    
                    {/* Campo 1: Nombre */}
                    <div>
                        <label htmlFor="nombre">Nombre del Servidor:</label>
                        <input
                            id="nombre" 
                            type="text"
                            value={servidorData.nombre} 
                            onChange={handleChange}
                            required
                        />
                    </div>
                    
                    {/* Campo 2: Ubicación */}
                    <div>
                        <label htmlFor="ubicacion">Ubicación:</label>
                        <input
                            id="ubicacion"
                            type="text"
                            value={servidorData.ubicacion} 
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Campo 3: Estado */}
                    <div>
                        <label htmlFor="estado">Estado Inicial:</label>
                        <select
                            id="estado"
                            value={servidorData.estado}
                            onChange={handleChange}
                            required
                        >
                            <option value="Activo">Activo</option>
                            <option value="Inactivo">Inactivo</option>
                        </select>
                    </div>
                    
                    <button 
                        type="submit" 
                       
                        className="btn-form btn-primary" 
                        disabled={loading}
                    >
                        {loading ? 'Creando...' : 'Crear Servidor'}
                    </button>
                </form>
                
      {/* --- MODALES --- */}
      <ModalProcessing visible={isProcessing} />

      <ModalConfirm
        visible={confirmVisible}
        title="Confirmar registro"
        message={`¿Estás seguro de registrar la Torre "${servidorData.nombre}" ubicada en "${servidorData.ubicacion}"?`}
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
        </div>
    );
};

export default ServidorCreatePage;