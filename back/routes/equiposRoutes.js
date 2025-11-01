// back/routes/equiposRoutes.js

const express = require('express');
const router = express.Router();
const equipoController = require('../controllers/equipoController'); 
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Roles
const ADMIN = ['admin'];
const AUTHENTICATED_USERS = ['admin', 'user']; 

// ----------------------------------------------------
// A. RUTAS DE LECTURA (User o Admin)
// ----------------------------------------------------

// GET ALL: Listar Equipos
router.get(
    '/', 
    verifyToken, 
    checkRole(AUTHENTICATED_USERS), 
    equipoController.getAll
);

// GET ONE: Obtener un Equipo por ID
router.get(
    '/:id', 
    verifyToken, 
    checkRole(AUTHENTICATED_USERS), 
    equipoController.getOne
);


// ----------------------------------------------------
// B. RUTAS DE ESCRITURA (Solo Admin)
// ----------------------------------------------------

// POST: Crear nuevo Equipo
router.post(
    '/', 
    verifyToken, 
    checkRole(ADMIN), 
    equipoController.create
);

// PUT: Actualizar Equipo
router.put(
    '/:id', 
    verifyToken, 
    checkRole(ADMIN), 
    equipoController.update
);

// DELETE: Eliminar Equipo
router.delete(
    '/:id', 
    verifyToken, 
    checkRole(ADMIN), 
    equipoController.delete
);


module.exports = router;