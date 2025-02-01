const { ipcRenderer } = require('electron');
const io = require('socket.io-client');
const SimplePeer = require('simple-peer');

// Sunucu adresi (Render.com'a deploy ettikten sonra bu adresi değiştireceğiz)
const SOCKET_SERVER = 'https://your-app-name.onrender.com';
const socket = io(SOCKET_SERVER);

let peer = null;

// DOM Elements
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const messages = document.getElementById('messages');
const voiceButton = document.getElementById('voiceButton');
const screenButton = document.getElementById('screenButton');
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const screenShare = document.getElementById('screenShare');
const mediaArea = document.getElementById('mediaArea');

// Mesaj gönderme
function sendMessage() {
    const message = messageInput.value.trim();
    if (message) {
        socket.emit('message', { message });
        messageInput.value = '';
    }
}

sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// Mesaj alma
socket.on('message', (data) => {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.innerHTML = `
        <strong>${data.userId === socket.id ? 'Sen' : 'Kullanıcı ' + data.userId.substr(0, 4)}</strong>
        <span style="color: #72767d; font-size: 0.8em;"> ${new Date().toLocaleTimeString()}</span><br>
        ${data.message}
    `;
    messages.appendChild(messageElement);
    messages.scrollTop = messages.scrollHeight;
});

// Sesli görüşme
voiceButton.addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaArea.style.display = 'flex';
        localVideo.srcObject = stream;
        
        if (!peer) {
            peer = new SimplePeer({
                initiator: true,
                stream: stream,
                trickle: false
            });

            peer.on('signal', data => {
                socket.emit('signal', data);
            });

            peer.on('stream', stream => {
                remoteVideo.srcObject = stream;
            });
        }
    } catch (err) {
        console.error('Mikrofona erişilemedi:', err);
    }
});

// Ekran paylaşımı
screenButton.addEventListener('click', async () => {
    try {
        const sources = await ipcRenderer.invoke('get-sources');
        const source = sources[0]; // İlk ekranı seç
        
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
                mandatory: {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId: source.id
                }
            }
        });

        mediaArea.style.display = 'flex';
        screenShare.srcObject = stream;
        socket.emit('screen-share', { sharing: true });
    } catch (err) {
        console.error('Ekran paylaşımı başlatılamadı:', err);
    }
});

// Sinyal işleme
socket.on('signal', data => {
    if (peer) {
        peer.signal(data);
    }
});
