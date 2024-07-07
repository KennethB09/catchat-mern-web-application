require('dotenv').config();
const cors = require('cors');
const socketIo = require('socket.io');
const http = require('http');
const mongoose = require('mongoose');
const express = require('express');

const socketConnection = require('./controllers/SocketConnection');

const app = express();
const server = http.createServer(app)
const io = socketIo(server, {cors: {
    origin: process.env.CORS_ORIGIN,
}});

app.use(express.json());

// Routes


// Socket.io connection
socketConnection(io);

mongoose.connect(process.env.MONGODB_URI)
.then(() => {
    server.listen(process.env.PORT, () => {
        console.log(`Server running on port ${process.env.PORT}`);
    })
}) .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
});