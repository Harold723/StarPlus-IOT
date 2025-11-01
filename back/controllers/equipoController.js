

// back/controllers/equipoController.js

// Usamos require ya que estamos en un entorno CommonJS (.js)
const equipoModel = require('../models/equiposModels'); 

class EquipoController {
    
    // POST: Crear Equipo (Solo Admin)
    async create(req, res) {
        try {
            console.log('Datos recibidos para crear equipo:', req.body);
            // Usa el método nativo de Mongoose
            const data = await equipoModel.create(req.body);
            res.status(201).json(data);
        } catch (error) {
            console.error('Error al crear equipo:', error);
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
            const data = await equipoModel.findByIdAndUpdate(id, req.body, { new: true });

            if (!data) {
                return res.status(404).json({ message: 'Equipo no encontrado.' });
            }
            res.status(200).json({ data });
        } catch (error) {
            console.error('Error al actualizar equipo:', error);
            res.status(500).json({ message: "Error al actualizar el equipo" });
        }
    }

    // DELETE: Eliminar Equipo (Solo Admin)
    async delete(req, res) {
        try {
            const { id } = req.params;
            const data = await equipoModel.findByIdAndDelete(id);

            if (!data) {
                return res.status(404).json({ message: 'Equipo no encontrado.' });
            }
            res.status(200).json({ message: "Equipo eliminado con éxito." });
        } catch (error) {
            console.error('Error al eliminar equipo:', error);
            res.status(500).json({ message: "Error al eliminar el equipo" });
        }
    }

    // GET ALL: Listar Equipos (User y Admin)
    async getAll(req, res) {
        try {
            const data = await equipoModel.find({});
            res.status(200).json(data); 
        } catch (error) {
            console.error('Error al obtener equipos:', error);
            res.status(500).json({ message: "Error al obtener la lista de equipos" });
        }
    }

    // GET ONE: Obtener un Equipo por ID (User y Admin)
    async getOne(req, res) {
        try {
            const { id } = req.params;
            const data = await equipoModel.findById(id);

            if (!data) {
                return res.status(404).json({ message: 'Equipo no encontrado.' });
            }
            res.status(200).json(data); 
        } catch (error) {
            console.error('Error al obtener un equipo:', error);
            res.status(500).json({ message: "Error al obtener un equipo" });
        }
    }
}

// Exportamos la instancia de la clase
module.exports = new EquipoController();