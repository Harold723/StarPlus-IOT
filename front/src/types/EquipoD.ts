// src/types/Equipo.ts

export interface EquipoCreateData {
    Nombre: string;  
    tipo: string;    
    estado: string; 
    Precio: number;  
  
}

//  interfaz para los datos que vienen del backend
export interface EquipoData extends EquipoCreateData {
    _id: string; 
    createdAt: string; 
    updatedAt: string;
}


