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
    const { userId, currentUserId } = req.body;

    const findConversation = await Conversation.findOne({
        participants: { $all: [
            { $elemMatch: { user: currentUserId} },
            { $elemMatch: { user: userId } }
        ]},
        conversationType: "personal"
    }).populate('participants.user', 'username userAvatar email').populate('messages.sender', 'username userAvatar')

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
        }).populate('participants.user', 'username userAvatar email blockedUser userStatus')
          .populate('messages.sender', 'username userAvatar').sort({ timestamps: -1 })

        if (conversations.length === 0) {
            return res.status(200).json(conversations);
        }

        res.status(200).json(conversations);
    } catch (error) {
        console.log(error.message)
        res.status(400).json({error: error.message})
    }
};

const getContacts = async (req, res) => {
    const user_id = req.user._id;

    try {
        const user = await User.findById(user_id).populate('contacts', 'username userAvatar conversationType messages');

        res.status(200).json(user.contacts)
    } catch (error) {
        console.log(error.message)
        res.status(400).json({ error: error.message })
    }
};

const postImageOrAvatar = async (req, res) => {
    const { userIdOrConversationId, image, purpose } = req.body;
    const extractImage = image.split(',')[1]

    try {
        if(purpose === 'change_user_avatar') {
            await User.updateOne({
                _id: userIdOrConversationId
            }, {
                $set: {
                    userAvatar: extractImage
                }
            });
        }

        if(purpose === 'change_group_image') {
            await Conversation.updateOne({
                _id: userIdOrConversationId
            }, {
                $set: {
                    groupAvatar: extractImage
                }
            });
        }
        
        res.json({ message: 'Image updated' })
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
        const members = groupMember.map(u => ({
            user: new mongoose.Types.ObjectId(u._id),
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

        const findGroup = await Conversation.findOne({ _id: newConversation._id }).populate('participants.user', 'username userAvatar email blockedUser userStatus').populate('messages.sender', 'username userAvatar');

        res.status(200).json(findGroup);
    } catch (error) {
        console.error('Error creating group:', error);
        res.status(500).json({ message: 'An error occurred while creating the group' });
    }
};

const addGroupMember = async (req, res) => {
    const { groupId, newMembers } = req.body;
    const newMemberId = newMembers.map(u => ({
        user: new mongoose.Types.ObjectId(u._id),
        role: 'member'
    }))
    try {
        await Conversation.findByIdAndUpdate(groupId, 
            { $push: { participants: { $each: newMemberId } } },
            { new: true }
        );

        await User.updateMany({ _id: newMembers }, {
            $push: { conversations: groupId }
        });

     res.status(200).json({ message: 'New members added' })
    } catch (error) {
        console.error('Error adding group member:', error);
        res.status(500).json({ message: 'An error occurred while adding a group member' });
    }
};

const removeGroupMember = async (req, res) => {
    const { groupId, memberId } = req.body;
    try {
        await Conversation.updateOne({
                _id: groupId
            },
            {
                $pull: { participants: { user: memberId } }
            }
        );

        await User.updateMany({ _id: memberId }, {
            $pull: { conversations: groupId }
        });

        res.status(200).json({ message: `You successfully removed ${memberId.length} users` })
    } catch (error) {
        console.error('Error removing group member:', error);
        res.status(500).json({ message: 'An error occurred while removing a group member' });
    }
};

const leaveGroup = async (req, res) => {
    const { userId, groupId } = req.body;
    try {
        await Conversation.updateOne({
                _id: groupId
            },
            {
                $pull: { participants: { user: userId } }
            }
        );

        const leavedGroup = await Conversation.findOne({ _id: groupId })

        res.status(200).json({ message: 'You leave the group', leavedGroup })
    } catch (error) {
        console.error('Error leaving group:', error);
        res.status(500).json({ message: 'An error occurred while leaving the group' });
    }
};

const getUserBlockedUsers = async (req, res) => {
    const user = req.user._id;
    try {
        const blockedUsers = await User.findOne({ _id: user }).populate('blockedUser', 'username userAvatar conversationType');

        res.status(200).json(blockedUsers.blockedUser);
    } catch (error) {
        console.error('Error getting blocked users:', error);
        res.status(500).json({ message: 'An error occurred while getting blocked users' });
    }
};

const blockUser = async (req, res) => {
    const { userToBlockId } = req.body;
    const user = req.user._id;

    try {
        await User.updateOne({ _id: user },
            {
                $push: { blockedUser: userToBlockId }
            }
        );

        const blockedUser = await User.findOne({ _id: userToBlockId });

        res.status(200).json({ message: 'User blocked', blockedUser });
    } catch (error) {
        console.error('Error blocking user:', error);
        res.status(500).json({ message: 'An error occurred while blocking the user' });
    }
};

const unBlockUser = async (req, res) => {
    const { userToUnblockId } = req.body;
    const user = req.user._id;

    try {
        await User.updateOne({ _id: user },
            {
                $pull: { blockedUser: userToUnblockId }
            }
        );

        const unBlockUser = await User.findOne({ _id: userToUnblockId });

        res.status(200).json({ message: 'User Unblocked', unBlockUser })
    } catch (error) {
        console.error('Error unblocking user:', error);
        res.status(500).json({ message: 'An error occurred while unblocking the user' });
    }
};

module.exports = { 
    searchUser, 
    getConversation,
    getContacts,
    getConversationOrStartNew,
    postImageOrAvatar,
    createNewGroup,
    addGroupMember,
    removeGroupMember,
    leaveGroup,
    getUserBlockedUsers,
    blockUser,
    unBlockUser
};