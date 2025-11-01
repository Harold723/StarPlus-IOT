const mongoose = require('mongoose');

const CardButtonSchema = new mongoose.Schema({
    label: {
        type: String,
        required: true,
    },
    actionType: {
        type: String,
        // ✅ Ya no es requerido; el controlador lo asigna.
        default: 'Detalle', 
    },
    dataValue: {
        type: String,
        default: "",
    },
    torreId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Torre', 
        default: null,
    },
    servidorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Servidor', 
        default: null,
    },
    // ✅ CLAVE: Array para múltiples referencias de Equipos
    equipoIds: [{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Equipo', 
    }],
}, {
    timestamps: true 
});

module.exports = mongoose.model('CardButton', CardButtonSchema);