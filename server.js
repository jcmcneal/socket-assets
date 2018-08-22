// Utils
const fs = require('fs');
const path = require('path');
const prettySize = require('prettysize');
const now = require('performance-now');
// Server Requirements
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
    socket.emit('message', { message: 'Welcome client! '})

    socket.on('getAssets', (assets) => {
        assets.forEach(asset => {
            const file = path.join(__dirname, asset.src);
            console.log('Client is requesting', file);
            // Get stats
            const stats = fs.statSync(file);

            // If file doesn't exist
            if (!stats) {
                socket.emit('message', { message: "File can't be found", status: 404, asset});
                return;
            }

            // Read file content
            const startRead = now();
            fs.readFile(file, 'utf8', (err, content) => {
                if (err) {
                    // File read failure
                    socket.emit('message', { message: "Error reading file", status: 404, asset});
                    return;
                }

                // Send content
                socket.emit('asset', {
                    ...asset,
                    content,
                    size: prettySize(stats.size),
                    speed: `${(now() - startRead).toFixed(4)} ms`,
                });
            });
        });
    });

    socket.on('end', () => {
        socket.emit('message', { message: 'Goodbye! '})
        console.log('Client disconnected');
    });

    socket.on('message', (data) => {
        console.log('Client message:', data);
    });
});

server.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
    console.log(`WebSocket on ws://localhost:${port}`);
});
