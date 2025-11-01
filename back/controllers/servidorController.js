

// back/controllers/servidorController.js

// Usamos require ya que estamos en un entorno CommonJS (.js)
const servidorModel = require('../models/servidorModels.js'); 

class servidorController {
    
    // POST: Crear Equipo (Solo Admin)
    async create(req, res) {
        try {
            // Usa el método nativo de Mongoose
            const data = await servidorModel.create(req.body);
            res.status(201).json(data);
        } catch (error) {
            console.error('Error al crear servidor:', error);
            if (error.name === 'ValidationError') {
                return res.status(400).json({ message: 'Error de validación: faltan campos o son inválidos.' });
            }
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }

    // PUT: Actualizar Equipo (Solo Admin)
    async update(req, res) {
        try {
            const { id } = req.params;
            const data = await servidorModel.findByIdAndUpdate(id, req.body, { new: true });

            if (!data) {
                return res.status(404).json({ message: 'Servidor no encontrado.' });
            }
            res.status(200).json({ data });
        } catch (error) {
            console.error('Error al actualizar servidor:', error);
            res.status(500).json({ message: "Error al actualizar el servidor" });
        }
    }

    // DELETE: Eliminar Equipo (Solo Admin)
    async delete(req, res) {
        try {
            const { id } = req.params;
            const data = await servidorModel.findByIdAndDelete(id);

            if (!data) {
                return res.status(404).json({ message: 'Servidor no encontrado.' });
            }
            res.status(200).json({ message: "Servidor eliminado con éxito." });
        } catch (error) {
            console.error('Error al eliminar servidor:', error);
            res.status(500).json({ message: "Error al eliminar el servidor" });
        }
    }

    // GET ALL: Listar Equipos (User y Admin)
    async getAll(req, res) {
        try {
            const data = await servidorModel.find({});
            res.status(200).json(data); 
        } catch (error) {
            console.error('Error al obtener servidor:', error);
            res.status(500).json({ message: "Error al obtener la lista de servidor" });
        }
    }

    // GET ONE: Obtener un Equipo por ID (User y Admin)
    async getOne(req, res) {
        try {
            const { id } = req.params;
            const data = await servidorModel.findById(id);

            if (!data) {
                return res.status(404).json({ message: 'Equipo no encontrado.' });
            }
            res.status(200).json(data); 
        } catch (error) {
            console.error('Error al obtener uns servidor:', error);
            res.status(500).json({ message: "Error al obtener un servidor" });
        }
    }
}

// Exportamos la instancia de la clase
module.exports = new servidorController();