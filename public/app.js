let socket;
let username = '';

function joinChat() {
    const usernameInput = document.getElementById('username-input');
    username = usernameInput.value.trim();
    
    if (username.length < 3) {
        alert('Kullanıcı adı en az 3 karakter olmalıdır!');
        return;
    }

    // Socket.IO bağlantısını başlat
    socket = io();

    // Kullanıcı adını sunucuya gönder
    socket.emit('join', { username });

    // Mesaj alma olayını dinle
    socket.on('message', (data) => {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        
        const time = new Date(data.timestamp).toLocaleTimeString();
        messageElement.innerHTML = `
            <strong>${data.username}</strong>
            <span style="color: #72767d; font-size: 0.8em;"> ${time}</span><br>
            ${data.message}
        `;
        
        const messageArea = document.getElementById('messageArea');
        messageArea.appendChild(messageElement);
        messageArea.scrollTop = messageArea.scrollHeight;
    });

    // Giriş ekranını gizle, chat ekranını göster
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('chat-screen').style.display = 'flex';
    document.getElementById('username-display').textContent = `Hoş geldin, ${username}!`;
    
    // Input'a focus
    document.getElementById('messageInput').focus();
}

// Mesaj gönderme fonksiyonu
function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    
    if (message && socket) {
        socket.emit('message', { 
            message,
            username
        });
        messageInput.value = '';
    }
}

// Enter tuşu ile mesaj gönderme
document.getElementById('messageInput')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Enter tuşu ile giriş yapma
document.getElementById('username-input')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        joinChat();
    }
});
