const mongoose = require('mongoose');

const {messageSchema} = require('./MessageModel');

const Schema = mongoose.Schema

const conversationSchema = new Schema({

    participants: {
        type: [{
            _id: {
                type: Schema.Types.ObjectId,
                required: true
            },
            username: {
                type: String,
                required: true
            }
        }],
        required: true
    },

    conversationType: {
        type: ['personal', 'group'],
        required: true
    },

    ConversationName: {
        type: String,
        required: false
    },

    messages: [messageSchema]

})

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = { conversationSchema, Conversation };