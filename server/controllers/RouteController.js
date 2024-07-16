const User = require('../models/UserModel');
const { Conversation } = require('../models/ConversationModel');

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
            { $elemMatch: { _id: currentUserId} },
            { $elemMatch: { _id: userId } }
        ]}
    });

    const findUser = await User.findById(userId);

    res.status(200).json({conversation: findConversation, user: {
        _id: findUser._id,
        username: findUser.username
    }});
};

const getConversation = async (req, res) => {
    const user_id = req.user._id;
    try {
        const conversations = await Conversation.find({
            participants: { $all: [ { $elemMatch: { _id: user_id }} ] }
        });

        if (conversations.length === 0) {
            return res.status(200).json({conversation: null, user: null});
        }

        res.status(200).json({conversation: conversations});
    } catch (error) {
        console.log(error.message)
        res.status(400).json({error: error.message})
    }
}

module.exports = { searchUser, getConversation, getConversationOrStartNew };