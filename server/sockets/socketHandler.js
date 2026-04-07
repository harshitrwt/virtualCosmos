const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Session = require('../models/Session');
const Message = require('../models/Message');
const getActiveSessionsState = require('../utils/getActiveSessions');

const socketHandler = (io) => {

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
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

      await new Session({
        socketId: socket.id,
        userId: user.userId,
        username: user.username,
        avatarStyle: user.avatarStyle,
        avatarSeed: user.avatarSeed,
        x: spawnX,
        y: spawnY,
        active: true
      }).save();

      io.emit('players:update', await getActiveSessionsState());

      socket.on('player:move', async (data) => {
        await Session.findOneAndUpdate(
          { socketId: socket.id },
          { x: data.x, y: data.y }
        );
        io.emit('players:update', await getActiveSessionsState());
      });

      socket.on('chat:message', async ({ roomId, text }) => {
        const msg = await new Message({
          roomId,
          senderId: socket.userId,
          text
        }).save();

        socket.to(roomId).emit('chat:receive', msg);
      });

      socket.on('disconnect', async () => {
        await Session.findOneAndUpdate(
          { socketId: socket.id },
          { active: false }
        );
        io.emit('players:update', await getActiveSessionsState());
      });

    } catch (err) {
      console.error(err);
      socket.disconnect();
    }
  });
};

module.exports = socketHandler;