const User = require('../models/UserModel');
const jwt = require('jsonwebtoken');

// Middleware to verify token
const createToken = (_id) => {
    return jwt.sign({ _id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

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
    loginUser
}