const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const port = 5000;

// Express Server
app.use(express.static('.'));
app.get('/', (req, res) => {
    console.log('http request');
    res.sendFile('index.html');
});

// Socket Server
io.on('connection', (socket) => {
    console.log('Client connected!');
    socket.emit('message', { message: 'Welcome Yo! '})

    socket.on('getAssets', (data) => {
        console.log('Client requests asset', data);
        socket.emit('asset', data);
    });

    socket.on('end', () => {
        console.log('Client disconnected');
    });
});

server.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
    console.log(`WebSocket on ws://localhost:${port}`);
});
