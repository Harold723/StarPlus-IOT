
export interface ServidorCreateData {
    nombre: string;  
    ubicacion: string;    
    estado: string;   
  
}

//  interfaz para los datos que vienen del backend
export interface servidorData extends ServidorCreateData {
    _id: string; 
    createdAt: string; 
    updatedAt: string;
}