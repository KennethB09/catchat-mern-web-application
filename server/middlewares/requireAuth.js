const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');

const requireAuth = async (req, res, next) => {
    // Verify Authentication
    const { authorization } = req.headers;

    if (!authorization) {
        return res.status(401).json({status: 401, error: "You must be logged in"})
    };

    const token = authorization.split(' ')[1]

    try {
        const {_id} = jwt.verify(token, process.env.JWT_SECRET)

        req.user = await User.findOne({ _id }).select('_id')
        next()
    } catch (error) {
        console.log(error.message)
        res.status(440).json({ status: 440, error: error.message })
    };
};

module.exports = requireAuth;