const express = require('express');
const { 
    searchUser, 
    getConversation,
    getContacts,
    getConversationOrStartNew, 
    postImageOrAvatar, 
    createNewGroup,
    addGroupMember,
    getUserBlockedUsers,
    removeGroupMember,
    leaveGroup,
    blockUser,
    unBlockUser,
    loadMessage,
    changeGroupName,
    changeUsername
} = require('../controllers/RouteController');
const requireAuth = require('../middlewares/requireAuth');

const router = express.Router();

router.use(requireAuth);

router.get('/search', searchUser);

router.post('/conversation', getConversationOrStartNew);

router.post('/conversation-create-group', createNewGroup);

router.get('/conversations', getConversation);

router.get('/contacts', getContacts);

router.post('/post-image', postImageOrAvatar);

router.patch('/conversation-add-group-member', addGroupMember);

router.get('/user-blocked-users', getUserBlockedUsers);

router.patch('/conversation-remove-group-member', removeGroupMember);

router.patch('/conversation-leave-group', leaveGroup);

router.patch('/block-user', blockUser);

router.patch('/unblock-user', unBlockUser);

router.post('/load-message', loadMessage);

router.patch('/conversation-change-group-name', changeGroupName);

router.patch('/change-username', changeUsername);

module.exports = router;