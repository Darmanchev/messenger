const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const Message = require('../models/Message');

module.exports = (io) => {
  // JWT проверка при подключении
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('No token'));
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = await User.findById(payload.id).select('-passwordHash');
      if (!socket.user) return next(new Error('User not found'));
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 ${socket.user.username} connected`);

    User.findByIdAndUpdate(socket.user._id, { status: 'online' }).exec();
    socket.broadcast.emit('user:status', { userId: socket.user._id, status: 'online' });

    // Войти в канал
    socket.on('channel:join', (channelId) => {
      Array.from(socket.rooms)
        .filter(r => r !== socket.id)
        .forEach(r => socket.leave(r));
      socket.join(channelId);
    });

    // Новое сообщение
    socket.on('message:send', async ({ channelId, text }) => {
      try {
        if (!channelId || !text?.trim()) return;
        const message = await Message.create({
          channelId,
          userId: socket.user._id,
          text: text.trim(),
        });
        const populated = await message.populate('userId', 'username avatar');
        io.to(channelId).emit('message:new', populated);
      } catch (e) {
        socket.emit('error', { message: e.message });
      }
    });

    // Печатает...
    socket.on('typing:start', ({ channelId }) => {
      socket.to(channelId).emit('typing:update', {
        userId: socket.user._id,
        username: socket.user.username,
        typing: true,
      });
    });

    socket.on('typing:stop', ({ channelId }) => {
      socket.to(channelId).emit('typing:update', {
        userId: socket.user._id,
        username: socket.user.username,
        typing: false,
      });
    });

    socket.on('disconnect', () => {
      console.log(`🔌 ${socket.user.username} disconnected`);
      User.findByIdAndUpdate(socket.user._id, { status: 'offline' }).exec();
      socket.broadcast.emit('user:status', { userId: socket.user._id, status: 'offline' });
    });
  });
};