const CardButton = require('../models/CardButton'); 

// ==========================================================
// 1. CREAR (POST /)
// ==========================================================
exports.createCardButton = async (req, res) => {
    try {
        const { label, actionType, dataValue, torreId, servidorId, equipoIds } = req.body;
        // ... (resto de la lógica) ...
        const newCardButton = new CardButton({
            label,
            actionType,
            dataValue,
            torreId: torreId || null,
            servidorId: servidorId || null,
            equipoIds: equipoIds || [],
            createdBy: req.user.id 
        });

        await newCardButton.save();
        res.status(201).json({ message: 'Card Button creado con éxito.', data: newCardButton });
    } catch (error) {
        console.error('Error al crear Card Button:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// ==========================================================
// 2. LEER TODOS (GET /)
// ==========================================================
exports.getCardButtons = async (req, res) => {
    try {
        const buttons = await CardButton.find({})
            .populate('torreId') 
            .populate('servidorId')
            .populate('equipoIds');

        res.status(200).json(buttons);
    } catch (error) {
        console.error('Error al obtener todos los Card Buttons:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// ==========================================================
// 3. LEER POR ID (GET /:id) 
// ==========================================================
exports.getCardButtonById = async (req, res) => {
    try {
        const { id } = req.params;
        const button = await CardButton.findById(id)
            .populate('torreId') 
            .populate('servidorId')
            .populate('equipoIds');

        if (!button) {
            return res.status(404).json({ message: "Card Button no encontrado." });
        }
        
        return res.status(200).json(button);
    } catch (error) {
        // ... (manejo de errores) ...
        return res.status(500).json({ error: "Error interno del servidor.", details: error.message });
    }
};

// ==========================================================
// 4. ACTUALIZAR POR ID (PUT /:id)
// ==========================================================
exports.updateCardButton = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const updatedButton = await CardButton.findByIdAndUpdate(
            id, 
            updateData, 
            { new: true, runValidators: true } 
        );

        if (!updatedButton) {
            return res.status(404).json({ message: "Card Button no encontrado para actualizar." });
        }

        res.status(200).json({ message: "Card Button actualizado con éxito.", data: updatedButton });

    } catch (error) {
        // ... (manejo de errores) ...
        return res.status(500).json({ error: "Error interno del servidor.", details: error.message });
    }
};

// ==========================================================
// 5. ELIMINAR POR ID (DELETE /:id)
// ==========================================================
exports.deleteCardButton = async (req, res) => {
    try {
        const { id } = req.params;
        
        const deletedButton = await CardButton.findByIdAndDelete(id);

        if (!deletedButton) {
            return res.status(404).json({ message: "Card Button no encontrado para eliminar." });
        }

        res.status(200).json({ message: "Card Button eliminado con éxito.", deletedData: deletedButton });

    } catch (error) {
        // ... (manejo de errores) ...
        return res.status(500).json({ error: "Error interno del servidor.", details: error.message });
    }
};
// ¡No se necesita module.exports al final!// cardButtonController.js
// Asumo que este archivo está en back/controllers/
