const io = require('socket.io');

function socketConnection (io) {
    // Listen for connection event
    io.on('connection', (socket) => {
        socket.on('message', (msg) => {
            // Broadcast the received message to all connected clients
            io.emit('message', msg);
            console.log(`Received message: ${msg}`);
        })
    })
}

module.exports = socketConnection;