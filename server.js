const express = require('express');
const path = require('path');
const app = express();

// Sirve los archivos estáticos desde la carpeta dist/app-qr/browser/inicio
app.use(express.static(path.join(__dirname, 'dist/app-qr/browser/inicio')));

// Maneja cualquier solicitud que no coincida con los archivos estáticos
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/app-qr/browser/inicio/index.html'));
});

const port = process.env.PORT || 4200;

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Iniciar el servidor con manejo de errores
const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}).on('error', (error) => {
  console.error('Error starting server:', error);
  process.exit(1);
});

// Manejar señales de terminación
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});