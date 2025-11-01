import React from "react";
import "../styles/modal.css";

interface ModalProcessingProps {
  visible: boolean;
  text?: string;
}

const ModalProcessing: React.FC<ModalProcessingProps> = ({
  visible,
  text = "Procesando su solicitud...",
}) => {
  if (!visible) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card processing-modal">
        <div className="modal-icon processing-icon"></div>
        <h2>Esperando</h2>
        <p>{text}</p>
      </div>
    </div>
  );
};

export default ModalProcessing;
