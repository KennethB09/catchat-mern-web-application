const express = require('express');

const { signupUser, loginUser, googleOAuthSignIn, googleOAuthSignUp } = require('../controllers/UserController');

const router = express.Router();

router.post('/signup', signupUser);

router.post('/login', loginUser);

router.post('/google-oauth-sign-in', googleOAuthSignIn);

router.post('/google-oauth-sign-up', googleOAuthSignUp);

module.exports = router;