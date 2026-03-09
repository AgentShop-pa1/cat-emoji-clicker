const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Обслуживание статических файлов
app.use(express.static(path.join(__dirname)));

// Основной маршрут
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Обработка 404
app.get('*', (req, res) => {
    res.redirect('/');
});

app.listen(PORT, () => {
    console.log(`🐱 Cat Clicker Game running on port ${PORT}`);
    console.log(`🎮 Game URL: http://localhost:${PORT}`);
});