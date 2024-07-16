const express = require('express');
const { searchUser, getConversation, getConversationOrStartNew } = require('../controllers/RouteController');
const requireAuth = require('../middlewares/requireAuth');

const router = express.Router();

router.use(requireAuth);

router.get('/search', searchUser);

router.post('/conversation', getConversationOrStartNew)

router.get('/conversations', getConversation);

module.exports = router;