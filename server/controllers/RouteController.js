const User = require('../models/UserModel');
const { Conversation } = require('../models/ConversationModel');
const mongoose = require('mongoose'); 

const searchUser = async (req, res) => {
    const { username } = req.query;

    if (!username) {
        return res.status(400).json({ message: 'Username query parameter is required' });
    }

    try {
        const users = await User.find({ username: { $regex: username, $options: 'i' } });
        
        res.status(200).json(users);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ message: 'An error occurred while searching for users' });
    }
};

const getConversationOrStartNew = async (req, res) => {
    const { currentUserId, userId } = req.body;

    const findConversation = await Conversation.findOne({
        participants: { $all: [
            { $elemMatch: { user: currentUserId} },
            { $elemMatch: { user: userId } }
        ]}
    });

    const findUser = await User.findById(userId);

    res.status(200).json({conversation: findConversation, user: {
        _id: findUser._id,
        username: findUser.username,
        userAvatar: findUser.userAvatar
    }});
};

const getConversation = async (req, res) => {
    const user_id = req.user._id;
    try {
        const conversations = await Conversation.find({
            participants: {
                $elemMatch: { user: user_id }
            }
        }).populate('participants.user', 'username userAvatar email')
          .populate('messages.sender', 'username userAvatar')

        if (conversations.length === 0) {
            return res.status(200).json(conversations);
        }

        res.status(200).json(conversations);
    } catch (error) {
        console.log(error.message)
        res.status(400).json({error: error.message})
    }
}

const postImageOrAvatar = async (req, res) => {
    const { userId, image, purpose } = req.body;
    const extractImage = image.split(',')[1]

    try {
        await User.updateOne({
            _id: userId
        }, {
            $set: {
                userAvatar: extractImage
            }
        });
        
        res.json({userId, extractImage, purpose})
    } catch (error) {
        console.log(error.message)
        res.status(400).json({ error: error.message })
    }
};

const createNewGroup = async (req, res) => {
    const { groupName, groupMember } = req.body;
    const user = req.user._id;

    try {
        const currentUser = await User.findOne({ _id: user });
        
        // Create consistent objects for all members
        const members = groupMember.map(id => ({
            user: new mongoose.Types.ObjectId(id),
            role: 'member'
        }));

        // Add current user as admin
        members.push({
            user: currentUser._id,
            role: 'admin'
        });

        const newConversation = await Conversation.create({
            participants: members,
            conversationType: 'group',
            conversationName: groupName,
            messages: [{
                sender: user,
                content: `Welcome to the group ${groupName}!`
            }]
        });

        // Extract just the user IDs for updating User documents
        const memberIds = members.map(member => member.user);

        await User.updateMany(
            { _id: { $in: memberIds } },
            {
                $push: {
                    conversations: newConversation._id
                }
            }
        );

        res.status(200).json(newConversation);
    } catch (error) {
        console.error('Error creating group:', error);
        res.status(500).json({ message: 'An error occurred while creating the group' });
    }
}

module.exports = { 
    searchUser, 
    getConversation, 
    getConversationOrStartNew,
    postImageOrAvatar,
    createNewGroup
};