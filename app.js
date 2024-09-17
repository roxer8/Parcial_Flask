const express = require('express');
const connection = require('./database'); // Asegúrate de que la ruta sea correcta
const cors = require('cors'); // Importar el paquete CORS
const bcrypt = require('bcrypt'); // Importar bcrypt para encriptar contraseñas
const app = express();
const PORT = 5000;

app.use(express.json());

// Middleware para permitir CORS
app.use(cors({
    origin: 'http://52.1.149.100:8080', // Permitir todas las solicitudes
    methods: 'GET, POST, OPTIONS',
    allowedHeaders: 'Content-Type'
}));

// Ruta para la raíz
app.get('/', (req, res) => {
    res.send('Servidor funcionando correctamente');
});

// Ruta para obtener todos los usuarios
app.get('/usuarios', async (req, res) => {
    try {
        const [rows] = await connection.query('SELECT * FROM usuarios');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ error: error.message });
    }
});

// Ruta para registrar un nuevo usuario con contraseña encriptada
app.post('/registro', async (req, res) => {
    const { nombres, apellidos, fecha_nacimiento, password } = req.body;

    if (!nombres || !apellidos || !fecha_nacimiento || !password) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }
    try {
        // Encriptar la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await connection.query(
            'INSERT INTO usuarios (nombres, apellidos, fecha_de_nacimiento, password) VALUES (?, ?, ?, ?)',
            [nombres, apellidos, fecha_nacimiento, hashedPassword]
        );

        if (result[0].affectedRows === 0) {
            return res.status(500).json({ error: 'No se pudo registrar el usuario.' });
        }

        res.status(201).json({ id: result[0].insertId, nombres, apellidos });
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({ error: error.message });
    }
});

// Ruta para el login
app.post('/login', async (req, res) => {
    const { nombres, password } = req.body;

    if (!nombres || !password) {
        return res.status(400).json({ error: 'Nombre de usuario y contraseña son obligatorios.' });
    }

    try {
        const [users] = await connection.query('SELECT * FROM usuarios WHERE nombres = ?', [nombres]);

        if (users.length === 0) {
            return res.status(400).json({ error: 'Usuario no encontrado.' });
        }

        const user = users[0];

        // Comparar la contraseña ingresada con la encriptada en la base de datos
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(400).json({ error: 'Contraseña incorrecta.' });
        }

        res.json({ message: 'Ingreso exitoso' });
    } catch (error) {
        console.error('Error al verificar usuario:', error);
        res.status(500).json({ error: error.message });
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
