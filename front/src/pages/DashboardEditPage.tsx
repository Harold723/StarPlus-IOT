import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// 🔹 Modales reutilizables
import ModalConfirm from "../components/ModalConfirm";
import ModalProcessing from "../components/ModalProcessign";
import ModalResult from "../components/ModalResult";

import '../styles/EditDash.css';

interface EntityData {
  _id: string;
  nombre?: string;
  Nombre?: string;
  [key: string]: any;
}
interface TorreData extends EntityData {}
interface ServidorData extends EntityData {}
interface EquipoData extends EntityData {}
interface CardButtonFormState {
  label: string;
  dataValue: string;
  torreId: string | EntityData | null;
  servidorId: string | EntityData | null;
  equipoIds: (string | EntityData)[];
  selectedEntityType: 'Torre' | 'Servidor' | '';
}

const API_BASE = 'http://localhost:3000/api';
const AUTO_CLOSE_TIME = 5;

const DashboardEditPage: React.FC = () => {
  const { token } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<CardButtonFormState>({
    label: '',
    dataValue: '',
    torreId: null,
    servidorId: null,
    equipoIds: [],
    selectedEntityType: '',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [availableTorres, setAvailableTorres] = useState<TorreData[]>([]);
  const [availableServidores, setAvailableServidores] = useState<ServidorData[]>([]);
  const [availableEquipos, setAvailableEquipos] = useState<EquipoData[]>([]);

  // 🔹 Estados para modales
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

  // ---------------------------------------------------------
  // 🔹 CARGA DE DATOS INICIALES
  // ---------------------------------------------------------
  useEffect(() => {
    if (!token || !id) {
      setError("Token o ID faltante.");
      setLoading(false);
      return;
    }

    const config = { headers: { Authorization: `Bearer ${token}` } };
    const loadAllData = async () => {
      setLoading(true);
      try {
        const [torresRes, servidoresRes, equiposRes, buttonRes] = await Promise.all([
          axios.get(`${API_BASE}/torres`, config),
          axios.get(`${API_BASE}/servidores`, config),
          axios.get(`${API_BASE}/equipos`, config),
          axios.get(`${API_BASE}/dashboard/${id}`, config),
        ]);

        setAvailableTorres(torresRes.data);
        setAvailableServidores(servidoresRes.data);
        setAvailableEquipos(equiposRes.data);

        const data: CardButtonFormState = buttonRes.data;
        let initialType: CardButtonFormState['selectedEntityType'] = '';
        if (data.torreId) initialType = 'Torre';
        else if (data.servidorId) initialType = 'Servidor';

        setFormData({
          ...data,
          equipoIds: data.equipoIds || [],
          selectedEntityType: initialType,
        });
      } catch (err: any) {
        console.error("Error al cargar datos:", err);
        setError(err.response?.data?.message || "Error al cargar datos.");
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, [id, token]);

  // ---------------------------------------------------------
  // 🔹 MANEJADORES
  // ---------------------------------------------------------
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEntityTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const entityType = e.target.value as CardButtonFormState['selectedEntityType'];
    setFormData({
      ...formData,
      selectedEntityType: entityType,
      torreId: null,
      servidorId: null,
    });
  };

  const handleSpecificIdChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const type = formData.selectedEntityType;
    setFormData(prev => ({
      ...prev,
      torreId: type === 'Torre' ? value : null,
      servidorId: type === 'Servidor' ? value : null,
    }));
  };

  const handleEquipoSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    if (!selectedId) return;
    const selectedEquipo = availableEquipos.find(e => e._id === selectedId);
    if (selectedEquipo) {
      const already = (formData.equipoIds as (string | EntityData)[]).some(e =>
        (typeof e === 'object' ? e._id : e) === selectedId
      );
      if (!already)
        setFormData({ ...formData, equipoIds: [...formData.equipoIds, selectedEquipo] });
    }
  };

  const handleRemoveEquipo = (equipoIdToRemove: string) => {
    const updated = (formData.equipoIds as (string | EntityData)[]).filter(e =>
      (typeof e === 'object' ? e._id : e) !== equipoIdToRemove
    );
    setFormData({ ...formData, equipoIds: updated });
  };

  // ---------------------------------------------------------
  // 🔹 ENVÍO DEL FORMULARIO
  // ---------------------------------------------------------
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmVisible(true); // Mostrar confirmación antes de actualizar
  };

  const confirmSubmit = async () => {
    if (!token || !id) return;

    const config = { headers: { Authorization: `Bearer ${token}` } };
    const dataToSend = {
      label: formData.label,
      dataValue: formData.dataValue,
      torreId: formData.torreId && typeof formData.torreId === 'object' ? formData.torreId._id : formData.torreId,
      servidorId: formData.servidorId && typeof formData.servidorId === 'object' ? formData.servidorId._id : formData.servidorId,
      equipoIds: formData.equipoIds.map(e => typeof e === 'object' ? e._id : e),
    };

    setConfirmVisible(false);
    setIsProcessing(true);

    try {
      const response = await axios.put(`${API_BASE}/dashboard/${id}`, dataToSend, config);
      setResultModal({
        visible: true,
        message: `✅ Dashboard '${response.data.data.label}' actualizada con éxito.`,
        type: 'success',
      });
      setTimeout(() => navigate('/dashboard/lista'), 2000);
    } catch (err: any) {
      console.error("Error al actualizar:", err);
      setResultModal({
        visible: true,
        message: "❌ Error al actualizar el dashboard.",
        type: 'error',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const closeResultModal = () => setResultModal({ visible: false, message: '', type: null });

  // 🔹 Cierre automático del modal de resultado
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

  if (loading) return <div className="loading-message">Cargando datos...</div>;
  if (error) return <div className="error-message">{error}</div>;

  // ---------------------------------------------------------
  // 🔹 RENDER
  // ---------------------------------------------------------
  return (
    <div className="edit-container">
      <h2 className="edit-title">Editar Dashboard: {formData.label || id}</h2>

      <form onSubmit={handleSubmit} className="edit-form">
        <label className="form-label">
          Etiqueta:
          <input type="text" name="label" value={formData.label} onChange={handleTextChange} required className="form-input" />
        </label>
        <label className="form-label">
          Data Value:
          <input type="text" name="dataValue" value={formData.dataValue} onChange={handleTextChange} className="form-input" />
        </label>

        <hr className="separator" />

        <fieldset className="fieldset">
          <legend>Asociación Primaria</legend>
          <select name="selectedEntityType" value={formData.selectedEntityType} onChange={handleEntityTypeChange} className="form-input">
            <option value="">-- Seleccione tipo --</option>
            <option value="Torre">Torre</option>
            <option value="Servidor">Servidor</option>
          </select>

          {formData.selectedEntityType === 'Torre' && (
            <select value={formData.torreId as string || ''} onChange={handleSpecificIdChange} className="form-input">
              <option value="">Seleccione una Torre</option>
              {availableTorres.map(t => <option key={t._id} value={t._id}>{t.nombre}</option>)}
            </select>
          )}
          {formData.selectedEntityType === 'Servidor' && (
            <select value={formData.servidorId as string || ''} onChange={handleSpecificIdChange} className="form-input">
              <option value="">Seleccione un Servidor</option>
              {availableServidores.map(s => <option key={s._id} value={s._id}>{s.nombre}</option>)}
            </select>
          )}
        </fieldset>

        <hr className="separator" />

        <fieldset className="fieldset">
          <legend>Equipos Asignados</legend>
          <select onChange={handleEquipoSelection} value="" className="form-input">
            <option value="">Agregar equipo</option>
            {availableEquipos
              .filter(eq => !(formData.equipoIds as any[]).some(e => (typeof e === 'object' ? e._id : e) === eq._id))
              .map(eq => <option key={eq._id} value={eq._id}>{eq.nombre}</option>)}
          </select>

          <div className="assigned-list">
            {formData.equipoIds.map((eq, i) => {
              const id = typeof eq === 'object' ? eq._id : eq;
              const name = typeof eq === 'object' ? eq.Nombre : eq;
              return (
                <div key={i} className="equipo-item">
                  <span>{name}</span>
                  <button type="button" onClick={() => handleRemoveEquipo(id)} className="remove-button">Remover</button>
                </div>
              );
            })}
          </div>
        </fieldset>

        <button type="submit" className="submit-button">Guardar Cambios</button>
      </form>

      {/* 🔹 MODALES */}
      <ModalProcessing visible={isProcessing} />
      <ModalConfirm
        visible={confirmVisible}
        title="Confirmar actualización"
        message={`¿Deseas guardar los cambios del dashboard "${formData.label}"?`}
        onConfirm={confirmSubmit}
        onCancel={() => setConfirmVisible(false)}
        confirmLabel="Sí, guardar"
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

export default DashboardEditPage;
