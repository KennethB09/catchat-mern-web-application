const User = require('../models/UserModel');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client();

// Middleware to verify token
const createToken = (_id) => {
    return jwt.sign({ _id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const googleOAuthSignUp = async (req, res) => {
    const credential = req.body.credentialResponse.credential;
    const clientId = req.body.credentialResponse.clientId;
    const authSource = 'google';
    const password = null;

    try {
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: clientId
        });

        const payload = ticket.getPayload();
        const { email, name } = payload;

        const user = await User.signup(authSource, name, email, password);

        const token = createToken(user._id);

        res.status(201).json({ username: name, email, token, userId: user._id });

    } catch (error) {
        console.log(error.message);
        res.status(400).json({ error: error.message })
    }
}

const googleOAuthSignIn = async (req, res) => {
    const credential = req.body.credentialResponse.credential;
    const clientId = req.body.credentialResponse.clientId;
    const authSource = 'google';
    const password = null;

    try {
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: clientId
        });

        const payload = ticket.getPayload();
        const { email } = payload;

        const user = await User.login(authSource, email, password);

        const token = createToken(user._id);

        res.status(200).json({username: user.username, email, token, userId: user._id, userAvatar: user.userAvatar})

    } catch (error) {
        console.log(error.message);
        res.status(400).json({ error: error.message })
    }
}

const signupUser = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const authSource = "local"
        const user = await User.signup(authSource, username, email, password)

        const token = createToken(user._id);

        res.status(201).json({ username: user.username , email, token, userId: user._id });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    const authSource = "local";
    try {
        const user = await User.login(authSource, email, password);

        const token = createToken(user._id);

        res.status(200).json({username: user.username, email, token, userId: user._id, userAvatar: user.userAvatar})
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

module.exports = {
    signupUser,
    loginUser,
    googleOAuthSignIn,
    googleOAuthSignUp
}