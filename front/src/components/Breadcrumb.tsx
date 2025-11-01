// src/components/Breadcrumb.tsx

import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Breadcrumb.css'; // 🔑 Necesitas crear este archivo CSS para los estilos

// Mapeo opcional: Si quieres que las rutas se vean más bonitas (ej: 'torres' -> 'Gestión de Torres')
const PATH_NAMES: { [key: string]: string } = {
    'torres': 'Torres',
    'crear': 'Crear Nuevo',
    'editar': 'Editar',
    'equipos': 'Equipos',
    'servidores': 'Servidores',
    'dashboard': 'Dashboard',
    'admin': 'Panel Admin',
    'register': 'Registrar Usuario',
    'lista': 'Lista',
    // Si la ruta es un ID (ej: /torres/editar/123), se mostrará el ID por defecto.
};

const Breadcrumb: React.FC = () => {
    const location = useLocation();
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) return null;

    // Filtra los segmentos vacíos (el primer '/' y posibles '//')
    const pathSegments = location.pathname.split('/').filter(segment => segment.length > 0);

    const breadcrumbs = pathSegments.map((segment, index) => {
        // 1. Construir la ruta acumulada para el enlace (ej: /torres, luego /torres/crear)
        const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
        
        // 2. Obtener el nombre amigable, si existe, o capitalizar el segmento
        // Si el segmento es un ID numérico, simplemente lo mostramos.
        const nameKey = segment.toLowerCase();
        const name = PATH_NAMES[nameKey] || segment.charAt(0).toUpperCase() + segment.slice(1);
        
        // 3. Determinar si es el último segmento (debe ser texto, no un enlace)
        const isLast = index === pathSegments.length - 1;

        return (
            <React.Fragment key={path}>
                {/* Separador entre elementos */}
                <span className="breadcrumb-separator">/</span>
                
                {/* Enlace o texto final */}
                {isLast ? (
                    <span className="breadcrumb-link current">{name}</span>
                ) : (
                    <Link to={path} className="breadcrumb-link">{name}</Link>
                )}
            </React.Fragment>
        );
    });

    return (
        <div className="breadcrumb-container">
            {/* El enlace de Home es siempre el punto de partida */}
            <Link to="/" className="breadcrumb-link home-link">Home</Link>
            {breadcrumbs}
        </div>
    );
};

export default Breadcrumb;