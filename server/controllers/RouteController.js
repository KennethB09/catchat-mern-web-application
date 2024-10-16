const User = require('../models/UserModel');
const { Conversation } = require('../models/ConversationModel');
const mongoose = require('mongoose');
const Imagekit = require('imagekit');

const imagekit = new Imagekit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

const upload_image = async (id, image, purpose) => {
    let image_kit_Img = {};
    const folder = purpose === "change_user_avatar" ? "Users_Avatar" : "Groups_Avatar";

    if (purpose === "change_user_avatar") {
        const user = await User.find({ _id: id }, { imageId: 1 });

        if (user[0].imageId !== "") {
            await imagekit.deleteFile(user[0].imageId).then(response => {
                console.log(response);
            }).catch(error => {
                console.log(error);
            });
        };
    } else {
        const group = await Conversation.find({ _id: id }, { imageId: 1 });

        if (group[0].imageId !== "") {
            await imagekit.deleteFile(group[0].imageId).then(response => {
                console.log(response);
            }).catch(error => {
                console.log(error);
            });
        };
    }

    await imagekit.upload({
        file: image, //required
        fileName: id,
        folder: folder,  //required
        extensions: [
            {
                name: "google-auto-tagging",
                maxTags: 5,
                minConfidence: 95
            }
        ],
        transformation: {
            pre: 'r-max',
            post: [
                {
                    type: 'transformation',
                    value: 'w-100'
                }
            ]
        }
    }).then(response => {
        console.log(response);
        image_kit_Img = {
            id: response.fileId,
            image: response.name
        };
    }).catch(error => {
        console.log(error);
    });

    return image_kit_Img;
};

const searchUser = async (req, res) => {
    const { username } = req.query;

    if (!username) {
        return res.status(400).json({ status: 400, error: 'Username query parameter is required' });
    }

    try {
        const users = await User.find({ username: { $regex: username, $options: 'i' } });

        res.status(200).json(users);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ status: 500, error: 'An error occurred while searching for users' });
    }
};

const getConversationOrStartNew = async (req, res) => {
    const { userId, currentUserId } = req.body;

    try {
        const findConversation = await Conversation.aggregate([
            [
                {
                    $match: {
                        participants: {
                            $all: [
                                {
                                    $elemMatch: {
                                        user: new mongoose.Types.ObjectId(currentUserId)
                                    },
                                },
                                {
                                    $elemMatch: {
                                        user: new mongoose.Types.ObjectId(userId)
                                    },
                                },
                            ],
                        },
                        conversationType: "personal",
                    },
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "participants.user",
                        foreignField: "_id",
                        as: "populatedUsers",
                    },
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "messages.sender",
                        foreignField: "_id",
                        as: "populatedSenders",
                    },
                },
                {
                    $project: {
                        _id: 1,
                        participants: {
                            $map: {
                                input: "$participants",
                                as: "participant",
                                in: {
                                    $mergeObjects: [
                                        "$$participant",
                                        {
                                            user: {
                                                $arrayElemAt: [
                                                    {
                                                        $filter: {
                                                            input: "$populatedUsers",
                                                            cond: {
                                                                $eq: [
                                                                    "$$this._id",
                                                                    "$$participant.user",
                                                                ],
                                                            },
                                                        },
                                                    },
                                                    0,
                                                ],
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                        messages: {
                            $map: {
                                input: {
                                    $slice: [
                                        {
                                            $sortArray: {
                                                input: "$messages",
                                                sortBy: { createdAt: -1 },
                                            },
                                        },
                                        20,
                                    ],
                                },
                                as: "message",
                                in: {
                                    $mergeObjects: [
                                        "$$message",
                                        {
                                            sender: {
                                                $arrayElemAt: [
                                                    {
                                                        $filter: {
                                                            input:
                                                                "$populatedSenders",
                                                            cond: {
                                                                $eq: [
                                                                    "$$this._id",
                                                                    "$$message.sender",
                                                                ],
                                                            },
                                                        },
                                                    },
                                                    0,
                                                ],
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                        groupAvatar: 1,
                        conversationName: 1,
                        conversationType: 1,
                        updatedAt: 1,
                    },
                },
                {
                    $project: {
                        _id: 1,
                        participants: {
                            $map: {
                                input: "$participants",
                                as: "participant",
                                in: {
                                    user: {
                                        _id: "$$participant.user._id",
                                        username:
                                            "$$participant.user.username",
                                        userAvatar:
                                            "$$participant.user.userAvatar",
                                        email: "$$participant.user.email",
                                        blockedUser:
                                            "$$participant.user.blockedUser",
                                        userStatus:
                                            "$$participant.user.userStatus",
                                    },
                                    role: "$$participant.role",
                                },
                            },
                        },
                        messages: {
                            $map: {
                                input: "$messages",
                                as: "message",
                                in: {
                                    _id: "$$message._id",
                                    content: "$$message.content",
                                    createdAt: "$$message.createdAt",
                                    sender: {
                                        _id: "$$message.sender._id",
                                        username:
                                            "$$message.sender.username",
                                        userAvatar:
                                            "$$message.sender.userAvatar",
                                    },
                                },
                            },
                        },
                        groupAvatar: 1,
                        conversationName: 1,
                        conversationType: 1,
                        updatedAt: 1,
                    },
                },
            ]
        ]);
        const findUser = await User.findById(userId);

        if (findConversation.length === 0) {
            res.status(200).json({
                conversation: null, user: {
                    _id: findUser._id,
                    username: findUser.username,
                    userAvatar: findUser.userAvatar
                }
            });
            return;
        };

        res.status(200).json({
            conversation: findConversation[0], user: {
                _id: findUser._id,
                username: findUser.username,
                userAvatar: findUser.userAvatar
            }
        });

    } catch (error) {
        console.log(error)
        res.status(500).json({ status: 500, error: "Can't get conversation or create" })
    };
};

const getConversation = async (req, res) => {
    const user_id = req.user._id;
    try {
        const conversations = await Conversation.aggregate([
            // FIRST PIPELINE: Find the conversations that the participants have the current user ID.
            {
                $match: {
                    participants: {
                        $elemMatch: { user: user_id }
                    }
                }
            },
            // SECOND PIPELINE: Populate the user documents for each conversation participant and also
            // the sender of each message in messages array field.
            {
                $lookup: {
                    from: "users",
                    localField: "participants.user",
                    foreignField: "_id",
                    as: "populatedUsers",
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "messages.sender",
                    foreignField: "_id",
                    as: "populatedSenders",
                },
            },
            {
                $project: {
                    _id: 1,
                    participants: {
                        $map: {
                            input: "$participants",
                            as: "participant",
                            in: {
                                $mergeObjects: [
                                    "$$participant",
                                    {
                                        user: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: "$populatedUsers",
                                                        cond: {
                                                            $eq: [
                                                                "$$this._id",
                                                                "$$participant.user",
                                                            ],
                                                        },
                                                    },
                                                },
                                                0,
                                            ],
                                        },
                                    },
                                ],
                            },
                        },
                    },
                    messages: {
                        $map: {
                            input: {
                                $slice: [
                                    {
                                        $sortArray: {
                                            input: "$messages",
                                            sortBy: { createdAt: -1 },
                                        },
                                    },
                                    20
                                ],
                            },
                            as: "message",
                            in: {
                                $mergeObjects: [
                                    "$$message",
                                    {
                                        sender: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: "$populatedSenders",
                                                        cond: {
                                                            $eq: [
                                                                "$$this._id",
                                                                "$$message.sender"
                                                            ]
                                                        }
                                                    }
                                                },
                                                0
                                            ]
                                        }
                                    }
                                ]
                            }
                        }
                    },
                    groupAvatar: 1,
                    conversationName: 1,
                    conversationType: 1,
                    updatedAt: 1,
                },
            },
            {
                $project: {
                    _id: 1,
                    participants: {
                        $map: {
                            input: "$participants",
                            as: "participant",
                            in: {
                                user: {
                                    _id: "$$participant.user._id",
                                    username:
                                        "$$participant.user.username",
                                    userAvatar:
                                        "$$participant.user.userAvatar",
                                    email: "$$participant.user.email",
                                    blockedUser:
                                        "$$participant.user.blockedUser",
                                    userStatus:
                                        "$$participant.user.userStatus",
                                },
                                role: "$$participant.role",
                            },
                        },
                    },
                    messages: {
                        $map: {
                            input: "$messages",
                            as: "message",
                            in: {
                                _id: "$$message._id",
                                content: "$$message.content",
                                createdAt: "$$message.createdAt",
                                sender: {
                                    _id: "$$message.sender._id",
                                    username: "$$message.sender.username",
                                    userAvatar: "$$message.sender.userAvatar",
                                }
                            },
                        },
                    },
                    groupAvatar: 1,
                    conversationName: 1,
                    conversationType: 1,
                    updatedAt: 1,
                },
            }
        ]).sort({ updatedAt: -1 });

        if (conversations.length === 0) {
            return res.status(200).json(conversations);
        }

        res.status(200).json(conversations);
    } catch (error) {
        console.log(error.message)
        res.status(400).json({ status: 400, error: "Can't fetch conversations" })
    }
};

const loadMessage = async (req, res) => {
    const { conversationId, limit, skip } = req.body;

    try {
        const newMessages = await Conversation.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(conversationId),
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "messages.sender",
                    foreignField: "_id",
                    as: "populatedSenders",
                },
            },
            {
                $project: {
                    _id: 1,
                    messages: {
                        $map: {
                            input: {
                                $slice: [
                                    {
                                        $sortArray: {
                                            input: "$messages",
                                            sortBy: {
                                                createdAt: -1,
                                            },
                                        },
                                    },
                                    parseInt(skip, 10),
                                    parseInt(limit, 10),
                                ],
                            },
                            as: "message",
                            in: {
                                $mergeObjects: [
                                    "$$message",
                                    {
                                        sender: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input:
                                                            "$populatedSenders",
                                                        cond: {
                                                            $eq: [
                                                                "$$this._id",
                                                                "$$message.sender",
                                                            ],
                                                        },
                                                    },
                                                },
                                                0,
                                            ],
                                        },
                                    },
                                ],
                            },
                        },
                    },
                },
            },
            {
                $project: {
                    _id: 1,
                    messages: {
                        $map: {
                            input: "$messages",
                            as: "message",
                            in: {
                                _id: "$$message._id",
                                content: "$$message.content",
                                createdAt: "$$message.createdAt",
                                sender: {
                                    _id: "$$message.sender._id",
                                    username:
                                        "$$message.sender.username",
                                    userAvatar:
                                        "$$message.sender.userAvatar",
                                },
                            },
                        },
                    },
                },
            },
        ]);
        const newMessageBatch = newMessages.map(i => i.messages);

        res.status(200).json(newMessageBatch[0]);
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ status: 500, error: "Can't load messages" })
    }
}

const getContacts = async (req, res) => {
    const user_id = req.user._id;

    try {
        const user = await User.findById(user_id).populate('contacts', 'username userAvatar');

        res.status(200).json(user.contacts)
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ status: 500, error: "Can't get contacts" })
    }
};

const postImageOrAvatar = async (req, res) => {
    const { userIdOrConversationId, image, purpose } = req.body;
    const extractImage = image.split(',')[1]

    try {
        if (purpose === 'change_user_avatar') {

            const imagekitImage = await upload_image(userIdOrConversationId, extractImage, purpose);

            await User.updateOne({
                _id: userIdOrConversationId
            }, {
                $set: {
                    userAvatar: imagekitImage.image,
                    imageId: imagekitImage.id
                }
            });
            return res.json({ message: 'Avatar updated successfully', image: imagekitImage.image })
        };

        if (purpose === 'change_group_image') {

            const imagekitImage = await upload_image(userIdOrConversationId, extractImage, purpose);

            await Conversation.updateOne({
                _id: userIdOrConversationId
            }, {
                $set: {
                    groupAvatar: imagekitImage.image,
                    imageId: imagekitImage.id
                }
            });
            return res.json({ message: 'Group Avatar updated successfully', image: imagekitImage.image })
        };

    } catch (error) {
        console.log(error.message)
        res.status(500).json({ status: 500, error: "Can't update avatar" })
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

        const findGroup = await Conversation.aggregate([
            {
                $match: {
                    _id: newConversation._id
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "participants.user",
                    foreignField: "_id",
                    as: "populatedUsers",
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "messages.sender",
                    foreignField: "_id",
                    as: "populatedSenders",
                },
            },
            {
                $project: {
                    _id: 1,
                    participants: {
                        $map: {
                            input: "$participants",
                            as: "participant",
                            in: {
                                $mergeObjects: [
                                    "$$participant",
                                    {
                                        user: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: "$populatedUsers",
                                                        cond: {
                                                            $eq: [
                                                                "$$this._id",
                                                                "$$participant.user",
                                                            ],
                                                        },
                                                    },
                                                },
                                                0,
                                            ],
                                        },
                                    },
                                ],
                            },
                        },
                    },
                    messages: {
                        $map: {
                            input: {
                                $slice: [
                                    {
                                        $sortArray: {
                                            input: "$messages",
                                            sortBy: { createdAt: -1 },
                                        },
                                    },
                                    20
                                ],
                            },
                            as: "message",
                            in: {
                                $mergeObjects: [
                                    "$$message",
                                    {
                                        sender: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: "$populatedSenders",
                                                        cond: {
                                                            $eq: [
                                                                "$$this._id",
                                                                "$$message.sender"
                                                            ]
                                                        }
                                                    }
                                                },
                                                0
                                            ]
                                        }
                                    }
                                ]
                            }
                        }
                    },
                    groupAvatar: 1,
                    conversationName: 1,
                    conversationType: 1,
                    updatedAt: 1,
                },
            },
            {
                $project: {
                    _id: 1,
                    participants: {
                        $map: {
                            input: "$participants",
                            as: "participant",
                            in: {
                                user: {
                                    _id: "$$participant.user._id",
                                    username:
                                        "$$participant.user.username",
                                    userAvatar:
                                        "$$participant.user.userAvatar",
                                    email: "$$participant.user.email",
                                    blockedUser:
                                        "$$participant.user.blockedUser",
                                    userStatus:
                                        "$$participant.user.userStatus",
                                },
                                role: "$$participant.role",
                            },
                        },
                    },
                    messages: {
                        $map: {
                            input: "$messages",
                            as: "message",
                            in: {
                                _id: "$$message._id",
                                content: "$$message.content",
                                createdAt: "$$message.createdAt",
                                sender: {
                                    _id: "$$message.sender._id",
                                    username: "$$message.sender.username",
                                    userAvatar: "$$message.sender.userAvatar",
                                }
                            },
                        },
                    },
                    groupAvatar: 1,
                    conversationName: 1,
                    conversationType: 1,
                    updatedAt: 1,
                },
            }
        ]);

        res.status(200).json(findGroup[0]);
    } catch (error) {
        console.error('Error creating group:', error);
        res.status(500).json({ status: 500, error: 'An error occurred while creating the group' });
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

        const newAddedMembers = await User.find({ _id: { $in: newMembers } }, {
            username: 1,
            userAvatar: 1
        });

        res.status(200).json({ message: 'New members added', newAddedMembers })
    } catch (error) {
        console.error('Error adding group member:', error);
        res.status(500).json({ status: 500, error: 'An error occurred while adding a group member' });
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
        res.status(500).json({ status: 500, error: 'An error occurred while removing a group member' });
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
        res.status(500).json({ status: 500, error: 'An error occurred while leaving the group' });
    }
};

const changeGroupName = async (req, res) => {
    const { groupId, newGroupName } = req.body;
    try {
        await Conversation.updateOne({
            _id: groupId
        },
            {
                $set: { conversationName: newGroupName }
            }
        );
        res.status(200).json({ message: 'Group name changed successfully' });
    } catch (error) {
        console.error('Error changing group name:', error);
        res.status(500).json({ status: 500, error: 'An error occurred while changing the group name' });
    }
};

const getUserBlockedUsers = async (req, res) => {
    const user = req.user._id;
    try {
        const blockedUsers = await User.findOne({ _id: user }).populate('blockedUser', 'username email');

        res.status(200).json(blockedUsers.blockedUser);
    } catch (error) {
        console.error('Error getting blocked users:', error);
        res.status(500).json({ status: 500, error: 'An error occurred while getting blocked users' });
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
        res.status(500).json({ status: 500, error: 'An error occurred while blocking the user' });
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
        res.status(500).json({ status: 500, error: 'An error occurred while unblocking the user' });
    }
};

module.exports = {
    searchUser,
    getConversation,
    getContacts,
    getConversationOrStartNew,
    postImageOrAvatar,
    loadMessage,
    createNewGroup,
    addGroupMember,
    removeGroupMember,
    leaveGroup,
    getUserBlockedUsers,
    blockUser,
    unBlockUser,
    changeGroupName
};