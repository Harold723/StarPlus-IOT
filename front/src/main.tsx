// src/main.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './context/AuthContext'; // Importar el Provider

// Asegúrate de que el elemento root existe
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <AuthProvider> {/* 🔑 Envolver toda la aplicación con el contexto de autenticación */}
      <App />
    </AuthProvider>
  </React.StrictMode>,
);