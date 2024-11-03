
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3000', 
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true
  }
});

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const upload = multer({ dest: 'public/uploads/' });

let clients = {};

app.post('/api/register', upload.single('photo'), (req, res) => {
  const name = req.body.name;
  const photoUrl = `/uploads/${req.file.filename}`;
  res.json({ name, photoUrl });
});

io.on('connection', (socket) => {
  socket.on('register', ({ name, photoUrl }) => {
    clients[socket.id] = { name, photoUrl, gameStarted: false, tiles: [1, 2, 3, 4, 5, 6, 7, 8, null] };
    io.emit('newPlayer', { id: socket.id, name, photoUrl });
    console.log('New client registered:', socket.id, name);
  });

  socket.on('startGame', () => {
    clients[socket.id].gameStarted = true;
    io.to(socket.id).emit('gameStarted');
  });

  socket.on('tileMoved', ({ newTiles }) => {
    clients[socket.id].tiles = newTiles;
    io.to(socket.id).emit('tileMoved', { newTiles });
  });

  socket.on('gameWon', () => {
    const { name } = clients[socket.id];
    io.emit('gameWon', { id: socket.id, name });
  });

  socket.on('disconnect', () => {
    delete clients[socket.id];
    io.emit('playerLeft', { id: socket.id });
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
