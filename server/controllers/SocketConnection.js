const io = require('socket.io');
const {Conversation} = require('../models/ConversationModel');
const {Message} = require('../models/MessageModel');
const User = require('../models/UserModel');

function socketConnection (io) {
    // Listen for connection event
    io.on('connection', (socket) => {
        
        socket.emit('userOnline', socket.id);

        socket.on('private message', async (msg, userId, userUsername, currentUser, currentUserUsername) => {
            
            // Create a new Message
            const newMessage =  new Message({
                sender: currentUser,
                content: msg
            });

            try {
                // Find a conversation that have the two users ID
                const conversation = await Conversation.findOne({
                    participants: { $all: [
                        { $elemMatch: { _id: currentUser} },
                        { $elemMatch: { _id: userId } }
                    ]}
                });
                
                // If no conversation found, create a new one
                if (!conversation) {

                    const newConversation = new Conversation({
                        participants: [{
                            _id: currentUser,
                            username: currentUserUsername
                        }, {
                            _id: userId,
                            username: userUsername
                        }],

                        conversationType: "personal",
                        messages: [newMessage]
                    });

                    await newConversation.save();

                    await User.updateMany({
                        _id: {$in: [currentUser, userId]}},
                        {
                            $push: {conversations: newConversation._id}
                        }
                    )
                    socket.join(newConversation._id.toString())
                    return socket.to(newConversation._id.toString()).emit('messageReceive', msg);
                };

                await conversation.updateOne({$push: { messages: newMessage }});

                socket.join(conversation._id.toString());
                socket.to(conversation._id.toString()).emit('messageReceive', msg);

            } catch (error) {
                console.error('Error sending private message:', error.message);
            }
        })
    })
}

module.exports = socketConnection;