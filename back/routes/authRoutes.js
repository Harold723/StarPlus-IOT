

// back/routes/authRoutes.js (COMPLETO)

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

const { verifyToken, checkRole } = require('../middleware/authMiddleware');

const ADMIN = ['admin'];

// =======================================================
// RUTAS DE AUTENTICACIÓN (PÚBLICAS Y PROTEGIDAS)
// =======================================================

// 1. INICIO DE SESIÓN (LOGIN) - RUTA PÚBLICA
router.post('/login', authController.login);

// 2. CREACIÓN DE USUARIO - PROTEGIDA (Solo Admin)
router.post('/register', verifyToken, checkRole(ADMIN), authController.register);

// 3. OBTENER USUARIOS - PROTEGIDA (Solo Admin)
router.get('/users', verifyToken, checkRole(ADMIN), authController.getUsers);

// 4. ACTUALIZAR ROL - PROTEGIDA (Solo Admin)
router.put('/users/:id', verifyToken, checkRole(ADMIN), authController.updateRole);

// 5. ELIMINAR USUARIO - PROTEGIDA (Solo Admin)
router.delete('/users/:id', verifyToken, checkRole(ADMIN), authController.deleteUser);

// 6. CAMBIO DE CONTRASEÑA OBLIGATORIO - RUTA PÚBLICA (CRÍTICA)
router.post('/change-password-mandatory', authController.changePasswordMandatory);


module.exports = router;