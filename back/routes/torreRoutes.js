// back/routes/equiposRoutes.js

const express = require('express');
const router = express.Router();
const TorreController = require('../controllers/torreController'); 
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Roles
const ADMIN = ['admin'];
const AUTHENTICATED_USERS = ['admin', 'user']; 

// ----------------------------------------------------
// A. RUTAS DE LECTURA (User o Admin)
// ----------------------------------------------------

// GET ALL: Listar torres
router.get(
    '/', 
    verifyToken, 
    checkRole(AUTHENTICATED_USERS), 
    TorreController.getAll
);

// GET ONE: Obtener una torre por ID
router.get(
    '/:id', 
    verifyToken, 
    checkRole(AUTHENTICATED_USERS), 
    TorreController.getOne
);


// ----------------------------------------------------
// B. RUTAS DE ESCRITURA (Solo Admin)
// ----------------------------------------------------

// POST: Crear nuevo Equipo
router.post(
    '/', 
    verifyToken, 
    checkRole(ADMIN), 
    TorreController.create
);

// PUT: Actualizar Equipo
router.put(
    '/:id', 
    verifyToken, 
    checkRole(ADMIN), 
    TorreController.update
);

// DELETE: Eliminar Equipo
router.delete(
    '/:id', 
    verifyToken, 
    checkRole(ADMIN), 
    TorreController.delete
);


module.exports = router;