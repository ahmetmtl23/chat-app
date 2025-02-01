const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Aktif kullanıcıları ve odaları tutacak Map'ler
const users = new Map();
const rooms = new Map();

io.on('connection', (socket) => {
    console.log('Yeni kullanıcı bağlandı:', socket.id);

    // Kullanıcı katılma
    socket.on('join', (data) => {
        users.set(socket.id, {
            id: socket.id,
            username: data.username,
            room: 'genel'
        });
        
        socket.join('genel');
        
        // Kullanıcı listesini güncelle
        io.to('genel').emit('users-update', Array.from(users.values()));
        
        // Katılma mesajı
        io.to('genel').emit('message', {
            type: 'system',
            content: `${data.username} sohbete katıldı!`,
            timestamp: new Date()
        });
    });

    // Mesaj gönderme
    socket.on('message', (data) => {
        const user = users.get(socket.id);
        if (user) {
            io.to(user.room).emit('message', {
                type: 'chat',
                userId: socket.id,
                username: user.username,
                content: data.message,
                timestamp: new Date()
            });
        }
    });

    // WebRTC sinyalleşme
    socket.on('signal', (data) => {
        const user = users.get(socket.id);
        if (user) {
            socket.to(user.room).emit('signal', {
                userId: socket.id,
                signal: data
            });
        }
    });

    // Ekran paylaşımı
    socket.on('screen-share', (data) => {
        const user = users.get(socket.id);
        if (user) {
            socket.to(user.room).emit('screen-share', {
                userId: socket.id,
                ...data
            });
        }
    });

    // Bağlantı kopması
    socket.on('disconnect', () => {
        const user = users.get(socket.id);
        if (user) {
            io.to(user.room).emit('message', {
                type: 'system',
                content: `${user.username} ayrıldı.`,
                timestamp: new Date()
            });
            
            users.delete(socket.id);
            io.to(user.room).emit('users-update', Array.from(users.values()));
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor`);
});
