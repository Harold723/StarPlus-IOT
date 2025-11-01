
export interface TorreCreateData {
    nombre: string;  
    ubicacion: string;    
    estado: string;   
  
}

//  interfaz para los datos que vienen del backend
export interface TorreData extends TorreCreateData {
    _id: string; 
    createdAt: string; 
    updatedAt: string;
}