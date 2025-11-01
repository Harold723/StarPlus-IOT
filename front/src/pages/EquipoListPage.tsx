
// EquipoListPage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; 
import { useAuth } from '../context/AuthContext'; 
import type { EquipoData } from '../types/EquipoD'; 

// 🔹 Modales reutilizables
import ModalConfirm from "../components/ModalConfirm";
import ModalProcessing from "../components/ModalProcessign";
import ModalResult from "../components/ModalResult";

import '../styles/EquipoList.css'; // Asegúrate que esta ruta sea correcta

const API_URL = 'http://localhost:3000/api/equipos';
const AUTO_CLOSE_TIME = 5;


const EquipoListPage: React.FC = () => {
    const [equipos, setEquipos] = useState<EquipoData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
     const [deleteEquipo, setDeleteEquipo] = useState<{id: string, nombre: string} | null>(null);
    

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
 
    // }
const [countdown, setCountdown] = useState(AUTO_CLOSE_TIME);

  // ------------------- CARGA DE TORRES -------------------
  const fetchEquipo = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setError('Autenticación requerida.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get<EquipoData[]>(API_URL, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setEquipos(response.data);
      setError('');
    } catch (err: any) {
      setError('Error al cargar los equipos.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    fetchEquipo();
  }, [fetchEquipo]);

  // ------------------- ELIMINAR TORRE -------------------
  const handleDeleteClick = (id: string, nombre: string) => {
    setDeleteEquipo({ id, nombre });
    setConfirmVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteEquipo || !token) return;
    setConfirmVisible(false);
    setIsProcessing(true);

    try {
      await axios.delete(`${API_URL}/${deleteEquipo.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setEquipos(prev => prev.filter(t => t._id !== deleteEquipo.id));

      setResultModal({ visible: true, message: `✅ Equipo "${deleteEquipo.nombre}" eliminado.`, type: 'success' });
    } catch {
      setResultModal({ visible: true, message: '❌ Error al eliminar. Verifica tu rol (debe ser admin).', type: 'error' });
    } finally {
      setIsProcessing(false);
      setDeleteEquipo(null);
    }
  };

  const handleCancelDelete = () => {
    setConfirmVisible(false);
    setDeleteEquipo(null);
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

  if (loading) return <div className="center">Cargando equipos...</div>;
  if (error) return <div className="alert error">{error}</div>;
  if (equipos.length === 0) return <div className="center">No hay equipos registrados.</div>;
    // ------------------------------------------
    // Renderizado de la Lista (Usando clases de lista)
    // ------------------------------------------
    return (
        // 🚨 Usamos la clase 'list-container' como contenedor principal
        <div className="list-container">
            <h2>Listado de Sensores </h2>
            
            {/* 🚨 Usamos la clase 'data-list' */}
            <ul className="data-list">
                {equipos.map((equipo) => (
                    // 🚨 Usamos la clase 'data-card'
                    <li key={equipo._id} className="data-card">
                        
                        {/* 🚨 Usamos la clase 'data-info' */}
                        <div className="data-info">
                            <strong>{equipo.Nombre}</strong> ({equipo.tipo})
                            <p>
                                Precio: Q {equipo.Precio.toFixed(2)} | 
                                {/* 🚨 Usamos la clase 'estado' con el modificador */}
                                <span className={`estado ${equipo.estado === 'Activo' ? 'activo' : 'inactivo'}`}>
                                    {equipo.estado}
                                </span>
                            </p>
                        </div>
                        
                        {isAdmin && (
                            // 🚨 Usamos la clase 'data-actions'
                            <div className="data-actions">
                                {/* 🚨 Usamos las clases 'btn edit' */}
                                <Link 
                                    to={`/equipos/editar/${equipo._id}`}
                                    className="btn edit"
                                >
                                    Editar
                                </Link>

                                {/* 🚨 Usamos las clases 'btn delete' */}
                                <button
                                    onClick={() => handleDeleteClick(equipo._id, equipo.Nombre)}
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
        message={`¿Estás seguro de eliminar la Torre "${deleteEquipo?.nombre}"?`}
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

export default EquipoListPage;