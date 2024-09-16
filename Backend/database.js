const mysql = require('mysql2/promise');

// Configuración de la conexión a la base de datos
const dbConfig = {
    host: '10.0.2.11', // IP privada de la instancia de MySQL
    user: 'myuser',    // Nombre de usuario de MySQL
    password: '1234',  // Contraseña de MySQL
    database: 'usuarios' // Nombre de la base de datos
};

// Crear la conexión
const connection = mysql.createPool(dbConfig); // Usamos createPool para manejar múltiples conexiones

module.exports = connection; // Exportar la conexión para usarla en app.js


