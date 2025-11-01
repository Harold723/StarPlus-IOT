import React from "react";
import "../styles/modal.css";

interface ModalConfirmProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: "delete" | "confirm";
}

const ModalConfirm: React.FC<ModalConfirmProps> = ({
  visible,
  title,
  message,
  confirmLabel = "Aceptar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
  type = "confirm",
}) => {
  if (!visible) return null;

  return (
    <div className="modal-overlay">
      <div
        className={`modal-card confirmation-modal ${
          type === "delete" ? "delete-modal" : ""
        }`}
      >
        <div className="modal-icon confirm-icon">
          {type === "delete" ? "⚠️" : "🔁"}
        </div>
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="modal-buttons">
          <button
            className={`btn ${type === "delete" ? "btn-danger" : "btn-accept"}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
          <button className="btn btn-cancel" onClick={onCancel}>
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirm;
