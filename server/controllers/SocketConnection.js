const io = require('socket.io');
const {Conversation} = require('../models/ConversationModel');
const {Message} = require('../models/MessageModel');
const User = require('../models/UserModel');

let users = [];
function socketConnection (io) {
    // Listen for connection event
    io.on('connection', (socket) => {

        socket.on('join conversations', (conversationIds) => {

            socket.join(conversationIds);
            console.log('joined', conversationIds)
        });

        socket.on('isOnline', async (userId) => {
          
            users.push({
                userId: userId,
                socketId: socket.id
            });
            
            console.log('online users: ',users)
            try {
                // Find the user and update the status
                const user = await User.findOneAndUpdate(
                    {_id: userId},
                    {userStatus: "online"}
                );

                // Find the user online contacts
                const onlineContacts = await User.find({
                    _id: { $in: user.contacts },
                    userStatus: "online"
                });

                socket.emit('onlineContacts', onlineContacts)
                
            } catch (error) {
                console.error('Error finding user:', error.message);
            }
        });

        socket.on('private message', async (msg, recipientId, senderId) => {
            // Create a new Message
            const newMessage =  new Message(msg);

            try {
                const conversation = await Conversation.findOne({
                    participants: {
                         $all: [
                            { $elemMatch: { user: senderId } },
                            { $elemMatch: { user: recipientId } }
                        ] 
                    },
                    conversationType: "personal"
                }).populate('participants.user', 'username userAvatar')
                  .populate('messages.sender', 'username userAvatar');
                
                // If no conversation found, create a new one
                if (!conversation) {

                    const newConversation = new Conversation({
                        participants: [{ user: senderId }, { user: recipientId }],
                        conversationType: "personal",
                        messages: [newMessage]
                    });

                    await newConversation.save();

                    await User.updateMany({
                        _id: {$in: [senderId, recipientId]}},
                        {
                            $push: {
                                conversations: newConversation._id
                            }
                        }
                    );

                    await User.findOneAndUpdate(
                        {_id: senderId},
                        {
                            $push: {
                                contacts: recipientId
                            }
                        }
                    );

                    await User.findOneAndUpdate(
                        {_id: recipientId},
                        {
                            $push: {
                                contacts: senderId
                            }
                        }
                    );

                    socket.join(newConversation._id.toString())
                    return socket.to(newConversation._id.toString()).emit('messageReceive', msg);
                };

                await conversation.updateOne({ $push: { messages: newMessage } });

                const conversationId = conversation._id.toString();

                socket.to(conversationId).emit('messageReceive', msg, conversationId);
         
            } catch (error) {
                console.error('Error sending private message:', error.message);
            }
        });

        socket.on('group message', async (msg, groupId) => {
            const newMessage =  new Message(msg);

            try {
                const conversation = await Conversation.findById(groupId);

                await conversation.updateOne({ $push: { messages: newMessage } });

                socket.to(conversation._id.toString()).emit('messageReceive', msg);

            } catch (error) {
                console.error('Error sending private message:', error.message)
            }
        });

        socket.on('disconnect', async () => {

     

            const logoutUser = users.filter(u => u.socketId === socket.id);

            try {
                // Find the user and update the status
                await User.findOneAndUpdate(
                    {_id: logoutUser[0].userId},
                    {userStatus: "offline"}
                );

                const usersLeft = users.filter(u => u.userId !== logoutUser[0].userId);
                users = usersLeft;

                socket.emit('currentUserOnline', false);
                
            } catch (error) {
                console.error('Failed logout:', error.message);
            }

        });
    })
}

module.exports = socketConnection;