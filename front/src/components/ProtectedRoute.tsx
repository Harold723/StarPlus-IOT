// src/components/ProtectedRoute.tsx

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
    allowedRole?: 'user' | 'admin';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRole }) => {
    const { isAuthenticated, role, loading } = useAuth();

    if (loading) {
        return <div>Cargando autenticación...</div>;
    }

    if (!isAuthenticated) {
        // Redirige al login si no está autenticado
        return <Navigate to="/login" replace />;
    }

    if (allowedRole && role !== allowedRole) {
        // Redirige al home si el rol es incorrecto
        return <Navigate to="/" replace />; 
    }

    // Permite el acceso
    return <Outlet />; 
};

export default ProtectedRoute;