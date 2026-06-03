const Message = require('../models/Message');

const onlineUsers = {};

module.exports = (io) => {

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('user_online', (userId) => {
      if (!userId) return;
      socket.userId = userId.toString();
      onlineUsers[socket.userId] = socket.id;
      console.log(`User ${socket.userId} is online`);
      io.emit('online_users', Object.keys(onlineUsers));
    });

    socket.on('join_room', (roomId) => {
      if (!roomId) return;
      // Leave all previous rooms first except own socket room
      const rooms = Array.from(socket.rooms);
      rooms.forEach(room => {
        if (room !== socket.id) socket.leave(room);
      });
      socket.join(roomId);
      socket.currentRoom = roomId; // store current room
      console.log(`Socket joined room: ${roomId}`);
    });

    socket.on('send_message', async (messageData) => {
      try {
        if (!messageData) return;
        const { roomId, senderId, receiverId, text } = messageData;

        if (!roomId || !senderId || !receiverId || !text) {
          console.log('Missing fields:', { roomId, senderId, receiverId, text });
          return;
        }

        const message = await Message.create({
          roomId,
          sender: senderId,
          receiver: receiverId,
          text
        });

        const populated = await message.populate('sender', 'name avatar');

        console.log(`Emitting to room ${roomId}:`, populated.text);

        // Emit to room
        io.to(roomId).emit('receive_message', populated);

      } catch (error) {
        console.error('Message save error:', error.message);
        socket.emit('message_error', { message: error.message });
      }
    });

    socket.on('typing', (data) => {
      if (!data?.roomId) return;
      socket.to(data.roomId).emit('user_typing', { userId: data.userId });
    });

    socket.on('stop_typing', (data) => {
      if (!data?.roomId) return;
      socket.to(data.roomId).emit('user_stop_typing', { userId: data.userId });
    });

    socket.on('disconnect', () => {
      const userId = socket.userId;
      if (userId && onlineUsers[userId]) {
        delete onlineUsers[userId];
        io.emit('online_users', Object.keys(onlineUsers));
        console.log(`User ${userId} went offline`);
      }
    });
  });
};