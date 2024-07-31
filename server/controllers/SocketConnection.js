const io = require('socket.io');
const {Conversation} = require('../models/ConversationModel');
const {Message} = require('../models/MessageModel');
const User = require('../models/UserModel');

let onlineUsers = [];
function socketConnection (io) {
    // Listen for connection event
    io.on('connection', (socket) => {
        
        socket.emit('currentUserOnline', true)

        socket.on('isOnline', async (userId) => {
        
            try {
                // Find the user
                const user = await User.findById(userId);
                
                // If the user exists, send the user's online status
    
                onlineUsers.push({
                    userId: user._id.toString(),
                    username: user.username,
                    userAvatar: user.userAvatar,
                    socketId: socket.id
                });

                socket.emit('userOnlineStatus', onlineUsers);
          
                
            } catch (error) {
                console.error('Error finding user:', error.message);
            }
        });

        socket.on('conversation click', conversationId => {
            socket.join(conversationId.toString())
        });

        socket.on('private message', async (msg, recipientId, senderId) => {
            
            // Create a new Message
            const newMessage =  new Message(msg);

            try {
                const conversation = await Conversation.findOne({
                    participants: { $all: [senderId, recipientId] },
                    conversationType: "personal"
                }).populate('participants', 'username userAvatar')
                  .populate('messages.sender', 'username userAvatar');
                
                // If no conversation found, create a new one
                if (!conversation) {

                    const newConversation = new Conversation({
                        participants: [senderId, recipientId],
                        conversationType: "personal",
                        messages: [newMessage]
                    });

                    await newConversation.save();

                    await User.updateMany({
                        _id: {$in: [senderId, recipientId]}},
                        {
                            $push: {conversations: newConversation._id}
                        }
                    )
                    socket.join(newConversation._id.toString())
                    return socket.to(newConversation._id.toString()).emit('messageReceive', msg);
                };

                await conversation.updateOne({$push: { messages: newMessage }});

                socket.to(conversation._id.toString()).emit('messageReceive', newMessage);

            } catch (error) {
                console.error('Error sending private message:', error.message);
            }
        });

        socket.on('group message', async (msg, groupId) => {

            const newMessage =  new Message(msg);

            try {
                const conversation = await Conversation.findOne({ _id: groupId });
                await conversation.updateOne({$push: { messages: newMessage }})
                socket.to(conversation._id.toString()).emit('messageReceive', newMessage);
            } catch (error) {
                console.log('Error sending group message:', error.message)
            }
        })

        socket.on('disconnect', () => {
            onlineUsers = onlineUsers.filter(user => user.socketId !==  socket.id && user.socketId !== user.socketId);
            socket.emit('userOnlineStatus', onlineUsers);
        });

    })
}

module.exports = socketConnection;