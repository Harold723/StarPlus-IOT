
// export default DashboardCardPreview;
import React from "react";

import '../styles/dashboardPreview.css'; 

interface DashboardCardPreviewProps {
  label: string;
  actionType: string;
  dataValue?: string;
  torreId?: { _id: string; nombre?: string } | null;
  servidorId?: { _id: string; nombre?: string } | null;
  equipoIds?: { _id: string; Nombre?: string }[];
  onExecute?: () => void;
}

const DashboardCardPreview: React.FC<DashboardCardPreviewProps> = ({
  label,
  actionType,
  dataValue,
  torreId,
  servidorId,
  equipoIds = [],
  onExecute,
}) => {
  // Los estilos en línea ahora están en el archivo CSS y se usan como className.
  // El código de estilos en línea se elimina, lo que hace el componente más limpio.

  return (
    // Clase principal para la tarjeta
    <div className="dashboard-card">
      
      {/* Título */}
      <div className="dashboard-card-title">{label || "Sin nombre"}</div>
      
      {/* Etiqueta de Acción */}
      {/* <div className="dashboard-card-badge">{actionType}</div> */}

      {/* --- Información Detallada --- */}

      {torreId && (
        <div className="dashboard-card-info">
          Torre: <strong>{torreId.nombre || torreId._id}</strong>
        </div>
      )}

      {servidorId && (
        <div className="dashboard-card-info">
          Servidor: <strong>{servidorId.nombre || servidorId._id}</strong>
        </div>
      )}
      
      {/* {dataValue && (
        <div className="dashboard-card-info">
          Valor de Dato: <strong>{dataValue}</strong>
        </div>
      )} */}

      {equipoIds && equipoIds.length > 0 && (
        <div className="dashboard-card-info">
          Equipos:
          {/* Lista de equipos */}
          <ul className="dashboard-card-list">
            {equipoIds.map((eq) => (
              <li key={eq._id}>{eq.Nombre || `ID: ${eq._id}`}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Botón */}
      {onExecute && (
        <button className="dashboard-card-button" onClick={onExecute}>
          Ver Dashboard
        </button>
      )}
    </div>
  );
};

export default DashboardCardPreview;
