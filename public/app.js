const socket = io();

const messageArea = document.getElementById('messageArea');
const messageInput = document.getElementById('messageInput');

// Mesaj gönderme fonksiyonu
function sendMessage() {
    const message = messageInput.value;
    if (message.trim()) {
        socket.emit('message', { message });
        messageInput.value = '';
    }
}

// Enter tuşu ile mesaj gönderme
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Gelen mesajları görüntüleme
socket.on('message', (data) => {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    
    const time = new Date(data.timestamp).toLocaleTimeString();
    messageElement.innerHTML = `
        <strong>${data.userId === socket.id ? 'Sen' : 'Kullanıcı ' + data.userId.substr(0, 4)}</strong>
        <span style="color: #72767d; font-size: 0.8em;"> ${time}</span><br>
        ${data.message}
    `;
    
    messageArea.appendChild(messageElement);
    messageArea.scrollTop = messageArea.scrollHeight;
});
