const Message = require('../models/Message');

const onlineUsers = {};

module.exports = (io) => {

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // ── Event 1: User comes online ──
    socket.on('user_online', (userId) => {
      // Store as string to be safe
      onlineUsers[userId.toString()] = socket.id;
      // Attach userId to socket object for disconnect use
      socket.userId = userId.toString();
      console.log(`User ${userId} is online`);
      io.emit('online_users', Object.keys(onlineUsers));
    });

    // ── Event 2: Join a chat room ──
    socket.on('join_room', (roomId) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    // ── Event 3: Send a message ──
    socket.on('send_message', async (data) => {
      try {
        const { roomId, senderId, receiverId, text } = data;

        const message = await Message.create({
          roomId,
          sender: senderId,
          receiver: receiverId,
          text
        });

        const populated = await message.populate('sender', 'name avatar');
        io.to(roomId).emit('receive_message', populated);

      } catch (error) {
        console.error('Message error:', error.message);
        socket.emit('message_error', { message: error.message });
      }
    });

    // ── Event 4: Typing indicator ──
    socket.on('typing', (data) => {
      // Safely destructure
      const roomId = data?.roomId;
      const userId = data?.userId;
      if (roomId) {
        socket.to(roomId).emit('user_typing', { userId });
      }
    });

    socket.on('stop_typing', (data) => {
      // Safely destructure
      const roomId = data?.roomId;
      const userId = data?.userId;
      if (roomId) {
        socket.to(roomId).emit('user_stop_typing', { userId });
      }
    });

    // ── Event 5: Disconnect ──
    socket.on('disconnect', () => {
      // Use the userId we attached to socket on 'user_online'
      const userId = socket.userId;

      if (userId && onlineUsers[userId]) {
        delete onlineUsers[userId];
        io.emit('online_users', Object.keys(onlineUsers));
        console.log(`User ${userId} went offline`);
      }

      console.log('Client disconnected:', socket.id);
    });

  });
};