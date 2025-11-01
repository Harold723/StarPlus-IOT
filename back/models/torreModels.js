// back/models/equiposModels.js

const mongoose = require('mongoose');

const TorreSchema = new mongoose.Schema({
    nombre: { 
        type: String, 
        required: true,
        unique: true
    },
    ubicacion: { 
        type: String, 
        required: true 
    },
    estado: {
        type: String,
        required: false
    },
    // Puedes añadir una referencia al usuario que lo creó si es necesario
    // createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } 
}, {
    timestamps: true // Añade createdAt y updatedAt
});

// Mongoose automáticamente añade los métodos .create, .find, .findById, etc.

module.exports = mongoose.model('Torre', TorreSchema);