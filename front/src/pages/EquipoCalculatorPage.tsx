
// export default EquipoCalculatorPage;

import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import { useAuth } from "../context/AuthContext";
import type { EquipoData } from "../types/EquipoD";
import "../styles/Calculator.css";

const API_URL = "http://localhost:3000/api/equipos";

const EquipoCalculatorPage: React.FC = () => {
  const { token, isAuthenticated } = useAuth();
  const [equipos, setEquipos] = useState<EquipoData[]>([]);
  const [seleccionados, setSeleccionados] = useState<EquipoData[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [error, setError] = useState("");


  const fetchEquipos = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setError("Debes iniciar sesión para usar la calculadora.");
      return;
    }

    try {
      const res = await axios.get<EquipoData[]>(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEquipos(res.data.filter((eq) => eq.estado === "Activo"));
      setError("");
    } catch (err) {
      setError("Error al cargar los equipos disponibles.");
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    fetchEquipos();
  }, [fetchEquipos]);

  //  Agregar equipo
  const agregarEquipo = (equipo: EquipoData) => {
    setSeleccionados((prev) => [...prev, equipo]);
    setTotal((prev) => prev + equipo.Precio);
  };

  //  Quitar equipo
  const quitarEquipo = (index: number) => {
    const equipo = seleccionados[index];
    setSeleccionados((prev) => prev.filter((_, i) => i !== index));
    setTotal((prev) => prev - equipo.Precio);
  };

  //   PDF membretado STAR PLUS
  const generarPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

   
    const azulStar: [number, number, number] = [0, 80, 160];
    const blanco: [number, number, number] = [255, 255, 255];


    //  ENCABEZADO MEMBRETADO
    
    doc.setFillColor(...azulStar);
    doc.rect(0, 0, pageWidth, 35, "F");

    
    // const logoUrl = "/img/Star Plus."; 
    // doc.addImage(logoUrl, "JPG", 10, 5, 25, 25); 

    //🔹 Título empresa
    doc.setTextColor(...blanco);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("STAR PLUS", 40, 15);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("Cotización de Equipos", 40, 25);

    // Fecha
    doc.setFontSize(10);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, pageWidth - 45, 15);

    // Línea divisoria
    doc.setDrawColor(...azulStar);
    doc.setLineWidth(0.5);
    doc.line(10, 38, pageWidth - 10, 38);

    //  CONTENIDO PRINCIPAL
  
    let y = 50;
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Detalle de Equipos Cotizados", 10, y);
    y += 10;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    seleccionados.forEach((eq, i) => {
      doc.text(`${i + 1}. ${eq.Nombre} (${eq.tipo}) — Q${eq.Precio.toFixed(2)}`, 15, y);
      y += 8;
    });

    y += 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...azulStar);
    doc.text(`TOTAL: Q${total.toFixed(2)}`, 15, y);

   
    //  PIE DE PÁGINA
 
    const footerY = pageHeight - 20;
    doc.setDrawColor(...azulStar);
    doc.line(10, footerY - 5, pageWidth - 10, footerY - 5);

    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(80, 80, 80);
    doc.text(
      "Star Plus — Porque Petén Se Merece Más. | (502) 7926-3365",
      pageWidth / 2,
      footerY,
      { align: "center" }
    );

    //  Guardar PDF
    doc.save("cotizacion_starplus.pdf");
  };

  return (
    <div className="calculator-container">
      <h2> Calculadora de Equipos </h2>

      {error && <div className="message-error">{error}</div>}

      {/* Sección de equipos disponibles */}
      <div className="available-section">
        <h3>Equipos Disponibles para Cotización</h3>
        {equipos.length === 0 && !error ? (
          <div className="center">No hay equipos activos disponibles.</div>
        ) : (
          <ul className="available-list">
            {equipos.map((eq) => (
              <li key={eq._id} className="item-card">
                <div className="item-info">
                  <strong>{eq.Nombre}</strong> ({eq.tipo}) —{" "}
                  <span>Q{eq.Precio.toFixed(2)}</span>
                </div>
                <button
                  onClick={() => agregarEquipo(eq)}
                  className="btn-calculator btn-add"
                >
                  ➕ Agregar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Tabla de equipos seleccionados */}
      <div className="selected-table-section">
        <h3>Equipos Seleccionados ({seleccionados.length})</h3>
        {seleccionados.length === 0 ? (
          <p className="center">No has agregado ningún equipo aún.</p>
        ) : (
          <table className="selected-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Precio (Q)</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {seleccionados.map((eq, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{eq.Nombre}</td>
                  <td>{eq.tipo}</td>
                  <td>{eq.Precio.toFixed(2)}</td>
                  <td>
                    <button
                      onClick={() => quitarEquipo(i)}
                      className="btn-calculator btn-remove"
                    >
                      ➖ Quitar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Total y botón PDF */}
      <div className="total-section">
        <h3>Total: Q{total.toFixed(2)}</h3>
        {seleccionados.length > 0 && (
          <button onClick={generarPDF} className="btn-pdf">
             Descargar PDF de Cotización
          </button>
        )}
      </div>
    </div>
  );
};

export default EquipoCalculatorPage;