

// src/types/auth.d.ts

export interface UserData {
    id: string; 
    username: string;
    role: 'user' | 'admin';
}

export interface AuthContextType {
    user: UserData | null;
    token: string | null;
    role: 'user' | 'admin' | null;
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => void;
    hasRole: (requiredRole: 'user' | 'admin') => boolean;
    
    // Propiedades de Flujo Obligatorio
    tempUserId: string | null; 
    setTempUserId: (id: string | null) => void;
    completeLogin: (accessToken: string, role: 'user' | 'admin', id: string, username: string) => void; 
}