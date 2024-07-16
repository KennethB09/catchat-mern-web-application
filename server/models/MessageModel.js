const mongoose = require('mongoose');

const Schema = mongoose.Schema

const messageSchema = new Schema({
    sender: {
        type: Schema.Types.ObjectId,
        required: true
    },

    content: {
        type: String,
        required: true
    }
}, { timestamp: true })

const Message = mongoose.model('Message', messageSchema);

module.exports = {messageSchema, Message};