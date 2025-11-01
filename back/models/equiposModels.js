// back/models/equiposModels.js

const mongoose = require('mongoose');

const EquipoSchema = new mongoose.Schema({
    Nombre: { 
        type: String, 
        required: true,
        unique: true
    },
    tipo: { 
        type: String, 
        required: true 
    },
    estado: {
        type: String,
        required: false
    },
    
    Precio:{
        type: Number, 
        required: true
    }
    // Puedes añadir una referencia al usuario que lo creó si es necesario
    // createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } 
}, {
    timestamps: true // Añade createdAt y updatedAt
});

module.exports = mongoose.model('Equipo', EquipoSchema);