// back/server.js

const express = require('express');
const cors = require('cors'); 
const mongoose = require('mongoose');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const equipoRoutes = require('./routes/equiposRoutes'); 
const torreRoutes = require('./routes/torreRoutes');
const servidorRoutes = require('./routes/servidorRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.DB_CONNECTION_STRING;

// 1. Conexión a MongoDB
mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Conexión a MongoDB exitosa.'))
    .catch(err => console.error('❌ Error de conexión a MongoDB:', err.message));

// ------------------------------------------
// MIDDLEWARE GLOBAL
// ------------------------------------------

// 2. CORS
app.use(cors({
    origin: 'http://localhost:5173', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}));

// 3. Body Parser para JSON
app.use(express.json());

// ------------------------------------------
// DEFINICIÓN DE RUTAS (API)
// ------------------------------------------

app.use('/api/auth', authRoutes); 
app.use('/api/equipos', equipoRoutes);
app.use('/api/torres',torreRoutes);
app.use('/api/servidores',servidorRoutes);
app.use('/api/dashboard',dashboardRoutes);

// ------------------------------------------
// INICIO DEL SERVIDOR
// ------------------------------------------
app.listen(PORT, () => {
    console.log(`Server corriendo en http://localhost:${PORT}`);
});// back/server.js

