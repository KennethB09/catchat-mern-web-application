require('dotenv').config();
const cors = require('cors');
const socketIo = require('socket.io');
const http = require('http');
const mongoose = require('mongoose');
const express = require('express');

const socketConnection = require('./controllers/SocketConnection');
const userRoutes = require('./routes/UserRoutes');
const routes = require('./routes/Routes');

const app = express();
const server = http.createServer(app)
const io = socketIo(server, {
  cors: {
    origin: [process.env.CORS_ORIGIN, "https://h3wrw7sw-5173.asse.devtunnels.ms/"],
    methods: ["GET", "POST"]
  }
});

// Use cors middleware
app.use(cors({
  origin: [process.env.CORS_ORIGIN, "https://h3wrw7sw-5173.asse.devtunnels.ms/"],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Routes
app.use('/catchat/api/auth', userRoutes);

app.use('/catchat/api', routes);
 

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