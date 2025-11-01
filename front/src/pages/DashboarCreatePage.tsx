// // 
// // export default CardButtonCreatePage;
// import React, { useState, useEffect, useCallback  } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import DashboardCardPreview from '../components/DashboardCardPreview';
// import type { DashboardDCreateData } from '../types/DashboardD';
// import type { TorreData } from '../types/TorreD';
// import type { servidorData } from '../types/ServidorD';
// import type { EquipoData } from '../types/EquipoD';
// // 🔹 Modales reutilizables
// import ModalConfirm from "../components/ModalConfirm";
// import ModalProcessing from "../components/ModalProcessign";
// import ModalResult from "../components/ModalResult";

// import '../styles/DashForm.css';

// const API_BASE = 'http://localhost:3000/api';

// interface CardButtonFormState extends Omit<DashboardDCreateData, 'actionType'> {
//   equipoIds: string[];
//   selectedEntityType: 'Torre' | 'Servidor' | '';
// }

// const CardButtonCreatePage: React.FC = () => {
//   const { token } = useAuth();
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState<CardButtonFormState>({
//     label: '',
//     dataValue: '',
//     torreId: null,
//     servidorId: null,
//     equipoIds: [],
//     selectedEntityType: ''
//   });

//   const [torres, setTorres] = useState<TorreData[]>([]);
//   const [servidores, setServidores] = useState<servidorData[]>([]);
//   const [equipos, setEquipos] = useState<EquipoData[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [successMessage, setSuccessMessage] = useState<string | null>(null);


//     // 🔹 Estados de proceso y modales
//     const [isProcessing, setIsProcessing] = useState(false);
//     const [confirmVisible, setConfirmVisible] = useState(false);
//     const [resultModal, setResultModal] = useState<{
//       visible: boolean;
//       message: string;
//       type: "success" | "error" | null;
//     }>({
//       visible: false,
//       message: "",
//       type: null,
//     });
  

//   // ------------------- CARGA INICIAL -------------------
//   useEffect(() => {
//     const fetchAllEntities = async () => {
//       if (!token) {
//         setError('No autenticado.');
//         setLoading(false);
//         return;
//       }

//       const config = { headers: { Authorization: `Bearer ${token}` } };
//       setLoading(true);

//       try {
//         const [torresRes, servidoresRes, equiposRes] = await Promise.all([
//           axios.get(`${API_BASE}/torres`, config),
//           axios.get(`${API_BASE}/servidores`, config),
//           axios.get(`${API_BASE}/equipos`, config)
//         ]);

//         setTorres(torresRes.data);
//         setServidores(servidoresRes.data);
//         setEquipos(equiposRes.data);
//       } catch (err: any) {
//         console.error('Error fetching entities:', err.message);
//         setError('Error al cargar las listas de entidades.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAllEntities();
//   }, [token]);

//   // ------------------- HANDLERS -------------------
//   const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value } as CardButtonFormState));
//   };

//   const handleEntityTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     const entityType = e.target.value as CardButtonFormState['selectedEntityType'];
//     setFormData({
//       ...formData,
//       selectedEntityType: entityType,
//       torreId: null,
//       servidorId: null
//     });
//   };

//   const handleSpecificIdChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     const value = e.target.value;
//     const type = formData.selectedEntityType;
//     setFormData(prev => ({
//       ...prev,
//       torreId: type === 'Torre' ? value : null,
//       servidorId: type === 'Servidor' ? value : null
//     }));
//   };

//   const handleEquipoIdsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     const selectedIds = Array.from(e.target.selectedOptions, option => option.value);
//     setFormData(prev => ({
//       ...prev,
//       equipoIds: selectedIds
//     }));
//   };

//   // ------------------- ENVÍO -------------------
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError(null);
//     setSuccessMessage(null);
//     setLoading(true);

//     if (!token) {
//       setError('Debe iniciar sesión.');
//       setLoading(false);
//       return;
//     }

//     if (!formData.label) {
//       setError('La etiqueta es obligatoria.');
//       setLoading(false);
//       return;
//     }

//     if (!formData.torreId && !formData.servidorId && formData.equipoIds.length === 0) {
//       setError('Debe seleccionar al menos una entidad.');
//       setLoading(false);
//       return;
//     }

//     const finalDataToSend: DashboardDCreateData = {
//       label: formData.label,
//       actionType: 'submit',
//       dataValue: formData.dataValue || '',
//       torreId: null,
//       servidorId: null,
//       equipoIds: formData.equipoIds
//     };

//     if (formData.selectedEntityType === 'Torre' && formData.torreId) {
//       finalDataToSend.torreId = formData.torreId;
//     } else if (formData.selectedEntityType === 'Servidor' && formData.servidorId) {
//       finalDataToSend.servidorId = formData.servidorId;
//     }

//     const config = { headers: { Authorization: `Bearer ${token}` } };

//     try {
//       const res = await axios.post(`${API_BASE}/dashboard`, finalDataToSend, config);
//       setSuccessMessage(res.data.message || 'Card Button creado exitosamente.');

//       setFormData({
//         label: '',
//         dataValue: '',
//         torreId: null,
//         servidorId: null,
//         equipoIds: [],
//         selectedEntityType: ''
//       });
//     } catch (err: any) {
//       console.error('Error al crear:', err);
//       setError(err.response?.data?.message || 'Error al crear el Card Button.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ------------------- FUNCIÓN NUEVA -------------------
//   const generatePreviewDataValue = () => {
//     if (formData.dataValue) return formData.dataValue;

//     const selectedTorre = torres.find(t => t._id === formData.torreId);
//     const selectedServidor = servidores.find(s => s._id === formData.servidorId);
//     const selectedEquipos = equipos.filter(e => formData.equipoIds.includes(e._id));

//     const result: any = {};

//     if (selectedTorre) result.Torre = selectedTorre.nombre;
//     if (selectedServidor) result.Servidor = selectedServidor.nombre;
//     if (selectedEquipos.length > 0) {
//       result.Equipos = selectedEquipos.map(e => e.Nombre || e._id);
//     }

//     if (Object.keys(result).length === 0) return 'Sin valor asignado';

//     return result;
//   };

//   if (loading) return <div>Cargando listas de entidades...</div>;

//   // ------------------- RENDER -------------------
//   return (
//     <div className="create-page-container">
//       <div className="form-card">
//         <h2>Crear Nuevo Dashboard</h2>
//         {successMessage && <div className="message-success">{successMessage}</div>}
//         {error && <div className="message-error">{error}</div>}

//         <form onSubmit={handleSubmit}>
//           <div className="form-group">
//             <label>Nombre:</label>
//             <input
//               type="text"
//               name="label"
//               value={formData.label}
//               onChange={handleTextChange}
//               required
//               className="form-input"
//             />
//           </div>

//           <div className="form-group">
//             <label>Link:</label>
//             <input
//               type="text"
//               name="dataValue"
//               value={formData.dataValue}
//               onChange={handleTextChange}
//               placeholder="Ej: link, comando, etc."
//               className="form-input"
//             />
//           </div>

//           <fieldset className="form-fieldset">
//             <legend>Torres/Servidores</legend>
//             <div className="form-group">
//               <select
//                 name="selectedEntityType"
//                 value={formData.selectedEntityType}
//                 onChange={handleEntityTypeChange}
//                 className="form-select"
//               >
//                 <option value="">Seleccione el tipo</option>
//                 <option value="Torre">Torre</option>
//                 <option value="Servidor">Servidor</option>
//               </select>
//             </div>

//             {formData.selectedEntityType === 'Torre' && (
//               <div className="form-group">
//                 <label>Seleccionar Torre:</label>
//                 <select
//                   name="torreId"
//                   value={formData.torreId || ''}
//                   onChange={handleSpecificIdChange}
//                   required
//                   className="form-select"
//                 >
//                   <option value="">Seleccione una Torre</option>
//                   {torres.map(t => (
//                     <option key={t._id} value={t._id}>
//                       {t.nombre}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             )}

//             {formData.selectedEntityType === 'Servidor' && (
//               <div className="form-group">
//                 <label>Seleccionar Servidor:</label>
//                 <select
//                   name="servidorId"
//                   value={formData.servidorId || ''}
//                   onChange={handleSpecificIdChange}
//                   required
//                   className="form-select"
//                 >
//                   <option value="">Seleccione un Servidor</option>
//                   {servidores.map(s => (
//                     <option key={s._id} value={s._id}>
//                       {s.nombre}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             )}
//           </fieldset>

//           <fieldset className="form-fieldset">
//             <legend>Equipos</legend>
//             <div className="form-group">
//               <select
//                 name="equipoIds"
//                 value={formData.equipoIds}
//                 onChange={handleEquipoIdsChange}
//                 multiple
//                 className="form-select form-select-multiple"
//               >
//                 {equipos.map(e => (
//                   <option key={e._id} value={e._id}>
//                     {e.Nombre || e._id}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </fieldset>

//           <button type="submit" disabled={loading} className="btn-submit">
//             {loading ? 'Creando...' : 'Crear'}
//           </button>
//         </form>
//       </div>

//       <div className="preview-container">
//         <h3>Vista Previa</h3>
//         <DashboardCardPreview
//           label={formData.label}
//           actionType={'submit'}
//           dataValue={generatePreviewDataValue()}
//         />
//       </div>
//     </div>
//   );
// };

// export default CardButtonCreatePage;
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardCardPreview from '../components/DashboardCardPreview';
import type { DashboardDCreateData } from '../types/DashboardD';
import type { TorreData } from '../types/TorreD';
import type { servidorData } from '../types/ServidorD';
import type { EquipoData } from '../types/EquipoD';

// 🔹 Modales reutilizables
import ModalConfirm from "../components/ModalConfirm";
import ModalProcessing from "../components/ModalProcessign";
import ModalResult from "../components/ModalResult";

import '../styles/DashForm.css';

const API_BASE = 'http://localhost:3000/api';
const AUTO_CLOSE_TIME = 5; // segundos para cerrar automáticamente el modal de resultado

interface CardButtonFormState extends Omit<DashboardDCreateData, 'actionType'> {
  equipoIds: string[];
  selectedEntityType: 'Torre' | 'Servidor' | '';
}

const CardButtonCreatePage: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<CardButtonFormState>({
    label: '',
    dataValue: '',
    torreId: null,
    servidorId: null,
    equipoIds: [],
    selectedEntityType: ''
  });

  const [torres, setTorres] = useState<TorreData[]>([]);
  const [servidores, setServidores] = useState<servidorData[]>([]);
  const [equipos, setEquipos] = useState<EquipoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // ------------------- CARGA INICIAL -------------------
  useEffect(() => {
    const fetchAllEntities = async () => {
      if (!token) {
        setError('No autenticado.');
        setLoading(false);
        return;
      }

      const config = { headers: { Authorization: `Bearer ${token}` } };
      setLoading(true);

      try {
        const [torresRes, servidoresRes, equiposRes] = await Promise.all([
          axios.get(`${API_BASE}/torres`, config),
          axios.get(`${API_BASE}/servidores`, config),
          axios.get(`${API_BASE}/equipos`, config)
        ]);

        setTorres(torresRes.data);
        setServidores(servidoresRes.data);
        setEquipos(equiposRes.data);
      } catch (err: any) {
        console.error('Error fetching entities:', err.message);
        setError('Error al cargar las listas de entidades.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllEntities();
  }, [token]);

  // ------------------- HANDLERS -------------------
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value } as CardButtonFormState));
  };

  const handleEntityTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const entityType = e.target.value as CardButtonFormState['selectedEntityType'];
    setFormData({ ...formData, selectedEntityType: entityType, torreId: null, servidorId: null });
  };

  const handleSpecificIdChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const type = formData.selectedEntityType;
    setFormData(prev => ({
      ...prev,
      torreId: type === 'Torre' ? value : null,
      servidorId: type === 'Servidor' ? value : null
    }));
  };

  const handleEquipoIdsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIds = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({ ...prev, equipoIds: selectedIds }));
  };

  // ------------------- ENVÍO -------------------
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.label) {
      setError('La etiqueta es obligatoria.');
      return;
    }

    if (!formData.torreId && !formData.servidorId && formData.equipoIds.length === 0) {
      setError('Debe seleccionar al menos una entidad.');
      return;
    }

    // Abrimos modal de confirmación antes de enviar
    setConfirmVisible(true);
  };

  const handleConfirmRegister = async () => {
    setConfirmVisible(false);
    setIsProcessing(true);
    setError('');

    const finalDataToSend: DashboardDCreateData = {
      label: formData.label,
      actionType: 'submit',
      dataValue: formData.dataValue || '',
      torreId: formData.selectedEntityType === 'Torre' ? formData.torreId : null,
      servidorId: formData.selectedEntityType === 'Servidor' ? formData.servidorId : null,
      equipoIds: formData.equipoIds
    };

    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      const res = await axios.post(`${API_BASE}/dashboard`, finalDataToSend, config);

      setResultModal({
        visible: true,
        message: res.data.message || 'Card Button creado exitosamente.',
        type: 'success'
      });

      setFormData({
        label: '',
        dataValue: '',
        torreId: null,
        servidorId: null,
        equipoIds: [],
        selectedEntityType: ''
      });
    } catch (err: any) {
      console.error('Error al crear:', err);
      setResultModal({
        visible: true,
        message: err.response?.data?.message || 'Error al crear el Card Button.',
        type: 'error'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelRegister = () => {
    setConfirmVisible(false);
  };

  const closeResultModal = useCallback(() => {
    setResultModal({ visible: false, message: '', type: null });
  }, []);

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
  }, [resultModal.visible, resultModal.type, closeResultModal]);

  // ------------------- PREVIEW -------------------
  const generatePreviewDataValue = () => {
    if (formData.dataValue) return formData.dataValue;

    const selectedTorre = torres.find(t => t._id === formData.torreId);
    const selectedServidor = servidores.find(s => s._id === formData.servidorId);
    const selectedEquipos = equipos.filter(e => formData.equipoIds.includes(e._id));

    const result: any = {};
    if (selectedTorre) result.Torre = selectedTorre.nombre;
    if (selectedServidor) result.Servidor = selectedServidor.nombre;
    if (selectedEquipos.length > 0) result.Equipos = selectedEquipos.map(e => e.Nombre || e._id);

    return Object.keys(result).length ? result : 'Sin valor asignado';
  };

  if (loading) return <div>Cargando listas de entidades...</div>;

  // ------------------- RENDER -------------------
  return (
    <div className="create-page-container">
      <div className="form-card">
        <h2>Crear Nuevo Dashboard</h2>
        {error && <div className="message-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre:</label>
            <input
              type="text"
              name="label"
              value={formData.label}
              onChange={handleTextChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Link:</label>
            <input
              type="text"
              name="dataValue"
              value={formData.dataValue}
              onChange={handleTextChange}
              placeholder="Ej: link, comando, etc."
              className="form-input"
            />
          </div>

          <fieldset className="form-fieldset">
            <legend>Torres/Servidores</legend>
            <div className="form-group">
              <select
                name="selectedEntityType"
                value={formData.selectedEntityType}
                onChange={handleEntityTypeChange}
                className="form-select"
              >
                <option value="">Seleccione el tipo</option>
                <option value="Torre">Torre</option>
                <option value="Servidor">Servidor</option>
              </select>
            </div>

            {formData.selectedEntityType === 'Torre' && (
              <div className="form-group">
                <label>Seleccionar Torre:</label>
                <select
                  name="torreId"
                  value={formData.torreId || ''}
                  onChange={handleSpecificIdChange}
                  required
                  className="form-select"
                >
                  <option value="">Seleccione una Torre</option>
                  {torres.map(t => (
                    <option key={t._id} value={t._id}>{t.nombre}</option>
                  ))}
                </select>
              </div>
            )}

            {formData.selectedEntityType === 'Servidor' && (
              <div className="form-group">
                <label>Seleccionar Servidor:</label>
                <select
                  name="servidorId"
                  value={formData.servidorId || ''}
                  onChange={handleSpecificIdChange}
                  required
                  className="form-select"
                >
                  <option value="">Seleccione un Servidor</option>
                  {servidores.map(s => (
                    <option key={s._id} value={s._id}>{s.nombre}</option>
                  ))}
                </select>
              </div>
            )}
          </fieldset>

          <fieldset className="form-fieldset">
            <legend>Equipos</legend>
            <div className="form-group">
              <select
                name="equipoIds"
                value={formData.equipoIds}
                onChange={handleEquipoIdsChange}
                multiple
                className="form-select form-select-multiple"
              >
                {equipos.map(e => (
                  <option key={e._id} value={e._id}>{e.Nombre || e._id}</option>
                ))}
              </select>
            </div>
          </fieldset>

          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? 'Creando...' : 'Crear'}
          </button>
        </form>
      </div>

      <div className="preview-container">
        <h3>Vista Previa</h3>
        <DashboardCardPreview
          label={formData.label}
          actionType={'submit'}
          dataValue={generatePreviewDataValue()}
        />
      </div>

      {/* --- MODALES --- */}
      <ModalProcessing visible={isProcessing} />

      <ModalConfirm
        visible={confirmVisible}
        title="Confirmar registro"
        message={`¿Estás seguro de crear el Card Button "${formData.label}"?`}
        onConfirm={handleConfirmRegister}
        onCancel={handleCancelRegister}
        confirmLabel="Sí, crear"
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

export default CardButtonCreatePage;
