const Message = require('../models/message');
const onlineUser = {};
module.exports = (io) =>{
    io.on('connection', (socket) =>{
        console.log('New client Connected: ', socket.id);

        socket.on('user_online', (userId) =>{
            onlineUser[userId] = socket.id;
            console.log(`User ${userId} is online`);
            io.emit('online_users', Object.keys(onlineUser));
        });

        socket.on('join_room', (roomId) =>{
            socket.join(roomId);
            console.log(`Socket ${socket.io} joined room ${roomId}`);

        });
        socket.on('send_message', async(Data) =>{
            try{
                const { roomId, senderId, receiverId, text } = data;

                const message = await Message.create({
                    roomId,
                    sender:senderId,
                    receiver: receiverId,
                    text
                });
                const populated = await message.populate('sender', 'name avatar');
                io.to(roomId).emit('receive_message', populated);

            } catch(error){
                console.error('Message error: ', error.message);
                socket.emit('message_error', { message: error.message});

            }
        });
        socket.on('typing', ({ roomId, userId}) => {
            socket.to(roomId).emit('user_typing', { userId });

        });
        socket.on('stop_typing', ({roomId, userid}) =>{
            socket.to(roomId).emit('user_stop_typing', {userId});

        });
        socket.on('disconnected', () =>{
            const userId = Object.keys(onlineUser).find(id => onlineUser[id] === socket.id);

            if(userId){
                delete onlineUser[userId];
                io.emit('online_user', Object.keys(onlineUser));
                console.log(`User ${userId} went offline`);

            }
            console.log('Client disconnected:', socket.id);


        });
    });

};
