
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom'; // 👈 Importamos useNavigate para la redirección
import { useAuth } from '../context/AuthContext'; 
import type { servidorData } from '../types/ServidorD'; 
// 🔹 Modales reutilizables
import ModalConfirm from "../components/ModalConfirm";
import ModalProcessing from "../components/ModalProcessign";
import ModalResult from "../components/ModalResult";

import '../styles/ServidorList.css'; 

const API_URL = 'http://localhost:3000/api/servidores';
const AUTO_CLOSE_TIME = 5;

const ServidorListPage: React.FC = () => {
    const [servidor, setServidor] = useState<servidorData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
      const [deleteServidor, setDeleteServidor] = useState<{id: string, nombre: string} | null>(null);

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
    
    
  // ------------------- CARGA DE Servidores -------------------
  const fetchServidor = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setError('Autenticación requerida.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get<servidorData[]>(API_URL, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setServidor(response.data);
      setError('');
    } catch (err: any) {
      setError('Error al cargar los Servidores.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    fetchServidor();
  }, [fetchServidor]);

  // ------------------- ELIMINAR TORRE -------------------
  const handleDeleteClick = (id: string, nombre: string) => {
    setDeleteServidor({ id, nombre });
    setConfirmVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteServidor || !token) return;
    setConfirmVisible(false);
    setIsProcessing(true);

    try {
      await axios.delete(`${API_URL}/${deleteServidor.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setServidor(prev => prev.filter(t => t._id !== deleteServidor.id));

      setResultModal({ visible: true, message: `✅ Servidor "${deleteServidor.nombre}" eliminado.`, type: 'success' });
    } catch {
      setResultModal({ visible: true, message: '❌ Error al eliminar. Verifica tu rol (debe ser admin).', type: 'error' });
    } finally {
      setIsProcessing(false);
      setDeleteServidor(null);
    }
  };

  const handleCancelDelete = () => {
    setConfirmVisible(false);
    setDeleteServidor(null);
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

  if (loading) return <div className="center">Cargando Servidores...</div>;
  if (error) return <div className="alert error">{error}</div>;
  if (servidor.length === 0) return <div className="center">No hay Servidores registrados.</div>;

    // ------------------------------------------
    // Renderizado de la Lista (Aplicando el estilo de Torres)
    // ------------------------------------------
    return (
        // 🚨 Contenedor principal
        <div className="servidor-list-container">
            <h2>Listado de Servidores </h2>
            
   
            <ul className="servidor-list">
                {servidor.map((s) => (
       
                    <li key={s._id} className="servidor-card">
                        
            
                        <div className="servidor-info">
                            <strong>{s.nombre}</strong> 
                            <p>📍 Ubicación: {s.ubicacion}</p>
                            
                            {/* 🚨 Badge de Estado */}
                            <span className={`estado ${s.estado === 'Activo' ? 'activo' : 'inactivo'}`}>
                                {s.estado}
                            </span>
                        </div>
                        
                        {/* 🚨 Contenedor de Botones */}
                        {isAdmin && (
                            <div className="servidor-actions">
                                {/* Botón de Edición */}
                                <Link 
                                    to={`/servidores/editar/${s._id}`}
                                    className="btn edit"
                                >
                                    Editar
                                </Link>

                                {/* Botón de Eliminación */}
                                <button
                                    onClick={() => handleDeleteClick(s._id, s.nombre)}
                                    className="btn delete"
                                    disabled={loading}
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
        message={`¿Estás seguro de eliminar la Torre "${deleteServidor?.nombre}"?`}
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

export default ServidorListPage;