

// src/pages/LoginPage.tsx 

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/login.css'; 
// Importaciones de Font Awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const LoginPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); 
    
    const { login, isAuthenticated, error, tempUserId, loading } = useAuth();
    const navigate = useNavigate();

    const hasRedirected = useRef(false);

    // 1. Lógica de Redirección
    useEffect(() => {
        if (hasRedirected.current) return; 

        if (isAuthenticated) {
            hasRedirected.current = true;
            navigate('/', { replace: true });
        } else if (tempUserId) {
            hasRedirected.current = true;
            console.log(`LoginPage.tsx: Redirigiendo a cambio obligatorio con ID: ${tempUserId}`);
            navigate(`/change-password-mandatory/${tempUserId}`, { replace: true });
        }
    }, [isAuthenticated, tempUserId, navigate]);

    // 2. Definición de handleSubmit (Resuelve el error TS2304)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        hasRedirected.current = false;
        await login(username, password);
    };

    // 3. Función para cambiar la visibilidad de la contraseña
    const togglePasswordVisibility = () => {
        setShowPassword(prev => !prev);
    };

    return (
        <div className="contenedor-login">
            <h2 className="login-title">INICIAR SESIÓN</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <form onSubmit={handleSubmit} className="login-form">

                {/* Input de Usuario */}
                <div className="input-con-icono">
                    <input
                        type="text"
                        placeholder="Ingrese su usuario"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={loading}
                        required
                    />
                </div>

                {/* Input de Contraseña con Icono */}
                <div className="input-con-icono password-container">
                    <input
                        // Cambia el tipo entre "password" y "text"
                        type={showPassword ? "text" : "password"}
                        placeholder="Ingrese su contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        required
                    />
                    
                    {/* Botón/Icono para mostrar/ocultar */}
                    <button 
                        type="button" 
                        onClick={togglePasswordVisibility}
                        className="toggle-password-button" // Usado en CSS
                        disabled={loading}
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                    </button>
                </div>

                {/* Botón de Submit */}
                <button 
                    type="submit" 
                    disabled={loading} 
                    className="gradient-button"
                >
                    {loading ? 'Cargando...' : 'INICIAR SESIÓN'}
                </button>

            </form>
        </div>
    );
};

export default LoginPage;