const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Socket.IO bağlantı yönetimi
io.on('connection', (socket) => {
    console.log('Yeni kullanıcı bağlandı:', socket.id);

    socket.on('message', (data) => {
        io.emit('message', {
            userId: socket.id,
            message: data.message,
            timestamp: new Date()
        });
    });

    socket.on('disconnect', () => {
        console.log('Kullanıcı ayrıldı:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server ${PORT} portunda çalışıyor`);
});
