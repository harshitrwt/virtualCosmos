const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const crypto = require('crypto');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/virtual-cosmos';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

const userSchema = new mongoose.Schema({
  userId: String,
  username: String,
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

const messageSchema = new mongoose.Schema({
  roomId: String,
  senderId: String,
  text: String,
  timestamp: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

app.post('/api/users', async (req, res) => {
  try {
    const { username } = req.body;
    let user = await User.findOne({ username });
    if (!user) {
      user = new User({ userId: crypto.randomUUID(), username });
      await user.save();
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/history/:roomId', async (req, res) => {
  try {
    const messages = await Message.find({ roomId: req.params.roomId })
      .sort({ timestamp: -1 })
      .limit(50);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const players = new Map();

io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;
  if (!userId) return socket.disconnect();

  User.findOne({ userId }).then(user => {
    if (!user) return socket.disconnect();
    
    players.set(socket.id, {
      userId,
      username: user.username,
      x: 400,
      y: 300
    });

    const playersState = {};
    for (const [sid, data] of players.entries()) {
      playersState[data.userId] = data;
    }
    io.emit('players:update', playersState);

    socket.on('player:move', (data) => {
      const player = players.get(socket.id);
      if (player) {
        player.x = data.x;
        player.y = data.y;
        
        const state = {};
        for (const [sid, p] of players.entries()) {
          state[p.userId] = p;
        }
        io.emit('players:update', state);
      }
    });

    socket.on('room:join', ({ roomId }) => {
      socket.join(roomId);
    });

    socket.on('room:leave', ({ roomId }) => {
      socket.leave(roomId);
    });

    socket.on('chat:message', async (data) => {
      const { roomId, text } = data;
      const msg = new Message({
        roomId,
        senderId: userId,
        text
      });
      await msg.save();
      socket.to(roomId).emit('chat:receive', msg);
    });

    socket.on('disconnect', () => {
      players.delete(socket.id);
      const state = {};
      for (const [sid, p] of players.entries()) {
        state[p.userId] = p;
      }
      io.emit('players:update', state);
    });
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
