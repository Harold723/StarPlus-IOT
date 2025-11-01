import React from "react";
import "../styles/modal.css";

interface ModalResultProps {
  visible: boolean;
  type: "success" | "error" | null;
  message: string;
  countdown?: number;
  onClose: () => void;
}

const ModalResult: React.FC<ModalResultProps> = ({
  visible,
  type,
  message,
  countdown,
  onClose,
}) => {
  if (!visible) return null;

  return (
    <div className="modal-overlay">
      <div className={`modal-card result-modal ${type}`}>
        <div className={`modal-icon ${type}-icon`}>
          {type === "success" ? "✅" : "❌"}
        </div>
        <h2>{type === "success" ? "Éxito" : "Error"}</h2>
        <p>{message}</p>

        {countdown && countdown > 0 && (
          <p className="countdown-message">
            Se cerrará automáticamente en {countdown} segundos...
          </p>
        )}

        <div className="modal-buttons">
          <button className="btn btn-ok" onClick={onClose}>
            {countdown && countdown > 0 ? "Aceptar" : "Cerrar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalResult;
