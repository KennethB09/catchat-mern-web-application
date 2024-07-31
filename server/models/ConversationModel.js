const mongoose = require('mongoose');

const {messageSchema} = require('./MessageModel');

const Schema = mongoose.Schema

const conversationSchema = new Schema({

    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],

    conversationType: {
        type: ['personal', 'group'],
        required: true
    },

    groupAvatar: {
        type: String,
        required: false
    },

    conversationName: {
        type: String,
        required: false
    },

    messages: [messageSchema]

})

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = { conversationSchema, Conversation };