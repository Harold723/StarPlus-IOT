// back/models/equiposModels.js

const mongoose = require('mongoose');

const servidorSchema = new mongoose.Schema({
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

}, {
    timestamps: true // Añade createdAt y updatedAt
});

// Mongoose automáticamente añade los métodos .create, .find, .findById, etc.

module.exports = mongoose.model('Servidor', servidorSchema);