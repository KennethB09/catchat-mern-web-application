const mongoose = require('mongoose');

const {messageSchema} = require('./MessageModel');

const Schema = mongoose.Schema

const conversationSchema = new Schema({

    participants: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        role: {
            type: ['admin','member'],
            default: 'member',
            required: false
        }
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

}, { timestamps: true });

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = { conversationSchema, Conversation };