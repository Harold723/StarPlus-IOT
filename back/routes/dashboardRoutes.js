const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController'); 
// Usamos 'middleware' (singular) según tu estructura de carpetas
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Roles
const ADMIN = ['admin'];
const AUTHENTICATED_USERS = ['admin','user'];

// =======================================================
// RUTAS PROTEGIDAS (DASHBOARD CRUD)
// =======================================================

// 1. CREAR Card Button (POST)
router.post('/', verifyToken, checkRole(ADMIN), dashboardController.createCardButton);

// 2. LEER todos los Card Buttons (GET) - Para la vista de lista
router.get(
    '/', 
    verifyToken, 
    checkRole(AUTHENTICATED_USERS), 
    dashboardController.getCardButtons
);

// 3. LEER POR ID (GET /:id) - ¡ESTO CARGA LOS DATOS PARA LA EDICIÓN!
router.get(
    '/:id', 
    verifyToken, 
    checkRole(AUTHENTICATED_USERS), 
    dashboardController.getCardButtonById 
);

// 4. ACTUALIZAR Card Button (PUT /:id) - ¡ESTO GUARDA LA EDICIÓN!
router.put('/:id', verifyToken, checkRole(ADMIN), dashboardController.updateCardButton);

// ❌ RUTA ELIMINADA: Quitamos la ruta de associations que causaba el TypeError
// router.put('/associations/:id', verifyToken, checkRole(ADMIN), dashboardController.updateCardAssociations);

// 5. ELIMINAR Card Button (DELETE)
router.delete('/:id', verifyToken, checkRole(ADMIN), dashboardController.deleteCardButton);

module.exports = router;