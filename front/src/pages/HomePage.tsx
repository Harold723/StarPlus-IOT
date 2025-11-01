

// export default HomePage;
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import DashboardCardPreview from "../components/DashboardCardPreview";

// URL base de tu API
const API_BASE = "http://localhost:3000/api";

interface CardButtonData {
  _id: string;
  label: string;
  actionType: string;
  dataValue?: string;
  torreId?: { _id: string; nombre?: string } | null;
  servidorId?: { _id: string; nombre?: string } | null;
  equipoIds?: { _id: string; nombre?: string }[];
}

const HomePage: React.FC = () => {
  const { isAuthenticated, user, role, token, logout } = useAuth();

  const [cards, setCards] = useState<CardButtonData[]>([]);
  const [loadingCards, setLoadingCards] = useState(false);
  const [errorCards, setErrorCards] = useState<string | null>(null);

  // ----------------------------------------------------
  // FETCH DE LAS TARJETAS
  // ----------------------------------------------------
  useEffect(() => {
    const fetchCards = async () => {
      if (!isAuthenticated || !token) {
        setCards([]);
        return;
      }

      setLoadingCards(true);
      setErrorCards(null);

      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get(`${API_BASE}/dashboard`, config);
        setCards(res.data);
      } catch (err: any) {
        console.error("Error al cargar las cards:", err.message);

        if (err.response?.status === 403) {
          setErrorCards("Tu sesión ha expirado. Por favor, inicia sesión de nuevo.");
          logout(); // 🔒 Forzamos cierre de sesión si token venció
        } else {
          setErrorCards(`Error al cargar tarjetas: ${err.response?.status || "500"}`);
        }

        setCards([]);
      } finally {
        setLoadingCards(false);
      }
    };

    fetchCards();
  }, [isAuthenticated, token, logout]);

  // ----------------------------------------------------
  // ACCIÓN DEL BOTÓN DE CADA CARD
  // ----------------------------------------------------
  const handleCardButtonClick = (card: CardButtonData) => {
    console.log(`Ejecutando Card: "${card.label}". Valor: ${card.dataValue}`);

    if (card.dataValue) {
      window.open(card.dataValue, "_blank");
    } else {
      alert(`La tarjeta "${card.label}" no tiene valor asignado.`);
    }
  };

  // ----------------------------------------------------
  // RENDER
  // ----------------------------------------------------
  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "auto" }}>
      {/* SECCIÓN DE USUARIO */}
      {isAuthenticated ? (
        <div
          style={{
            border: "1px solid #ccc",
            padding: "15px",
            borderRadius: "5px",
            marginBottom: "30px",
            backgroundColor: "#f9f9f9",
          }}
        >
          <h3>Bienvenido, {user?.username || "Usuario"}!</h3>
          {role === "admin" && <p style={{ marginTop: "15px" }}>Panel de administración</p>}
        </div>
      ) : (
        <div style={{ marginBottom: "30px" }}>
          <p>
            No has iniciado sesión. <Link to="/login">Inicia Sesión</Link> para ver las tarjetas del dashboard.
          </p>
        </div>
      )}

      {/* SECCIÓN DE TARJETAS */}
      <h3
        style={{
          borderBottom: "2px solid #ccc",
          paddingBottom: "10px",
          marginTop: "40px",
        }}
      >
        Dashboards
      </h3>

      {!isAuthenticated ? (
        <p>Inicia sesión para ver las tarjetas del dashboard.</p>
      ) : loadingCards ? (
        <p>Cargando tarjetas...</p>
      ) : errorCards ? (
        <div
          style={{
            color: "red",
            padding: "10px",
            border: "1px solid red",
            borderRadius: "4px",
          }}
        >
          {errorCards}
        </div>
      ) : cards.length === 0 ? (
        <p>No hay tarjetas de control creadas en este momento.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "30px",
            marginTop: "20px",
          }}
        >
          {cards.map((card) => (
            <DashboardCardPreview
              key={card._id}
              label={card.label}
              actionType={card.actionType}
              dataValue={card.dataValue}
              torreId={card.torreId}
              servidorId={card.servidorId}
              equipoIds={card.equipoIds}
              onExecute={() => handleCardButtonClick(card)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;
