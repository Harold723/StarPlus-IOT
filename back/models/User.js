
// back/models/User.js 

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    mustChangePassword: {
        type: Boolean,
        default: true
    }
});

// MIDDLEWARE CRÍTICO: Hashear la contraseña ANTES de guardar
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    
    // Solo hasheamos si el campo fue modificado.
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Método para verificar la contraseña
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;