
// export default ServidorEditPage;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom'; // Aseguramos Link
import { useAuth } from '../context/AuthContext'; 
import type { servidorData, ServidorCreateData } from '../types/ServidorD'; 
import ModalConfirm from "../components/ModalConfirm";
import ModalProcessing from "../components/ModalProcessign";
import ModalResult from "../components/ModalResult";
import '../styles/EditServidor.css'


const API_URL = 'http://localhost:3000/api/servidores';
const AUTO_CLOSE_TIME = 5;

const ServidorEditPage: React.FC = () => {
    // 1. LEER EL ID DE LA RUTA: Espera el parámetro definido como :servidorId
    const { servidorId } = useParams<{ servidorId: string }>(); 
    const navigate = useNavigate();
    const { token, isAuthenticated } = useAuth();

    // Estado para guardar los datos del Servidor a editar
    const [servidorData, setServidorData] = useState<ServidorCreateData | null>(null); 
    const [loading, setLoading] = useState(true);
    const [deleteServidor, setDeleteServidor] = useState<boolean>(false);

    //estados de modales y procesos
      const [resultModal, setResultModal] = useState<{ 
        visible: boolean; message: string; type: "success" | "error" | null; }>({ visible: false, message: '', type: null });
      const [isProcessing, setIsProcessing] = useState(false);
      const [confirmVisible, setConfirmVisible] = useState(false);
      const [countdown, setCountdown] = useState(AUTO_CLOSE_TIME);

    // Estado inicial para la estructura del objeto de edición (no usado directamente en el renderizado, solo como referencia)
    const initialServidorState: ServidorCreateData = {
        nombre: '',
        ubicacion: '',
        estado: 'Activo'
    };

  // ------------------- Cargar datos de torre -------------------
  useEffect(() => {
    if (!isAuthenticated || !token || !servidorId) {
      setLoading(false);
      setResultModal({ visible: true, message: 'Autenticación o ID de servidor faltante.', type: 'error' });
      return;
    }

    const fetchTorre = async () => {
      try {
        const response = await axios.get<servidorData>(`${API_URL}/${servidorId}`, { headers: { Authorization: `Bearer ${token}` } });
        setServidorData({
          nombre: response.data.nombre,
          ubicacion: response.data.ubicacion,
          estado: response.data.estado || 'Activo',
        });
      } catch {
        setResultModal({ visible: true, message: 'No se pudo cargar el servidor. Verifique el ID.', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchTorre();
  }, [servidorId, isAuthenticated, token]);

  // ------------------- Manejo de inputs -------------------
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!servidorData) return;
    const { id, value } = e.target;
    setServidorData(prev => ({ ...(prev as ServidorCreateData), [id]: value }));
  };

  // ------------------- Guardar cambios (PUT) -------------------
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!servidorData || !servidorId) return;
    if (!servidorData.nombre || !servidorData.ubicacion) {
      setResultModal({ visible: true, message: 'Nombre y Ubicación son obligatorios.', type: 'error' });
      return;
    }

    setIsProcessing(true);
    try {
      await axios.put(`${API_URL}/${servidorId}`, servidorData, { headers: { Authorization: `Bearer ${token}` } });
      setResultModal({ visible: true, message: '✅ ¡Servidor actualizado exitosamente!', type: 'success' });
    } catch {
      setResultModal({ visible: true, message: '❌ Error al actualizar el servidor. Verifica tu rol.', type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  // ------------------- Eliminar torre -------------------
  const handleDeleteClick = () => setConfirmVisible(true);

  const handleConfirmDelete = async () => {
    if (!servidorId|| !token) return;
    setConfirmVisible(false);
    setIsProcessing(true);

    try {
      await axios.delete(`${API_URL}/${servidorId}`, { headers: { Authorization: `Bearer ${token}` } });
      setResultModal({ visible: true, message: '🗑️ Servidor eliminada. Redirigiendo...', type: 'success' });
      setTimeout(() => navigate('/torres'), 2000);
    } catch {
      setResultModal({ visible: true, message: '❌ Error al eliminar el Servidor. Verifica tu rol.', type: 'error' });
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

  if (loading) return <div className="center">Cargando datos del Servidor...</div>;
  if (!servidorData) return <div className="center">Servidor no encontrada.</div>;


    return (
        <div className="servidor-edit-container">
            <div className="servidor-edit-card">
                <h2>Editar Servidor: {servidorData.nombre}</h2>
                <p className="edit-id">ID de edición: {servidorId}</p>
                
                <form onSubmit={handleUpdate} className="servidor-form">
                    
                    {/* Campo 1: Nombre */}
                    <div>
                        <label htmlFor="nombre">Nombre del servidor:</label>
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
                        <label htmlFor="estado">Estado:</label>
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
                        disabled={loading} 
                        className="servidor-btn servidor-btn-primary"
                    >
                        {loading ? 'Actualizando...' : 'Guardar Cambios'}
                    </button>
                </form>

                <button 
                    onClick={handleDeleteClick}
                    disabled={loading} 
                    className="servidor-btn servidor-btn-danger"
                >
                    {loading ? 'Eliminando...' : 'Eliminar Servidor'}
                </button>
            </div>
            
      {/* --- MODALES --- */}
      <ModalProcessing visible={isProcessing} />
      <ModalConfirm
        visible={confirmVisible}
        title="Confirmar eliminación"
        message={`¿Desea eliminar la torre "${servidorData.nombre}"?`}
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

export default ServidorEditPage;