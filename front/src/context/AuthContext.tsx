
// src/context/AuthContext.tsx 

import { createContext, useState, useContext } from 'react'; 
import type {ReactNode } from 'react'; 
import axios from 'axios';
import type { AuthContextType, UserData } from '../types/authD.ts'; 
// Importar 'useNavigate' aquí generaría un error, la navegación debe ir en el componente

const API_URL = 'http://localhost:3000';

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const storedUser = localStorage.getItem('user');
    const initialUser: UserData | null = storedUser ? JSON.parse(storedUser) : null;
    
    const [user, setUser] = useState<UserData | null>(initialUser);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token') || null);
    const [role, setRole] = useState<'user' | 'admin' | null>(
        (localStorage.getItem('role') as 'user' | 'admin' | null) || null
    );
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    
    // Estado clave
    const [tempUserId, setTempUserId] = useState<string | null>(null); 

    const login = async (username: string, password: string): Promise<boolean> => {
        setLoading(true);
        setError(null);
        setTempUserId(null); // Limpiar cualquier ID temporal de un intento anterior

        try {
            // 1. Llamada al Backend
            const res = await axios.post(`${API_URL}/api/auth/login`, { username, password });
            
            // 💡 LÓGICA CLAVE: Redirección forzada (no lanzar error)
            if (res.data.mustChangePassword === true) {
                setTempUserId(res.data.id); 
                setError('Acceso inicial. Debe cambiar su contraseña.'); // Mostrar mensaje
                setLoading(false);
                // Devolver false para que el handleSubmit no continúe
                return false; 
            }

            // 2. Login normal:
            const { accessToken, role, id, username: resUsername } = res.data; 
            const userData: UserData = { id: id, username: resUsername || username, role };
            
            setToken(accessToken);
            setRole(role);
            setUser(userData);
            
            localStorage.setItem('token', accessToken);
            localStorage.setItem('role', role);
            localStorage.setItem('user', JSON.stringify(userData));
            
            setLoading(false);
            return true;
            
        } catch (err) {
            // Manejo de errores de credenciales (401 Unauthorized, 403 Forbidden, etc.)
            if (axios.isAxiosError(err) && err.response) {
                setError(err.response.data.message || 'Error de conexión o credenciales.');
            } else {
                 setError('Error desconocido en el intento de login.');
            }
            setLoading(false);
            return false;
        }
    };

    const logout = () => {
        // ... (logout logic) ...
        setToken(null);
        setRole(null);
        setUser(null);
        setTempUserId(null); 
        localStorage.clear();
    };
    
    // ... (hasRole y completeLogin) ...
    const completeLogin = (accessToken: string, role: 'user' | 'admin', id: string, username: string) => {
        const userData: UserData = { id, username, role };

        setToken(accessToken);
        setRole(role);
        setUser(userData);
        setTempUserId(null); // Limpiar el estado temporal después del login completo
        
        localStorage.setItem('token', accessToken);
        localStorage.setItem('role', role);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const value: AuthContextType = {
        user, token, role, loading, error, login, logout, hasRole: () => false, // Simplificado, usa tu lógica original
        isAuthenticated: !!token, isAdmin: role === 'admin',
        tempUserId, setTempUserId, completeLogin 
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider');
    }
    return context as AuthContextType;
};