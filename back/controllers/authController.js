

// back/controllers/authController.js 

const User = require('../models/User'); 
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); 
// Asumimos que process.env.JWT_SECRET está configurado.

// 1. REGISTRO/CREACIÓN DE USUARIO
const register = async (req, res) => {
    try {
        const { username, password, role } = req.body;
        
        if (!username || !password || !role) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'El nombre de usuario ya existe.' });
        }

        const newUser = new User({
            username,
            password: password, // El modelo lo hashea
            role: role 
        });

        await newUser.save();
        
        res.status(201).json({ 
            message: 'Usuario creado con éxito (por Admin).',
            user: { _id: newUser._id, username: newUser.username, role: newUser.role, mustChangePassword: newUser.mustChangePassword }
        });

    } catch (error) {
        console.error('Error en el registro/creación de usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// 2. LOGIN
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Usuario o contraseña incorrectos.' });
        }

        const isMatch = await user.matchPassword(password); 
        if (!isMatch) {
            return res.status(401).json({ message: 'Usuario o contraseña incorrectos.' });
        }

        if (user.mustChangePassword) {
            return res.status(200).json({
                message: 'Acceso inicial. Debe cambiar su contraseña.',
                mustChangePassword: true, 
                id: user._id 
            });
        }

        const payload = { id: user._id, role: user.role };
        const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ 
            accessToken, 
            role: user.role,
            id: user._id,
            username: user.username,
            mustChangePassword: false 
        });

    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};


// 3. FUNCIÓN: CAMBIO DE CONTRASEÑA OBLIGATORIO
const changePasswordMandatory = async (req, res) => {
    // 🔑 CORRECCIÓN DEL REFERENCE ERROR: Declaramos accessToken al inicio del bloque try
    let accessToken; 
    
    try {
        const { id, currentPassword, newPassword } = req.body;

        if (!id || !currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
        }
        
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        
        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ message: 'Contraseña actual incorrecta.' });
        }
        
        const isNewSameAsOld = await user.matchPassword(newPassword);
        if (isNewSameAsOld) {
             return res.status(400).json({ message: 'La nueva contraseña no puede ser igual a la anterior.' });
        }
        
        // 🔑 CORRECCIÓN DEL DOBLE HASHING: Solo pasamos el texto plano
        user.password = newPassword; 
        user.mustChangePassword = false; 
        
        await user.save(); // Aquí se hashea (una vez)

        // 5. Generar el token JWT de sesión normal
        const payload = { id: user._id, role: user.role };
        accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }); // Se asigna a la variable declarada con 'let'

        res.json({ 
            message: 'Contraseña actualizada exitosamente. Acceso concedido.', 
            accessToken, 
            role: user.role,
            id: user._id,
            username: user.username, 
            mustChangePassword: false
        });

    } catch (error) {
        console.error('Error en el cambio de contraseña obligatorio:', error);
        // Si el error ocurre ANTES de la generación del token, lo manejamos con 500.
        // Si el error es una referencia a 'accessToken', se resuelve al declararla con 'let'
        // fuera del bloque de asignación.
        res.status(500).json({ message: 'Error interno del servidor o al generar el token.' });
    }
};


// 4. OBTENER TODOS LOS USUARIOS
const getUsers = async (req, res) => { 
    try {
        const users = await User.find({}).select('-password'); 
        res.json({ users });
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};


// 5. ACTUALIZAR ROL
const updateRole = async (req, res) => { 
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (role !== 'user' && role !== 'admin') {
            return res.status(400).json({ message: 'Rol inválido.' });
        }

        const user = await User.findByIdAndUpdate(
            id, 
            { role: role }, 
            { new: true, select: '-password' }
        );

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        res.json({ message: `Rol de ${user.username} actualizado a ${user.role}.`, user });

    } catch (error) {
        console.error('Error al actualizar el rol:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};


// 6. ELIMINAR USUARIO
const deleteUser = async (req, res) => { 
    try {
        const { id } = req.params;
        const currentUserId = req.user.id; 

        if (id === currentUserId.toString()) {
            return res.status(403).json({ 
                message: 'No puedes eliminar tu propia cuenta de administrador desde este panel.' 
            });
        }
        
        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json({ message: 'Usuario no encontrado para eliminar.' });
        }

        res.json({ 
            message: `Usuario ${deletedUser.username} (ID: ${id}) eliminado con éxito.`, 
            deletedUserId: id 
        });

    } catch (error) {
        console.error('Error al eliminar el usuario:', error);
        if (error.kind === 'ObjectId') {
             return res.status(400).json({ message: 'ID de usuario inválido.' });
        }
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};


module.exports = {
    register, 
    login,
    changePasswordMandatory, 
    getUsers,
    updateRole,
    deleteUser
};