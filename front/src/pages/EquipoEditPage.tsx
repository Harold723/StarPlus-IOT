// EquipoEditPage.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import type { EquipoData, EquipoCreateData } from '../types/EquipoD'; 
// 🔹 Modales reutilizables
import ModalConfirm from "../components/ModalConfirm";
import ModalProcessing from "../components/ModalProcessign";
import ModalResult from "../components/ModalResult";
import '../styles/EditEquipo.css'; 

const API_URL = 'http://localhost:3000/api/equipos';
const AUTO_CLOSE_TIME = 5;

const EquipoEditPage: React.FC = () => {
    const { equipoId } = useParams<{ equipoId: string }>(); 
    const navigate = useNavigate();
    const { token, isAuthenticated } = useAuth();

    const [equipoData, setEquipoData] = useState<EquipoCreateData | null>(null);
    const [loading, setLoading] = useState(true);

    // 🔹 Estados de proceso y modales
    const [resultModal, setResultModal] = useState<{ 
        visible: boolean; message: string; type: "success" | "error" | null; 
    }>({ visible: false, message: '', type: null });
    const [isProcessing, setIsProcessing] = useState(false);
    const [confirmVisible, setConfirmVisible] = useState(false);
    const [countdown, setCountdown] = useState(AUTO_CLOSE_TIME);

    const initialEquipoState: EquipoCreateData = {
        Nombre: '',
        Precio: 0,
        tipo: '',
        estado: 'Activo',
    };

    // ------------------- Cargar datos del equipo -------------------
    useEffect(() => {
        if (!isAuthenticated || !token || !equipoId) {
            setLoading(false);
            setResultModal({ visible: true, message: 'Autenticación o ID de equipo faltante.', type: 'error' });
            return;
        }

        const fetchEquipo = async () => {
            try {
                const response = await axios.get<EquipoData>(
                    `${API_URL}/${equipoId}`, 
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setEquipoData({
                    Nombre: response.data.Nombre,
                    Precio: response.data.Precio,
                    tipo: response.data.tipo || '',
                    estado: response.data.estado || 'Activo',
                });
            } catch {
                setResultModal({ visible: true, message: 'No se pudo cargar el equipo. Verifique el ID.', type: 'error' });
            } finally {
                setLoading(false);
            }
        };

        fetchEquipo();
    }, [equipoId, isAuthenticated, token]);

    // ------------------- Manejo de inputs -------------------
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (!equipoData) return;
        const { id, value } = e.target;

        setEquipoData(prev => ({
            ...(prev as EquipoCreateData),
            [id]: id === 'Precio' ? Number(value) : value  // <-- convertir Precio a número
        }));
    };

    // ------------------- Guardar cambios (PUT) -------------------
    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!equipoData || !equipoId) return;

        if (!equipoData.Nombre || !equipoData.Precio || !equipoData.tipo) {
            setResultModal({ visible: true, message: 'Nombre, Precio y Tipo son obligatorios.', type: 'error' });
            return;
        }

        setIsProcessing(true);
        try {
            await axios.put(`${API_URL}/${equipoId}`, equipoData, { headers: { Authorization: `Bearer ${token}` } });
            setResultModal({ visible: true, message: '✅ ¡Equipo actualizado exitosamente!', type: 'success' });
        } catch {
            setResultModal({ visible: true, message: '❌ Error al actualizar el equipo. Verifica tu rol.', type: 'error' });
        } finally {
            setIsProcessing(false);
        }
    };

    // ------------------- Eliminar equipo -------------------
    const handleDeleteClick = () => setConfirmVisible(true);

    const handleConfirmDelete = async () => {
        if (!equipoData || !token) return;
        setConfirmVisible(false);
        setIsProcessing(true);

        try {
            await axios.delete(`${API_URL}/${equipoId}`, { headers: { Authorization: `Bearer ${token}` } });
            setResultModal({ visible: true, message: ' Equipo eliminado. Redirigiendo...', type: 'success' });
            setTimeout(() => navigate('/equipos'), 2000);
        } catch {
            setResultModal({ visible: true, message: '❌ Error al eliminar el equipo. Verifica tu rol.', type: 'error' });
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

    if (loading) return <div className="center">Cargando datos del equipo...</div>;
    if (!equipoData) return <div className="center">Equipo no encontrado.</div>;

    // ------------------- Renderizado -------------------
    return (
        <div className="page-container">
            <ModalProcessing visible={isProcessing} />
            <ModalConfirm
                visible={confirmVisible}
                title="Confirmar eliminación"
                message={`¿Estás seguro de eliminar el equipo "${equipoData.Nombre}"?`}
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

            <div className="form-card">
                <h2>Editar Equipo: {equipoData.Nombre}</h2>
                <p>ID: {equipoId}</p>

                <form onSubmit={handleUpdate} className="form-group">
                    <div>
                        <label htmlFor="Nombre">Nombre del Equipo:</label>
                        <input
                            id="Nombre"
                            type="text"
                            value={equipoData.Nombre}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="Precio">Precio de Adquisición:</label>
                        <input
                            id="Precio"
                            type="number"
                            value={equipoData.Precio}
                            onChange={handleChange}
                            required
                            min="1"
                        />
                    </div>

                    <div>
                        <label htmlFor="tipo">Tipo de Equipo:</label>
                        <select
                            id="tipo"
                            value={equipoData.tipo}
                            onChange={handleChange}
                            required
                        >
                            <option value="">-- Seleccione un tipo --</option>
                            <option value="Sensor">Sensor</option>
                            <option value="Microcontrolador">Microcontrolador</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="estado">Estado:</label>
                        <select
                            id="estado"
                            value={equipoData.estado}
                            onChange={handleChange}
                            required
                        >
                            <option value="Activo">Activo</option>
                            <option value="Inactivo">Inactivo</option>
                        </select>
                    </div>

                    <div className="btn-group">
                        <button type="submit" className="btn-form btn-primary" disabled={loading}>
                            {loading ? 'Actualizando...' : 'Guardar Cambios'}
                        </button>
                        <button
                            type="button"
                            className="btn-form btn-danger"
                            onClick={handleDeleteClick}
                            disabled={loading}
                        >
                            {loading ? 'Eliminando...' : 'Eliminar Equipo Permanentemente'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EquipoEditPage;
