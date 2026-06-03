const Message = require('../models/message');
const User = require('../models/User');

const getChatHistory = async(req, res) =>{
    try{
        const { roomId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 30;
        const skip = (page - 1) * limit;

        const messages = await Message.find({roomId})
        .populate('sender', 'name avatar')
        .sort({ createdAt: 1})
        .skip(skip)
        .limit(limit);
        res.status(200).json({
            page,
            count: messages.length,
            messages   
        });

    }catch(error){
        res.status(500).json({message: error.message});

    }
};

const getMyConversation = async(req, res) =>{
    try{
        const userId = req.user._id ;

        const conversations = await Message.aggregate([
            {
                $match:{
                    $or: [
                        { sender: userId },
                        { receiver: userId}
                    ]
                }
            },
            {
                $sort: {createdAt: -1 }
            },
            {
                $group:{
                    _id: '$roomId',
                    lastMessage: { $first: '$text' },
                    lastMessageTime: { $first: '$createdAt'},
                    senderid: { $first: '$sender'},
                    receiverId: { $first: '$receiver'},
                    unreadCount: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        {$eq: ['$receiver', userId]},
                                        { $eq: ['$read', false]}
                                    ]
                                },
                                1,0
                            ]
                        }
                    }
                }
            },
            {$sort: {lastMessageTime: -1}}
        ]);

        const populated = await Promise.all(
            conversations.map(async(conv) => {
                const otherUserId = conv.senderId.equals(userId)
                ? conv.reveiverId
                : conv.senderId;

                const otherUser = await User.findById(otherUserId)
                .select('name avatar is online ');

                 return{
                    roomId: conv._id,
                        otherUser,
                        lastMessage:conv.lastMessageTime,
                        unreadCount: conv.unreadCount
                 };
            })
        );
        res.status(200).json(populated);

    }catch(error){
        res.status(500).json({message: error.message});

    }
};

module.exports = { getChatHistory, getMyConversation };
