const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [process.env.CLIENT_URL, 'http://localhost:5173'],
      credentials: true,
    },
    pingTimeout: 60000,
  });

  // Auth middleware for sockets
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        if (user) socket.user = user;
      }
      next();
    } catch {
      next(); // Allow unauthenticated socket connections
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id} | User: ${socket.user?.name || 'Guest'}`);

    // Join personal room
    if (socket.user) {
      socket.join(`user_${socket.user._id}`);
      socket.join(`${socket.user.role}_${socket.user._id}`);
      logger.info(`User ${socket.user.name} joined room: user_${socket.user._id}`);
    }

    // Join menu voting room
    socket.on('join_menu', (menuId) => {
      socket.join(`menu_${menuId}`);
      logger.info(`Socket joined menu room: menu_${menuId}`);
    });

    socket.on('leave_menu', (menuId) => {
      socket.leave(`menu_${menuId}`);
    });

    // Join provider room
    socket.on('join_provider', (providerId) => {
      socket.join(`provider_${providerId}`);
    });

    // Delivery location update
    socket.on('update_location', (data) => {
      socket.broadcast.emit('delivery_location', data);
    });

    // Typing indicator for chat
    socket.on('typing', ({ chatId, recipientId }) => {
      socket.to(`user_${recipientId}`).emit('typing', { chatId, userId: socket.user?._id });
    });

    socket.on('stop_typing', ({ chatId, recipientId }) => {
      socket.to(`user_${recipientId}`).emit('stop_typing', { chatId });
    });

    // Online status
    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

module.exports = { initSocket, getIO };
