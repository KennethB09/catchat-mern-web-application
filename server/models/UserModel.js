const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');

const { conversationSchema } = require('./ConversationModel');

const Schema = mongoose.Schema

const userSchema = new Schema({

    authSource: {
        type: String,
        required: true,
        enum: ['local', 'google']
    },

    username: {
        type: String,
        required: true,
        unique: true
    },

    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true
    },

    password: {
        type: String,
        required: false
    },

    userAvatar: {
        type: String,
        required: false
    },

    conversations: [conversationSchema],

    contacts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    }],

    blockedUser: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    }]
    
});

// Hash the password before saving it to the database

userSchema.statics.signup = async function (authSource, username, email, password) {

    // Check if the user signup using google authentication
    if (authSource === 'google') {
        // Implement Google authentication logic here
        const isUserExist = await this.findOne({ email });

        if (isUserExist) {
            throw new Error('User already exists');
        }

        const user = await this.create({ authSource, username, email, password: null })

        return user;
    };
    
    // Check if the user signup using local authentication

    if (!email || !password) {
        throw new Error('Email and password are required');
    }
    if (!validator.isEmail(email)) {
        throw new Error('Invalid email');
    }
    if (!validator.isStrongPassword(password)) {
        throw new Error('Password is too weak');
    }
    
    const isUserExist = await this.findOne({ email });

    if (isUserExist) {
        throw new Error('User already exists');
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await this.create({ authSource, username, email, password: hashedPassword });
    
    return user;
};

// Static login method

userSchema.statics.login = async function (authSource, email, password) {

    // If user is authenticated with Google
    if (authSource === 'google') {
        // Implement Google authentication logic here
        const user = await this.findOne({ email });

        if (!user) {
            throw new Error('User not found');
        }
        if (user.authSource.toString() !== "google") {
            throw new Error('User is not authenticated with Google');
        }

        return user;
    };

    // If not authenticated with Google

    if (!email ||!password) {
        throw new Error('Email and password are required');
    }

    const user = await this.findOne({ email });

    if (!user) {
        throw new Error('User not found');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new Error('Invalid credentials');
    }

    return user;
};

module.exports = mongoose.model('User', userSchema);