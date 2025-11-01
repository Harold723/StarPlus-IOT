// src/pages/ChangePasswordMandatoryPage.tsx (CÓDIGO CORREGIDO Y MÁS SEGURO)

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../styles/login.css'; 

const API_URL = 'http://localhost:3000'; 

const ChangePasswordMandatoryPage: React.FC = () => {
    // ... (Estados y variables: currentPassword, newPassword, etc.)
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>(); 
    const { completeLogin, user, isAuthenticated } = useAuth(); 
    // ^ Se mantiene isAuthenticated si lo necesitas en algún otro punto del código, 
    // pero lo removemos del useEffect.

    // ⚠️ CRÍTICO: Redirecciones de seguridad
    useEffect(() => {
        // La única redirección aquí debe ser si NO hay ID en la URL.
        if (!id) {
             console.error("ID Faltante en URL. Redirigiendo al login.");
             navigate('/login', { replace: true });
        }
        
        // ❌ REMOVIDA: La redirección basada en 'isAuthenticated'
        // Si el usuario llega aquí, 'isAuthenticated' es 'false' (si el flujo de login funcionó bien).
        // Si fuera 'true' por un error de estado anterior, lo manejará la lógica de la app.
        
    }, [navigate, id]); // Dependencias simplificadas


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        // ... (Validaciones: newPassword !== confirmPassword, newPassword.length < 6)
        if (newPassword !== confirmPassword) {
            setError('La nueva contraseña y su confirmación no coinciden.');
            return;
        }
        if (newPassword.length < 6) { 
             setError('La nueva contraseña debe tener al menos 6 caracteres.');
             return;
        }
        if (!id) {
             setError('Error de sesión. Por favor, vuelva a iniciar sesión.');
             return;
        }


        setLoading(true);

        try {
            const res = await axios.post(
                `${API_URL}/api/auth/change-password-mandatory`,
                { 
                    id: id, 
                    currentPassword, 
                    newPassword 
                }
            );

            setMessage(res.data.message);
            
            // Asume que el backend devuelve el username, usa el fallback seguro.
            const usernameFromResponse = res.data.username || user?.username || 'Usuario';
            
            completeLogin(
                res.data.accessToken, 
                res.data.role, 
                res.data.id, 
                usernameFromResponse
            ); 
            
            // La redirección final a la página de inicio
            setTimeout(() => navigate('/'), 1500);

        } catch (err) {
            if (axios.isAxiosError(err) && err.response) {
                setError(err.response.data.message || 'Error al cambiar la contraseña.');
            } else {
                setError('Error de conexión.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="contenedor-login">
            <h2 className="login-title">🔒 Cambio Obligatorio</h2>
            <p>Por favor, establezca su contraseña inicial para acceder.</p>
            
            {/* ... (Tu JSX de formulario) ... */}
            {message && <p style={{ color: 'green' }}>{message}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            
            <form onSubmit={handleSubmit} className="login-form">
                
                <div className="input-con-icono">
                    <input
                        type="password"
                        placeholder="Contraseña Actual"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        disabled={loading}
                        required
                    />
                </div>
                
                <div className="input-con-icono">
                    <input
                        type="password"
                        placeholder="Nueva Contraseña"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={loading}
                        required
                    />
                </div>

                <div className="input-con-icono">
                    <input
                        type="password"
                        placeholder="Confirma Nueva Contraseña"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={loading}
                        required
                    />
                </div>

                <button type="submit" disabled={loading} className="gradient-button">
                    {loading ? 'Cambiando...' : 'GUARDAR Y ACCEDER'}
                </button>
            </form>
        </div>
    );
};

export default ChangePasswordMandatoryPage;