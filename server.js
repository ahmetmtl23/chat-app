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

// Kullanıcı listesi
const users = new Map();

// Socket.IO bağlantı yönetimi
io.on('connection', (socket) => {
    console.log('Yeni kullanıcı bağlandı:', socket.id);

    // Kullanıcı katılma olayı
    socket.on('join', (data) => {
        users.set(socket.id, data.username);
        io.emit('message', {
            username: 'Sistem',
            message: `${data.username} sohbete katıldı!`,
            timestamp: new Date()
        });
    });

    // Mesaj gönderme olayı
    socket.on('message', (data) => {
        io.emit('message', {
            username: users.get(socket.id),
            message: data.message,
            timestamp: new Date()
        });
    });

    // Bağlantı kopma olayı
    socket.on('disconnect', () => {
        const username = users.get(socket.id);
        if (username) {
            io.emit('message', {
                username: 'Sistem',
                message: `${username} sohbetten ayrıldı.`,
                timestamp: new Date()
            });
            users.delete(socket.id);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server ${PORT} portunda çalışıyor`);
});
