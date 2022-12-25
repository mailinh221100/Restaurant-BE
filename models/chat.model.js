const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const groupSchema = new Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    unique: true,
  },
}, {
  timestamps: true
});

const chatSchema = new Schema({
  message: {
    type: String,
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Group',
  },
}, {
  timestamps: true
});

const Chat = mongoose.model("Chat", chatSchema);
const Group = mongoose.model("Group", groupSchema);

module.exports = { Chat, Group }
