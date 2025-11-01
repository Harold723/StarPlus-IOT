// ./types/Dashboard.ts

export interface DashboardDCreateData {
    // Texto visible en el botón (OBLIGATORIO)
    label: string; 
    
    // Hacemos actionType OPCIONAL (con el signo ?) ya que se establece
    // por defecto en el frontend ('submit') o en el backend.
    actionType?: string; 
    
    // dataValue (el link/comando - OBLIGATORIO)
    dataValue: string; 
    
    // Referencias opcionales a las entidades
    torreId?: string | null; 
    servidorId?: string | null;

    // ✅ ARRAY de IDs para equipos (OPCIONAL)
    equipoIds?: string[];
}

// ----------------------------------------------------

// 🚨 Estructura completa (incluye ID y Timestamps) utilizada para la lectura (GET)
export interface DashboardData extends DashboardDCreateData {
    _id: string; // El ID único de MongoDB
    createdAt: Date;
    updatedAt: Date;
}