const express = require('express');
require('dotenv').config();
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/virtual-cosmos';
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkeyforvirtualcosmos';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB Connected');
    Session.updateMany({}, { active: false }).exec().catch(err => console.error(err));
  })
  .catch(err => console.error('MongoDB Initial Connection Error:', err));

mongoose.connection.on('error', err => {
  console.error('MongoDB Runtime Error:', err.message);
});

const userSchema = new mongoose.Schema({
  userId: { type: String, unique: true },
  username: String,
  email: { type: String, unique: true },
  password: { type: String, required: true },
  avatarStyle: { type: String, default: 'avataaars' },
  avatarSeed: { type: String, default: 'default' },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

const sessionSchema = new mongoose.Schema({
  socketId: String,
  userId: String,
  username: String,
  avatarStyle: String,
  avatarSeed: String,
  x: Number,
  y: Number,
  active: Boolean
});
const Session = mongoose.model('Session', sessionSchema);

const messageSchema = new mongoose.Schema({
  roomId: String,
  senderId: String,
  text: String,
  timestamp: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, avatarStyle, avatarSeed } = req.body;
    let existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      userId: crypto.randomUUID(),
      username,
      email,
      password: hashedPassword,
      avatarStyle,
      avatarSeed
    });
    await user.save();
    res.json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.userId }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { userId: user.userId, username: user.username, avatarStyle: user.avatarStyle, avatarSeed: user.avatarSeed } });
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

const getActiveSessionsState = async () => {
  const activeSessions = await Session.find({ active: true });
  const state = {};
  activeSessions.forEach(s => {
    state[s.userId] = s;
  });
  return state;
};



io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Authentication error'));
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return next(new Error('Authentication error'));
    socket.userId = decoded.userId;
    next();
  });
});

io.on('connection', async (socket) => {
  try {
    const user = await User.findOne({ userId: socket.userId });
    if (!user) return socket.disconnect();

    const spawnX = Math.floor(Math.random() * 100) + 50;
    const spawnY = Math.floor(Math.random() * 100) + 50;

    const newSession = new Session({
      socketId: socket.id,
      userId: user.userId,
      username: user.username,
      avatarStyle: user.avatarStyle,
      avatarSeed: user.avatarSeed,
      x: spawnX,
      y: spawnY,
      active: true
    });
    await newSession.save();

    const state = await getActiveSessionsState();
    io.emit('players:update', state);

    socket.on('player:move', async (data) => {
      await Session.findOneAndUpdate({ socketId: socket.id }, { x: data.x, y: data.y });
      const updatedState = await getActiveSessionsState();
      io.emit('players:update', updatedState);
    });

    socket.on('players:request', async () => {
      const state = await getActiveSessionsState();
      socket.emit('players:update', state);
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
        senderId: socket.userId,
        text
      });
      await msg.save();
      socket.to(roomId).emit('chat:receive', msg);
    });

    socket.on('player_disconnect', async () => {
      await Session.findOneAndUpdate({ socketId: socket.id }, { active: false });
      const state = await getActiveSessionsState();
      io.emit('players:update', state);
      socket.disconnect();
    });

    socket.on('disconnect', async () => {
      await Session.findOneAndUpdate({ socketId: socket.id }, { active: false });
      const state = await getActiveSessionsState();
      io.emit('players:update', state);
    });
  } catch (err) {
    console.error(err);
    socket.disconnect();
  }
});

server.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
