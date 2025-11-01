// back/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

// Obtener el secreto desde las variables de entorno
const ACCESS_SECRET = process.env.JWT_SECRET; 

// =========================================================================
// 1. VERIFICACIÓN DEL TOKEN (Autenticación)
// =========================================================================
function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).send({ message: 'Acceso denegado. No se proporcionó Access Token.' });
    }

    try {
        const decoded = jwt.verify(token, ACCESS_SECRET);
        // Adjuntamos los datos decodificados (id, username, role) a la petición
        req.user = decoded; 
        next();
    } catch (error) {
        return res.status(403).send({ message: 'Access Token inválido o expirado.' });
    }
}

// =========================================================================
// 2. COMPROBACIÓN DE ROL (Autorización)
// =========================================================================

/**
 * Middleware de fábrica para verificar si el rol del usuario está permitido.
 * @param {string[]} allowedRoles - Un array de roles permitidos.
 */
const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        
        if (!req.user || !req.user.role) {
            return res.status(403).send({ message: "Autorización fallida: El rol no pudo ser verificado." });
        }

        const userRole = req.user.role; 

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).send({ 
                message: `Acceso prohibido. No tienes el nivel de permisos requerido (${allowedRoles.join(', ')}).`
            });
        }
        
        next();
    };
};

module.exports = {
    verifyToken,
    checkRole
};