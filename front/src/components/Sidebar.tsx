
// src/components/Sidebar.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 

// 💡 CORRECCIÓN CLAVE: Importar la imagen como un módulo de React
import userDefaultAvatar from '../img/user.png';

import '../styles/Sidebar.css'; 

// 💡 Interfaz de usuario mejorada para incluir la imagen de perfil
interface AuthUser {
  username: string;
  profilePicture?: string; // URL de la imagen si viene de la API/DB
}

interface SidebarProps {
  onLogout: () => void; 
  isOpen: boolean; 
  onClose: () => void; 
}

const menuItems = [
  {
    id: "torres",
    title: "Gestión de Torres",
    links: [
      { to: "/torres/crear", label: "Registrar Torre" }, 
      { to: "/Torres", label: "Lista de Torres" }, 
    ],
  },
  {
    id: "sensores",
    title: "Gestión de Sensores",
    links: [
      { to: "/equipos/crear", label: "Registrar Sensor" }, 
      { to: "/Equipos", label: "Lista de Sensores" }, 
      { to: "/calculadora", label: "Calculadora de Equipos" }, 
    ],
  },
  {
    id: "servidores",
    title: "Gestión de Servidores",
    links: [
      { to: "/servidores/crear", label: "Registrar Servidor" }, 
      { to: "/Servidores", label: "Lista de Servidores" }, 
    ],
  },
  {
    id: "dashboard",
    title: "Gestión de Dashboard",
    links: [
      { to: "/dashboard/crear", label: "Crear Dashboard" }, 
      { to: "/dashboard/lista", label: "Lista de Dashboards" }, 
    ],
  },
  {
    id: "usuarios", 
    title: "Gestión de Usuarios",
    links: [
      { to: "/admin", label: "Panel Principal Admin" }, 
      { to: "/register", label: "Crear Usuario" }, 
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ onLogout, isOpen, onClose }) => {
  const auth = useAuth();
  // 💡 Casting del usuario con la interfaz AuthUser
  const user = auth.user as AuthUser | null; 
  const role = auth.role;
  const isAuthenticated = auth.isAuthenticated;
  const isAdmin = role === 'admin';
  const [openSubmenuId, setOpenSubmenuId] = useState<string | null>(null);

  if (!isAuthenticated) return null;

  const toggleSubmenu = (id: string) => {
    setOpenSubmenuId(openSubmenuId === id ? null : id);
  };

  const handleLinkClick = () => {
    onClose(); 
    setOpenSubmenuId(null);
  };

  // 💡 Lógica para determinar la fuente de la imagen
  // Si user?.profilePicture existe (viene del backend), úsala. Si no, usa la importación local.
  const avatarSrc = user?.profilePicture || userDefaultAvatar;

  // El estilo `sidebarStyle` ya no es estrictamente necesario si `Sidebar.css` maneja la transición
  // con la clase `.sidebar.open`, pero se mantiene por si es necesario
  const sidebarStyle = {
    transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
  };

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}

      <div className={`sidebar ${isOpen ? "open" : ""}`} style={sidebarStyle}>
        <div className="user-profile">
          <div className="profile-header">
            {/* 💡 Uso de la variable avatarSrc para la imagen */}
            <img 
              src={avatarSrc} 
              alt={`${user?.username} Avatar`} 
              className="profile-avatar" 
            />
            <div className="profile-info">
              <span className="profile-name">{user?.username || 'Usuario Invitado'}</span>
              <span className="profile-role">{role === 'admin' ? ' Administrador' : 'Usuario'}</span>
              <span className="profile-status online">Online</span>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <nav className="sidebar-nav">
          <Link to="/" className="nav-item" onClick={handleLinkClick}>Inicio</Link>
          <div className="menu-group-separator"></div>

          {menuItems.map((item) => {
            if (item.id === "usuarios" && !isAdmin) return null; 
            return (
              <div key={item.id} className={`menu-group ${openSubmenuId === item.id ? "open" : ""}`}>
                <div
                  className={`nav-item has-submenu ${openSubmenuId === item.id ? "active-group" : ""}`}
                  onClick={() => toggleSubmenu(item.id)}
                >
                  {item.title}
                  <i className={`submenu-arrow ${openSubmenuId === item.id ? 'open' : ''}`}>▼</i>
                </div>

                {openSubmenuId === item.id && (
                  <div className="submenu">
                    {item.links.map((link) => (
                      <Link 
                        key={link.to} 
                        to={link.to} 
                        className="submenu-item" 
                        onClick={handleLinkClick}
                      >
                        <span className="dot"></span> {link.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

       
          <button onClick={onLogout} className="logout-button">Cerrar Sesión</button>
        </nav>
      </div>
    </>
  );
};