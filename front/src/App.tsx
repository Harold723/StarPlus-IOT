


import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import Breadcrumb from './components/Breadcrumb';

//  Páginas
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import EquipoCreatePage from './pages/EquipoCreatePage';
import EquipoListPage from './pages/EquipoListPage';
import EquipoEditPage from './pages/EquipoEditPage';
import TorreCreatePage from './pages/TorreCreatePage';
import TorreListPage from './pages/TorreListPage';
import TorreEditPage from './pages/TorreEditPage';
import ServidorCreatePage from './pages/ServidorCreatePage';
import ServidorListPage from './pages/ServidorListPage';
import ServidorEditPage from './pages/ServidorEditPage';
import DashboarCreatePage from './pages/DashboarCreatePage';
import DashboardListPage from './pages/DashboardListPage';
import DashboardEditPage from './pages/DashboardEditPage';
import CalculadoraPage from './pages/EquipoCalculatorPage';
import ChangePasswordMandatoryPage from './pages/ChangePasswordMandatoryPage';

import './App.css';
import './styles/login.css';

const AppContent: React.FC = () => {
    const { isAuthenticated, role, logout } = useAuth();
    const navigate = useNavigate();

    // 🔒 Lógica de cierre de sesión
    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // ⚙️ CORREGIDO: Permitir ruta de cambio de contraseña obligatoria sin forzar al login
    useEffect(() => {
        if (!isAuthenticated) {
            const publicPaths = ['/', '/login'];
            const isChangePasswordRoute = window.location.pathname.startsWith('/change-password-mandatory');

            if (!publicPaths.includes(window.location.pathname) && !isChangePasswordRoute) {
                navigate('/login');
            }
        }
    }, [isAuthenticated, navigate]);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            setIsSidebarOpen(true);
        } else {
            setIsSidebarOpen(false);
        }
    }, [isAuthenticated]);

    const sidebarProps = {
        onLogout: handleLogout,
        isOpen: isSidebarOpen,
        onClose: () => setIsSidebarOpen(false),
    };

    const sidebarWidth = '280px';
    const marginSize = isSidebarOpen && isAuthenticated ? sidebarWidth : '0';
    const appClass = isAuthenticated ? 'App dashboard-view' : 'App login-background';

    return (
        <div className={appClass}>
            {/* Sidebar y navegación principal */}
            {isAuthenticated && <Sidebar {...sidebarProps} />}

            {isAuthenticated && (
                <nav className="top-nav" style={{ marginLeft: marginSize, transition: 'margin-left 0.3s' }}>
                    <Link to="/">Star Plus</Link>
                </nav>
            )}

            {isAuthenticated && (
                <div className="breadcrumb-bar" style={{ marginLeft: marginSize, transition: 'margin-left 0.3s' }}>
                    {!isSidebarOpen && (
                        <button onClick={() => setIsSidebarOpen(true)} className="sidebar-open-btn">
                            ☰
                        </button>
                    )}
                    <div className="breadcrumb-content">
                        <Breadcrumb />
                    </div>
                </div>
            )}

            {/* Contenido principal */}
            <div
                className={`main-content-area ${!isAuthenticated ? 'login-content' : ''}`}
                style={
                    isAuthenticated
                        ? { marginLeft: marginSize, padding: '20px', transition: 'margin-left 0.3s' }
                        : {}
                }
            >
                <Routes>
                    {/* 🟢 RUTAS PÚBLICAS */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    {/* ⚠️ Cambio de contraseña obligatorio */}
                    <Route path="/change-password-mandatory/:id" element={<ChangePasswordMandatoryPage />} />

                    {/* 🔐 RUTAS PROTEGIDAS (ADMIN) */}
                    <Route element={<ProtectedRoute allowedRole="admin" />}>
                        <Route path="/admin" element={<AdminPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/dashboard/crear" element={<DashboarCreatePage />} />
                        <Route path="/dashboard/editar/:id" element={<DashboardEditPage />} />
                        <Route path="/equipos/crear" element={<EquipoCreatePage />} />
                        <Route path="/equipos/editar/:equipoId" element={<EquipoEditPage />} />
                        <Route path="/torres/crear" element={<TorreCreatePage />} />
                        <Route path="/torres/editar/:torreId" element={<TorreEditPage />} />
                        <Route path="/servidores/crear" element={<ServidorCreatePage />} />
                        <Route path="/servidores/editar/:servidorId" element={<ServidorEditPage />} />
                        <Route path="/calculadora" element={<CalculadoraPage />} />
                    </Route>

                    {/* 🔐 RUTAS PROTEGIDAS (GENERAL) */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/Equipos" element={<EquipoListPage />} />
                        <Route path="/Torres" element={<TorreListPage />} />
                        <Route path="/Servidores" element={<ServidorListPage />} />
                        <Route path="/dashboard/lista" element={<DashboardListPage />} />
                    </Route>

                    {/* 🚫 404 */}
                    <Route path="*" element={<h1>404 - Página no encontrada</h1>} />
                </Routes>
            </div>
        </div>
    );
};

function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}

export default App;
