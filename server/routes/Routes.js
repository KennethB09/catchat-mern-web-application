const express = require('express');
const { searchUser, getConversation, getConversationOrStartNew, postImageOrAvatar, createNewGroup } = require('../controllers/RouteController');
const requireAuth = require('../middlewares/requireAuth');

const router = express.Router();

router.use(requireAuth);

router.get('/search', searchUser);

router.post('/conversation', getConversationOrStartNew);

router.post('/conversation-create-group', createNewGroup);

router.get('/conversations', getConversation);

router.post('/post-image', postImageOrAvatar)

module.exports = router;