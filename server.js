const express = require('express');
const path = require('path');
const app = express();

// Sirve los archivos estáticos desde la carpeta dist/app-qr/browser
app.use(express.static(path.join(__dirname, 'dist/app-qr/browser')));

// Maneja cualquier solicitud que no coincida con los archivos estáticos
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/app-qr/browser/index.html'));
});

const port = process.env.PORT || 4200;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});